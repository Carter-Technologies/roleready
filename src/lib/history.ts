import { supabase } from "./supabase";
import type { AtsAnalysis, Generation } from "./types";

export async function fetchGenerations(userId: string): Promise<Generation[]> {
  const { data, error } = await supabase
    .from("cv_requests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Generation[];
}

export async function saveGeneration(input: {
  userId: string;
  originalCv: string;
  jobDesc: string;
  tailoredCv: string;
  coverLetter: string;
  jobTitle: string;
  atsScore?: number | null;
  atsAnalysis?: AtsAnalysis | null;
  applicationId?: string | null;
}): Promise<Generation | null> {
  const { data, error } = await supabase
    .from("cv_requests")
    .insert({
      user_id: input.userId,
      original_cv: input.originalCv,
      job_description: input.jobDesc,
      tailored_cv: input.tailoredCv,
      cover_letter: input.coverLetter,
      job_title: input.jobTitle,
      ats_score: input.atsScore ?? null,
      ats_analysis: input.atsAnalysis ?? null,
      application_id: input.applicationId ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Generation;
}

export async function deleteGeneration(id: string): Promise<void> {
  const { error } = await supabase.from("cv_requests").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function updateMasterCv(userId: string, masterCv: string): Promise<void> {
  const { error } = await supabase
    .from("profiles")
    .update({ master_cv: masterCv, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw new Error(error.message);
}
