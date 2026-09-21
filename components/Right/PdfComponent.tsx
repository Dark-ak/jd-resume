"use client";

import { Download, Eye, FileText, Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  downloadResumePdf,
  generateResumePdfBlob,
} from "@/lib/pdfMakeGenerator";
import { useFileStore } from "@/store/fileStore";
import { useResumeStore } from "@/store/resumeStore";
import LoadPdf from "@/utils/LoadPdf";

export default function PdfComponent() {
  const { file } = useFileStore();
  const { resume } = useResumeStore();

  const [viewMode, setViewMode] = useState<"tailored" | "original">("tailored");
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isRenderingPdf, setIsRenderingPdf] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Render original uploaded PDF on canvas
  useEffect(() => {
    if (viewMode === "original" && file?.[0]) {
      LoadPdf(canvasRef, file[0]);
    }
  }, [file, viewMode]);

  // Real-time debounced PDF generation from structured resume state
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setIsRenderingPdf(true);

    debounceTimerRef.current = setTimeout(async () => {
      try {
        const blob = await generateResumePdfBlob(resume);
        if (blob) {
          const url = URL.createObjectURL(blob);
          setPdfBlobUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return url;
          });
        }
      } catch (err) {
        console.error("Live PDF Generation error:", err);
      } finally {
        setIsRenderingPdf(false);
      }
    }, 200);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [resume]);

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const name = resume.personalInfo.fullName
        ? `${resume.personalInfo.fullName.toLowerCase().replace(/\s+/g, "_")}_resume.pdf`
        : "tailored_resume.pdf";
      await downloadResumePdf(resume, name);
    } catch (err) {
      console.error("Download error:", err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="h-fit lg:h-screen bg-muted/30 p-4 col-span-3 flex flex-col overflow-hidden">
      {/* Top Controls Bar */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/70 shrink-0">
        <div className="flex items-center gap-2">
          <div className="flex bg-muted rounded-lg p-1 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("tailored")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                viewMode === "tailored"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              Tailored PDF (Live)
            </button>
            <button
              type="button"
              onClick={() => setViewMode("original")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                viewMode === "original"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Original Upload
            </button>
          </div>

          {isRenderingPdf && viewMode === "tailored" && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              Rendering...
            </span>
          )}
        </div>

        {/* Download Button */}
        <div className="flex items-center gap-2">
          {viewMode === "tailored" && (
            <Button
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading || !pdfBlobUrl}
              className="gap-1.5 h-8 font-medium cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
            >
              {isDownloading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              Download PDF
            </Button>
          )}
        </div>
      </div>

      {/* Main Preview Container */}
      <div className="flex-1 min-h-0 bg-background rounded-lg border border-border shadow-xs overflow-hidden flex flex-col items-center justify-center relative">
        {viewMode === "tailored" ? (
          pdfBlobUrl ? (
            <iframe
              src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
              title="Tailored Resume Live Preview"
              className="w-full h-full border-none rounded-lg"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p>Preparing live PDF preview...</p>
            </div>
          )
        ) : file?.[0] ? (
          <div className="w-full h-full overflow-y-auto p-4 flex justify-center bg-muted/20">
            <canvas
              ref={canvasRef}
              className="shadow-md rounded border border-border bg-white"
            />
          </div>
        ) : (
          <div className="text-center p-6 text-muted-foreground flex flex-col items-center gap-3">
            <FileText className="w-12 h-12 stroke-[1.2] text-muted-foreground/50" />
            <div>
              <p className="font-semibold text-foreground text-sm">
                No resume uploaded yet
              </p>
              <p className="text-xs mt-1">
                Upload a PDF on the left panel to inspect the original file.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
