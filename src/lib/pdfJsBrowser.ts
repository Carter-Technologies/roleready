let initPromise: Promise<void> | null = null;

/** Use official pdfjs-dist in the browser — unpdf's serverless bundle breaks under Vite production minify. */
export async function ensureBrowserPdfJs() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    const [{ definePDFJSModule }, workerModule] = await Promise.all([
      import("unpdf"),
      import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
    ]);

    const workerSrc =
      typeof workerModule === "object" && workerModule && "default" in workerModule
        ? String(workerModule.default)
        : String(workerModule);

    await definePDFJSModule(async () => {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      return pdfjs;
    });
  })();

  return initPromise;
}
