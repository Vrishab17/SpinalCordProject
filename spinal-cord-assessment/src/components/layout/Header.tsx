"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type GP = {
  title: string;
  given_name: string;
  family_name: string;
};

export default function Header() {
  const [gpName, setGpName] = useState("Loading...");

  useEffect(() => {
    async function fetchGP() {
      const { data: userData } = await supabase.auth.getUser();

      if (!userData?.user) {
        setGpName("Unknown User");
        return;
      }

      // Adjust table/column names if needed
      const { data, error } = await supabase
        .from("Staff") // or GP table
        .select("title, given_name, family_name")
        .eq("user_id", userData.user.id)
        .single();

      if (error || !data) {
        setGpName("Unknown User");
        return;
      }

      const gp = data as GP;

      const formatted = `${gp.title} ${gp.given_name[0]}. ${gp.family_name}`;
      setGpName(formatted);
    }

    fetchGP();
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
        <div
          style={{
            fontSize: "28px",
            fontWeight: 700,
            marginBottom: "4px",
          }}
        >
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "14px",
        }}
      >
        <span
          style={{
            fontSize: "18px",
            fontWeight: 400,
            color: "#AEB9D3",
          }}
        >
          {gpName}
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