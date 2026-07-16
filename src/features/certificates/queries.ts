import "server-only";

import { createClient } from "@/lib/supabase/server";
import { integrations } from "@/lib/env";

export interface CertificateVerification {
  certificateNumber: string;
  issuedAt: string;
  studentName: string;
  courseTitle: string;
}

/**
 * Verify a certificate by its public token via the `verify_certificate` RPC
 * (SECURITY DEFINER — never exposes the certificates table). Returns null when
 * not found. Before Supabase is connected, a demo token is recognized so the
 * verification UX is fully demonstrable.
 */
export async function verifyCertificate(
  token: string,
): Promise<CertificateVerification | null> {
  if (!integrations.supabase) {
    if (token === "demo" || token.toLowerCase() === "dmaths-demo") {
      return {
        certificateNumber: "D-MATHS-2026-DEMO1234",
        issuedAt: new Date().toISOString(),
        studentName: "Kwame Osei",
        courseTitle: "Mathematics Made Simple",
      };
    }
    return null;
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .rpc("verify_certificate", { token })
      .maybeSingle<{
        certificate_number: string;
        issued_at: string;
        student_name: string;
        course_title: string;
      }>();

    if (error || !data) return null;
    return {
      certificateNumber: data.certificate_number,
      issuedAt: data.issued_at,
      studentName: data.student_name,
      courseTitle: data.course_title,
    };
  } catch {
    return null;
  }
}
