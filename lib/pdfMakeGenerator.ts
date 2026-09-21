import type { Content, TDocumentDefinitions } from "pdfmake/interfaces";
import type { Resume } from "@/lib/schema/resume";

// Lazy-load client pdfMake singleton
let pdfMakeInstance: any = null;

export async function getPdfMake() {
  if (typeof window === "undefined") return null;

  if (!pdfMakeInstance) {
    const pdfMakeModule = await import("pdfmake/build/pdfmake");
    const pdfFontsModule = await import("pdfmake/build/vfs_fonts");

    const pdfMake: any = pdfMakeModule.default || pdfMakeModule;
    const vfs: any = pdfFontsModule.default || pdfFontsModule;

    if (pdfMake.addVirtualFileSystem) {
      pdfMake.addVirtualFileSystem(vfs);
    } else {
      pdfMake.vfs = vfs;
    }
    pdfMakeInstance = pdfMake;
  }
  return pdfMakeInstance;
}

function createSectionDivider(): Content {
  return {
    canvas: [
      {
        type: "line",
        x1: 0,
        y1: 2,
        x2: 540,
        y2: 2,
        lineWidth: 0.75,
        lineColor: "#94a3b8",
      },
    ],
    margin: [0, 2, 6, 0],
  };
}

export function buildResumeDocDefinition(resume: Resume): TDocumentDefinitions {
  const content: Content[] = [];

  // 1. Header (Name & Contact)
  const { personalInfo } = resume;
  content.push({
    text: personalInfo.fullName || "Your Name",
    fontSize: 20,
    bold: true,
    alignment: "center",
    color: "#0f172a",
    margin: [0, 0, 0, 4],
  });

  const contactParts: string[] = [];
  if (personalInfo.location) contactParts.push(personalInfo.location);
  if (personalInfo.phone) contactParts.push(personalInfo.phone);
  if (personalInfo.email) contactParts.push(personalInfo.email);
  if (personalInfo.linkedin) contactParts.push(personalInfo.linkedin);
  if (personalInfo.github) contactParts.push(personalInfo.github);
  if (personalInfo.website) contactParts.push(personalInfo.website);

  if (contactParts.length > 0) {
    content.push({
      text: contactParts.join("  •  "),
      fontSize: 8.5,
      color: "#475569",
      alignment: "center",
      margin: [0, 0, 0, 10],
    });
  }

  // 2. Summary
  if (resume.summary?.trim()) {
    content.push({
      text: "PROFESSIONAL SUMMARY",
      fontSize: 10,
      bold: true,
      color: "#1e293b",
      margin: [0, 6, 0, 2],
    });
    content.push(createSectionDivider());
    content.push({
      text: resume.summary,
      fontSize: 9,
      lineHeight: 1.25,
      color: "#334155",
      margin: [0,6, 0, 8],
    });
  }

  // 3. Experience
  if (resume.experience && resume.experience.length > 0) {
    content.push({
      text: "WORK EXPERIENCE",
      fontSize: 10,
      bold: true,
      color: "#1e293b",
      margin: [0, 6, 0, 2],
    });
    content.push(createSectionDivider());

    for (const exp of resume.experience) {
      const dates = [exp.startDate, exp.current ? "Present" : exp.endDate]
        .filter(Boolean)
        .join(" – ");

      content.push({
        columns: [
          {
            text: [
              {
                text: exp.role || "Role",
                bold: true,
                fontSize: 9.5,
                color: "#0f172a",
              },
              {
                text: exp.company ? ` | ${exp.company}` : "",
                fontSize: 9.5,
                color: "#334155",
              },
            ],
            width: "*",
          },
          {
            text: [
              {
                text: exp.location ? `${exp.location}  ` : "",
                color: "#64748b",
                fontSize: 8.5,
              },
              { text: dates, color: "#475569", bold: true, fontSize: 8.5 },
            ],
            alignment: "right",
            width: "auto",
          },
        ],
        margin: [0, 2, 0, 2],
      });

      if (exp.bullets && exp.bullets.length > 0) {
        const cleanBullets = exp.bullets.filter((b) => b.trim().length > 0);
        if (cleanBullets.length > 0) {
          content.push({
            ul: cleanBullets.map((b) => ({
              text: b,
              fontSize: 8.5,
              lineHeight: 1.2,
              color: "#334155",
            })),
            margin: [0, 2, 0, 6],
          });
        }
      }
    }
  }

  // 4. Skills
  if (resume.skills && resume.skills.length > 0) {
    content.push({
      text: "SKILLS",
      fontSize: 10,
      bold: true,
      color: "#1e293b",
      margin: [0, 6, 0, 2],
    });
    content.push(createSectionDivider());

    for (const cat of resume.skills) {
      if (!cat.category && (!cat.items || cat.items.length === 0)) continue;
      content.push({
        text: [
          {
            text: `${cat.category || "Skills"}: `,
            bold: true,
            fontSize: 8.5,
            color: "#0f172a",
          },
          { text: cat.items.join(", "), fontSize: 8.5, color: "#334155" },
        ],
        margin: [0, 1, 0, 2],
      });

    }
    content.push({ text: "", margin: [0, 0, 0, 2] });
  }

  if (resume.projects && resume.projects.length > 0) {
    content.push({
      text: "PROJECTS",
      fontSize: 10,
      bold: true,
      color: "#1e293b",
      margin: [0, 6, 0, 2],
    });
    content.push(createSectionDivider());

    for (const proj of resume.projects) {
      content.push({
        columns: [
          {
            text: [
              { text: proj.name, bold: true, fontSize: 9, color: "#0f172a" },
              {
                text: proj.technologies?.length
                  ? ` (${proj.technologies.join(", ")})`
                  : "",
                fontSize: 8.5,
                color: "#64748b",
              },
            ],
            width: "*",
          },
          {
            text: proj.link || "",
            alignment: "right",
            fontSize: 8,
            color: "#2563eb",
            width: "auto",
          },
        ],
        margin: [0, 1, 0, 2],
      });

      if (proj.description) {
        content.push({
          text: proj.description,
          fontSize: 8.5,
          color: "#334155",
          margin: [0, 0, 0, 4],
        });
      }

      if(proj.bullets){
        const cleanBullets = proj.bullets.filter((b) => b.trim().length > 0);
        if (cleanBullets.length > 0) {
          content.push({
            ul: cleanBullets.map((b) => ({
              text: b,
              fontSize: 8.5,
              lineHeight: 1.2,
              color: "#334155",
            })),
            margin: [0, 2, 0, 6],
          });
        }
      }
      
    }
  }
  // 5. Education
  if (resume.education && resume.education.length > 0) {
    content.push({
      text: "EDUCATION",
      fontSize: 10,
      bold: true,
      color: "#1e293b",
      margin: [0, 4, 0, 2],
    });
    content.push(createSectionDivider());

    for (const edu of resume.education) {
      const dates = [edu.startDate, edu.endDate].filter(Boolean).join(" – ");
      const degreeStr = [edu.degree, edu.field].filter(Boolean).join(" in ");

      content.push({
        columns: [
          {
            text: [
              {
                text: edu.institution || "Institution",
                bold: true,
                fontSize: 9,
                color: "#0f172a",
              },
              {
                text: degreeStr ? ` — ${degreeStr}` : "",
                fontSize: 9,
                color: "#334155",
              },
            ],
            width: "*",
          },
          {
            text: dates,
            alignment: "right",
            fontSize: 8.5,
            color: "#475569",
            width: "auto",
          },
        ],
        margin: [0, 1, 0, 2],
      });

      if (edu.gpa) {
        content.push({
          text: `GPA: ${edu.gpa}`,
          fontSize: 8,
          color: "#64748b",
          margin: [0, 0, 0, 4],
        });
      }
    }
  }

  

  return {
    pageSize: "LETTER",
    pageMargins: [36, 36, 36, 36],
    content,
    defaultStyle: {
      font: "Roboto",
    },
  };
}

export async function generateResumePdfBlob(
  resume: Resume,
): Promise<Blob | null> {
  const pdfMake = await getPdfMake();
  if (!pdfMake) return null;

  const docDef = buildResumeDocDefinition(resume);
  const pdfDoc = pdfMake.createPdf(docDef);
  return await pdfDoc.getBlob();
}

export async function downloadResumePdf(
  resume: Resume,
  filename = "tailored-resume.pdf",
): Promise<void> {
  const pdfMake = await getPdfMake();
  if (!pdfMake) return;

  const docDef = buildResumeDocDefinition(resume);
  pdfMake.createPdf(docDef).download(filename);
}
