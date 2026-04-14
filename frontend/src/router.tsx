import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "./shared/layout/app-shell";
import { AdminPage } from "./pages/admin-page";
import { CallsPage } from "./pages/calls-page";
import { CandidateProfilePage } from "./pages/candidate-profile-page";
import { LandingPage } from "./pages/landing-page";
import { MessagesPage } from "./pages/messages-page";
import { NotFoundPage } from "./pages/not-found-page";
import { ResumesPage } from "./pages/resumes-page";
import { VacancyDetailsPage } from "./pages/vacancy-details-page";
import { VacanciesPage } from "./pages/vacancies-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "vacancies", element: <VacanciesPage /> },
      { path: "vacancies/:id", element: <VacancyDetailsPage /> },
      { path: "candidate/profile", element: <CandidateProfilePage /> },
      { path: "resumes", element: <ResumesPage /> },
      { path: "messages", element: <MessagesPage /> },
      { path: "calls", element: <CallsPage /> },
      { path: "admin", element: <AdminPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
