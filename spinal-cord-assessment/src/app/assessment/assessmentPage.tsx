import AssessmentForm from "@/components/assessment/AssessmentForm";

export default function AssessmentPage() {
  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-xl font-semibold">
        ISNCSCI Assessment
      </h1>

      <div className="mt-4">
        <AssessmentForm />
      </div>
    </div>
  );
}