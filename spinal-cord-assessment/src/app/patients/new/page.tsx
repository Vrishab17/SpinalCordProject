import Header from "@/components/layout/Header";
import NewPatientForm from "@/components/patients/NewPatientForm";

export default function NewPatientPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#F6F4EC",
      }}
    >
      <Header />

      <div
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
          padding: "32px 24px",
          boxSizing: "border-box",
        }}
      >
        <h1
          style={{
            fontSize: "40px",
            fontWeight: 700,
            color: "#15284C",
            margin: "0 0 24px 0",
          }}
        >
          New Patient
        </h1>

        <NewPatientForm />
      </div>
    </main>
  );
}