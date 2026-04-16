import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

import { httpRequest } from "../shared/api/http-client";

export type UserRole = "guest" | "candidate" | "employer" | "admin";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: Exclude<UserRole, "guest">;
  headline: string;
  city: string;
  status: string;
};

export type CandidateProfile = {
  userId: string;
  headline: string;
  about: string;
  location: string;
  preferredFormat: string;
  salaryExpectation: string;
  experience: string;
  availability: string;
  skills: string[];
  summary: string[];
};

export type EmployerProfile = {
  userId: string;
  companyId: string;
  companyName: string;
  position: string;
  aboutCompany: string;
  office: string;
  hiringFocus: string[];
  teamSize: string;
  responseRate: string;
};

export type Vacancy = {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  salary: string;
  experience: string;
  location: string;
  format: string;
  employment: string;
  status: "published" | "draft" | "archived";
  publishedAt: string;
  note: string;
  description: string;
  responsibilities: string[];
  requirements: string[];
  perks: string[];
};

export type Resume = {
  id: string;
  candidateId: string;
  candidateName: string;
  role: string;
  experience: string;
  salary: string;
  location: string;
  visibility: string;
  updatedAt: string;
  about: string;
  skills: string[];
  education: string;
  formatPreference: string;
};

export type Application = {
  id: string;
  vacancyId: string;
  candidateId: string;
  status: string;
  updatedAt: string;
};

export type Notification = {
  id: string;
  title: string;
  description: string;
  isRead: boolean;
};

export type AdminCase = {
  id: string;
  title: string;
  subtitle: string;
  priority: string;
  actionLabel: string;
};

export type Message = {
  id: string;
  sender: "candidate" | "employer" | "system";
  author: string;
  text: string;
  sentAt: string;
};

export type Chat = {
  id: string;
  title: string;
  subtitle: string;
  vacancyId: string;
  unreadCount: number;
  lastMessageAt: string;
  nextStep: string;
  messages: Message[];
};

export type CallRecord = {
  id: string;
  participant: string;
  role: string;
  status: string;
  duration: string;
  summary: string;
  timeline: string[];
  context: string;
};

type RegisterPayload = {
  fullName: string;
  email: string;
  password: string;
  role: "candidate" | "employer";
  companyName?: string;
};

type CandidateProfileForm = Pick<
  CandidateProfile,
  "headline" | "about" | "location" | "preferredFormat" | "salaryExpectation" | "availability"
>;

type EmployerProfileForm = Pick<
  EmployerProfile,
  "companyName" | "position" | "aboutCompany" | "office" | "teamSize" | "responseRate"
>;

type ResumeCreatePayload = Pick<
  Resume,
  "role" | "experience" | "salary" | "location" | "visibility" | "about" | "skills" | "education" | "formatPreference"
>;

type VacancyCreatePayload = Pick<
  Vacancy,
  "title" | "salary" | "experience" | "location" | "format" | "employment" | "note" | "description" | "responsibilities" | "requirements" | "perks"
>;

type AppSnapshot = {
  users: User[];
  candidateProfiles: CandidateProfile[];
  employerProfiles: EmployerProfile[];
  vacancies: Vacancy[];
  resumes: Resume[];
  applications: Application[];
  notifications: Notification[];
  adminCases: AdminCase[];
  favoriteVacancyIds: string[];
  favoriteResumeIds: string[];
  chats: Chat[];
  calls: CallRecord[];
};

type Session = {
  userId: string | null;
  accessToken: string | null;
  refreshToken: string | null;
};

type AppContextValue = {
  data: AppSnapshot;
  sessionUser: User | null;
  role: UserRole;
  activeCandidateProfile: CandidateProfile | null;
  activeEmployerProfile: EmployerProfile | null;
  authReady: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  signOut: () => void;
  refreshData: () => Promise<void>;
  updateCandidateProfile: (payload: CandidateProfileForm) => Promise<void>;
  updateEmployerProfile: (payload: EmployerProfileForm) => Promise<void>;
  createResume: (payload: ResumeCreatePayload) => Promise<void>;
  createVacancy: (payload: VacancyCreatePayload) => Promise<void>;
  applyToVacancy: (vacancyId: string, coverLetter?: string) => Promise<void>;
  toggleFavoriteVacancy: (vacancyId: string) => Promise<void>;
  toggleFavoriteResume: (resumeId: string) => Promise<void>;
  toggleNotificationRead: (notificationId: string) => Promise<void>;
  isVacancyFavorite: (vacancyId: string) => boolean;
  isResumeFavorite: (resumeId: string) => boolean;
};

type ApiAuthResponse = {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: Record<string, unknown>;
};

const STORAGE_KEY = "hr-platform-session-v2";

const emptyData: AppSnapshot = {
  users: [],
  candidateProfiles: [],
  employerProfiles: [],
  vacancies: [],
  resumes: [],
  applications: [],
  notifications: [],
  adminCases: [],
  favoriteVacancyIds: [],
  favoriteResumeIds: [],
  chats: [],
  calls: [],
};

const AppContext = createContext<AppContextValue | null>(null);

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function toUser(payload: Record<string, unknown>): User {
  const role = asString(payload.role, "candidate") as User["role"];
  return {
    id: asString(payload.id),
    fullName: asString(payload.fullName ?? payload.full_name),
    email: asString(payload.email),
    role,
    headline: asString(payload.headline),
    city: asString(payload.city),
    status: asString(payload.status),
  };
}

function toCandidateProfile(payload: Record<string, unknown>): CandidateProfile {
  return {
    userId: asString(payload.user_id),
    headline: asString(payload.headline),
    about: asString(payload.about),
    location: asString(payload.location),
    preferredFormat: asString(payload.preferred_format),
    salaryExpectation: asString(payload.salary_expectation),
    experience: asString(payload.experience),
    availability: asString(payload.availability),
    skills: asStringArray(payload.skills),
    summary: asStringArray(payload.summary),
  };
}

function toEmployerProfile(payload: Record<string, unknown>): EmployerProfile {
  return {
    userId: asString(payload.user_id),
    companyId: asString(payload.company_id),
    companyName: asString(payload.company_name),
    position: asString(payload.position),
    aboutCompany: asString(payload.about_company),
    office: asString(payload.office),
    hiringFocus: asStringArray(payload.hiring_focus),
    teamSize: asString(payload.team_size),
    responseRate: asString(payload.response_rate),
  };
}

function toVacancy(payload: Record<string, unknown>): Vacancy {
  return {
    id: asString(payload.id),
    title: asString(payload.title),
    companyId: asString(payload.company_id),
    companyName: asString(payload.company_name),
    salary: asString(payload.salary),
    experience: asString(payload.experience),
    location: asString(payload.location),
    format: asString(payload.format),
    employment: asString(payload.employment),
    status: (asString(payload.status, "draft") as Vacancy["status"]) ?? "draft",
    publishedAt: asString(payload.published_at),
    note: asString(payload.note),
    description: asString(payload.description),
    responsibilities: asStringArray(payload.responsibilities),
    requirements: asStringArray(payload.requirements),
    perks: asStringArray(payload.perks),
  };
}

function toResume(payload: Record<string, unknown>): Resume {
  return {
    id: asString(payload.id),
    candidateId: asString(payload.candidate_id),
    candidateName: asString(payload.candidate_name),
    role: asString(payload.role),
    experience: asString(payload.experience),
    salary: asString(payload.salary),
    location: asString(payload.location),
    visibility: asString(payload.visibility),
    updatedAt: asString(payload.updated_at),
    about: asString(payload.about),
    skills: asStringArray(payload.skills),
    education: asString(payload.education),
    formatPreference: asString(payload.format_preference),
  };
}

function toApplication(payload: Record<string, unknown>): Application {
  return {
    id: asString(payload.id),
    vacancyId: asString(payload.vacancy_id),
    candidateId: asString(payload.candidate_id),
    status: asString(payload.status),
    updatedAt: asString(payload.updated_at),
  };
}

function toNotification(payload: Record<string, unknown>): Notification {
  return {
    id: asString(payload.id),
    title: asString(payload.title),
    description: asString(payload.description),
    isRead: Boolean(payload.is_read ?? payload.isRead),
  };
}

function toAdminCase(payload: Record<string, unknown>): AdminCase {
  const status = asString(payload.status, "new");
  return {
    id: asString(payload.id),
    title: asString(payload.title, "Report"),
    subtitle: `Status: ${status}`,
    priority: status === "new" ? "High" : "Medium",
    actionLabel: status === "new" ? "Review" : "Update status",
  };
}

function readStorage(): Session | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<Session>;
    return {
      userId: parsed.userId ?? null,
      accessToken: parsed.accessToken ?? null,
      refreshToken: parsed.refreshToken ?? null,
    };
  } catch {
    return null;
  }
}

function getDashboardPath(role: UserRole) {
  switch (role) {
    case "candidate":
      return "/candidate/profile";
    case "employer":
      return "/employer/profile";
    case "admin":
      return "/admin";
    default:
      return "/";
  }
}

export function AppProvider({ children }: PropsWithChildren) {
  const [data, setData] = useState<AppSnapshot>(emptyData);
  const [session, setSession] = useState<Session>({ userId: null, accessToken: null, refreshToken: null });
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const stored = readStorage();
    if (stored) {
      setSession(stored);
    }
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!authReady || typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }, [authReady, session]);

  useEffect(() => {
    let cancelled = false;

    async function loadPublicData() {
      try {
        const [vacanciesResponse, resumesResponse] = await Promise.all([
          httpRequest<Array<Record<string, unknown>>>("/vacancies"),
          httpRequest<Array<Record<string, unknown>>>("/resumes"),
        ]);

        if (cancelled) {
          return;
        }

        setData((current) => ({
          ...current,
          vacancies: vacanciesResponse.map(toVacancy),
          resumes: resumesResponse.map(toResume),
        }));
      } catch {
        if (cancelled) {
          return;
        }

        setData((current) => ({
          ...current,
          vacancies: [],
          resumes: [],
        }));
      }
    }

    void loadPublicData();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadSessionData() {
      if (!session.accessToken) {
        setData((current) => ({
          ...current,
          users: [],
          candidateProfiles: [],
          employerProfiles: [],
          applications: [],
          notifications: [],
          adminCases: [],
          favoriteVacancyIds: [],
          favoriteResumeIds: [],
          chats: [],
          calls: [],
        }));
        return;
      }

      try {
        const me = await httpRequest<Record<string, unknown>>("/users/me", {
          accessToken: session.accessToken,
        });
        const nextUser = toUser(me);

        const requests: Array<Promise<unknown>> = [
          httpRequest<Array<Record<string, unknown>>>("/applications", { accessToken: session.accessToken }),
          httpRequest<Array<Record<string, unknown>>>("/notifications", { accessToken: session.accessToken }),
          httpRequest<Array<Record<string, unknown>>>("/favorites/vacancies", { accessToken: session.accessToken }),
          httpRequest<Array<Record<string, unknown>>>("/favorites/resumes", { accessToken: session.accessToken }),
        ];

        if (nextUser.role === "candidate") {
          requests.push(httpRequest<Record<string, unknown>>("/candidate/profile", { accessToken: session.accessToken }));
        }

        if (nextUser.role === "employer") {
          requests.push(httpRequest<Record<string, unknown>>("/employer/profile", { accessToken: session.accessToken }));
        }

        if (nextUser.role === "admin") {
          requests.push(
            httpRequest<Array<Record<string, unknown>>>("/admin/users", { accessToken: session.accessToken }),
            httpRequest<Array<Record<string, unknown>>>("/admin/reports", { accessToken: session.accessToken }),
          );
        }

        const [
          applicationsResponse,
          notificationsResponse,
          favoriteVacanciesResponse,
          favoriteResumesResponse,
          ...extraResponses
        ] = await Promise.all(requests);

        if (cancelled) {
          return;
        }

        const nextCandidateProfiles: CandidateProfile[] = [];
        const nextEmployerProfiles: EmployerProfile[] = [];
        let nextUsers: User[] = [nextUser];
        let nextAdminCases: AdminCase[] = [];

        if (nextUser.role === "candidate" && extraResponses[0]) {
          nextCandidateProfiles.push(toCandidateProfile(extraResponses[0] as Record<string, unknown>));
        }

        if (nextUser.role === "employer" && extraResponses[0]) {
          nextEmployerProfiles.push(toEmployerProfile(extraResponses[0] as Record<string, unknown>));
        }

        if (nextUser.role === "admin") {
          const adminUsers = extraResponses[0] as Array<Record<string, unknown>> | undefined;
          const adminReports = extraResponses[1] as Array<Record<string, unknown>> | undefined;
          nextUsers = adminUsers?.map(toUser) ?? [nextUser];
          nextAdminCases = adminReports?.map(toAdminCase) ?? [];
        }

        setSession((current) => ({ ...current, userId: nextUser.id }));
        setData((current) => ({
          ...current,
          users: nextUsers,
          candidateProfiles: nextCandidateProfiles,
          employerProfiles: nextEmployerProfiles,
          applications: (applicationsResponse as Array<Record<string, unknown>>).map(toApplication),
          notifications: (notificationsResponse as Array<Record<string, unknown>>).map(toNotification),
          adminCases: nextAdminCases,
          favoriteVacancyIds: (favoriteVacanciesResponse as Array<Record<string, unknown>>).map((item) => asString(item.id)),
          favoriteResumeIds: (favoriteResumesResponse as Array<Record<string, unknown>>).map((item) => asString(item.id)),
          chats: [],
          calls: [],
        }));
      } catch {
        if (cancelled) {
          return;
        }

        setSession({ userId: null, accessToken: null, refreshToken: null });
        setData((current) => ({
          ...current,
          users: [],
          candidateProfiles: [],
          employerProfiles: [],
          applications: [],
          notifications: [],
          adminCases: [],
          favoriteVacancyIds: [],
          favoriteResumeIds: [],
          chats: [],
          calls: [],
        }));
      }
    }

    void loadSessionData();

    return () => {
      cancelled = true;
    };
  }, [session.accessToken]);

  const sessionUser = useMemo(
    () => data.users.find((user) => user.id === session.userId) ?? null,
    [data.users, session.userId],
  );
  const role: UserRole = sessionUser?.role ?? "guest";
  const activeCandidateProfile = useMemo(
    () => data.candidateProfiles.find((profile) => profile.userId === sessionUser?.id) ?? null,
    [data.candidateProfiles, sessionUser?.id],
  );
  const activeEmployerProfile = useMemo(
    () => data.employerProfiles.find((profile) => profile.userId === sessionUser?.id) ?? null,
    [data.employerProfiles, sessionUser?.id],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      data,
      sessionUser,
      role,
      activeCandidateProfile,
      activeEmployerProfile,
      authReady,
      async signIn(email, password) {
        const response = await httpRequest<ApiAuthResponse>("/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
        });

        setSession({
          userId: asString(response.user.id),
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
        });
      },
      async register(payload) {
        const response = await httpRequest<ApiAuthResponse>("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            full_name: payload.fullName,
            email: payload.email,
            password: payload.password,
            role: payload.role,
            company_name: payload.companyName,
          }),
        });

        setSession({
          userId: asString(response.user.id),
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
        });
      },
      async requestPasswordReset(email) {
        await httpRequest<{ success: boolean }>("/auth/forgot-password", {
          method: "POST",
          body: JSON.stringify({ email }),
        });
      },
      signOut() {
        if (session.refreshToken) {
          void httpRequest<{ success: boolean }>("/auth/logout", {
            method: "POST",
            body: JSON.stringify({ refresh_token: session.refreshToken }),
          }).catch(() => undefined);
        }

        setSession({ userId: null, accessToken: null, refreshToken: null });
      },
      async refreshData() {
        if (!session.accessToken) {
          return;
        }

        const [vacanciesResponse, resumesResponse, applicationsResponse, notificationsResponse] = await Promise.all([
          httpRequest<Array<Record<string, unknown>>>("/vacancies"),
          httpRequest<Array<Record<string, unknown>>>("/resumes"),
          httpRequest<Array<Record<string, unknown>>>("/applications", { accessToken: session.accessToken }),
          httpRequest<Array<Record<string, unknown>>>("/notifications", { accessToken: session.accessToken }),
        ]);

        setData((current) => ({
          ...current,
          vacancies: vacanciesResponse.map(toVacancy),
          resumes: resumesResponse.map(toResume),
          applications: applicationsResponse.map(toApplication),
          notifications: notificationsResponse.map(toNotification),
        }));
      },
      async updateCandidateProfile(payload) {
        if (!sessionUser || sessionUser.role !== "candidate" || !session.accessToken) {
          throw new Error("Editing is available only for candidate accounts.");
        }

        const updated = await httpRequest<Record<string, unknown>>("/candidate/profile", {
          method: "PATCH",
          accessToken: session.accessToken,
          body: JSON.stringify({
            headline: payload.headline,
            about: payload.about,
            location: payload.location,
            preferred_format: payload.preferredFormat,
            salary_expectation: payload.salaryExpectation,
            availability: payload.availability,
          }),
        });

        setData((current) => ({
          ...current,
          users: current.users.map((user) =>
            user.id === sessionUser.id
              ? {
                  ...user,
                  headline: payload.headline,
                  city: payload.location,
                }
              : user,
          ),
          candidateProfiles: [toCandidateProfile(updated)],
        }));
      },
      async updateEmployerProfile(payload) {
        if (!sessionUser || sessionUser.role !== "employer" || !session.accessToken) {
          throw new Error("Editing is available only for employer accounts.");
        }

        const updated = await httpRequest<Record<string, unknown>>("/employer/profile", {
          method: "PATCH",
          accessToken: session.accessToken,
          body: JSON.stringify({
            company_name: payload.companyName,
            position: payload.position,
            about_company: payload.aboutCompany,
            office: payload.office,
            team_size: payload.teamSize,
            response_rate: payload.responseRate,
          }),
        });

        setData((current) => ({
          ...current,
          users: current.users.map((user) =>
            user.id === sessionUser.id
              ? {
                  ...user,
                  headline: payload.position,
                  city: payload.office,
                }
              : user,
          ),
          employerProfiles: [toEmployerProfile(updated)],
        }));
      },
      async createResume(payload) {
        if (!session.accessToken || role !== "candidate") {
          throw new Error("Only candidate accounts can create resumes.");
        }

        await httpRequest<Record<string, unknown>>("/resumes", {
          method: "POST",
          accessToken: session.accessToken,
          body: JSON.stringify({
            role: payload.role,
            experience: payload.experience,
            salary: payload.salary,
            location: payload.location,
            visibility: payload.visibility,
            about: payload.about,
            skills: payload.skills,
            education: payload.education,
            format_preference: payload.formatPreference,
          }),
        });

        const resumesResponse = await httpRequest<Array<Record<string, unknown>>>("/resumes");
        setData((current) => ({
          ...current,
          resumes: resumesResponse.map(toResume),
        }));
      },
      async createVacancy(payload) {
        if (!session.accessToken || role !== "employer") {
          throw new Error("Only employer accounts can create vacancies.");
        }

        let companyId = activeEmployerProfile?.companyId;
        if (!companyId) {
          const createdCompany = await httpRequest<Record<string, unknown>>("/companies", {
            method: "POST",
            accessToken: session.accessToken,
            body: JSON.stringify({
              name: activeEmployerProfile?.companyName || "Новая компания",
              description: activeEmployerProfile?.aboutCompany || "",
              office: activeEmployerProfile?.office || "",
            }),
          });
          companyId = asString(createdCompany.id);
        }

        await httpRequest<Record<string, unknown>>("/vacancies", {
          method: "POST",
          accessToken: session.accessToken,
          body: JSON.stringify({
            title: payload.title,
            company_id: companyId,
            salary: payload.salary,
            experience: payload.experience,
            location: payload.location,
            format: payload.format,
            employment: payload.employment,
            note: payload.note,
            description: payload.description,
            responsibilities: payload.responsibilities,
            requirements: payload.requirements,
            perks: payload.perks,
          }),
        });

        const [vacanciesResponse, employerProfileResponse] = await Promise.all([
          httpRequest<Array<Record<string, unknown>>>("/vacancies"),
          httpRequest<Record<string, unknown>>("/employer/profile", { accessToken: session.accessToken }),
        ]);

        setData((current) => ({
          ...current,
          vacancies: vacanciesResponse.map(toVacancy),
          employerProfiles: [toEmployerProfile(employerProfileResponse)],
        }));
      },
      async applyToVacancy(vacancyId, coverLetter = "") {
        if (!session.accessToken) {
          throw new Error("Sign in to apply for a vacancy.");
        }

        const application = await httpRequest<Record<string, unknown>>("/applications", {
          method: "POST",
          accessToken: session.accessToken,
          body: JSON.stringify({
            vacancy_id: vacancyId,
            cover_letter: coverLetter,
          }),
        });

        setData((current) => ({
          ...current,
          applications: [...current.applications.filter((item) => item.id !== asString(application.id)), toApplication(application)],
        }));
      },
      async toggleFavoriteVacancy(vacancyId) {
        if (!session.accessToken) {
          throw new Error("Sign in to save vacancies.");
        }

        const isFavorite = data.favoriteVacancyIds.includes(vacancyId);

        await httpRequest<unknown>(`/favorites/vacancies/${vacancyId}`, {
          method: isFavorite ? "DELETE" : "POST",
          accessToken: session.accessToken,
        });

        setData((current) => ({
          ...current,
          favoriteVacancyIds: isFavorite
            ? current.favoriteVacancyIds.filter((item) => item !== vacancyId)
            : [...current.favoriteVacancyIds, vacancyId],
        }));
      },
      async toggleFavoriteResume(resumeId) {
        if (!session.accessToken) {
          throw new Error("Sign in to save candidates.");
        }

        const isFavorite = data.favoriteResumeIds.includes(resumeId);

        await httpRequest<unknown>(`/favorites/resumes/${resumeId}`, {
          method: isFavorite ? "DELETE" : "POST",
          accessToken: session.accessToken,
        });

        setData((current) => ({
          ...current,
          favoriteResumeIds: isFavorite
            ? current.favoriteResumeIds.filter((item) => item !== resumeId)
            : [...current.favoriteResumeIds, resumeId],
        }));
      },
      async toggleNotificationRead(notificationId) {
        if (!session.accessToken) {
          throw new Error("Sign in to manage notifications.");
        }

        const notification = data.notifications.find((item) => item.id === notificationId);
        if (!notification || notification.isRead) {
          return;
        }

        await httpRequest<{ success: boolean }>(`/notifications/${notificationId}/read`, {
          method: "POST",
          accessToken: session.accessToken,
        });

        setData((current) => ({
          ...current,
          notifications: current.notifications.map((item) =>
            item.id === notificationId
              ? {
                  ...item,
                  isRead: true,
                }
              : item,
          ),
        }));
      },
      isVacancyFavorite(vacancyId) {
        return data.favoriteVacancyIds.includes(vacancyId);
      },
      isResumeFavorite(resumeId) {
        return data.favoriteResumeIds.includes(resumeId);
      },
    }),
    [activeCandidateProfile, activeEmployerProfile, authReady, data, role, session, sessionUser],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider.");
  }
  return context;
}

export { getDashboardPath };
