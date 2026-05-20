import { Suspense } from "react";
import AssessmentForm from "@/components/assessment/AssessmentForm";
import AuthGuard from "@/components/AuthGuard";
import AssessmentNewClient from "./AssessmentNewClient";

export default function AssessmentPage() {
  return (
    <AuthGuard>
      <Suspense fallback={<div>Loading...</div>}>
        <AssessmentNewClient />
      </Suspense>
    </AuthGuard>
  );
}
