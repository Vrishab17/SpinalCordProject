"use client";

import ScoreBox from "./ScoreBox";

export default function ResultsPanel({ result }: { result: any }) {
  const classification = result?.classification;
  const totals = result?.totals;

  return (
    <div
      style={{
        borderTop: "1px solid #DDD",
        paddingTop: "24px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr 1fr 1fr 1.5fr",
        gap: "32px",
        textAlign: "center",
        color: "#15284C",
      }}
    >
      <section>

<div>Neurological levels</div>
<div style={{ display: "flex", gap: "10px" }}>
  <span>R</span>
  <ScoreBox value={classification?.neurologicalLevel?.sensoryRight} />
  <ScoreBox value={classification?.neurologicalLevel?.motorRight} />
</div>
<div style={{ display: "flex", gap: "10px" }}>
  <span>L</span>
  <ScoreBox value={classification?.neurologicalLevel?.sensoryLeft} />
  <ScoreBox value={classification?.neurologicalLevel?.motorLeft} />
</div>
</section>

      <section>
        <div>Neurological Level of Injury (NLI)</div>
        <ScoreBox value={classification?.neurologicalLevelOfInjury} wide />
      </section>

      <section>
        <div>Complete or Incomplete?</div>
        <ScoreBox value={classification?.injuryComplete} wide />
      </section>

      <section>
        <div>Asia Impairment Scale (AIS)</div>
        <ScoreBox value={classification?.ASIAImpairmentScale} wide />
      </section>

      <section>
        <div>Zone of partial preservation</div>

        <div style={{ display: "grid", gridTemplateColumns: "80px 80px 80px" }}>
          <span></span>
          <span>R</span>
          <span>L</span>

          <span>Sensory</span>
          <ScoreBox value={classification?.zoneOfPartialPreservations?.sensoryRight} />
          <ScoreBox value={classification?.zoneOfPartialPreservations?.sensoryLeft} />

          <span>Motor</span>
          <ScoreBox value={classification?.zoneOfPartialPreservations?.motorRight} />
          <ScoreBox value={classification?.zoneOfPartialPreservations?.motorLeft} />
        </div>
      </section>

      <section>
        <div>Sub-scores</div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "100px 70px 70px 70px",
            gap: "4px",
          }}
        >
          <span></span>
          <span>R</span>
          <span>L</span>
          <span>Total</span>

          <span>UEMS</span>
          <ScoreBox value={totals?.right?.upperExtremity} />
          <ScoreBox value={totals?.left?.upperExtremity} />
          <ScoreBox value={totals?.upperExtremity} />

          <span>LEMS</span>
          <ScoreBox value={totals?.right?.lowerExtremity} />
          <ScoreBox value={totals?.left?.lowerExtremity} />
          <ScoreBox value={totals?.lowerExtremity} />

          <span>Light touch</span>
          <ScoreBox value={totals?.right?.lightTouch} />
          <ScoreBox value={totals?.left?.lightTouch} />
          <ScoreBox value={totals?.lightTouch} />

          <span>Pin prick</span>
          <ScoreBox value={totals?.right?.pinPrick} />
          <ScoreBox value={totals?.left?.pinPrick} />
          <ScoreBox value={totals?.pinPrick} />
        </div>
      </section>
    </div>
  );
}