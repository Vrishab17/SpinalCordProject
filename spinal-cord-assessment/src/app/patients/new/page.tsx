"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import NewPatientForm from "@/components/patients/NewPatientForm";

export default function NewPatientPage() {
  const router = useRouter();

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
        }}
      >
        <button
          onClick={() => router.push("/dashboard")}
          style={{
            marginBottom: "20px",
            padding: "10px 16px",
            backgroundColor: "#FFFFFF",
            border: "1px solid #5F6F8C",
            color: "#15284C",
            fontSize: "14px",
            cursor: "pointer",
          }}
        >
          ← Back to Home
        </button>

        <h1
          style={{
            fontSize: "32px",
            fontWeight: 600,
            color: "#15284C",
            marginBottom: "24px",
          }}
        >
          New Patient
        </h1>

        <Suspense fallback={<div>Loading form...</div>}>
          <NewPatientForm />
        </Suspense>
      </div>
    </main>
  );
}