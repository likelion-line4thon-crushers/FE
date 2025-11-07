// src/hooks/usePdfConverter.js
import { useState, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function usePdfConverter() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const convertPdfToImages = useCallback(async (file) => {
    if (!file) return [];
    try {
      setLoading(true);
      setError(null);

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const imgs = [];

      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2.5 });
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: ctx, viewport }).promise;
        imgs.push(canvas.toDataURL("image/png"));
      }
      return imgs;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, convertPdfToImages };
}
