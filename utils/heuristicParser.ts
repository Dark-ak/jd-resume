import { initialResumeState, type Resume } from "@/lib/schema/resume";

export function parseRawTextToResume(rawText: string): Resume {
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  console.log((rawText))
  
  if (lines.length === 0) {
    return initialResumeState;
  }

  const emailMatch = rawText.match(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
  );
  const phoneMatch = rawText.match(
    /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/,
  );
  const linkedinMatch = rawText.match(
    /(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i,
  );
  const githubMatch = rawText.match(
    /(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_-]+/i,
  );

  // Candidate name is usually on the first 1-2 lines
  let fullName = lines[0] || "Candidate Name";
  if (fullName.length > 50 || fullName.includes("@")) {
    const cleanLine = lines.find(
      (l) => l.length < 40 && !l.includes("@") && !l.match(/\d{3}/),
    );
    if (cleanLine) fullName = cleanLine;
  }

  // Section separation
  const sections: { [key: string]: string[] } = {};
  let currentSection = "header";
  sections[currentSection] = [];

  const sectionPatterns: { [key: string]: RegExp } = {
    summary:
      /^(?:professional\s+summary|summary|profile|about\s+me|objective)/i,
    experience:
      /^(?:work\s+experience|experience|employment\s+history|professional\s+experience)/i,
    education: /^(?:education|academic\s+background|academics)/i,
    skills:
      /^(?:technical\s+skills|skills\s*&?\s*technologies|core\s+competencies|skills)/i,
    projects: /^(?:projects|key\s+projects|personal\s+projects)/i,
    certifications: /^(?:certifications|licenses|courses)/i,
  };

  for (const line of lines) {
    let matchedKey: string | null = null;
    for (const [key, regex] of Object.entries(sectionPatterns)) {
      // If line is short and matches the section title
      if (line.length < 35 && regex.test(line.replace(/[:-]/g, "").trim())) {
        matchedKey = key;
        break;
      }
    }

    if (matchedKey) {
      currentSection = matchedKey;
      if (!sections[currentSection]) sections[currentSection] = [];
    } else {
      sections[currentSection].push(line);
    }
  }

  // Extract Summary
  const summaryLines = sections["summary"] || [];
  const summary = summaryLines.join(" ").trim() || initialResumeState.summary;

  // Extract Skills
  const skillLines = sections["skills"] || [];
  const skillsList: string[] = [];
  for (const sLine of skillLines) {
    const parts = sLine
      .replace(/^[•\-*]\s*/, "")
      .split(/[,|•;·\t]/)
      .map((s) => s.trim())
      .filter((s) => s.length > 1 && s.length < 35);
    skillsList.push(...parts);
  }

  // Extract Experience
  const expLines = sections["experience"] || [];
  const experience: Resume["experience"] = [];
  let currentExp: {
    id: string;
    company: string;
    role: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    bullets: string[];
  } | null = null;

  for (const line of expLines) {
    const isBullet = /^[•\-*–]\s*/.test(line);
    if (isBullet) {
      const cleanBullet = line.replace(/^[•\-*–]\s*/, "").trim();
      if (currentExp) {
        currentExp.bullets.push(cleanBullet);
      } else {
        currentExp = {
          id: Math.random().toString(36).substring(2, 9),
          company: "Company",
          role: "Role",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          bullets: [cleanBullet],
        };
        experience.push(currentExp);
      }
    } else {
      // Likely title or company line
      if (line.length < 80) {
        currentExp = {
          id: Math.random().toString(36).substring(2, 9),
          company: line,
          role: "Professional Role",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          bullets: [],
        };
        experience.push(currentExp);
      }
    }
  }

  // Extract Education
  const eduLines = sections["education"] || [];
  const education: Resume["education"] = [];
  if (eduLines.length > 0) {
    education.push({
      id: "edu-1",
      institution: eduLines[0] || "University",
      degree: eduLines[1] || "Degree",
      field: "",
      startDate: "",
      endDate: "",
      gpa: "",
    });
  }

  return {
    personalInfo: {
      fullName,
      email: emailMatch ? emailMatch[0] : "",
      phone: phoneMatch ? phoneMatch[0] : "",
      location: "",
      linkedin: linkedinMatch ? linkedinMatch[0] : "",
      github: githubMatch ? githubMatch[0] : "",
      website: "",
    },
    summary:
      summary || "Experienced professional with proven domain expertise.",
    experience:
      experience.length > 0 ? experience : initialResumeState.experience,
    education: education.length > 0 ? education : initialResumeState.education,
    skills:
      skillsList.length > 0
        ? [
            {
              category: "Key Skills",
              items: Array.from(new Set(skillsList)).slice(0, 20),
            },
          ]
        : initialResumeState.skills,
    projects: initialResumeState.projects,
    certifications: initialResumeState.certifications,
  };
}
