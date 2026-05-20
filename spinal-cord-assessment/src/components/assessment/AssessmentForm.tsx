"use client";

import { exportAssessmentPdf } from "@/lib/exportAssessmentPdf";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ISNCSCI, Exam as ISNCSCIExam } from "isncsci";
import BodyDiagram from "./BodyDiagram";
import ResultsPanel from "./ResultsPanel";
import {
  persistAssessmentToDatabase,
  persistExamAndClassification,
} from "@/lib/persistAssessment";
import { extractAisGradeFromResult } from "@/lib/extractAisGrade";
import { readStaffIdFromStorage } from "@/lib/staffSession";
import {
  LEVELS,
  LOWER_MOTOR_LEVELS,
  MOTOR_KEY_LABELS,
  MOTOR_LEVELS,
  UPPER_MOTOR_LEVELS,
} from "./examConstants";

export { LEVELS, MOTOR_LEVELS } from "./examConstants";

type Side = "right" | "left";
type ScoreType = "motor" | "lightTouch" | "pinPrick";

export type UiScore = "" | "0" | "1" | "2" | "3" | "4" | "5" | "NT";
type BinaryObservation = "" | "Yes" | "No" | "NT";

export type UiExam = {
  right: {
    lowestNonKeyMuscleWithMotorFunction: string;
    motor: Record<string, UiScore>;
    lightTouch: Record<string, UiScore>;
    pinPrick: Record<string, UiScore>;
  };
  left: {
    lowestNonKeyMuscleWithMotorFunction: string;
    motor: Record<string, UiScore>;
    lightTouch: Record<string, UiScore>;
    pinPrick: Record<string, UiScore>;
  };
  voluntaryAnalContraction: BinaryObservation;
  deepAnalPressure: BinaryObservation;
};

export const inputStyle: React.CSSProperties = {
  width: "40px",
  height: "30px",
  border: "1px solid #D6D6D6",
  backgroundColor: "#FFFFFF",
  borderRadius: "4px",
  textAlign: "center",
  color: "#15284C",
  fontSize: "12px",
  padding: 0,
  fontFamily: "inherit",
};

const NAVY = "#15284C";
const BORDER = "#D6D6D6";

const selectStyle: React.CSSProperties = {
  padding: "8px 10px",
  border: `1px solid ${BORDER}`,
  borderRadius: "6px",
  backgroundColor: "#FFFFFF",
  color: NAVY,
  fontSize: "13px",
  fontFamily: "inherit",
  minWidth: "120px",
};

function levelOptionLabel(level: string) {
  return level.replace("_", "-");
}

const actionBarBtnOutline: React.CSSProperties = {
  padding: "16px 18px",
  minHeight: "56px",
  width: "100%",
  boxSizing: "border-box",
  backgroundColor: "#FFFFFF",
  border: `2px solid ${NAVY}`,
  borderRadius: "8px",
  color: NAVY,
  fontSize: "16px",
  fontWeight: 600,
  fontFamily: "inherit",
  cursor: "pointer",
};

const actionBarBtnPrimary: React.CSSProperties = {
  ...actionBarBtnOutline,
  backgroundColor: NAVY,
  color: "#FFFFFF",
};

function emptyScores(): Record<string, UiScore> {
  return LEVELS.reduce((acc, level) => {
    acc[level] = "";
    return acc;
  }, {} as Record<string, UiScore>);
}

const defaultExam: UiExam = {
  right: {
    lowestNonKeyMuscleWithMotorFunction: "",
    motor: emptyScores(),
    lightTouch: emptyScores(),
    pinPrick: emptyScores(),
  },
  left: {
    lowestNonKeyMuscleWithMotorFunction: "",
    motor: emptyScores(),
    lightTouch: emptyScores(),
    pinPrick: emptyScores(),
  },
  voluntaryAnalContraction: "",
  deepAnalPressure: "",
};

function cleanValue(value: string, type: ScoreType): UiScore {
  const v = value.toUpperCase();

  if (v === "") return "";
  if (v === "NT") return "NT";

  if (type === "motor") {
    if (["0", "1", "2", "3", "4", "5"].includes(v)) return v as UiScore;
  } else {
    if (["0", "1", "2"].includes(v)) return v as UiScore;
  }

  return "";
}

function hasEmptyScores(exam: UiExam) {
  for (const side of ["right", "left"] as const) {
    for (const level of LEVELS) {
      if (!exam[side].lightTouch[level]) return true;
      if (!exam[side].pinPrick[level]) return true;

      if (
        MOTOR_LEVELS.includes(level as (typeof MOTOR_LEVELS)[number]) &&
        !exam[side].motor[level]
      ) {
        return true;
      }
    }
  }

  if (!exam.voluntaryAnalContraction) return true;
  if (!exam.deepAnalPressure) return true;

  return false;
}

function sumMotorBlock(
  exam: UiExam,
  side: Side,
  block: readonly string[]
): number {
  let s = 0;
  for (const level of block) {
    const v = exam[side].motor[level];
    if (!v || v === "NT") continue;
    const n = parseInt(v, 10);
    if (!Number.isNaN(n)) s += n;
  }
  return s;
}

function toISNCSCIExam(exam: UiExam): ISNCSCIExam {
  const motor = (side: Side) =>
    MOTOR_LEVELS.reduce((acc, level) => {
      acc[level] = exam[side].motor[level] || "NT";
      return acc;
    }, {} as Record<string, string>);

  const sensory = (side: Side, type: "lightTouch" | "pinPrick") =>
    LEVELS.reduce((acc, level) => {
      acc[level] = exam[side][type][level] || "NT";
      return acc;
    }, {} as Record<string, string>);

  const fallback = "C2";

  return {
    voluntaryAnalContraction: exam.voluntaryAnalContraction || "NT",
    deepAnalPressure: exam.deepAnalPressure || "NT",
    right: {
      lowestNonKeyMuscleWithMotorFunction: (exam.right
        .lowestNonKeyMuscleWithMotorFunction || fallback) as never,
      motor: motor("right") as never,
      lightTouch: sensory("right", "lightTouch") as never,
      pinPrick: sensory("right", "pinPrick") as never,
    },
    left: {
      lowestNonKeyMuscleWithMotorFunction: (exam.left
        .lowestNonKeyMuscleWithMotorFunction || fallback) as never,
      motor: motor("left") as never,
      lightTouch: sensory("left", "lightTouch") as never,
      pinPrick: sensory("left", "pinPrick") as never,
    },
  } as ISNCSCIExam;
}

type AssessmentFormProps = {
  patientId: number | null;
};

export default function AssessmentForm({ patientId }: AssessmentFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nhi = searchParams.get("nhi");

  const [patient, setPatient] = useState<any>(null);
  const [exam, setExam] = useState<UiExam>(defaultExam);
  const [result, setResult] = useState<unknown>(null);
  const [comments, setComments] = useState("");
  const [linkedAssessmentId, setLinkedAssessmentId] = useState<number | null>(
    null
  );
  const [saving, setSaving] = useState(false);
  const [saveCompleteOpen, setSaveCompleteOpen] = useState(false);

  useEffect(() => {
    setLinkedAssessmentId(null);
  }, [patientId]);

  useEffect(() => {
    async function loadPatient() {
      if (!nhi) return;

      const { data: patientData, error: patientError } = await supabase
        .from("Patient")
        .select("*")
        .eq("nhi_number", nhi)
        .single();

      if (patientError || !patientData) {
        console.error("Could not load patient:", patientError);
        return;
      }

      const { data: nameData, error: nameError } = await supabase
        .from("Patient Name")
        .select("*")
        .eq("PATIENTpatient_id", patientData.patient_id)
        .single();

      if (nameError) {
        console.error("Could not load patient name:", nameError);
      }

      setPatient({
        ...patientData,
        name: nameData,
      });
    }

    loadPatient();
  }, [nhi]);

  useEffect(() => {
    if (!saveCompleteOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSaveCompleteOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saveCompleteOpen]);

  const totalsPreview = useMemo(() => {
    const ur = sumMotorBlock(exam, "right", UPPER_MOTOR_LEVELS);
    const ul = sumMotorBlock(exam, "left", UPPER_MOTOR_LEVELS);
    const lr = sumMotorBlock(exam, "right", LOWER_MOTOR_LEVELS);
    const ll = sumMotorBlock(exam, "left", LOWER_MOTOR_LEVELS);
    return { ur, ul, uems: ur + ul, lr, ll, lems: lr + ll };
  }, [exam]);

  const columnTotals = useMemo(() => {
    const totals = (
      result as {
        totals?: {
          right?: {
            upperExtremity?: unknown;
            lowerExtremity?: unknown;
            lightTouch?: unknown;
            pinPrick?: unknown;
          };
          left?: {
            upperExtremity?: unknown;
            lowerExtremity?: unknown;
            lightTouch?: unknown;
            pinPrick?: unknown;
          };
        };
      } | null
    )?.totals;

    return {
      right: {
        ur: String(totals?.right?.upperExtremity ?? totalsPreview.ur),
        lr: String(totals?.right?.lowerExtremity ?? totalsPreview.lr),
        lt: String(totals?.right?.lightTouch ?? "—"),
        pp: String(totals?.right?.pinPrick ?? "—"),
      },
      left: {
        ul: String(totals?.left?.upperExtremity ?? totalsPreview.ul),
        ll: String(totals?.left?.lowerExtremity ?? totalsPreview.ll),
        lt: String(totals?.left?.lightTouch ?? "—"),
        pp: String(totals?.left?.pinPrick ?? "—"),
      },
    };
  }, [result, totalsPreview]);

  useEffect(() => {
    async function loadPatient() {
      if (!nhi) return;

      const { data: patientData, error: patientError } = await supabase
        .from("Patient")
        .select("*")
        .eq("nhi_number", nhi)
        .single();

      if (patientError || !patientData) {
        console.error("Could not load patient:", patientError);
        return;
      }

      const { data: nameData, error: nameError } = await supabase
        .from("Patient Name")
        .select("*")
        .eq("PATIENTpatient_id", patientData.patient_id)
        .single();

      if (nameError) {
        console.error("Could not load patient name:", nameError);
      }

      setPatient({
        ...patientData,
        name: nameData,
      });
    }

    loadPatient();
  }, [nhi]);
  function update(
    side: Side,
    type: ScoreType,
    level: string,
    rawValue: string
  ) {
    const value = cleanValue(rawValue, type);

    setExam((prev) => {
      const updatedValues = {
        ...prev[side][type],
        [level]: value,
      };

      // Top-down rule: entering a score fills all dermatome/key levels below it in this column.
      if (value !== "") {
        const idx = LEVELS.indexOf(level as (typeof LEVELS)[number]);

        if (idx >= 0) {
          for (let i = idx + 1; i < LEVELS.length; i++) {
            const nextLevel = LEVELS[i];

            if (
              type === "motor" &&
              !MOTOR_LEVELS.includes(nextLevel as (typeof MOTOR_LEVELS)[number])
            ) {
              continue;
            }

            updatedValues[nextLevel] = value;
          }
        }
      }

      return {
        ...prev,
        [side]: {
          ...prev[side],
          [type]: updatedValues,
        },
      };
    });

    setResult(null);
  }

  function computeClassification(): InstanceType<typeof ISNCSCI> | null {
    if (hasEmptyScores(exam)) {
      alert("You cannot calculate while there are empty results.");
      return null;
    }

    const validExam = toISNCSCIExam(exam);
    return new ISNCSCI(validExam);
  }

  function calculate(): boolean {
    const calculated = computeClassification();
    if (!calculated) return false;
    setResult(calculated);
    return true;
  }

  async function handleSaveDraft() {
    if (patientId == null) {
      alert(
        "Open this assessment with a patient NHI (from Patient Search) so it can be saved to that patient."
      );
      return;
    }
    const staffId = readStaffIdFromStorage();
    if (!staffId) {
      alert("You must be logged in to save.");
      return;
    }
    setSaving(true);
    try {
      const { assessmentId } = await persistAssessmentToDatabase({
        patientId,
        staffId,
        mode: "draft",
        existingAssessmentId: linkedAssessmentId,
      });
      setLinkedAssessmentId(assessmentId);
      alert("Draft saved.");
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not save draft.");
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveFinal() {
    if (patientId == null) {
      alert(
        "Open this assessment with a patient NHI (from Patient Search) so it can be saved to that patient."
      );
      return;
    }
    const staffId = readStaffIdFromStorage();
    if (!staffId) {
      alert("You must be logged in to save.");
      return;
    }

    const calculated = computeClassification();
    if (!calculated) return;
    setResult(calculated);

    const aisGrade = extractAisGradeFromResult(calculated);
    if (!aisGrade) {
      alert(
        "Could not read AIS grade from the classification. Use Update, then try again."
      );
      return;
    }

    setSaving(true);
    try {
      const { assessmentId } = await persistAssessmentToDatabase({
        patientId,
        staffId,
        mode: "final",
        existingAssessmentId: linkedAssessmentId,
      });
      await persistExamAndClassification({
        assessmentId,
        alsGrade: aisGrade,
      });
      setLinkedAssessmentId(assessmentId);
      setSaveCompleteOpen(true);
    } catch (e) {
      setSaveCompleteOpen(false);
      alert(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  }

  function updateClassification() {
    calculate();
  }

  function handleExportPDF() {
    exportAssessmentPdf({
      patient,
      exam,
      result,
      nhi,
    });
  }

  function renderInput(
    side: Side,
    type: ScoreType,
    level: string,
    value: string
  ) {
    return (
      <input
        value={value}
        onChange={(e) => update(side, type, level, e.target.value)}
        maxLength={2}
        style={inputStyle}
      />
    );
  }

  function renderRightRows() {
    return LEVELS.map((level) => (
      <div
        key={`right-${level}`}
        style={{
          display: "grid",
          gridTemplateColumns: "40px minmax(90px, 1fr) 42px 42px 42px",
          gap: "6px",
          marginBottom: "2px",
          alignItems: "center",
        }}
      >
        <span
          style={{
            textAlign: "right",
            paddingRight: "4px",
            fontSize: "12px",
            fontWeight: 600,
            color: NAVY,
          }}
        >
          {level}
        </span>
        <span style={{ fontSize: "11px", color: "#4B5563", lineHeight: 1.2 }}>
          {MOTOR_LEVELS.includes(level as (typeof MOTOR_LEVELS)[number])
            ? MOTOR_KEY_LABELS[level as (typeof MOTOR_LEVELS)[number]]
            : ""}
        </span>
        {MOTOR_LEVELS.includes(level as (typeof MOTOR_LEVELS)[number]) ? (
          renderInput("right", "motor", level, exam.right.motor[level])
        ) : (
          <div />
        )}
        {renderInput(
          "right",
          "lightTouch",
          level,
          exam.right.lightTouch[level]
        )}
        {renderInput("right", "pinPrick", level, exam.right.pinPrick[level])}
      </div>
    ));
  }

  function renderLeftRows() {
    return LEVELS.map((level) => (
      <div
        key={`left-${level}`}
        style={{
          display: "grid",
          gridTemplateColumns: "42px 42px 42px minmax(90px, 1fr) 40px",
          gap: "6px",
          marginBottom: "2px",
          alignItems: "center",
        }}
      >
        {renderInput("left", "lightTouch", level, exam.left.lightTouch[level])}
        {renderInput("left", "pinPrick", level, exam.left.pinPrick[level])}
        {MOTOR_LEVELS.includes(level as (typeof MOTOR_LEVELS)[number]) ? (
          renderInput("left", "motor", level, exam.left.motor[level])
        ) : (
          <div />
        )}
        <span
          style={{
            fontSize: "11px",
            color: "#4B5563",
            lineHeight: 1.2,
            textAlign: "right",
          }}
        >
          {MOTOR_LEVELS.includes(level as (typeof MOTOR_LEVELS)[number])
            ? MOTOR_KEY_LABELS[level as (typeof MOTOR_LEVELS)[number]]
            : ""}
        </span>
        <span style={{ fontSize: "12px", fontWeight: 600, color: NAVY }}>
          {level}
        </span>
      </div>
    ));
  }

  return (
    <>
      {saveCompleteOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-complete-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            backgroundColor: "rgba(21, 40, 76, 0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
          onClick={() => setSaveCompleteOpen(false)}
        >
          <div
            role="presentation"
            onClick={(e) => e.stopPropagation()}
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "28px 32px 32px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.15)",
              maxWidth: 440,
              width: "100%",
              textAlign: "center",
            }}
          >
            <p
              id="save-complete-title"
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 700,
                color: NAVY,
              }}
            >
              Save complete
            </p>
            <p
              style={{
                margin: "12px 0 22px",
                fontSize: "14px",
                lineHeight: 1.5,
                color: "#5C667A",
              }}
            >
              Stay on this assessment, or open this patient&apos;s history.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              <button
                type="button"
                style={{
                  ...actionBarBtnOutline,
                  padding: "14px 16px",
                  minHeight: "48px",
                  fontSize: "15px",
                }}
                onClick={() => setSaveCompleteOpen(false)}
              >
                Stay on assessment
              </button>
              <button
                type="button"
                style={{
                  ...actionBarBtnPrimary,
                  padding: "14px 16px",
                  minHeight: "48px",
                  fontSize: "15px",
                }}
                onClick={() => {
                  setSaveCompleteOpen(false);
                  if (patientId != null) {
                    router.push(`/history/${patientId}`);
                  }
                }}
              >
                Patient history
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(340px, 440px)",
          minHeight: 0,
          overflow: "hidden",
          backgroundColor: "#F6F4EC",
        }}
      >
        <div
          style={{
            overflow: "auto",
            padding: "20px 24px 28px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "minmax(0, auto) minmax(340px, 1fr) minmax(0, auto)",
              gap: "20px",
              alignItems: "start",
              justifyContent: "center",
              maxWidth: "1100px",
              margin: "0 auto",
            }}
          >
            <section>
              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: NAVY,
                  letterSpacing: "0.06em",
                }}
              >
                RIGHT
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "40px minmax(90px, 1fr) 42px 42px 42px",
                  marginBottom: "6px",
                  gap: "6px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: NAVY,
                  textAlign: "center",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                <span />
                <span style={{ textAlign: "left" }}>Key muscle</span>
                <span>M</span>
                <span>LT</span>
                <span>PP</span>
              </div>

              {renderRightRows()}

              <div style={{ marginTop: "16px" }}>
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    fontSize: "12px",
                    fontWeight: 600,
                    color: NAVY,
                  }}
                >
                  Voluntary anal contraction (VAC)
                  <select
                    value={exam.voluntaryAnalContraction}
                    onChange={(e) => {
                      setExam((prev) => ({
                        ...prev,
                        voluntaryAnalContraction: e.target
                          .value as BinaryObservation,
                      }));
                      setResult(null);
                    }}
                    style={selectStyle}
                  >
                    <option value=""></option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="NT">NT</option>
                  </select>
                </label>
              </div>
            </section>

            <section
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                paddingTop: "8px",
              }}
            >
              <BodyDiagram exam={exam as never} />
            </section>

            <section>
              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: NAVY,
                  letterSpacing: "0.06em",
                }}
              >
                LEFT
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "42px 42px 42px minmax(90px, 1fr) 40px",
                  marginBottom: "6px",
                  gap: "6px",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: NAVY,
                  textAlign: "center",
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                }}
              >
                <span>LT</span>
                <span>PP</span>
                <span>M</span>
                <span style={{ textAlign: "right" }}>Key muscle</span>
                <span />
              </div>

              {renderLeftRows()}

              <div style={{ marginTop: "16px" }}>
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                    fontSize: "12px",
                    fontWeight: 600,
                    color: NAVY,
                  }}
                >
                  Deep anal pressure (DAP)
                  <select
                    value={exam.deepAnalPressure}
                    onChange={(e) => {
                      setExam((prev) => ({
                        ...prev,
                        deepAnalPressure: e.target.value as BinaryObservation,
                      }));
                      setResult(null);
                    }}
                    style={selectStyle}
                  >
                    <option value=""></option>
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                    <option value="NT">NT</option>
                  </select>
                </label>
              </div>
            </section>
          </div>

          <div
            style={{
              maxWidth: "1100px",
              margin: "20px auto 0",
              width: "100%",
              padding: "18px 20px 20px",
              backgroundColor: "#FFFFFF",
              border: `1px solid ${BORDER}`,
              borderRadius: "8px",
              boxSizing: "border-box",
            }}
          >
            <h3
              style={{
                margin: "0 0 14px",
                fontSize: "15px",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "0.02em",
              }}
            >
              Lowest non-key muscles with motor function
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "16px",
              }}
            >
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  fontSize: "13px",
                  fontWeight: 600,
                  color: NAVY,
                }}
              >
                Right
                <select
                  value={exam.right.lowestNonKeyMuscleWithMotorFunction}
                  onChange={(e) => {
                    setExam((prev) => ({
                      ...prev,
                      right: {
                        ...prev.right,
                        lowestNonKeyMuscleWithMotorFunction: e.target.value,
                      },
                    }));
                    setResult(null);
                  }}
                  style={selectStyle}
                >
                  <option value="">—</option>
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {levelOptionLabel(level)}
                    </option>
                  ))}
                </select>
              </label>
              <label
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  fontSize: "13px",
                  fontWeight: 600,
                  color: NAVY,
                }}
              >
                Left
                <select
                  value={exam.left.lowestNonKeyMuscleWithMotorFunction}
                  onChange={(e) => {
                    setExam((prev) => ({
                      ...prev,
                      left: {
                        ...prev.left,
                        lowestNonKeyMuscleWithMotorFunction: e.target.value,
                      },
                    }));
                    setResult(null);
                  }}
                  style={selectStyle}
                >
                  <option value="">—</option>
                  {LEVELS.map((level) => (
                    <option key={level} value={level}>
                      {levelOptionLabel(level)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div
            style={{
              maxWidth: "1100px",
              margin: "20px auto 0",
              width: "100%",
              padding: "18px 20px 20px",
              backgroundColor: "#FFFFFF",
              border: `1px solid ${BORDER}`,
              borderRadius: "8px",
              boxSizing: "border-box",
            }}
          >
            <label
              htmlFor="assessment-comments-main"
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "13px",
                fontWeight: 700,
                color: NAVY,
              }}
            >
              Comments
            </label>
            <textarea
              id="assessment-comments-main"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows={4}
              placeholder="Enter clinical notes…"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                border: `1px solid ${BORDER}`,
                borderRadius: "6px",
                fontSize: "14px",
                fontFamily: "inherit",
                color: NAVY,
                resize: "vertical",
                minHeight: "88px",
              }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                gap: "12px",
                marginTop: "16px",
              }}
            >
              <button
                type="button"
                disabled={saving}
                style={{
                  ...actionBarBtnOutline,
                  opacity: saving ? 0.65 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
                onClick={handleExportPDF}
              >
                Export PDF
              </button>
              <button
                type="button"
                disabled={saving}
                style={{
                  ...actionBarBtnOutline,
                  opacity: saving ? 0.65 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
                onClick={() => void handleSaveDraft()}
              >
                Save as Draft
              </button>
              <button
                type="button"
                disabled={saving}
                style={{
                  ...actionBarBtnPrimary,
                  opacity: saving ? 0.65 : 1,
                  cursor: saving ? "not-allowed" : "pointer",
                }}
                onClick={() => void handleSaveFinal()}
              >
                Save as Final Version
              </button>
            </div>
          </div>
        </div>

        <ResultsPanel
          result={result}
          onCalculate={updateClassification}
          motorPreview={totalsPreview}
          columnTotals={columnTotals}
        />
      </div>
    </>
  );
}
