import { supabase } from "./supabase";
import type { ApplicationStatus } from "./applicationStatus";
import type { JobApplication } from "./types";

export async function fetchApplications(userId: string): Promise<JobApplication[]> {
  const { data, error } = await supabase
    .from("job_applications")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as JobApplication[];
}

export async function createApplication(input: {
  userId: string;
  company: string;
  roleTitle: string;
  jobUrl?: string;
  status?: ApplicationStatus;
  notes?: string;
  primaryCvRequestId?: string;
  appliedAt?: string | null;
}): Promise<JobApplication> {
  const { data, error } = await supabase
    .from("job_applications")
    .insert({
      user_id: input.userId,
      company: input.company,
      role_title: input.roleTitle,
      job_url: input.jobUrl ?? null,
      status: input.status ?? "applied",
      notes: input.notes ?? null,
      primary_cv_request_id: input.primaryCvRequestId ?? null,
      applied_at: input.appliedAt ?? (input.status === "applied" ? new Date().toISOString() : null),
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as JobApplication;
}

export async function updateApplication(
  id: string,
  patch: Partial<{
    company: string;
    role_title: string;
    job_url: string | null;
    status: ApplicationStatus;
    notes: string | null;
    applied_at: string | null;
    follow_up_at: string | null;
    interview_at: string | null;
    interview_prep: unknown;
    follow_up_draft: string | null;
  }>
): Promise<JobApplication> {
  const { data, error } = await supabase
    .from("job_applications")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as JobApplication;
}

export async function deleteApplication(id: string): Promise<void> {
  const { error } = await supabase.from("job_applications").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function linkCvRequestToApplication(
  cvRequestId: string,
  applicationId: string
): Promise<void> {
  const { error } = await supabase
    .from("cv_requests")
    .update({ application_id: applicationId })
    .eq("id", cvRequestId);

  if (error) throw new Error(error.message);
}

export async function createApplicationFromGeneration(input: {
  userId: string;
  company: string;
  roleTitle: string;
  cvRequestId: string;
  status?: ApplicationStatus;
}): Promise<JobApplication> {
  const app = await createApplication({
    userId: input.userId,
    company: input.company,
    roleTitle: input.roleTitle,
    status: input.status ?? "applied",
    primaryCvRequestId: input.cvRequestId,
    appliedAt: new Date().toISOString(),
  });
  await linkCvRequestToApplication(input.cvRequestId, app.id);
  return app;
}
