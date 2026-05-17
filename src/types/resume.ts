export interface PersonalInfo {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  github: string;
  website: string;
  photo?: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  field: string;
  start: string;
  end: string;
  details: string;
}

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  bullets: string[];
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  link: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  date: string;
  image?: string;
}

export interface LanguageItem {
  id: string;
  name: string;
  level: string;
}

export type SectionKey =
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "languages";

export interface ResumeData {
  personal: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: string[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  languages: LanguageItem[];
  sectionOrder: SectionKey[];
}

export const emptyResume: ResumeData = {
  personal: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    address: "",
    linkedin: "",
    github: "",
    website: "",
    photo: "",
  },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  projects: [],
  certifications: [],
  languages: [],
  sectionOrder: [
    "summary",
    "experience",
    "education",
    "skills",
    "projects",
    "certifications",
    "languages",
  ],
};

export const SECTION_LABELS: Record<SectionKey, string> = {
  summary: "Professional Summary",
  experience: "Work Experience",
  education: "Education",
  skills: "Skills",
  projects: "Projects",
  certifications: "Certifications",
  languages: "Languages",
};

export type TemplateKey =
  | "executive"
  | "tech"
  | "creative"
  | "academic"
  | "functional"
  | "startup"
  | "project";

export const TEMPLATE_LABELS: Record<TemplateKey, string> = {
  executive: "Executive",
  tech: "Tech Minimalist",
  creative: "Creative Storyteller",
  academic: "Academic / CV",
  functional: "Career Changer",
  startup: "Startup Hustler",
  project: "Project-Centric",
};

export function normalizeTemplate(key: string | null | undefined): TemplateKey {
  if (!key) return "executive";
  if (key === "modern") return "creative";
  if (key === "classic") return "executive";
  if (key === "minimal") return "tech";
  if (key in TEMPLATE_LABELS) return key as TemplateKey;
  return "executive";
}
