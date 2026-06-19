type PdfJs = typeof import("pdfjs-dist");

let pdfjsModule: PdfJs | null = null;

function polyfillPromiseWithResolvers() {
  const promiseCtor = Promise as PromiseConstructor & {
    withResolvers?: <T>() => {
      promise: Promise<T>;
      resolve: (value: T | PromiseLike<T>) => void;
      reject: (reason?: unknown) => void;
    };
  };
  if (typeof promiseCtor.withResolvers === "function") return;
  promiseCtor.withResolvers = function withResolvers<T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

/** Load pdfjs-dist with worker — no unpdf layer (avoids Vite minify issues). */
export async function getPdfJs(): Promise<PdfJs> {
  if (pdfjsModule) return pdfjsModule;

  polyfillPromiseWithResolvers();

  const [pdfjs, workerModule] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);

  const workerSrc =
    typeof workerModule === "object" && workerModule && "default" in workerModule
      ? String(workerModule.default)
      : String(workerModule);

  pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  pdfjsModule = pdfjs;
  return pdfjs;
}
