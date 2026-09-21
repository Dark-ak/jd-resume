import { pdfjsLib } from "@/lib/pdf";

interface TextItem {
  str: string;
  transform: number[]; // [scaleX, skewY, skewX, scaleY, transX, transY]
  hasEOL?: boolean;
}

/**
 * Extracts clean, multi-page raw text from an uploaded PDF file.
 */
export async function extractRawTextFromPdf(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingPdf = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingPdf.promise;

  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const items = content.items as TextItem[];

    if (!items || items.length === 0) continue;

    // Group items by line based on vertical position (transform[5] = y)
    const lines: { y: number; text: string }[] = [];
    let currentLineY: number | null = null;
    let currentLineParts: string[] = [];

    for (const item of items) {
      if (!item.str && !item.hasEOL) continue;

      const y = item.transform ? Math.round(item.transform[5]) : 0;

      // New line if Y differs significantly (e.g., > 3 units) or item has EOL flag
      if (
        currentLineY === null ||
        Math.abs(y - currentLineY) > 3 ||
        item.hasEOL
      ) {
        if (currentLineParts.length > 0) {
          lines.push({
            y: currentLineY ?? y,
            text: currentLineParts.join(" ").trim(),
          });
        }
        currentLineParts = [item.str.trim()];
        currentLineY = y;
      } else {
        if (item.str.trim()) {
          currentLineParts.push(item.str.trim());
        }
      }
    }

    if (currentLineParts.length > 0) {
      lines.push({
        y: currentLineY ?? 0,
        text: currentLineParts.join(" ").trim(),
      });
    }

    const pageResult = lines
      .map((l) => l.text)
      .filter((t) => t.length > 0)
      .join("\n");

    pageTexts.push(pageResult);
  }

  return pageTexts.join("\n\n");
}

export default extractRawTextFromPdf;
