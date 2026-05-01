"use client";

type Props = {
  classification: any;
  totals: any;
};

export default function AISClassification({ classification, totals }: Props) {
  return (
    <div>

      <h3>Classification</h3>

      <p><strong>AIS:</strong> {classification.ais}</p>
      <p><strong>NLI:</strong> {classification.neurologicalLevelOfInjury}</p>

      <h3>Totals</h3>

      <p>Right Motor: {totals.right?.motor}</p>
      <p>Left Motor: {totals.left?.motor}</p>

      <p>Light Touch: {totals.lightTouch}</p>
      <p>Pin Prick: {totals.pinPrick}</p>

    </div>
  );
}
