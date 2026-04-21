"use client";

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
        {/* BACK BUTTON (always goes home) */}
        <button
          onClick={() => router.push("/")}
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

        {/*TITLE */}
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

        <NewPatientForm />
      </div>
    </main>
  );
}