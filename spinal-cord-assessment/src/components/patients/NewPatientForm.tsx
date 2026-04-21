"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import PersonalDetailsSection from "./PersonalDetailsSection";
import InjuryInformationSection from "./InjuryInformationSection";
import NewPatientActions from "./NewPatientActions";

export type NewPatientFormData = {
  firstName: string;
  lastName: string;
  preferredName: string;
  prefix: string;
  dateOfBirth: string;
  ethnicity: string;
  gender: string;
  nzCitizenshipStatus: string;
  placeOfBirth: string;
  phoneNumber: string;
  homePhoneNumber: string;
  emailAddress: string;
  nhiNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  suburb: string;
  postalCode: string;
  dateOfInjury: string;
  injuryCause: string;
  notes: string;
};

const STORAGE_KEY = "new_patient_form_data";

const initialFormData: NewPatientFormData = {
  firstName: "",
  lastName: "",
  preferredName: "",
  prefix: "",
  dateOfBirth: "",
  ethnicity: "",
  gender: "",
  nzCitizenshipStatus: "",
  placeOfBirth: "",
  phoneNumber: "",
  homePhoneNumber: "",
  emailAddress: "",
  nhiNumber: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  suburb: "",
  postalCode: "",
  dateOfInjury: "",
  injuryCause: "",
  notes: "",
};

export default function NewPatientForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState<NewPatientFormData>(initialFormData);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [hasLoadedInitialData, setHasLoadedInitialData] = useState(false);

  useEffect(() => {
    try {
      const encodedData = searchParams.get("data");

      if (encodedData) {
        const parsed = JSON.parse(decodeURIComponent(encodedData)) as NewPatientFormData;
        setFormData(parsed);
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
        setHasLoadedInitialData(true);
        return;
      }

      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as NewPatientFormData;
        setFormData(parsed);
      }
    } catch {
      // ignore bad data
    } finally {
      setHasLoadedInitialData(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!hasLoadedInitialData) return;

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch {
      // ignore storage errors
    }
  }, [formData, hasLoadedInitialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleCancel = () => {
    setFormData(initialFormData);
    setErrorMessage(null);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  async function handleReview() {
    setErrorMessage(null);

    const missingRequiredFields: string[] = [];

    if (!formData.nhiNumber.trim()) missingRequiredFields.push("NHI Number");
    if (!formData.prefix.trim()) missingRequiredFields.push("Prefix");
    if (!formData.firstName.trim()) missingRequiredFields.push("First Name");
    if (!formData.lastName.trim()) missingRequiredFields.push("Surname");
    if (!formData.dateOfBirth.trim()) missingRequiredFields.push("Date of Birth");
    if (!formData.gender.trim()) missingRequiredFields.push("Gender");
    if (!formData.ethnicity.trim()) missingRequiredFields.push("Ethnicity");
    if (!formData.placeOfBirth.trim()) missingRequiredFields.push("Place of Birth");
    if (!formData.nzCitizenshipStatus.trim()) missingRequiredFields.push("NZ Citizenship Status");
    if (!formData.addressLine1.trim()) missingRequiredFields.push("Address Line 1");
    if (!formData.city.trim()) missingRequiredFields.push("City");
    if (!formData.suburb.trim()) missingRequiredFields.push("Suburb");
    if (!formData.postalCode.trim()) missingRequiredFields.push("Postcode");

    const hasAtLeastOneContact =
      formData.phoneNumber.trim() ||
      formData.homePhoneNumber.trim() ||
      formData.emailAddress.trim();

    if (!hasAtLeastOneContact) {
      missingRequiredFields.push("At least one contact method");
    }

    if (missingRequiredFields.length > 0) {
      setErrorMessage(`Please complete: ${missingRequiredFields.join(", ")}.`);
      return;
    }

    setChecking(true);

    try {
      const normalizedNhi = formData.nhiNumber.trim().toUpperCase();

      const { data, error } = await supabase
        .from("Patient")
        .select("patient_id, nhi_number")
        .eq("nhi_number", normalizedNhi)
        .maybeSingle();

      if (error) {
        setErrorMessage(`Could not validate NHI number: ${error.message}`);
        return;
      }

      if (data) {
        setErrorMessage(`A patient with NHI number ${normalizedNhi} already exists.`);
        return;
      }

      const nextFormData = {
        ...formData,
        nhiNumber: normalizedNhi,
      };

      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextFormData));

      const encoded = encodeURIComponent(JSON.stringify(nextFormData));
      router.push(`/patients/confirm?data=${encoded}`);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        border: "1px solid #5F6F8C",
        padding: 0,
        color: "#15284C",
      }}
    >
      <PersonalDetailsSection formData={formData} onChange={handleChange} />
      <InjuryInformationSection formData={formData} onChange={handleChange} />

      {errorMessage && (
        <div
          style={{
            margin: "18px",
            marginBottom: "0",
            padding: "12px 14px",
            backgroundColor: "#FEF3F2",
            border: "1px solid #FECDCA",
            color: "#B42318",
            fontSize: "14px",
          }}
        >
          {errorMessage}
        </div>
      )}

      <NewPatientActions
        onCancel={handleCancel}
        onReview={handleReview}
        reviewLabel={checking ? "Checking..." : "Review & Confirm →"}
        reviewDisabled={checking}
      />
    </div>
  );
}