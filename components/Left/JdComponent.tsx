"use client";

import { Button } from "@/components/ui/button";
import { Field, FieldDescription } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { type AiProvider, PROVIDER_META } from "@/lib/aiProvider";
import { useApiStore } from "@/store/apiStore";
import { useFileStore } from "@/store/fileStore";
import { useResumeStore } from "@/store/resumeStore";
import { extractRawTextFromPdf } from "@/utils/ExtractData";
import { parseRawTextToResume } from "@/utils/heuristicParser";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  KeyRound,
  Loader2,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import ResumeEditor from "./ResumeEditor";

export default function JdComponent() {
  const { file, setFile } = useFileStore();
  const { keys, setProviderKey, provider, setProvider } = useApiStore();
  const apiKey = keys[provider] || "";
  const {
    jobDescription,
    setJobDescription,
    setResume,
    rawText,
    setRawText,
    isExtracting,
    setIsExtracting,
    isGenerating,
    setIsGenerating,
    resume,
  } = useResumeStore();

  const [activeTab, setActiveTab] = useState<"input" | "editor">("input");
  const [extractStatus, setExtractStatus] = useState<string | null>(null);
  const [extractFailed, setExtractFailed] = useState<boolean>(false);
  const [tailorStatus, setTailorStatus] = useState<string | null>(null);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey || "");

  const runAiExtraction = async (text: string) => {
    setIsExtracting(true);
    setExtractFailed(false);
    setExtractStatus("AI is structuring sections, dates & bullets...");

    try {
      const res = await fetch("/api/extract-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawText: text,
          apiKey: apiKey || undefined,
          provider,
        }),
      });

      const data = await res.json();

      if (res.ok && data.resume) {
        setResume(data.resume);
        const expCount = data.resume.experience?.length || 0;
        const skillCount =
          data.resume.skills?.reduce(
            (acc: number, s: { items?: string[] }) => acc + (s.items?.length || 0),
            0
          ) || 0;
        setExtractStatus(
          `✨ Extracted with AI: ${expCount} experiences, ${skillCount} skills mapped!`
        );
        setExtractFailed(false);
      } else if (data.needsApiKey) {
        setShowApiKeyModal(true);
        setExtractFailed(true);
        setExtractStatus(
          "API key required. Paste your key below and retry extraction."
        );
      } else {
        console.warn("AI extraction warning:", data.error);
        setExtractFailed(true);
        setExtractStatus(
          `AI Extraction failed: ${data.error || "Unknown error"}. You can retry or edit manually.`
        );
      }
    } catch (err) {
      console.error("AI extraction fetch error:", err);
      setExtractFailed(true);
      setExtractStatus("AI Extraction encountered a network or server error. Please retry.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setFile(files);

    if (!files || files.length === 0) return;

    const uploadedFile = files[0];
    if (uploadedFile.type !== "application/pdf" && !uploadedFile.name.endsWith(".pdf")) {
      alert("Please upload a valid PDF file.");
      return;
    }

    try {
      setIsExtracting(true);
      setExtractFailed(false);
      setExtractStatus("Step 1/2: Extracting raw text from PDF pages...");

      const extractedText = await extractRawTextFromPdf(uploadedFile);
      setRawText(extractedText);

      // Fast initial heuristic parse for immediate feedback
      const quickParsed = parseRawTextToResume(extractedText);
      setResume(quickParsed);

      // Step 2: High-accuracy AI extraction
      await runAiExtraction(extractedText);
    } catch (err) {
      console.error("PDF Parsing error:", err);
      setExtractFailed(true);
      setExtractStatus("Failed to extract text from PDF. Please check the file.");
      setIsExtracting(false);
    }
  };

  const handleRetryExtraction = async () => {
    if (isExtracting) return;

    if (rawText && rawText.trim().length > 0) {
      await runAiExtraction(rawText);
      return;
    }

    // Otherwise if we have the file object, re-extract from the beginning
    if (file && file.length > 0) {
      const uploadedFile = file[0];
      try {
        setIsExtracting(true);
        setExtractFailed(false);
        setExtractStatus("Re-extracting raw text from PDF...");
        const extractedText = await extractRawTextFromPdf(uploadedFile);
        setRawText(extractedText);
        await runAiExtraction(extractedText);
      } catch (err) {
        console.error("Retry parsing error:", err);
        setExtractFailed(true);
        setExtractStatus("Failed to read PDF file on retry.");
        setIsExtracting(false);
      }
    } else {
      alert("Please upload a PDF resume first.");
    }
  };

  const handleTailorWithAi = async () => {
    if (!jobDescription.trim()) {
      alert("Please enter a Job Description first.");
      return;
    }

    try {
      setIsGenerating(true);
      setTailorStatus("AI is tailoring summary, bullets & skills...");

      const res = await fetch("/api/tailor-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume,
          jobDescription,
          apiKey: apiKey || undefined,
          provider,
        }),
      });

      const data = await res.json();

      if (res.ok && data.resume) {
        setResume(data.resume);
        setTailorStatus("✨ Resume tailored to match Job Description! Live PDF updated.");
        setActiveTab("editor");
      } else if (data.needsApiKey) {
        setShowApiKeyModal(true);
        setTailorStatus("API key required. Paste your key below first.");
      } else {
        throw new Error(data.error || "Failed to tailor resume");
      }
    } catch (err: unknown) {
      console.error("Tailoring error:", err);
      const msg = err instanceof Error ? err.message : "Unknown tailoring error";
      setTailorStatus(`Tailoring failed: ${msg}`);
      alert(`AI Tailoring error: ${msg}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveApiKey = () => {
    setProviderKey(provider, tempApiKey.trim());
    setShowApiKeyModal(false);
  };

  const switchProvider = (p: AiProvider) => {
    setProvider(p);
    setTempApiKey(useApiStore.getState().keys[p] || "");
  };

  return (
    <div className="h-fit lg:h-screen col-span-2 p-4 border-r border-border overflow-y-auto flex flex-col">
      {/* Header & Tabs */}
      <div className="flex items-center justify-between pb-3 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
            JD
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight">JD-Resume</h1>
            <p className="text-xs text-muted-foreground">
              Tailor your resume to any job description
            </p>
          </div>
        </div>

        {/* Action icons & Tab switcher */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowApiKeyModal(true)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground cursor-pointer"
            title="Configure AI Provider"
          >
            <KeyRound className="w-3.5 h-3.5" />
          </Button>

          <div className="flex bg-muted rounded-lg p-1 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab("input")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                activeTab === "input"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Upload & JD
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("editor")}
              className={`px-3 py-1.5 rounded-md font-medium transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === "editor"
                  ? "bg-background text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <SlidersHorizontal className="w-3 h-3" />
              Edit Resume
            </button>
          </div>
        </div>
      </div>

      {/* AI Provider Modal / Banner if requested */}
      {showApiKeyModal && (
        <div className="my-3 p-3.5 bg-primary/5 border border-primary/20 rounded-lg flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-primary" /> AI Provider
            </span>
            <button
              type="button"
              onClick={() => setShowApiKeyModal(false)}
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="flex bg-muted rounded-lg p-1 text-xs gap-1">
            {(Object.keys(PROVIDER_META) as AiProvider[]).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => switchProvider(p)}
                className={`flex-1 px-2 py-1.5 rounded-md font-medium transition-all cursor-pointer ${
                  provider === p
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {PROVIDER_META[p].label}
                {p === "gemini" ? " (Default)" : ""}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            Paste your {PROVIDER_META[provider].label} key below (kept in
            this browser only, sent with each request, never stored on the
            server). Get one from{" "}
            {PROVIDER_META[provider].keyUrl === "#" ? (
              <span className="text-foreground font-medium">
                {PROVIDER_META[provider].keyUrlLabel}
              </span>
            ) : (
              <a
                href={PROVIDER_META[provider].keyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline font-medium"
              >
                {PROVIDER_META[provider].keyUrlLabel}
              </a>
            )}
            . For local dev you can also set{" "}
            <code className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded">
              {PROVIDER_META[provider].envName}
            </code>{" "}
            in{" "}
            <code className="font-mono text-[10px] bg-muted px-1 py-0.5 rounded">
              .env.local
            </code>
            .
          </p>
          <div className="flex gap-2">
            <Input
              type="password"
              value={tempApiKey}
              onChange={(e) => setTempApiKey(e.target.value)}
              placeholder="Paste API key here"
              className="text-xs h-8"
            />
            <Button size="sm" onClick={saveApiKey} className="h-8 text-xs shrink-0 cursor-pointer">
              Save Key
            </Button>
          </div>
        </div>
      )}

      {/* Tab 1: Upload & JD Input */}
      {activeTab === "input" && (
        <div className="py-6 flex flex-col gap-6">
          {/* Upload Section */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-primary" />
                Upload Resume (PDF)
              </p>
              {isExtracting && (
                <span className="text-xs text-primary flex items-center gap-1 animate-pulse">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing with AI...
                </span>
              )}
            </div>

            <Field>
              <Input
                onChange={handleFileUpload}
                accept=".pdf,application/pdf"
                className="w-full cursor-pointer file:cursor-pointer"
                id="resume"
                type="file"
              />
            </Field>

            {/* Extraction Status and Retry Banner */}
            {extractStatus && (
              <div
                className={`text-xs flex items-center justify-between gap-2 p-2.5 rounded-md border mt-1 ${
                  extractFailed
                    ? "bg-destructive/10 border-destructive/30 text-destructive dark:text-red-400"
                    : isExtracting
                    ? "bg-muted/50 border-border text-foreground"
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {isExtracting ? (
                    <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
                  ) : extractFailed ? (
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  )}
                  <span className="truncate">{extractStatus}</span>
                </div>

                {/* Retry Button */}
                {(extractFailed || (!isExtracting && (rawText || (file && file.length > 0)))) && (
                  <Button
                    type="button"
                    variant={extractFailed ? "destructive" : "outline"}
                    size="sm"
                    disabled={isExtracting}
                    onClick={handleRetryExtraction}
                    className="h-6 px-2 text-[11px] gap-1 shrink-0 cursor-pointer"
                    title="Retry AI data extraction"
                  >
                    <RotateCcw className={`w-3 h-3 ${isExtracting ? "animate-spin" : ""}`} />
                    Retry AI Extraction
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Job Description Section */}
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-foreground">Target Job Description</p>
            <Field>
              <FieldDescription>
                Paste the requirements, role responsibilities, and qualifications.
              </FieldDescription>
              <Textarea
                id="textarea-jd"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-56 resize-y text-xs font-mono max-h-125"
                placeholder="Paste Job Description here (e.g. responsibilities, requirements, tech stack)..."
              />
            </Field>
          </div>

          {/* Tailoring status message */}
          {tailorStatus && (
            <div className="text-xs flex items-center gap-1.5 p-2.5 rounded-md bg-muted/60 border border-border">
              {isGenerating ? (
                <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
              ) : (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              )}
              <span className="text-foreground font-medium">{tailorStatus}</span>
            </div>
          )}

          {/* Action Row */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              className="w-full gap-2 shadow-xs cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
              disabled={isGenerating || isExtracting || !jobDescription.trim()}
              onClick={handleTailorWithAi}
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isGenerating ? "Tailoring with AI..." : "Tailor Resume with AI"}
            </Button>

            <Button
              variant="outline"
              className="w-full gap-2 shadow-xs cursor-pointer"
              onClick={() => setActiveTab("editor")}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Customize Extracted Resume
            </Button>
          </div>
        </div>
      )}

      {/* Tab 2: Full Resume Editor Form */}
      {activeTab === "editor" && (
        <div className="py-4 flex-1">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-foreground">Edit Resume Sections</h2>
              <p className="text-[11px] text-muted-foreground">
                {resume.personalInfo.fullName
                  ? `Editing: ${resume.personalInfo.fullName}`
                  : "Customize sections"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={isGenerating || !jobDescription.trim()}
                className="text-xs h-7 gap-1 text-primary cursor-pointer"
                onClick={handleTailorWithAi}
              >
                {isGenerating ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                {isGenerating ? "Tailoring..." : "Re-tailor with AI"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 cursor-pointer"
                onClick={() => setActiveTab("input")}
              >
                ← Back to JD
              </Button>
            </div>
          </div>

          <ResumeEditor />
        </div>
      )}
    </div>
  );
}
