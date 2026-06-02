import type { SupabaseClient } from "@supabase/supabase-js";

export type AuditAction =
  | "patient.register"
  | "assessment.create"
  | "assessment.update"
  | "assessment.finalise"
  | "assessment.version"
  | "patient.injury.update";

export async function writeAuditLog(
  db: SupabaseClient,
  opts: {
    entityType: string;
    entityId: string;
    action: AuditAction;
    staffId: number;
    details?: Record<string, unknown>;
  }
): Promise<void> {
  const { error } = await db.from("Audit Log").insert({
    entity_type: opts.entityType,
    entity_id: opts.entityId,
    action: opts.action,
    STAFFstaff_id: opts.staffId,
    details: opts.details ?? null,
    created_at: new Date().toISOString(),
  });
  if (error) {
    console.error("Audit log write failed:", error.message);
  }
}
