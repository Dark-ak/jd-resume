"use client";

import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useResumeStore } from "@/store/resumeStore";

export default function ResumeEditor() {
  const {
    resume,
    updatePersonalInfo,
    updateSummary,
    addExperience,
    updateExperience,
    removeExperience,
    addBullet,
    updateBullet,
    removeBullet,
    addSkillCategory,
    updateSkillCategory,
    removeSkillCategory,
    addEducation,
    updateEducation,
    removeEducation,
  } = useResumeStore();

  const [expandedSection, setExpandedSection] = useState<string>("personal");

  const toggleSection = (sec: string) => {
    setExpandedSection(expandedSection === sec ? "" : sec);
  };

  return (
    <div className="flex flex-col gap-4 text-sm pb-10">
      {/* 1. Personal Information Accordion */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("personal")}
          className="w-full px-4 py-3 font-semibold flex justify-between items-center bg-muted/40 hover:bg-muted/70 transition-colors"
        >
          <span>👤 Personal Information</span>
          {expandedSection === "personal" ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {expandedSection === "personal" && (
          <div className="p-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="field-fullname"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Full Name
                </label>
                <Input
                  id="field-fullname"
                  value={resume.personalInfo.fullName}
                  onChange={(e) =>
                    updatePersonalInfo({ fullName: e.target.value })
                  }
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div>
                <label
                  htmlFor="field-email"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Email
                </label>
                <Input
                  id="field-email"
                  type="email"
                  value={resume.personalInfo.email}
                  onChange={(e) =>
                    updatePersonalInfo({ email: e.target.value })
                  }
                  placeholder="e.g. jane@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="field-phone"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Phone
                </label>
                <Input
                  id="field-phone"
                  value={resume.personalInfo.phone}
                  onChange={(e) =>
                    updatePersonalInfo({ phone: e.target.value })
                  }
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label
                  htmlFor="field-location"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Location
                </label>
                <Input
                  id="field-location"
                  value={resume.personalInfo.location}
                  onChange={(e) =>
                    updatePersonalInfo({ location: e.target.value })
                  }
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label
                  htmlFor="field-linkedin"
                  className="text-xs font-medium text-muted-foreground"
                >
                  LinkedIn
                </label>
                <Input
                  id="field-linkedin"
                  value={resume.personalInfo.linkedin || ""}
                  onChange={(e) =>
                    updatePersonalInfo({ linkedin: e.target.value })
                  }
                  placeholder="linkedin.com/in/..."
                />
              </div>
              <div>
                <label
                  htmlFor="field-github"
                  className="text-xs font-medium text-muted-foreground"
                >
                  GitHub
                </label>
                <Input
                  id="field-github"
                  value={resume.personalInfo.github || ""}
                  onChange={(e) =>
                    updatePersonalInfo({ github: e.target.value })
                  }
                  placeholder="github.com/..."
                />
              </div>
              <div>
                <label
                  htmlFor="field-website"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Portfolio
                </label>
                <Input
                  id="field-website"
                  value={resume.personalInfo.website || ""}
                  onChange={(e) =>
                    updatePersonalInfo({ website: e.target.value })
                  }
                  placeholder="portfolio.com"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Professional Summary */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("summary")}
          className="w-full px-4 py-3 font-semibold flex justify-between items-center bg-muted/40 hover:bg-muted/70 transition-colors"
        >
          <span>📝 Professional Summary</span>
          {expandedSection === "summary" ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {expandedSection === "summary" && (
          <div className="p-4">
            <Textarea
              rows={4}
              value={resume.summary}
              onChange={(e) => updateSummary(e.target.value)}
              placeholder="A concise overview of your core qualifications and impact..."
            />
          </div>
        )}
      </div>

      {/* 3. Work Experience */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("experience")}
          className="w-full px-4 py-3 font-semibold flex justify-between items-center bg-muted/40 hover:bg-muted/70 transition-colors"
        >
          <span>💼 Work Experience ({resume.experience.length})</span>
          {expandedSection === "experience" ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {expandedSection === "experience" && (
          <div className="p-4 flex flex-col gap-5">
            {resume.experience.map((exp) => (
              <div
                key={exp.id}
                className="p-3 border border-border/80 rounded-md bg-background flex flex-col gap-3 relative"
              >
                <div className="flex justify-between items-center gap-2">
                  <span className="font-semibold text-xs text-primary">
                    Experience Entry
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-destructive hover:text-destructive"
                    onClick={() => removeExperience(exp.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      htmlFor={`exp-role-${exp.id}`}
                      className="text-xs text-muted-foreground"
                    >
                      Job Title
                    </label>
                    <Input
                      id={`exp-role-${exp.id}`}
                      value={exp.role}
                      onChange={(e) =>
                        updateExperience(exp.id, { role: e.target.value })
                      }
                      placeholder="e.g. Senior Software Engineer"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`exp-company-${exp.id}`}
                      className="text-xs text-muted-foreground"
                    >
                      Company
                    </label>
                    <Input
                      id={`exp-company-${exp.id}`}
                      value={exp.company}
                      onChange={(e) =>
                        updateExperience(exp.id, { company: e.target.value })
                      }
                      placeholder="e.g. Google"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label
                      htmlFor={`exp-loc-${exp.id}`}
                      className="text-xs text-muted-foreground"
                    >
                      Location
                    </label>
                    <Input
                      id={`exp-loc-${exp.id}`}
                      value={exp.location || ""}
                      onChange={(e) =>
                        updateExperience(exp.id, { location: e.target.value })
                      }
                      placeholder="e.g. New York, NY"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`exp-start-${exp.id}`}
                      className="text-xs text-muted-foreground"
                    >
                      Start Date
                    </label>
                    <Input
                      id={`exp-start-${exp.id}`}
                      value={exp.startDate}
                      onChange={(e) =>
                        updateExperience(exp.id, { startDate: e.target.value })
                      }
                      placeholder="e.g. Jan 2022"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor={`exp-end-${exp.id}`}
                      className="text-xs text-muted-foreground"
                    >
                      End Date
                    </label>
                    <Input
                      id={`exp-end-${exp.id}`}
                      value={exp.current ? "Present" : exp.endDate}
                      disabled={exp.current}
                      onChange={(e) =>
                        updateExperience(exp.id, { endDate: e.target.value })
                      }
                      placeholder="e.g. Present"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="checkbox"
                    id={`current-${exp.id}`}
                    checked={exp.current}
                    onChange={(e) =>
                      updateExperience(exp.id, { current: e.target.checked })
                    }
                    className="cursor-pointer"
                  />
                  <label
                    htmlFor={`current-${exp.id}`}
                    className="text-xs cursor-pointer select-none"
                  >
                    Currently working here
                  </label>
                </div>

                {/* Bullets */}
                <div className="mt-2 flex flex-col gap-2">
                  <span className="text-xs font-semibold text-muted-foreground">
                    Impact Bullet Points
                  </span>
                  {exp.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex gap-2 items-start">
                      <span className="text-xs text-muted-foreground mt-2">
                        •
                      </span>
                      <Textarea
                        rows={2}
                        className="text-xs resize-y"
                        value={bullet}
                        onChange={(e) =>
                          updateBullet(exp.id, bIdx, e.target.value)
                        }
                        placeholder="Action verb + Context + Measurable Result"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => removeBullet(exp.id, bIdx)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="self-start text-xs h-7 mt-1"
                    onClick={() => addBullet(exp.id)}
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Bullet Point
                  </Button>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              onClick={addExperience}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Work Experience
            </Button>
          </div>
        )}
      </div>

      {/* 4. Skills & Competencies */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("skills")}
          className="w-full px-4 py-3 font-semibold flex justify-between items-center bg-muted/40 hover:bg-muted/70 transition-colors"
        >
          <span>⚡ Skills & Competencies ({resume.skills.length})</span>
          {expandedSection === "skills" ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {expandedSection === "skills" && (
          <div className="p-4 flex flex-col gap-4">
            {resume.skills.map((skillCat, idx) => (
              <div
                key={idx}
                className="p-3 border border-border/80 rounded-md bg-background flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <Input
                    className="font-medium text-xs max-w-48 h-7"
                    value={skillCat.category}
                    onChange={(e) =>
                      updateSkillCategory(idx, { category: e.target.value })
                    }
                    placeholder="Category (e.g. Languages)"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeSkillCategory(idx)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <Input
                  className="text-xs"
                  value={skillCat.items.join(", ")}
                  onChange={(e) =>
                    updateSkillCategory(idx, {
                      items: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                  placeholder="Comma-separated items (e.g. React, Next.js, Node.js)"
                />
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addSkillCategory}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Skill Category
            </Button>
          </div>
        )}
      </div>

      {/* 5. Education */}
      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection("education")}
          className="w-full px-4 py-3 font-semibold flex justify-between items-center bg-muted/40 hover:bg-muted/70 transition-colors"
        >
          <span>🎓 Education ({resume.education.length})</span>
          {expandedSection === "education" ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {expandedSection === "education" && (
          <div className="p-4 flex flex-col gap-4">
            {resume.education.map((edu) => (
              <div
                key={edu.id}
                className="p-3 border border-border/80 rounded-md bg-background flex flex-col gap-2"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold">Education Entry</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeEducation(edu.id)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={edu.institution}
                    onChange={(e) =>
                      updateEducation(edu.id, { institution: e.target.value })
                    }
                    placeholder="Institution / University"
                  />
                  <Input
                    value={edu.degree}
                    onChange={(e) =>
                      updateEducation(edu.id, { degree: e.target.value })
                    }
                    placeholder="Degree (e.g. B.S. Computer Science)"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={edu.startDate}
                    onChange={(e) =>
                      updateEducation(edu.id, { startDate: e.target.value })
                    }
                    placeholder="Start Year"
                  />
                  <Input
                    value={edu.endDate}
                    onChange={(e) =>
                      updateEducation(edu.id, { endDate: e.target.value })
                    }
                    placeholder="End Year"
                  />
                  <Input
                    value={edu.gpa || ""}
                    onChange={(e) =>
                      updateEducation(edu.id, { gpa: e.target.value })
                    }
                    placeholder="GPA (optional)"
                  />
                </div>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={addEducation}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Education
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
