import { createBrowserRouter } from "react-router-dom";

import { AppShell } from "./shared/layout/app-shell";
import { AuthGuard } from "./shared/routes/auth-guard";
import { AdminPage } from "./pages/admin-page";
import { EmployerDashboardPage } from "./pages/employer-dashboard-page";
import { CallsPage } from "./pages/calls-page";
import { CandidateProfilePage } from "./pages/candidate-profile-page";
import { ForgotPasswordPage } from "./pages/forgot-password-page";
import { LandingPage } from "./pages/landing-page";
import { LoginPage } from "./pages/login-page";
import { MessagesPage } from "./pages/messages-page";
import { NotFoundPage } from "./pages/not-found-page";
import { RegisterPage } from "./pages/register-page";
import { ResumesPage } from "./pages/resumes-page";
import { VacancyDetailsPage } from "./pages/vacancy-details-page";
import { VacanciesPage } from "./pages/vacancies-page";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: "auth/login", element: <LoginPage /> },
      { path: "auth/register", element: <RegisterPage /> },
      { path: "auth/forgot-password", element: <ForgotPasswordPage /> },
      { path: "vacancies", element: <VacanciesPage /> },
      { path: "vacancies/:id", element: <VacancyDetailsPage /> },
      {
        element: <AuthGuard />,
        children: [
          { path: "resumes", element: <ResumesPage /> },
          { path: "messages", element: <MessagesPage /> },
          { path: "calls", element: <CallsPage /> },
        ],
      },
      {
        element: <AuthGuard allowedRoles={["candidate"]} />,
        children: [{ path: "candidate/profile", element: <CandidateProfilePage /> }],
      },
      {
        element: <AuthGuard allowedRoles={["employer"]} />,
        children: [{ path: "employer/profile", element: <EmployerDashboardPage /> }],
      },
      {
        element: <AuthGuard allowedRoles={["admin"]} />,
        children: [{ path: "admin", element: <AdminPage /> }],
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
