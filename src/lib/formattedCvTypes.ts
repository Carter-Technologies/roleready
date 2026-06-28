export type FormattedCvExperience = {
  title: string;
  company: string;
  location?: string;
  dates: string;
  bullets: string[];
};

export type FormattedCvEducation = {
  degree: string;
  institution: string;
  dates?: string;
  details?: string;
};

export type FormattedCv = {
  name: string;
  headline?: string;
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
  };
  summary?: string;
  experience: FormattedCvExperience[];
  education: FormattedCvEducation[];
  skills: string[];
  certifications?: string[];
};
