import AssessmentNewClient from "./AssessmentNewClient";
import { Suspense } from "react";
import Header from "@/components/layout/Header";
import AssessmentForm from "@/components/assessment/AssessmentForm";

export default function AssessmentPage() {
  return (
    <div>
      <Header />

      <Suspense fallback={<div>Loading...</div>}>
        <AssessmentNewClient />
        <AssessmentForm />
      </Suspense>
    </div>
  );
}
