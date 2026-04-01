"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

<<<<<<< Updated upstream
=======
type StaffName = {
  prefix: string | null;
  given_name: string | null;
  preferred_name: string | null;
  family_name: string | null;
};

>>>>>>> Stashed changes
export default function Header() {
  const [staffName, setStaffName] = useState("Loading...");

  useEffect(() => {
<<<<<<< Updated upstream
    async function fetchGP() {
      const username = localStorage.getItem("loggedInUser");

      if (!username) {
        setGpName("Unknown User");
        return;
      }

      // STEP 1: Get staff_id from Staff Credentials
      const { data: credData, error: credError } = await supabase
        .from("Staff Credentials")
        .select("STAFFstaff_id")
        .eq("username", username)
        .single();

      if (credError || !credData) {
        console.log("Credential error:", credError);
        setGpName("Unknown User");
        return;
      }

      const staffId = credData.STAFFstaff_id;

      // STEP 2: Get name from Staff Name
      const { data: nameData, error: nameError } = await supabase
        .from("Staff Name")
        .select("prefix, given_name, family_name")
        .eq("STAFFstaff_id", staffId)
        .single();

      if (nameError || !nameData) {
        console.log("Name error:", nameError);
        setGpName("Unknown User");
        return;
      }

      const formatted = `${nameData.prefix} ${nameData.given_name} ${nameData.family_name}`;
      setGpName(formatted);
=======
    async function fetchStaff() {
      const username = localStorage.getItem("loggedInUser");

      if (!username) {
        setStaffName("Unknown User");
        return;
      }

      // 🔍 Get staff_id from credentials table
      const { data: credData, error: credError } = await supabase
        .from("Staff Credentials")
        .select("staff_id")
        .eq("username", username)
        .maybeSingle();

      if (credError || !credData) {
        setStaffName("Unknown User");
        return;
      }

      // 🔍 Get name from Staff Name table
      const { data, error } = await supabase
        .from("Staff Name")
        .select("prefix, given_name, preferred_name, family_name")
        .eq("STAFFstaff_id", credData.staff_id)
        .maybeSingle();

      if (error || !data) {
        setStaffName("Unknown User");
        return;
      }

      const staff = data as StaffName;

      // 🎯 Use preferred name if available
      const firstName =
        staff.preferred_name || staff.given_name || "";

      const formatted = `${staff.prefix ?? ""} ${firstName} ${staff.family_name ?? ""}`.trim();

      setStaffName(formatted);
>>>>>>> Stashed changes
    }

    fetchStaff();
  }, []);

  return (
    <header
      style={{
        backgroundColor: "#33476D",
        color: "#FFFFFF",
        padding: "20px 24px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        width: "100%",
      }}
    >
      {/* LEFT */}
      <div>
        <div style={{ fontSize: "28px", fontWeight: 700 }}>
          Health New Zealand
        </div>
        <div
          style={{
            fontSize: "20px",
            fontWeight: 700,
            color: "#1FC2D5",
          }}
        >
          Te Whatu Ora
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <span
          style={{
            fontSize: "18px",
            fontWeight: 400,
            color: "#AEB9D3",
          }}
        >
          {staffName}
        </span>

        {/* Profile icon */}
        <div
          style={{
            width: "58px",
            height: "58px",
            borderRadius: "50%",
            border: "4px solid #7E90BA",
            position: "relative",
          }}
        >
          <div
            style={{
              width: "16px",
              height: "16px",
              borderRadius: "50%",
              backgroundColor: "#7E90BA",
              position: "absolute",
              top: "10px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
          <div
            style={{
              width: "28px",
              height: "14px",
              borderRadius: "14px 14px 10px 10px",
              backgroundColor: "#7E90BA",
              position: "absolute",
              bottom: "10px",
              left: "50%",
              transform: "translateX(-50%)",
            }}
          />
        </div>
      </div>
    </header>
  );
}