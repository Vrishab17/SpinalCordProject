import PatientSearch from "@/components/patients/PatientSearch";
import Header from "@/components/layout/Header";
import AuthGuard from "@/components/AuthGuard";

export default function Page() {
  return (
    <AuthGuard>
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
    </AuthGuard>
  );
}
