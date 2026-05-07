"use client";

import { useEffect, useState } from "react";
import { ISNCSCI, Exam as ISNCSCIExam } from "isncsci";
import BodyDiagram from "./BodyDiagram";
import ResultsPanel from "./ResultsPanel";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export const LEVELS = [
  "C2",
  "C3",
  "C4",
  "C5",
  "C6",
  "C7",
  "C8",
  "T1",
  "T2",
  "T3",
  "T4",
  "T5",
  "T6",
  "T7",
  "T8",
  "T9",
  "T10",
  "T11",
  "T12",
  "L1",
  "L2",
  "L3",
  "L4",
  "L5",
  "S1",
  "S2",
  "S3",
  "S4_5",
] as const;

export const MOTOR_LEVELS = [
  "C5",
  "C6",
  "C7",
  "C8",
  "T1",
  "L2",
  "L3",
  "L4",
  "L5",
  "S1",
] as const;

type Side = "right" | "left";
type ScoreType = "motor" | "lightTouch" | "pinPrick";
type UiScore = "" | "0" | "1" | "2" | "3" | "4" | "5" | "NT";
type BinaryObservation = "" | "Yes" | "No" | "NT";

type UiExam = {
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
  width: "38px",
  height: "26px",
  border: "1px solid #AEB4BE",
  backgroundColor: "#E5E5E5",
  textAlign: "center",
  color: "#15284C",
  fontSize: "12px",
  padding: 0,
};

function emptyScores(): Record<string, UiScore> {
  return LEVELS.reduce((acc, level) => {
    acc[level] = "";
    return acc;
  }, {} as Record<string, UiScore>);
}

const defaultExam: UiExam = {
  right: {
    lowestNonKeyMuscleWithMotorFunction: "C5",
    motor: emptyScores(),
    lightTouch: emptyScores(),
    pinPrick: emptyScores(),
  },
  left: {
    lowestNonKeyMuscleWithMotorFunction: "C5",
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

      if (MOTOR_LEVELS.includes(level as any) && !exam[side].motor[level]) {
        return true;
      }
    }
  }

  if (!exam.voluntaryAnalContraction) return true;
  if (!exam.deepAnalPressure) return true;

  return false;
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

  return {
    voluntaryAnalContraction: exam.voluntaryAnalContraction || "NT",
    deepAnalPressure: exam.deepAnalPressure || "NT",
    right: {
      lowestNonKeyMuscleWithMotorFunction: exam.right
        .lowestNonKeyMuscleWithMotorFunction as any,
      motor: motor("right") as any,
      lightTouch: sensory("right", "lightTouch") as any,
      pinPrick: sensory("right", "pinPrick") as any,
    },
    left: {
      lowestNonKeyMuscleWithMotorFunction: exam.left
        .lowestNonKeyMuscleWithMotorFunction as any,
      motor: motor("left") as any,
      lightTouch: sensory("left", "lightTouch") as any,
      pinPrick: sensory("left", "pinPrick") as any,
    },
  } as ISNCSCIExam;
}

function calculateAge(dob: string) {
  const birth = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

export default function AssessmentForm() {
  const searchParams = useSearchParams();
  const nhi = searchParams.get("nhi");
  const [patient, setPatient] = useState<any>(null);
  const [exam, setExam] = useState<UiExam>(defaultExam);
  const [result, setResult] = useState<any>(null);
  const [topDown, setTopDown] = useState(false);

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

      if (topDown && value !== "") {
        const startIndex = LEVELS.indexOf(level as any);

        for (let i = startIndex + 1; i < LEVELS.length; i++) {
          const nextLevel = LEVELS[i];

          if (type === "motor" && !MOTOR_LEVELS.includes(nextLevel as any)) {
            continue;
          }

          updatedValues[nextLevel] = value;
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

  function calculate() {
    if (hasEmptyScores(exam)) {
      alert("You cannot calculate while there are empty results.");
      return;
    }

    const calculated = new ISNCSCI(toISNCSCIExam(exam));
    setResult(calculated);
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
          gridTemplateColumns: "40px 38px 38px 38px",
          gap: "4px",
          marginBottom: "1px",
          alignItems: "center",
        }}
      >
        <span style={{ textAlign: "right", paddingRight: "6px" }}>{level}</span>

        {MOTOR_LEVELS.includes(level as any) ? (
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
          gridTemplateColumns: "38px 38px 38px 40px",
          gap: "4px",
          marginBottom: "1px",
          alignItems: "center",
        }}
      >
        {renderInput("left", "lightTouch", level, exam.left.lightTouch[level])}
        {renderInput("left", "pinPrick", level, exam.left.pinPrick[level])}

        {MOTOR_LEVELS.includes(level as any) ? (
          renderInput("left", "motor", level, exam.left.motor[level])
        ) : (
          <div />
        )}

        <span style={{ paddingLeft: "6px" }}>{level}</span>
      </div>
    ));
  }

  return (
    <div
      style={{
        backgroundColor: "#F6F4EC",
        color: "#15284C",
        height: "calc(100vh - 100px)",
        //overflow: "hidden",
        boxSizing: "border-box",
        marginTop: "-1px",
        padding: 0,
        margin: 0,
      }}
    >
      {/* Patient details strip */}
      <div
        style={{
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #15284C",
          padding: "10px 22px",
          margin: 0,
          width: "100%",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: "1.6fr 1.2fr 1fr 1fr 1.4fr 2fr",
          gap: "18px",
          alignItems: "center",
          fontSize: "14px",
          color: "#15284C",
        }}
      >
        <span>
          <strong>NAME:</strong>{" "}
          {patient
            ? `${patient.name?.family_name ?? ""}, ${
                patient.name?.given_name ?? ""
              }`
            : "Loading..."}
        </span>
        <span>
          <strong>NHI:</strong> {nhi ?? "N/A"}
        </span>
        <span>
          <strong>DOB:</strong> {patient?.date_of_birth ?? "N/A"}
        </span>
        <span>
          <strong>AGE:</strong>{" "}
          {patient?.date_of_birth
            ? `${calculateAge(patient.date_of_birth)} Years`
            : "N/A"}
        </span>
        <span>
          <strong>SEX:</strong> {patient?.gender ?? "N/A"}
        </span>
        <span>
          <strong>ETHNICITY:</strong> {patient?.ethnicity ?? "N/A"}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "340px minmax(0, 1fr)",
          gap: "24px",
          alignItems: "stretch",
          height: "calc(100% - 43px)",
          minHeight: 0,
          padding: "6px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            height: "100%",
            //overflow: "hidden",
            borderRight: "2px solid #2D3E5E",
            paddingRight: "14px",
            backgroundColor: "#F6F4EC",
            boxSizing: "border-box",
          }}
        >
          <ResultsPanel
            result={result}
            topDown={topDown}
            setTopDown={setTopDown}
            onCalculate={calculate}
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "200px minmax(0, 1fr) 200px",
            gap: "24px",
            alignItems: "center",
            height: "100%",
            minHeight: 0,
            paddingLeft: "36px",
            boxSizing: "border-box",
          }}
        >
          <section>
            <h2 style={{ margin: "0 0 4px", fontSize: "18px" }}>RIGHT</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "40px 38px 38px 38px",
                marginBottom: "1px",
                gap: "4px",
                fontSize: "12px",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              <span />
              <span>M</span>
              <span>LT</span>
              <span>PP</span>
            </div>

            {renderRightRows()}

            <label style={{ fontSize: "13px" }}>
              (VAC) Voluntary anal contraction{" "}
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
              >
                <option value=""></option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="NT">NT</option>
              </select>
            </label>
          </section>

          <section
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <BodyDiagram exam={exam as any} />
          </section>

          <section>
            <h2 style={{ margin: "0 0 4px", fontSize: "18px" }}>LEFT</h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "38px 38px 38px 40px",
                marginBottom: "1px",
                gap: "4px",
                fontSize: "12px",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              <span>LT</span>
              <span>PP</span>
              <span>M</span>
              <span />
            </div>

            {renderLeftRows()}

            <label style={{ fontSize: "13px" }}>
              <select
                value={exam.deepAnalPressure}
                onChange={(e) => {
                  setExam((prev) => ({
                    ...prev,
                    deepAnalPressure: e.target.value as BinaryObservation,
                  }));
                  setResult(null);
                }}
              >
                <option value=""></option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="NT">NT</option>
              </select>{" "}
              (DAP) Deep anal pressure
            </label>
          </section>
        </div>
      </div>
    </div>
  );
}
