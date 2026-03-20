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

export default function PersonalDetailsSection({ formData, onChange }: Props) {
  return (
    <section
      style={{
        borderBottom: "1px solid #5F6F8C",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
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
          PERSONAL DETAILS
        </h2>

        <span
          style={{
            fontSize: "12px",
            color: "#B42318",
          }}
        >
          * required
        </span>
      </div>

      <div
        style={{
          padding: "20px 18px 24px 18px",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "18px 28px",
        }}
      >
        <div>
          <label htmlFor="firstName" style={labelStyle}>
            FIRST NAME *
          </label>
          <input
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={onChange}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="dateOfBirth" style={labelStyle}>
            DATE OF BIRTH *
          </label>
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={onChange}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="ethnicity" style={labelStyle}>
            ETHNICITY
          </label>
          <input
            id="ethnicity"
            name="ethnicity"
            value={formData.ethnicity}
            onChange={onChange}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="lastName" style={labelStyle}>
            LAST NAME *
          </label>
          <input
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={onChange}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="gender" style={labelStyle}>
            GENDER *
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={onChange}
            style={inputStyle}
          >
            <option value="">Select</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label htmlFor="phoneNumber" style={labelStyle}>
            PHONE NUMBER
          </label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={onChange}
            style={inputStyle}
          />
        </div>

        <div>
          <label htmlFor="nhiNumber" style={labelStyle}>
            NHI NUMBER *
          </label>
          <input
            id="nhiNumber"
            name="nhiNumber"
            value={formData.nhiNumber}
            onChange={onChange}
            style={inputStyle}
          />
        </div>

        <div style={{ gridColumn: "span 2" }}>
          <label htmlFor="address" style={labelStyle}>
            ADDRESS
          </label>
          <input
            id="address"
            name="address"
            value={formData.address}
            onChange={onChange}
            style={inputStyle}
          />
        </div>
      </div>
    </section>
  );
}