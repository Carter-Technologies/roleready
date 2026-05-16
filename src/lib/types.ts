export type AtsAnalysis = {
  score: number;
  keywordScoring: {
    matchPercentage: number;
    matchedKeywords: string[];
    missingKeywords: string[];
  };
  atsOptimisation: string[];
  missingSkills: {
    skill: string;
    importance: "high" | "medium" | "low";
    suggestion: string;
  }[];
  resumeFeedback: string[];
};

export type InterviewPrep = {
  questions: { question: string; category: string; tips: string }[];
  starAnswers: {
    question: string;
    situation: string;
    task: string;
    action: string;
    result: string;
  }[];
  questionsToAsk: string[];
  focusAreas: string[];
  elevatorPitch: string;
};

export type FollowUpDraft = {
  subject: string;
  body: string;
};

export type JobApplication = {
  id: string;
  user_id: string;
  company: string;
  role_title: string;
  job_url: string | null;
  status: string;
  notes: string | null;
  applied_at: string | null;
  follow_up_at: string | null;
  interview_at: string | null;
  primary_cv_request_id: string | null;
  interview_prep: InterviewPrep | null;
  follow_up_draft: string | null;
  created_at: string;
  updated_at: string;
};

export type Generation = {
  id: string;
  created_at: string;
  original_cv: string;
  job_description: string;
  tailored_cv: string | null;
  cover_letter: string | null;
  job_title: string | null;
  user_id: string;
  ats_score: number | null;
  ats_analysis: AtsAnalysis | null;
  application_id: string | null;
};

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  master_cv: string | null;
  updated_at: string;
  created_at: string;
};

export type SplitResult = {
  tailoredCV: string;
  coverLetter: string;
};
