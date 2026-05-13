import PatientSearch from "@/components/patients/PatientSearch";
import Header from "@/components/layout/Header";

export default function Page() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#F6F4EC",
      }}
    >
      <Header />
      <PatientSearch />
    </main>
  );
}
