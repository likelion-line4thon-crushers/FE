import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import posthog from "posthog-js";
import { PostHogProvider } from "@posthog/react";
import router from "./router";
import queryClient from "./query-client";
import "../styles/global.css";

// 토큰 미설정(.env.example 기본값) 환경에서는 init 자체를 건너뛴다 — 콘솔 에러/불필요한 셋업 방지.
if (import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN) {
  posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN, {
    api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
    defaults: "2026-06-25",
    capture_exceptions: true,
    capture_heatmaps: true,
    // "history_change": SPA 라우트 이동마다 $pageview 캡처 (true 는 최초 로드 1회만 캡처하므로 금지)
    capture_pageview: "history_change",
    capture_pageleave: true,
    capture_performance: true,
    capture_dead_clicks: true,
    loaded: (ph) => {
      // 로컬 개발 이벤트가 프로덕션 프로젝트 데이터를 오염시키지 않도록 dev에서는 수집 중단.
      if (import.meta.env.DEV) {
        ph.opt_out_capturing();
        ph.set_config({ disable_session_recording: true });
      }
    },
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <PostHogProvider client={posthog}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </PostHogProvider>
  </React.StrictMode>
);
