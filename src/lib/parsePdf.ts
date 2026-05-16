function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return btoa(binary);
}

export async function extractTextFromPdf(file: File): Promise<string> {
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Please upload a PDF file.");
  }

  if (file.size > 10 * 1024 * 1024) {
    throw new Error("PDF must be under 10MB.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdfBase64 = uint8ArrayToBase64(bytes);

  const response = await fetch("/api/parse-cv", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ pdfBase64 }),
  });

  const data = (await response.json()) as { text?: string; error?: string };

  if (!response.ok) {
    throw new Error(
      data.error ||
        (response.status === 404
          ? "PDF parser unavailable. Run `npx vercel dev` alongside `npm run dev`."
          : "Failed to parse PDF")
    );
  }

  if (!data.text) {
    throw new Error("No text returned from PDF parser.");
  }

  return data.text;
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
