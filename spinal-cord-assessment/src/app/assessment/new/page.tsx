"use client";

import Header from "@/components/layout/Header";
import AssessmentForm from "@/components/assessment/AssessmentForm";

export default function AssessmentPage() {
  return (
    <div>
      <Header />

      <div style={{ padding: "20px" }}>
        <AssessmentForm />
      </div>
    </div>
  );
}