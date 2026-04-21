import type { NewPatientFormData } from "./NewPatientForm";

type Props = {
  formData: NewPatientFormData;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "#15284C",
  marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: "42px",
  border: "1px solid #D6D6D6",
  backgroundColor: "#FFFFFF",
  padding: "10px 12px",
  fontSize: "14px",
  color: "#15284C",
  boxSizing: "border-box",
  outline: "none",
};

const textAreaStyle: React.CSSProperties = {
  width: "100%",
  minHeight: "110px",
  border: "1px solid #D6D6D6",
  backgroundColor: "#FFFFFF",
  padding: "10px 12px",
  fontSize: "14px",
  color: "#15284C",
  boxSizing: "border-box",
  outline: "none",
  resize: "vertical",
};

export default function InjuryInformationSection({ formData, onChange }: Props) {
  return (
    <section>
      <div
        style={{
          padding: "14px 18px",
          borderBottom: "1px solid #5F6F8C",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "20px",
            fontWeight: 600,
            color: "#15284C",
          }}
        >
          INJURY INFORMATION
        </h2>
      </div>

      <div
        style={{
          padding: "20px 18px 24px 18px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "18px 28px",
        }}
      >
        <div>
          <label htmlFor="dateOfInjury" style={labelStyle}>
            DATE OF INJURY
          </label>
          <input
            id="dateOfInjury"
            name="dateOfInjury"
            type="date"
            value={formData.dateOfInjury}
            onChange={onChange}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="injuryCause" style={labelStyle}>
            INJURY CAUSE
          </label>
          <input
            id="injuryCause"
            name="injuryCause"
            value={formData.injuryCause}
            onChange={onChange}
            style={inputStyle}
          />
        </div>

        <div style={{ gridColumn: "span 2" }}>
          <label htmlFor="notes" style={labelStyle}>
            NOTES
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={onChange}
            style={textAreaStyle}
          />
        </div>
      </div>
    </section>
  );
}