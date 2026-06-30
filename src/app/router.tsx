import { createBrowserRouter } from "react-router";
import App from "./App";
import PresenterRoomGate from "./PresenterRoomGate";
import { LandingPage } from "@/pages/landing";
import { AudienceRoomPage } from "@/pages/audience-room";
import { AiReportPage } from "@/pages/ai-report";
import { RatingPage } from "@/pages/rating";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },

      // * Presenter flow — 단일 경로. 준비/발표 화면은 세션 상태로 결정 (PresenterRoomGate)
      { path: "rooms/new", element: <PresenterRoomGate /> },
      { path: "rooms/:roomId", element: <PresenterRoomGate /> },
      { path: "rooms/:roomId/report", element: <AiReportPage /> },

      // * Audience flow
      { path: "join/:code", element: <AudienceRoomPage /> },
      { path: "audience/:code/rating", element: <RatingPage /> },
    ],
  },
]);

export default router;
