import * as pdfjs from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

const MAX_PAGES = 20;

export async function extractTextFromPdf(file: File): Promise<string> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Please upload a PDF file.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("PDF must be under 10MB.");
  }

  const buffer = await file.arrayBuffer();
  const pdf = await pdfjs.getDocument({ data: buffer }).promise;
  const pageCount = Math.min(pdf.numPages, MAX_PAGES);
  const parts: string[] = [];

  for (let i = 1; i <= pageCount; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    parts.push(pageText);
  }

  const text = parts.join("\n\n").replace(/\s+\n/g, "\n").trim();

  if (!text) {
    throw new Error("No text found in PDF. Try a text-based PDF or paste your CV manually.");
  }

  return text;
}

export async function parseCvFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf")) {
    return extractTextFromPdf(file);
  }

  if (name.endsWith(".txt")) {
    return file.text();
  }

  throw new Error("Supported formats: PDF or TXT");
}
