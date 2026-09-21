import { create } from "zustand";
import {
  type EducationItem,
  type ExperienceItem,
  initialResumeState,
  type PersonalInfo,
  type Resume,
  type SkillCategory,
} from "@/lib/schema/resume";

interface ResumeStore {
  resume: Resume;
  rawText: string;
  jobDescription: string;
  isExtracting: boolean;
  isGenerating: boolean;
  activeView: "preview" | "original";

  setResume: (resume: Resume) => void;
  setRawText: (text: string) => void;
  setJobDescription: (jd: string) => void;
  setIsExtracting: (val: boolean) => void;
  setIsGenerating: (val: boolean) => void;
  setActiveView: (view: "preview" | "original") => void;

  updatePersonalInfo: (info: Partial<PersonalInfo>) => void;
  updateSummary: (summary: string) => void;

  // Experience actions
  addExperience: () => void;
  updateExperience: (id: string, updated: Partial<ExperienceItem>) => void;
  removeExperience: (id: string) => void;
  addBullet: (expId: string) => void;
  updateBullet: (expId: string, bulletIndex: number, text: string) => void;
  removeBullet: (expId: string, bulletIndex: number) => void;

  // Skills actions
  updateSkillCategory: (index: number, updated: Partial<SkillCategory>) => void;
  addSkillCategory: () => void;
  removeSkillCategory: (index: number) => void;

  // Education actions
  updateEducation: (id: string, updated: Partial<EducationItem>) => void;
  addEducation: () => void;
  removeEducation: (id: string) => void;

  resetToInitial: () => void;
}

export const useResumeStore = create<ResumeStore>((set) => ({
  resume: initialResumeState,
  rawText: "",
  jobDescription: "",
  isExtracting: false,
  isGenerating: false,
  activeView: "preview",

  setResume: (resume) => set({ resume }),
  setRawText: (rawText) => set({ rawText }),
  setJobDescription: (jobDescription) => set({ jobDescription }),
  setIsExtracting: (isExtracting) => set({ isExtracting }),
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  setActiveView: (activeView) => set({ activeView }),

  updatePersonalInfo: (info) =>
    set((state) => ({
      resume: {
        ...state.resume,
        personalInfo: { ...state.resume.personalInfo, ...info },
      },
    })),

  updateSummary: (summary) =>
    set((state) => ({
      resume: {
        ...state.resume,
        summary,
      },
    })),

  addExperience: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        experience: [
          {
            id: Math.random().toString(36).substring(2, 9),
            company: "New Company",
            role: "Role Title",
            location: "",
            startDate: "2024",
            endDate: "Present",
            current: true,
            bullets: ["Accomplished key task and optimized metrics."],
          },
          ...state.resume.experience,
        ],
      },
    })),

  updateExperience: (id, updated) =>
    set((state) => ({
      resume: {
        ...state.resume,
        experience: state.resume.experience.map((item) =>
          item.id === id ? { ...item, ...updated } : item,
        ),
      },
    })),

  removeExperience: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        experience: state.resume.experience.filter((item) => item.id !== id),
      },
    })),

  addBullet: (expId) =>
    set((state) => ({
      resume: {
        ...state.resume,
        experience: state.resume.experience.map((item) =>
          item.id === expId
            ? {
                ...item,
                bullets: [...item.bullets, "New bullet point achievement..."],
              }
            : item,
        ),
      },
    })),

  updateBullet: (expId, bulletIndex, text) =>
    set((state) => ({
      resume: {
        ...state.resume,
        experience: state.resume.experience.map((item) => {
          if (item.id !== expId) return item;
          const newBullets = [...item.bullets];
          newBullets[bulletIndex] = text;
          return { ...item, bullets: newBullets };
        }),
      },
    })),

  removeBullet: (expId, bulletIndex) =>
    set((state) => ({
      resume: {
        ...state.resume,
        experience: state.resume.experience.map((item) => {
          if (item.id !== expId) return item;
          return {
            ...item,
            bullets: item.bullets.filter((_, idx) => idx !== bulletIndex),
          };
        }),
      },
    })),

  updateSkillCategory: (index, updated) =>
    set((state) => {
      const skills = [...state.resume.skills];
      if (skills[index]) {
        skills[index] = { ...skills[index], ...updated };
      }
      return {
        resume: { ...state.resume, skills },
      };
    }),

  addSkillCategory: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        skills: [
          ...state.resume.skills,
          {
            category: "New Skill Group",
            items: ["Skill 1", "Skill 2"],
          },
        ],
      },
    })),

  removeSkillCategory: (index) =>
    set((state) => ({
      resume: {
        ...state.resume,
        skills: state.resume.skills.filter((_, idx) => idx !== index),
      },
    })),

  updateEducation: (id, updated) =>
    set((state) => ({
      resume: {
        ...state.resume,
        education: state.resume.education.map((item) =>
          item.id === id ? { ...item, ...updated } : item,
        ),
      },
    })),

  addEducation: () =>
    set((state) => ({
      resume: {
        ...state.resume,
        education: [
          ...state.resume.education,
          {
            id: Math.random().toString(36).substring(2, 9),
            institution: "University / Institute",
            degree: "Degree Name",
            field: "Field of Study",
            startDate: "2020",
            endDate: "2024",
            gpa: "",
          },
        ],
      },
    })),

  removeEducation: (id) =>
    set((state) => ({
      resume: {
        ...state.resume,
        education: state.resume.education.filter((item) => item.id !== id),
      },
    })),

  resetToInitial: () =>
    set({
      resume: initialResumeState,
      rawText: "",
      jobDescription: "",
    }),
}));
