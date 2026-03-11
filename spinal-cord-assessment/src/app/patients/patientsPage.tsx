import PatientSearch from "@/components/patients/PatientSearch";

export default function PatientsPage() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">Patient Search</h1>

      <PatientSearch />
    </div>
  );
}