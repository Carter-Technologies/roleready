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
