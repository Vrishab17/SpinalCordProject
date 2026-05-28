import { NextResponse } from "next/server";
import type { UiExam } from "@/components/assessment/AssessmentForm";
import { requireStaffSession } from "@/lib/api/requireStaffSession";
import type { AssessmentId } from "@/lib/assessmentId";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import {
  persistAssessmentOnServer,
  type PersistMode,
} from "@/lib/server/persistAssessment";

type SaveBody = {
  patientId: number;
  mode: PersistMode;
  existingAssessmentId?: string | null;
  exam: UiExam;
  comments: string;
  injuryDate?: string | null;
  reviewDate?: string | null;
  classificationResult?: unknown;
};

export async function POST(request: Request) {
  const auth = await requireStaffSession();
  if (auth.response) return auth.response;

  try {
    const body = (await request.json()) as SaveBody;
    if (body.patientId == null || !body.exam) {
      return NextResponse.json(
        { error: "patientId and exam are required" },
        { status: 400 }
      );
    }

    const db = getSupabaseAdmin();
    const result = await persistAssessmentOnServer(db, {
      staffId: auth.staff!.staffId,
      patientId: body.patientId,
      mode: body.mode,
      existingAssessmentId: (body.existingAssessmentId ?? null) as AssessmentId | null,
      exam: body.exam,
      comments: body.comments ?? "",
      injuryDate: body.injuryDate,
      reviewDate: body.reviewDate,
      classificationResult: body.classificationResult,
    });

    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Save failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
