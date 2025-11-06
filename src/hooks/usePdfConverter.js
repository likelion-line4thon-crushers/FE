// src/hooks/usePdfConverter.js
import { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

export default function usePdfConverter() {
    const [slides, setSlides] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const convertPdfToImages = async (file) => {
        try {
            setLoading(true);
            setError(null);

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const imgs = [];

            // ✅ 화질 개선: scale 2.5 (기존 1.5보다 고해상도)
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

            // ✅ 비동기 안정화 (state 업데이트 타이밍 보장)
            await new Promise((resolve) => setTimeout(resolve, 0));
            setSlides(imgs);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return { slides, setSlides, loading, error, convertPdfToImages };
}
