"use client";

import type { CSSProperties, ReactNode } from "react";

type TotalsClassification = Record<string, unknown>;

type Props = {
  result: unknown;
  onCalculate: () => void;
  motorPreview: {
    ur: number;
    ul: number;
    uems: number;
    lr: number;
    ll: number;
    lems: number;
  };
  /** Dermatome totals shown under ZPP (main form passes computed strings). */
  columnTotals: {
    right: { ur: string; lr: string; lt: string; pp: string };
    left: { ul: string; ll: string; lt: string; pp: string };
  };
};

const NAVY = "#15284C";
const BORDER = "#D6D6D6";

function get(obj: unknown, paths: string[]): string {
  for (const path of paths) {
    const value = path.split(".").reduce(
      (acc: unknown, key) =>
        acc != null && typeof acc === "object"
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      obj
    );
    if (value !== undefined && value !== null && value !== "") {
      return String(value);
    }
  }
  return "";
}

function ResultBox({
  value,
  wide = false,
}: {
  value: unknown;
  wide?: boolean;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: wide ? "72px" : "44px",
        height: "32px",
        padding: wide ? "0 10px" : "0 6px",
        border: `1px solid ${BORDER}`,
        backgroundColor: "#FFFFFF",
        borderRadius: "6px",
        color: NAVY,
        fontSize: "13px",
        fontWeight: 500,
        fontFamily: "inherit",
      }}
    >
      {String(value ?? "")}
    </span>
  );
}

export default function ResultsPanel({
  result,
  onCalculate,
  motorPreview,
  columnTotals,
}: Props) {
  const r = result as TotalsClassification | null | undefined;
  const c = (r?.classification ?? {}) as TotalsClassification;
  const t = (r?.totals ?? {}) as Record<string, unknown> & {
    right?: Record<string, unknown>;
    left?: Record<string, unknown>;
  };

  const sensoryRight = get(c, [
    "neurologicalLevel.sensoryRight",
    "neurologicalLevels.sensoryRight",
  ]);
  const sensoryLeft = get(c, [
    "neurologicalLevel.sensoryLeft",
    "neurologicalLevels.sensoryLeft",
  ]);
  const motorRight = get(c, [
    "neurologicalLevel.motorRight",
    "neurologicalLevels.motorRight",
  ]);
  const motorLeft = get(c, [
    "neurologicalLevel.motorLeft",
    "neurologicalLevels.motorLeft",
  ]);

  const nli = get(c, ["neurologicalLevelOfInjury"]);
  const complete = get(c, ["completeOrIncomplete", "injuryComplete"]);
  const ais = get(c, ["ASIAImpairmentScale", "asiaImpairmentScale"]);

  const zppSensoryRight = get(c, [
    "zoneOfPartialPreservations.sensoryRight",
    "zoneOfPartialPreservation.sensoryRight",
  ]);
  const zppSensoryLeft = get(c, [
    "zoneOfPartialPreservations.sensoryLeft",
    "zoneOfPartialPreservation.sensoryLeft",
  ]);
  const zppMotorRight = get(c, [
    "zoneOfPartialPreservations.motorRight",
    "zoneOfPartialPreservation.motorRight",
  ]);
  const zppMotorLeft = get(c, [
    "zoneOfPartialPreservations.motorLeft",
    "zoneOfPartialPreservation.motorLeft",
  ]);

  const ltR = (t.right?.lightTouch ?? t.lightTouch ?? "") as unknown;
  const ltL = (t.left?.lightTouch ?? "") as unknown;
  const ltTotal = (t.lightTouch ?? "") as unknown;

  const ppR = (t.right?.pinPrick ?? t.pinPrick ?? "") as unknown;
  const ppL = (t.left?.pinPrick ?? "") as unknown;
  const ppTotal = (t.pinPrick ?? "") as unknown;

  const uerShow = (t.right?.upperExtremity ?? motorPreview.ur) as unknown;
  const uelShow = (t.left?.upperExtremity ?? motorPreview.ul) as unknown;
  const lerShow = (t.right?.lowerExtremity ?? motorPreview.lr) as unknown;
  const lelShow = (t.left?.lowerExtremity ?? motorPreview.ll) as unknown;
  const uemsShow = (t.upperExtremity ?? motorPreview.uems) as unknown;
  const lemsShow = (t.lowerExtremity ?? motorPreview.lems) as unknown;

  const primaryBtn: CSSProperties = {
    padding: "10px 14px",
    backgroundColor: NAVY,
    border: `1px solid ${NAVY}`,
    borderRadius: "6px",
    color: "#FFFFFF",
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
  };

  return (
    <aside
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        backgroundColor: "#FFFFFF",
        borderLeft: `1px solid ${BORDER}`,
        color: NAVY,
        fontSize: "14px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "20px 22px",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <p style={{ margin: 0, fontSize: "12px", color: "#5C667A", flex: "1 1 160px", lineHeight: 1.4 }}>
            Each score fills every level below it in that column automatically (top-down scoring).
          </p>
          <button type="button" onClick={onCalculate} style={primaryBtn}>
            Update
          </button>
        </div>

        <Section title="Motor subscores">
          <div style={{ fontSize: "13px", lineHeight: 1.9 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
              <span style={{ minWidth: "36px", fontWeight: 600 }}>UER</span>
              <ResultBox value={uerShow} />
              <span>+</span>
              <span style={{ fontWeight: 600 }}>UEL</span>
              <ResultBox value={uelShow} />
              <span>=</span>
              <span style={{ fontWeight: 600 }}>UEMS</span>
              <ResultBox value={uemsShow} />
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "6px",
                alignItems: "center",
                marginTop: "6px",
              }}
            >
              <span style={{ minWidth: "36px", fontWeight: 600 }}>LER</span>
              <ResultBox value={lerShow} />
              <span>+</span>
              <span style={{ fontWeight: 600 }}>LEL</span>
              <ResultBox value={lelShow} />
              <span>=</span>
              <span style={{ fontWeight: 600 }}>LEMS</span>
              <ResultBox value={lemsShow} />
            </div>
          </div>
        </Section>

        <Section title="Sensory subscores">
          <div style={{ fontSize: "13px", lineHeight: 1.9 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
              <span style={{ fontWeight: 600 }}>LTR</span>
              <ResultBox value={ltR !== "" ? ltR : "—"} />
              <span>+</span>
              <span style={{ fontWeight: 600 }}>LTL</span>
              <ResultBox value={ltL !== "" ? ltL : "—"} />
              <span>=</span>
              <span style={{ fontWeight: 600 }}>LT Total</span>
              <ResultBox value={ltTotal !== "" ? ltTotal : "—"} wide />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center", marginTop: "6px" }}>
              <span style={{ fontWeight: 600 }}>PPR</span>
              <ResultBox value={ppR !== "" ? ppR : "—"} />
              <span>+</span>
              <span style={{ fontWeight: 600 }}>PPL</span>
              <ResultBox value={ppL !== "" ? ppL : "—"} />
              <span>=</span>
              <span style={{ fontWeight: 600 }}>PP Total</span>
              <ResultBox value={ppTotal !== "" ? ppTotal : "—"} wide />
            </div>
          </div>
        </Section>

        <div
          style={{
            marginTop: "32px",
            paddingTop: "24px",
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          <Section title="Neurological levels (steps 1–6)">
            <Step n={1} label="Sensory">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "24px 1fr 1fr",
                gap: "6px",
                alignItems: "center",
              }}
            >
              <span />
              <span style={{ fontSize: "12px", fontWeight: 700 }}>R</span>
              <span style={{ fontSize: "12px", fontWeight: 700 }}>L</span>
              <span />
              <ResultBox value={sensoryRight} />
              <ResultBox value={sensoryLeft} />
            </div>
          </Step>
          <Step n={2} label="Motor">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "24px 1fr 1fr",
                gap: "6px",
                alignItems: "center",
              }}
            >
              <span />
              <span style={{ fontSize: "12px", fontWeight: 700 }}>R</span>
              <span style={{ fontSize: "12px", fontWeight: 700 }}>L</span>
              <span />
              <ResultBox value={motorRight} />
              <ResultBox value={motorLeft} />
            </div>
          </Step>
          <Step n={3} label="Neurological level of injury (NLI)">
            <ResultBox value={nli} wide />
          </Step>
          <Step n={4} label="Complete or incomplete?">
            <ResultBox value={complete} wide />
          </Step>
          <Step n={5} label="ASIA Impairment Scale (AIS)">
            <ResultBox value={ais} wide />
          </Step>
          <Step n={6} label="Zone of partial preservation">
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "70px 1fr 1fr",
                gap: "6px",
                alignItems: "center",
              }}
            >
              <span />
              <span style={{ fontSize: "12px", fontWeight: 700 }}>R</span>
              <span style={{ fontSize: "12px", fontWeight: 700 }}>L</span>
              <span style={{ fontSize: "12px" }}>Sensory</span>
              <ResultBox value={zppSensoryRight} />
              <ResultBox value={zppSensoryLeft} />
              <span style={{ fontSize: "12px" }}>Motor</span>
              <ResultBox value={zppMotorRight} />
              <ResultBox value={zppMotorLeft} />
            </div>
          </Step>

          <div
            style={{
              marginTop: "20px",
              paddingTop: "18px",
              borderTop: `1px solid ${BORDER}`,
              display: "flex",
              flexDirection: "column",
              gap: "22px",
              width: "100%",
              boxSizing: "border-box",
            }}
          >
            <div style={{ width: "100%" }}>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: NAVY,
                  marginBottom: "12px",
                  letterSpacing: "0.06em",
                }}
              >
                RIGHT TOTALS
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: "12px 10px",
                  width: "100%",
                  fontSize: "15px",
                  lineHeight: 1.45,
                  color: NAVY,
                }}
              >
                <span style={{ minWidth: 0 }}>
                  UER{" "}
                  <strong style={{ fontSize: "18px", fontWeight: 700 }}>
                    {columnTotals.right.ur}
                  </strong>
                  <span style={{ color: "#6B7280", fontSize: "14px" }}> /25</span>
                </span>
                <span style={{ minWidth: 0 }}>
                  LER{" "}
                  <strong style={{ fontSize: "18px", fontWeight: 700 }}>
                    {columnTotals.right.lr}
                  </strong>
                  <span style={{ color: "#6B7280", fontSize: "14px" }}> /25</span>
                </span>
                <span style={{ minWidth: 0 }}>
                  LT{" "}
                  <strong style={{ fontSize: "18px", fontWeight: 700 }}>
                    {columnTotals.right.lt}
                  </strong>
                </span>
                <span style={{ minWidth: 0 }}>
                  PP{" "}
                  <strong style={{ fontSize: "18px", fontWeight: 700 }}>
                    {columnTotals.right.pp}
                  </strong>
                </span>
              </div>
            </div>
            <div style={{ width: "100%" }}>
              <div
                style={{
                  fontSize: "15px",
                  fontWeight: 700,
                  color: NAVY,
                  marginBottom: "12px",
                  letterSpacing: "0.06em",
                }}
              >
                LEFT TOTALS
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
                  gap: "12px 10px",
                  width: "100%",
                  fontSize: "15px",
                  lineHeight: 1.45,
                  color: NAVY,
                }}
              >
                <span style={{ minWidth: 0 }}>
                  UEL{" "}
                  <strong style={{ fontSize: "18px", fontWeight: 700 }}>
                    {columnTotals.left.ul}
                  </strong>
                  <span style={{ color: "#6B7280", fontSize: "14px" }}> /25</span>
                </span>
                <span style={{ minWidth: 0 }}>
                  LEL{" "}
                  <strong style={{ fontSize: "18px", fontWeight: 700 }}>
                    {columnTotals.left.ll}
                  </strong>
                  <span style={{ color: "#6B7280", fontSize: "14px" }}> /25</span>
                </span>
                <span style={{ minWidth: 0 }}>
                  LT{" "}
                  <strong style={{ fontSize: "18px", fontWeight: 700 }}>
                    {columnTotals.left.lt}
                  </strong>
                </span>
                <span style={{ minWidth: 0 }}>
                  PP{" "}
                  <strong style={{ fontSize: "18px", fontWeight: 700 }}>
                    {columnTotals.left.pp}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </Section>
        </div>
      </div>
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3
        style={{
          margin: "0 0 10px",
          fontSize: "14px",
          fontWeight: 700,
          color: NAVY,
          letterSpacing: "0.02em",
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function Step({
  n,
  label,
  children,
}: {
  n: number;
  label: string;
  children: ReactNode;
}) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <div
        style={{
          fontSize: "12px",
          fontWeight: 700,
          color: "#4B5563",
          marginBottom: "6px",
        }}
      >
        {n}. {label}
      </div>
      {children}
    </div>
  );
}
