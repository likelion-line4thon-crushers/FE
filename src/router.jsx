import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import MainPage from "./pages/MainPage";
import CreateSessionPage from "./pages/CreateSession/CreateSessionPage";
import PresenterViewPage from "./pages/PresenterView/PresenterViewPage";
import AudienceViewPage from "./pages/AudienceView/AudienceViewPage";
import AiReportPage from "./pages/AIReport/AIReport";

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
        path: "presentation",
        element: <PresenterViewPage />,
      },
      {
        path: "audience",
        element: <AudienceViewPage />,
      },
      {
        path: "ai-report",
        element: <AiReportPage />,
      },
    ],
  },
]);

export default router;
