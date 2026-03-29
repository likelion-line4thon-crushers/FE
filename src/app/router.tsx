import { createBrowserRouter } from "react-router";
import App from "./App";
import { LandingPage } from "@/pages/landing";
import { SessionCreatePage } from "@/pages/session-create";
import { PresenterRoomPage } from "@/pages/presenter-room";
import { AudienceRoomPage } from "@/pages/audience-room";
import { AiReportPage } from "@/pages/ai-report";
import { RatingPage } from "@/pages/rating";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <LandingPage /> },

      // * Presenter flow
      { path: "rooms/new", element: <SessionCreatePage /> },
      { path: "rooms/:roomId/prepare", element: <SessionCreatePage /> },
      { path: "rooms/:roomId/present", element: <PresenterRoomPage /> },
      { path: "rooms/:roomId/report", element: <AiReportPage /> },

      // * Audience flow
      { path: "join/:code", element: <AudienceRoomPage /> },
      { path: "audience/:code/rating", element: <RatingPage /> },
    ],
  },
]);

export default router;
