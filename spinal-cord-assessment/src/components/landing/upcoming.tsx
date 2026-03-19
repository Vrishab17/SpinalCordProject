"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Assessment = {
  nhi: string;
  patient_name: string;
  review_date: string;
};

type Review = {
  nhi: string;
  name: string;
  date: string;
  isToday: boolean;
};

const UpcomingReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from("assessments")
        .select("nhi, patient_name, review_date")
        .order("review_date", { ascending: true })
        .limit(5);

      if (error) {
        console.error("Error fetching reviews:", error);
        return;
      }

      if (!data) return;

      const today = new Date().toISOString().split("T")[0];

      const formatted: Review[] = data.map((item: Assessment) => {
        const isToday = item.review_date === today;

        return {
          nhi: item.nhi,
          name: item.patient_name,
          date: isToday
            ? "Today"
            : new Date(item.review_date).toLocaleDateString("en-NZ"),
          isToday,
        };
      });

      setReviews(formatted);
    };

    fetchReviews();
  }, []);

  return (
    <div className="bg-white border border-gray-300 rounded-md p-4 w-full max-w-md">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        Upcoming Reviews
      </h2>

      <div className="space-y-3">
        {reviews.length === 0 ? (
          <p className="text-sm text-gray-500">No upcoming reviews</p>
        ) : (
          reviews.map((review, index) => (
            <div
              key={index}
              className="flex justify-between items-center border-b border-gray-200 pb-2 last:border-none"
            >
              <div className="flex gap-4 text-sm text-gray-700">
                <span className="font-medium text-gray-600 w-[80px]">
                  {review.nhi}
                </span>
                <span>{review.name}</span>
              </div>

              <span
                className={`text-sm font-medium ${
                  review.isToday ? "text-red-500" : "text-gray-600"
                }`}
              >
                {review.date}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingReviews;