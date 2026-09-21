import { Type } from "@google/genai";
import { z } from "zod";

export const PersonalInfoSchema = z.object({
  fullName: z.string().default(""),
  email: z.string().default(""),
  phone: z.string().default(""),
  location: z.string().default(""),
  linkedin: z.string().optional().default(""),
  github: z.string().optional().default(""),
  website: z.string().optional().default(""),
});

export const ExperienceItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  company: z.string().default(""),
  role: z.string().default(""),
  location: z.string().optional().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  current: z.boolean().default(false),
  bullets: z.array(z.string()).default([]),
});

export const EducationItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  institution: z.string().default(""),
  degree: z.string().default(""),
  field: z.string().optional().default(""),
  startDate: z.string().default(""),
  endDate: z.string().default(""),
  gpa: z.string().optional().default(""),
});

export const SkillCategorySchema = z.object({
  category: z.string().default(""),
  items: z.array(z.string()).default([]),
});

export const ProjectItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  name: z.string().default(""),
  description: z.string().default(""),
  technologies: z.array(z.string()).default([]),
  link: z.string().optional().default(""),
  bullets: z.array(z.string()).default([]),
});

export const CertificationItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  name: z.string().default(""),
  issuer: z.string().default(""),
  date: z.string().default(""),
});

export const ResumeSchema = z.object({
  personalInfo: PersonalInfoSchema.default({
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    github: "",
    website: "",
  }),
  summary: z.string().default(""),
  experience: z.array(ExperienceItemSchema).default([]),
  education: z.array(EducationItemSchema).default([]),
  skills: z.array(SkillCategorySchema).default([]),
  projects: z.array(ProjectItemSchema).default([]),
  certifications: z.array(CertificationItemSchema).default([]),
});

export type Resume = z.infer<typeof ResumeSchema>;
export type PersonalInfo = z.infer<typeof PersonalInfoSchema>;
export type ExperienceItem = z.infer<typeof ExperienceItemSchema>;
export type EducationItem = z.infer<typeof EducationItemSchema>;
export type SkillCategory = z.infer<typeof SkillCategorySchema>;
export type ProjectItem = z.infer<typeof ProjectItemSchema>;
export type CertificationItem = z.infer<typeof CertificationItemSchema>;

export const initialResumeState: Resume = {
  personalInfo: {
    fullName: "Alex Morgan",
    email: "alex.morgan@email.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexmorgan",
    github: "github.com/alexmorgan",
    website: "alexmorgan.dev",
  },
  summary:
    "Full-Stack Software Engineer with 4+ years of experience designing and scaling web applications, APIs, and microservices. Adept at TypeScript, React, Node.js, and cloud architectures with a focus on performance, ATS optimization, and maintainable systems.",
  experience: [
    {
      id: "exp-1",
      company: "TechNova Solutions",
      role: "Senior Full-Stack Engineer",
      location: "San Francisco, CA",
      startDate: "Jan 2022",
      endDate: "Present",
      current: true,
      bullets: [
        "Architected and deployed customer-facing analytics dashboard in Next.js and TypeScript, reducing initial load latency by 35%.",
        "Designed and scaled REST & GraphQL microservices handling over 2M requests daily with 99.98% uptime.",
        "Mentored a team of 4 junior engineers and championed automated testing, boosting unit test coverage from 60% to 88%.",
      ],
    },
    {
      id: "exp-2",
      company: "DataPulse Labs",
      role: "Software Engineer",
      location: "San Jose, CA",
      startDate: "Jun 2020",
      endDate: "Dec 2021",
      current: false,
      bullets: [
        "Engineered real-time collaboration tools using WebSockets and React, increasing active daily user retention by 22%.",
        "Optimized PostgreSQL database queries and indexing strategies, slashing average API response times by 40%.",
        "Collaborated with product designers to implement responsive, accessible UI components complying with WCAG 2.1 AA.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      institution: "University of California, Berkeley",
      degree: "Bachelor of Science",
      field: "Computer Science",
      startDate: "2016",
      endDate: "2020",
      gpa: "3.8/4.0",
    },
  ],
  skills: [
    {
      category: "Languages",
      items: ["TypeScript", "JavaScript", "Python", "SQL", "HTML5", "CSS3"],
    },
    {
      category: "Frameworks & Libraries",
      items: [
        "React",
        "Next.js",
        "Node.js",
        "Express",
        "Tailwind CSS",
        "Zustand",
      ],
    },
    {
      category: "Cloud & Developer Tools",
      items: ["Docker", "AWS", "PostgreSQL", "Git", "Jest", "CI/CD Pipelines"],
    },
    {
      category: "Databases & Infrastructure",
      items: ["PostgreSQL", "Redis", "MongoDB", "Terraform", "Nginx", "Linux"],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "CloudScale CI/CD Engine",
      description:
        "Lightweight self-hosted runner and build orchestrator for containerized workloads.",
      technologies: ["Go", "Docker", "React", "gRPC"],
      link: "github.com/alexmorgan/cloudscale",
      bullets: [
        "Designed and implemented a distributed build queue in Go, reducing average pipeline execution time by 45% across 200+ daily builds.",
        "Built a real-time React dashboard for monitoring build statuses, logs, and resource utilization with WebSocket streaming.",
        "Containerized runner orchestration with Docker Compose and health-check probes, achieving 99.9% uptime in production.",
      ],
    },
    {
      id: "proj-2",
      name: "InsightBoard Analytics",
      description:
        "Open-source real-time analytics dashboard for SaaS metrics with customizable widgets.",
      technologies: [
        "Next.js",
        "TypeScript",
        "PostgreSQL",
        "Chart.js",
        "Tailwind CSS",
      ],
      link: "github.com/alexmorgan/insightboard",
      bullets: [
        "Developed a pluggable widget system allowing users to compose drag-and-drop dashboard layouts persisted to PostgreSQL.",
        "Implemented server-side data aggregation endpoints with incremental caching, cutting average query latency from 800ms to 120ms.",
        "Wrote comprehensive integration and unit tests achieving 92% code coverage, published npm package with 1.2k+ weekly downloads.",
      ],
    },
    {
      id: "proj-3",
      name: "DevVault Secret Manager",
      description:
        "CLI and web UI for encrypted secrets management with team-based access control.",
      technologies: ["Rust", "React", "SQLite", "OAuth 2.0"],
      link: "github.com/alexmorgan/devvault",
      bullets: [
        "Built a Rust CLI for encrypting, storing, and rotating secrets with AES-256-GCM, processing 50k+ operations per day.",
        "Designed team-based RBAC with OAuth 2.0 integration, supporting SSO via Google and GitHub for seamless onboarding.",
        "Created a React admin panel for audit logging, access reviews, and secret versioning with diff visualization.",
      ],
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect – Associate",
      issuer: "Amazon Web Services",
      date: "2023",
    },
    {
      id: "cert-2",
      name: "Certified Kubernetes Application Developer (CKAD)",
      issuer: "The Linux Foundation",
      date: "2024",
    },
  ],
};

// ---------------------------------------------------------------------------
// Native Gemini `responseSchema` objects (single source of truth for the API
// routes). These mirror the Zod schemas above but use the `@google/genai`
// `Type` enum, which is what `responseSchema` requires. Only the
// `description` hints differ between extraction (faithful parsing) and
// tailoring (JD-aligned rewriting); the shape stays identical so both routes
// return the same `Resume` JSON.
// ---------------------------------------------------------------------------

const personalInfoSchema = {
  type: Type.OBJECT,
  properties: {
    fullName: { type: Type.STRING },
    email: { type: Type.STRING },
    phone: { type: Type.STRING },
    location: { type: Type.STRING },
    linkedin: { type: Type.STRING },
    github: { type: Type.STRING },
    website: { type: Type.STRING },
  },
  required: ["fullName", "email", "phone", "location"],
};

const experienceItemSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    company: { type: Type.STRING },
    role: { type: Type.STRING },
    location: { type: Type.STRING },
    startDate: { type: Type.STRING },
    endDate: { type: Type.STRING },
    current: { type: Type.BOOLEAN },
    bullets: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["company", "role", "startDate", "endDate", "bullets"],
};

const skillCategorySchema = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING },
    items: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ["category", "items"],
};

const educationItemSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    institution: { type: Type.STRING },
    degree: { type: Type.STRING },
    field: { type: Type.STRING },
    startDate: { type: Type.STRING },
    endDate: { type: Type.STRING },
    gpa: { type: Type.STRING },
  },
  required: ["institution", "degree", "startDate", "endDate"],
};

const projectItemSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    description: { type: Type.STRING },
    highlights: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    link: { type: Type.STRING },
    technologies: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    bullets: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "Bullet points describing projects work, tech stack and features",
    },
  },
  required: ["name", "description"],
};

const certificationItemSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    name: { type: Type.STRING },
    issuer: { type: Type.STRING },
    date: { type: Type.STRING },
    url: { type: Type.STRING },
  },
  required: ["name"],
};

export const resumeExtractionSchema = {
  type: Type.OBJECT,
  properties: {
    personalInfo: personalInfoSchema,
    summary: {
      type: Type.STRING,
      description:
        "Professional summary or objective statement of the candidate",
    },
    experience: {
      type: Type.ARRAY,
      description:
        "List of work experience entries in reverse chronological order",
      items: {
        ...experienceItemSchema,
        properties: {
          ...experienceItemSchema.properties,
          bullets: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "Bullet points describing achievements, responsibilities, and quantified results",
          },
        },
      },
    },
    skills: {
      type: Type.ARRAY,
      description:
        "Skills grouped by logical category (e.g. Languages, Frameworks, Cloud & Tools)",
      items: skillCategorySchema,
    },
    education: {
      type: Type.ARRAY,
      description: "Educational history",
      items: educationItemSchema,
    },
    projects: {
      type: Type.ARRAY,
      description: "Notable personal, academic, or professional projects",
      items: projectItemSchema,
    },
    certifications: {
      type: Type.ARRAY,
      description: "Certifications and licenses",
      items: certificationItemSchema,
    },
  },
  required: ["personalInfo", "summary", "experience", "skills", "education"],
};

export const resumeTailoringSchema = {
  type: Type.OBJECT,
  properties: {
    personalInfo: personalInfoSchema,
    summary: {
      type: Type.STRING,
      description:
        "Tailored professional summary closely aligned with the target job title, core qualifications, and culture mentioned in the Job Description.",
    },
    experience: {
      type: Type.ARRAY,
      description:
        "Work experience entries with enhanced, high-impact bullet points mapped to JD requirements.",
      items: {
        ...experienceItemSchema,
        properties: {
          ...experienceItemSchema.properties,
          bullets: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description:
              "Quantified, action-oriented bullet points incorporating target keywords, technologies, and achievements relevant to the JD.",
          },
        },
      },
    },
    skills: {
      type: Type.ARRAY,
      description:
        "Prioritized and categorized skills matching the tech stack, methodologies, and tools requested in the JD.",
      items: skillCategorySchema,
    },
    education: {
      type: Type.ARRAY,
      description: "Education entries (preserve candidate's actual education)",
      items: educationItemSchema,
    },
    projects: {
      type: Type.ARRAY,
      description:
        "Projects with bullet points emphasizing technologies matching the JD",
      items: projectItemSchema,
    },
    certifications: {
      type: Type.ARRAY,
      items: certificationItemSchema,
    },
  },
  required: ["personalInfo", "summary", "experience", "skills", "education"],
};
