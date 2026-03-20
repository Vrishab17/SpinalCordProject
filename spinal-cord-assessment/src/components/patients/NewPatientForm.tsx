"use client";

import { useState } from "react";
import PersonalDetailsSection from "./PersonalDetailsSection";
import InjuryInformationSection from "./InjuryInformationSection";
import NewPatientActions from "./NewPatientActions";

export type NewPatientFormData = {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ethnicity: string;
  gender: string;
  phoneNumber: string;
  nhiNumber: string;
  address: string;
  dateOfInjury: string;
  injuryCause: string;
  notes: string;
};

const initialFormData: NewPatientFormData = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  ethnicity: "",
  gender: "",
  phoneNumber: "",
  nhiNumber: "",
  address: "",
  dateOfInjury: "",
  injuryCause: "",
  notes: "",
};

export default function NewPatientForm() {
  const [formData, setFormData] = useState<NewPatientFormData>(initialFormData);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    setFormData(initialFormData);
  };

  const handleReview = () => {
    console.log("Review & Confirm clicked", formData);
  };

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #5F6F8C",
        padding: "0",
        color: "#15284C",
      }}
    >
      <PersonalDetailsSection formData={formData} onChange={handleChange} />
      <InjuryInformationSection formData={formData} onChange={handleChange} />
      <NewPatientActions onCancel={handleCancel} onReview={handleReview} />
    </div>
  );
}