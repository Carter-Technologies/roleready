import { useEffect } from "react";

const BASE_TITLE = "Kigho";

export function usePageTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title ? `${title} | ${BASE_TITLE}` : BASE_TITLE;
    return () => {
      document.title = previous;
    };
  }, [title]);
}

export function useMetaDescription(description: string) {
  useEffect(() => {
    let meta = document.querySelector('meta[name="description"]');
    const created = !meta;
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    const previous = meta.getAttribute("content") ?? "";
    meta.setAttribute("content", description);
    return () => {
      if (created && meta?.parentNode) {
        meta.parentNode.removeChild(meta);
      } else {
        meta?.setAttribute("content", previous);
      }
    };
  }, [description]);
}
