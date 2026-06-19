type PdfJs = typeof import("pdfjs-dist/legacy/build/pdf.mjs");

let pdfjsModule: PdfJs | null = null;

/**
 * pdfjs-dist v4 legacy build + worker served from /public (stable on Vite/Vercel).
 * Avoids minified bundle/worker mismatch that caused "undefined is not a function".
 */
export async function getPdfJs(): Promise<PdfJs> {
  if (pdfjsModule) return pdfjsModule;

  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  pdfjs.GlobalWorkerOptions.workerSrc = `${import.meta.env.BASE_URL}pdf.worker.min.mjs`;
  pdfjsModule = pdfjs;
  return pdfjs;
}
