import { pdfjsLib } from "@/lib/pdf";

export default async function LoadPdf(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  file: File,
) {
  try {
    const fileBuffer = await file.arrayBuffer();

    const loadingPdf = pdfjsLib.getDocument({ data: fileBuffer });

    const pdf = await loadingPdf.promise;

    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;

    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render({ ...renderContext, canvas }).promise;
  } catch (error) {
    console.log(error);
  }
}
