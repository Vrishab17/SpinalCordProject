"use client";

const NAVY = "#15284C";
const BORDER = "#D6D6D6";
const MUTED = "#5C667A";

type Props = {
  assessmentId?: string | null;
  name: string;
  dob: string;
  age: string;
  gender: string;
  ethnicity: string;
  nhi: string;
  address: string;
  loading?: boolean;
};

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 3,
        minWidth: 0,
        width: "100%",
      }}
    >
      <span
        style={{
          fontWeight: 700,
          color: MUTED,
          fontSize: 10,
          letterSpacing: "0.04em",
          textTransform: "uppercase",
          lineHeight: 1,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontWeight: 600,
          color: NAVY,
          fontSize: 13,
          lineHeight: 1.25,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {value}
      </span>
    </div>
  );
}

export default function PatientAssessmentBar(props: Props) {
  const dash = "—";
  const v = props.loading
    ? {
        name: dash,
        dob: dash,
        age: dash,
        gender: dash,
        ethnicity: dash,
        nhi: dash,
        address: dash,
      }
    : props;

  const assessmentIdValue = props.loading
    ? dash
    : props.assessmentId?.trim() || dash;

  const fields = [
    { label: "Assessment ID", value: assessmentIdValue },
    { label: "Name", value: v.name || dash },
    { label: "DOB", value: v.dob || dash },
    { label: "Age", value: v.age || dash },
    { label: "Gender", value: v.gender || dash },
    { label: "Ethnicity", value: v.ethnicity || dash },
    { label: "NHI", value: v.nhi || dash },
    { label: "Address", value: v.address || dash },
  ];

  return (
    <div
      style={{
        width: "100%",
        boxSizing: "border-box",
        backgroundColor: "#FFFFFF",
        borderBottom: `1px solid ${BORDER}`,
        padding: "14px 22px",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 0.9fr) minmax(0, 1.5fr) minmax(0, 1.1fr) minmax(0, 0.75fr) minmax(0, 0.85fr) minmax(0, 1fr) minmax(0, 0.85fr) minmax(0, 1.8fr)",
          gap: "8px 20px",
          alignItems: "center",
          width: "100%",
        }}
      >
        {fields.map((field) => (
          <Field key={field.label} label={field.label} value={field.value} />
        ))}
      </div>
    </div>
  );
}
