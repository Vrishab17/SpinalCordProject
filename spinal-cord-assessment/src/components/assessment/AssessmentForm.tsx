"use client";

import { exportAssessmentPdf } from "@/lib/exportAssessmentPdf";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ISNCSCI, Exam as ISNCSCIExam } from "isncsci";
import BodyDiagram from "./BodyDiagram";
import ResultsPanel from "./ResultsPanel";
import {
  formatAssessmentDateDisplay,
  formatAssessmentTimestampDisplay,
} from "@/lib/assessmentDates";
import { persistAssessmentToDatabase } from "@/lib/persistAssessment";
import { getLoggedInStaff } from "@/lib/auth";
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

function computeResultFromExam(
  target: UiExam
): InstanceType<typeof ISNCSCI> | null {
  try {
    return new ISNCSCI(toISNCSCIExam(target));
  } catch {
    return null;
  }
}

function tryComputeClassification(
  target: UiExam
): InstanceType<typeof ISNCSCI> | null {
  if (hasEmptyScores(target)) return null;
  return computeResultFromExam(target);
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
  patientNhi?: string | null;
  initialAssessmentId?: string | null;
  initialExam?: UiExam | null;
  initialComments?: string;
  initialInjuryDate?: string;
  initialReviewDate?: string;
  initialCreatedAt?: string | null;
  initialUpdatedAt?: string | null;
  readOnly?: boolean;
  onAssessmentIdChange?: (assessmentId: string) => void;
};

export default function AssessmentForm({
  patientId,
  patientNhi = null,
  initialAssessmentId = null,
  initialExam = null,
  initialComments = "",
  initialInjuryDate = "",
  initialReviewDate = "",
  initialCreatedAt = null,
  initialUpdatedAt = null,
  readOnly = false,
  onAssessmentIdChange,
}: AssessmentFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nhi = patientNhi ?? searchParams.get("nhi");

  const [patient, setPatient] = useState<any>(null);
  const [exam, setExam] = useState<UiExam>(initialExam ?? defaultExam);
  const [result, setResult] = useState<unknown>(null);
  const [comments, setComments] = useState(initialComments);
  const [injuryDate, setInjuryDate] = useState(initialInjuryDate);
  const [reviewDate, setReviewDate] = useState(initialReviewDate);
  const [createdAt, setCreatedAt] = useState<string | null>(initialCreatedAt);
  const [updatedAt, setUpdatedAt] = useState<string | null>(initialUpdatedAt);
  const [linkedAssessmentId, setLinkedAssessmentId] = useState<string | null>(
    initialAssessmentId
  );
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "offline" | "error"
  >("idle");
  const [saveStatusDetail, setSaveStatusDetail] = useState("");
  const [saveFeedback, setSaveFeedback] = useState<
    { type: "success" } | { type: "error"; message: string } | null
  >(null);

  function showSaveError(message: string) {
    setSaveFeedback({ type: "error", message });
  }

  function showSaveSuccess() {
    setSaveFeedback({ type: "success" });
  }

  useEffect(() => {
    if (initialAssessmentId != null) {
      setLinkedAssessmentId(initialAssessmentId);
    } else {
      setLinkedAssessmentId(null);
    }
  }, [initialAssessmentId, patientId]);

  useEffect(() => {
    if (initialExam) setExam(initialExam);
  }, [initialExam]);

  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  useEffect(() => {
    setInjuryDate(initialInjuryDate);
    setReviewDate(initialReviewDate);
    setCreatedAt(initialCreatedAt);
    setUpdatedAt(initialUpdatedAt);
  }, [
    initialInjuryDate,
    initialReviewDate,
    initialCreatedAt,
    initialUpdatedAt,
  ]);

  useEffect(() => {
    if (!readOnly) return;
    const computed = computeResultFromExam(exam);
    if (computed) setResult(computed);
  }, [readOnly, exam]);

  useEffect(() => {
    async function loadPatient() {
      if (!nhi) return;

      const res = await fetch(
        `/api/patients/assessment-detail?nhi=${encodeURIComponent(nhi)}`,
        { credentials: "include" }
      );
      const body = (await res.json()) as { patient?: any; error?: string };
      if (!res.ok || !body.patient) {
        console.error("Could not load patient:", body.error);
        return;
      }

      setPatient(body.patient);
    }

    loadPatient();
  }, [nhi]);

  useEffect(() => {
    if (!saveFeedback) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSaveFeedback(null);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saveFeedback]);

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

  function update(
    side: Side,
    type: ScoreType,
    level: string,
    rawValue: string
  ) {
    if (readOnly) return;
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

    return computeResultFromExam(exam);
  }

  function calculate(): boolean {
    const calculated = computeClassification();
    if (!calculated) return false;
    setResult(calculated);
    return true;
  }

  async function runSave(mode: "draft" | "final") {
    if (readOnly) return;
    if (patientId == null) {
      showSaveError(
        "Open this assessment with a patient NHI (from Patient Search) so it can be saved to that patient."
      );
      return;
    }
    if (!getLoggedInStaff()) {
      showSaveError("You must be logged in to save.");
      return;
    }

    let classificationResult: unknown;
    if (mode === "final") {
      const calculated = computeClassification();
      if (!calculated) return;
      setResult(calculated);
      classificationResult = calculated;
    } else {
      const calculated = tryComputeClassification(exam);
      if (calculated) {
        classificationResult = calculated;
        setResult(calculated);
      }
    }

    if (typeof navigator !== "undefined" && !navigator.onLine) {
      setSaveStatus("offline");
      setSaveStatusDetail("You appear to be offline. Reconnect and save again.");
      return;
    }

    setSaving(true);
    setSaveStatus("saving");
    setSaveStatusDetail("Saving to database…");

    try {
      const saved = await persistAssessmentToDatabase({
        patientId,
        mode,
        existingAssessmentId: linkedAssessmentId,
        exam,
        comments,
        injuryDate,
        reviewDate,
        classificationResult,
      });
      setLinkedAssessmentId(saved.assessmentId);
      setCreatedAt(saved.createdAt);
      setUpdatedAt(saved.updatedAt);
      onAssessmentIdChange?.(saved.assessmentId);
      setSaveStatus("saved");
      setSaveStatusDetail(
        `Saved v${saved.versionNumber} at ${formatAssessmentTimestampDisplay(saved.updatedAt)}`
      );
      showSaveSuccess();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Could not save.";
      setSaveStatus("error");
      setSaveStatusDetail(message);
      showSaveError(message);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveDraft() {
    await runSave("draft");
  }

  async function handleSaveFinal() {
    await runSave("final");
  }

  function updateClassification() {
    calculate();
  }

  function handleExportPDF() {
    const exportResult =
      result ?? (readOnly ? computeResultFromExam(exam) : null);

    exportAssessmentPdf({
      patient,
      exam,
      result: exportResult,
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
        readOnly={readOnly}
        disabled={readOnly}
        style={{
          ...inputStyle,
          ...(readOnly
            ? { backgroundColor: "#F3F4F6", cursor: "not-allowed" }
            : {}),
        }}
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
      {saveFeedback ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="save-feedback-title"
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
          onClick={() => setSaveFeedback(null)}
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
              id="save-feedback-title"
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 700,
                color: saveFeedback.type === "success" ? NAVY : "#DC2626",
              }}
            >
              {saveFeedback.type === "success" ? "Successful" : "Error"}
            </p>
            {saveFeedback.type === "error" ? (
              <p
                style={{
                  margin: "12px 0 22px",
                  fontSize: "14px",
                  lineHeight: 1.5,
                  color: "#5C667A",
                }}
              >
                {saveFeedback.message}
              </p>
            ) : (
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
            )}
            {saveFeedback.type === "success" ? (
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
                  onClick={() => setSaveFeedback(null)}
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
                    setSaveFeedback(null);
                    if (patientId != null) {
                      router.push(`/history/${patientId}`);
                    }
                  }}
                >
                  Patient history
                </button>
              </div>
            ) : (
              <button
                type="button"
                style={{
                  ...actionBarBtnPrimary,
                  padding: "14px 16px",
                  minHeight: "48px",
                  fontSize: "15px",
                  width: "100%",
                }}
                onClick={() => setSaveFeedback(null)}
              >
                Close
              </button>
            )}
          </div>
        </div>
      ) : null}
      {!readOnly && saveStatus !== "idle" ? (
        <div
          role="status"
          style={{
            padding: "8px 22px",
            fontSize: 13,
            fontWeight: 600,
            color:
              saveStatus === "saved"
                ? "#15803D"
                : saveStatus === "error" || saveStatus === "offline"
                  ? "#DC2626"
                  : NAVY,
            backgroundColor:
              saveStatus === "saved"
                ? "#DCFCE7"
                : saveStatus === "error" || saveStatus === "offline"
                  ? "#FEF3F2"
                  : "#E8EEF8",
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          {saveStatusDetail}
        </div>
      ) : null}
      <div
        className="assessment-layout"
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
          className="assessment-main-area"
          style={{
            overflow: "auto",
            padding: "20px 24px 28px",
            boxSizing: "border-box",
          }}
        >
          <div
            className="assessment-score-grid"
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
            <section className="assessment-side assessment-table-scroll assessment-side-right">
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
                      if (readOnly) return;
                      setExam((prev) => ({
                        ...prev,
                        voluntaryAnalContraction: e.target
                          .value as BinaryObservation,
                      }));
                      setResult(null);
                    }}
                    disabled={readOnly}
                    style={{
                      ...selectStyle,
                      ...(readOnly
                        ? { backgroundColor: "#F3F4F6", cursor: "not-allowed" }
                        : {}),
                    }}
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
              className="assessment-diagram"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                paddingTop: "8px",
              }}
            >
              <BodyDiagram exam={exam as never} />
            </section>

            <section className="assessment-side assessment-table-scroll assessment-side-left">
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
                      if (readOnly) return;
                      setExam((prev) => ({
                        ...prev,
                        deepAnalPressure: e.target.value as BinaryObservation,
                      }));
                      setResult(null);
                    }}
                    disabled={readOnly}
                    style={{
                      ...selectStyle,
                      ...(readOnly
                        ? { backgroundColor: "#F3F4F6", cursor: "not-allowed" }
                        : {}),
                    }}
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
              className="assessment-input-grid"
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
                    if (readOnly) return;
                    setExam((prev) => ({
                      ...prev,
                      right: {
                        ...prev.right,
                        lowestNonKeyMuscleWithMotorFunction: e.target.value,
                      },
                    }));
                    setResult(null);
                  }}
                  disabled={readOnly}
                  style={{
                    ...selectStyle,
                    ...(readOnly
                      ? { backgroundColor: "#F3F4F6", cursor: "not-allowed" }
                      : {}),
                  }}
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
                    if (readOnly) return;
                    setExam((prev) => ({
                      ...prev,
                      left: {
                        ...prev.left,
                        lowestNonKeyMuscleWithMotorFunction: e.target.value,
                      },
                    }));
                    setResult(null);
                  }}
                  disabled={readOnly}
                  style={{
                    ...selectStyle,
                    ...(readOnly
                      ? { backgroundColor: "#F3F4F6", cursor: "not-allowed" }
                      : {}),
                  }}
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
            <h3
              style={{
                margin: "0 0 14px",
                fontSize: "15px",
                fontWeight: 700,
                color: NAVY,
                letterSpacing: "0.02em",
              }}
            >
              Assessment schedule
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "18px",
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
                Date of injury
                <input
                  type="date"
                  value={injuryDate}
                  onChange={(e) => setInjuryDate(e.target.value)}
                  readOnly={readOnly}
                  disabled={readOnly}
                  style={{
                    ...selectStyle,
                    minWidth: "unset",
                    width: "100%",
                    boxSizing: "border-box",
                    ...(readOnly
                      ? { backgroundColor: "#F3F4F6", cursor: "not-allowed" }
                      : {}),
                  }}
                />
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
                Next review date
                <input
                  type="date"
                  value={reviewDate}
                  onChange={(e) => setReviewDate(e.target.value)}
                  readOnly={readOnly}
                  disabled={readOnly}
                  style={{
                    ...selectStyle,
                    minWidth: "unset",
                    width: "100%",
                    boxSizing: "border-box",
                    ...(readOnly
                      ? { backgroundColor: "#F3F4F6", cursor: "not-allowed" }
                      : {}),
                  }}
                />
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
                Created
                <span
                  style={{
                    padding: "8px 10px",
                    border: `1px solid ${BORDER}`,
                    borderRadius: "6px",
                    backgroundColor: "#F3F4F6",
                    fontSize: "13px",
                    color: NAVY,
                  }}
                >
                  {formatAssessmentTimestampDisplay(createdAt) || "—"}
                </span>
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
                Last updated
                <span
                  style={{
                    padding: "8px 10px",
                    border: `1px solid ${BORDER}`,
                    borderRadius: "6px",
                    backgroundColor: "#F3F4F6",
                    fontSize: "13px",
                    color: NAVY,
                  }}
                >
                  {formatAssessmentTimestampDisplay(updatedAt) || "—"}
                </span>
              </label>
            </div>
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
              onChange={(e) => {
                if (readOnly) return;
                setComments(e.target.value);
              }}
              readOnly={readOnly}
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
                ...(readOnly
                  ? { backgroundColor: "#F3F4F6", cursor: "not-allowed" }
                  : {}),
              }}
            />
            {readOnly ? (
              <p
                style={{
                  margin: "16px 0 0",
                  fontSize: "13px",
                  color: "#6B7280",
                  fontWeight: 600,
                }}
              >
                This assessment is finalised and cannot be edited.
              </p>
            ) : null}
            <div
              className="assessment-action-buttons"
              style={{
                display: "grid",
                gridTemplateColumns: readOnly
                  ? "minmax(0, 1fr)"
                  : "repeat(3, minmax(0, 1fr))",
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
              {!readOnly ? (
                <>
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
                </>
              ) : null}
            </div>
          </div>
        </div>

        <ResultsPanel
          result={result}
          onCalculate={updateClassification}
          motorPreview={totalsPreview}
          columnTotals={columnTotals}
          readOnly={readOnly}
        />
      </div>
    </>
  );
}
