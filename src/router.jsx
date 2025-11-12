import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import MainPage from "./pages/MainPage";
import CreateSessionPage from "./pages/CreateSession/CreateSessionPage";
import PresenterViewPage from "./pages/PresenterView/PresenterViewPage";
import AudienceViewPage from "./pages/AudienceView/AudienceViewPage";
import AiReportPage from "./pages/AIReport/AIReport";
import RatingPage from "./pages/Rating/RatingPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        index: true,
        element: <MainPage />,
      },
      {
        path: "create-presentation",
        element: <CreateSessionPage />,
      },
      {
        path: "create-presentation/:roomId",
        element: <CreateSessionPage />,
      },
      {
        path: "presentation/:roomId",
        element: <PresenterViewPage />,
      },
      {
        path: "audience",
        element: <AudienceViewPage />,
      },
      {
        path: ":code",
        element: <AudienceViewPage />,
      },
      {
        path: "ai-report",
        element: <AiReportPage />,
      },
      {
        path: "rating",
        element: <RatingPage />,
      },
      {
        path: "rating/:code",
        element: <RatingPage />,
      },
    ],
  },
]);

export default router;
