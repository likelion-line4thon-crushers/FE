import { createBrowserRouter, Navigate, useParams } from 'react-router';
import App from "./App";
import MainPage from "../features/landing/MainPage";
import CreateSessionPage from "../features/session-create/CreateSessionPage";
import PresenterViewPage from "../features/presenter/PresenterViewPage";
import AudienceViewPage from "../features/audience/AudienceViewPage";
import AiReportPage from "../features/ai-report/AIReport";
import RatingPage from "../features/rating/RatingPage";

// * Backwards compat: redirect old /:code to /join/:code
function CodeRedirect() {
  const { code } = useParams();
  return <Navigate to={`/join/${code}`} replace />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <MainPage /> },

      // * Presenter flow
      { path: "rooms/new", element: <CreateSessionPage /> },
      { path: "rooms/:roomId/prepare", element: <CreateSessionPage /> },
      { path: "rooms/:roomId/present", element: <PresenterViewPage /> },
      { path: "rooms/:roomId/report", element: <AiReportPage /> },

      // * Audience flow
      { path: "join/:code", element: <AudienceViewPage /> },
      { path: "audience/:code/rating", element: <RatingPage /> },

      // * Backwards compat redirects
      { path: "create-presentation", element: <Navigate to="/rooms/new" replace /> },
      { path: "create-presentation/:roomId", element: <Navigate to="/rooms/new" replace /> },
      { path: "presentation/:roomId", element: <Navigate to="/" replace /> },
      { path: "ai-report", element: <Navigate to="/" replace /> },
      { path: "rating", element: <Navigate to="/" replace /> },
      { path: "rating/:code", element: <CodeRedirect /> },
      { path: "audience", element: <Navigate to="/" replace /> },
      { path: ":code", element: <CodeRedirect /> },
    ],
  },
]);

export default router;
