"use client";

const NAVY = "#15284C";
const BORDER = "#D6D6D6";

type Props = {
  name: string;
  dob: string;
  age: string;
  gender: string;
  ethnicity: string;
  address: string;
  loading?: boolean;
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "baseline",
        gap: 8,
        flexWrap: "wrap",
        minWidth: 0,
      }}
    >
      <span style={{ fontWeight: 700, color: NAVY, fontSize: 11, flexShrink: 0 }}>
        {label}:
      </span>
      <span style={{ fontWeight: 500, color: NAVY, fontSize: 12, lineHeight: 1.3 }}>
        {value}
      </span>
    </span>
  );
}

export default function PatientAssessmentBar(props: Props) {
  const dash = "—";
  const v = props.loading
    ? { name: dash, dob: dash, age: dash, gender: dash, ethnicity: dash, address: dash }
    : props;

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: "#E6E8EC",
        borderBottom: `1px solid ${BORDER}`,
        paddingTop: "7px",
        paddingBottom: "8px",
        paddingLeft: "clamp(16px, 4vw, 40px)",
        paddingRight: "clamp(16px, 4vw, 40px)",
      }}
    >
      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          width: "100%",
          display: "grid",
          columnGap: "clamp(10px, 2vw, 28px)",
          rowGap: "6px",
          gridTemplateColumns:
            "repeat(5, minmax(0, 1fr)) minmax(min(200px, 100%), 1.6fr)",
          alignItems: "start",
          justifyItems: "stretch",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <Field label="NAME" value={v.name || dash} />
        </div>
        <div style={{ minWidth: 0 }}>
          <Field label="DOB" value={v.dob || dash} />
        </div>
        <div style={{ minWidth: 0 }}>
          <Field label="AGE" value={v.age || dash} />
        </div>
        <div style={{ minWidth: 0 }}>
          <Field label="GENDER" value={v.gender || dash} />
        </div>
        <div style={{ minWidth: 0 }}>
          <Field label="ETHNICITY" value={v.ethnicity || dash} />
        </div>
        <div style={{ minWidth: 0 }}>
          <Field label="ADDRESS" value={v.address || dash} />
        </div>
      </div>
    </div>
  );
}
