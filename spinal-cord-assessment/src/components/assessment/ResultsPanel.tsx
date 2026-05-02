"use client";

type Props = {
  result: any;

  topDown: boolean;

  setTopDown: React.Dispatch<React.SetStateAction<boolean>>;

  onCalculate: () => void;
};

function get(obj: any, paths: string[]) {
  for (const path of paths) {
    const value = path.split(".").reduce((acc, key) => acc?.[key], obj);
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
}

function ResultBox({ value, wide = false }: { value: any; wide?: boolean }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: wide ? "100px" : "48px",
        height: "28px",
        border: "1px solid #AEB4BE",
        backgroundColor: "#E5E5E5",
        color: "#15284C",
        fontSize: "13px",
        fontWeight: 500,
      }}
    >
      {value ?? ""}
    </span>
  );
}

export default function ResultsPanel({
  result,
  topDown,
  setTopDown,
  onCalculate,
}: Props) {
  const c = result?.classification ?? {};
  const t = result?.totals ?? {};

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

  return (
    <aside
      style={{
        width: "330px",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        color: "#15284C",
        backgroundColor: "#F6F4EC",
        fontSize: "16px",
        transform: "scale(0.88)",
        transformOrigin: "top left",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "20px",
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "3px",
            fontSize: "13px",
            fontWeight: 600,
          }}
        >
          <input
            type="checkbox"
            checked={topDown}
            onChange={(e) => setTopDown(e.target.checked)}
          />
          Top-down
        </label>

        <button
          onClick={onCalculate}
          style={{
            height: "32px",
            padding: "0 12px",
            backgroundColor: "#2D3E5E",
            color: "#fff",
            border: "none",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          Calculate
        </button>
      </div>
      <h2 style={{ margin: "0 0 14px", fontSize: "28px", fontWeight: 700 }}>
        Classification
      </h2>
      <div
        style={{
          display: "flex",

          flexDirection: "column",

          justifyContent: "space-between",

          flex: 1,
        }}
      >
        <Section title="Neurological Levels">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "90px 60px 60px",
              gap: "4px",
              alignItems: "center",
            }}
          >
            <span></span>
            <strong>R</strong>
            <strong>L</strong>

            <span>Sensory</span>
            <ResultBox value={sensoryRight} />
            <ResultBox value={sensoryLeft} />

            <span>Motor</span>
            <ResultBox value={motorRight} />
            <ResultBox value={motorLeft} />
          </div>
        </Section>

        <Section title="Injury Classification">
          <div style={{ display: "grid", gap: "10px" }}>
            <Row label="NLI" value={nli} wide />
            <Row label="Complete?" value={complete} wide />
            <Row label="AIS" value={ais} wide />
          </div>
        </Section>

        <Section title="Zone of Partial Preservation">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "90px 60px 60px",
              gap: "4px",
              alignItems: "center",
            }}
          >
            <span></span>
            <strong>R</strong>
            <strong>L</strong>

            <span>Sensory</span>
            <ResultBox value={zppSensoryRight} />
            <ResultBox value={zppSensoryLeft} />

            <span>Motor</span>
            <ResultBox value={zppMotorRight} />
            <ResultBox value={zppMotorLeft} />
          </div>
        </Section>

        <Section title="Sub-scores">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "95px 60px 60px 60px",
              gap: "4px",
              alignItems: "center",
            }}
          >
            <span></span>
            <strong>R</strong>
            <strong>L</strong>
            <strong>Total</strong>

            <span>UEMS</span>
            <ResultBox value={t?.right?.upperExtremity} />
            <ResultBox value={t?.left?.upperExtremity} />
            <ResultBox value={t?.upperExtremity} />

            <span>LEMS</span>
            <ResultBox value={t?.right?.lowerExtremity} />
            <ResultBox value={t?.left?.lowerExtremity} />
            <ResultBox value={t?.lowerExtremity} />

            <span>LT</span>
            <ResultBox value={t?.right?.lightTouch} />
            <ResultBox value={t?.left?.lightTouch} />
            <ResultBox value={t?.lightTouch} />

            <span>PP</span>
            <ResultBox value={t?.right?.pinPrick} />
            <ResultBox value={t?.left?.pinPrick} />
            <ResultBox value={t?.pinPrick} />
          </div>
        </Section>
      </div>
    </aside>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3
        style={{
          margin: "0 0 14px",
          fontSize: "22px",
          fontWeight: 700,
          color: "#15284C",
        }}
      >
        {title}
      </h3>
      {children}
    </section>
  );
}

function Row({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: any;
  wide?: boolean;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <span style={{ width: "90px" }}>{label}</span>
      <ResultBox value={value} wide={wide} />
    </div>
  );
}
