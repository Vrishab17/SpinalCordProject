"use client";

import AssessmentForm from "@/components/assessment/AssessmentForm";

export default function AssessmentPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* PAGE HEADER */}
      <div className="bg-blue-900 text-white p-4 rounded-md mb-4 flex justify-between items-center">
        <div>
          <h1 className="text-lg font-semibold">
            Health New Zealand
          </h1>
          <p className="text-sm opacity-80">
            Te Whatu Ora
          </p>
        </div>

        <div className="text-sm">
          Dr. J. Doe
        </div>
      </div>

      {/* PATIENT INFO BAR */}
      <div className="bg-white p-4 rounded-md mb-4 text-sm flex flex-wrap gap-4">
        <span><strong>Name:</strong> Michael Turner</span>
        <span><strong>DOB:</strong> 14 May 1978</span>
        <span><strong>Age:</strong> 47</span>
        <span><strong>Gender:</strong> Male</span>
        <span><strong>Ethnicity:</strong> NZ European</span>
        <span><strong>Address:</strong> Auckland</span>
      </div>

      {/* MAIN FORM */}
      <div className="bg-white p-6 rounded-md shadow">
        <AssessmentForm />
      </div>

    </div>
  );
}