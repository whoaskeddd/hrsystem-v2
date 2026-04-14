import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";

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

export type SavedSearch = {
  id: string;
  title: string;
  description: string;
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

type AppSnapshot = {
  users: User[];
  candidateProfiles: CandidateProfile[];
  employerProfiles: EmployerProfile[];
  vacancies: Vacancy[];
  resumes: Resume[];
  applications: Application[];
  chats: Chat[];
  calls: CallRecord[];
  notifications: Notification[];
  adminCases: AdminCase[];
  savedSearches: SavedSearch[];
};

type Session = {
  userId: string | null;
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
  updateCandidateProfile: (payload: CandidateProfileForm) => Promise<void>;
  updateEmployerProfile: (payload: EmployerProfileForm) => Promise<void>;
  toggleNotificationRead: (notificationId: string) => void;
};

const STORAGE_KEY = "hr-platform-app-state-v1";

const initialData: AppSnapshot = {
  users: [
    {
      id: "user-candidate",
      fullName: "Анна Смирнова",
      email: "anna@hrplatform.dev",
      role: "candidate",
      headline: "Senior Frontend Engineer",
      city: "Москва",
      status: "Открыта к предложениям",
    },
    {
      id: "user-employer",
      fullName: "Игорь Беляев",
      email: "igor@aurumlabs.dev",
      role: "employer",
      headline: "Head of Product Hiring",
      city: "Москва",
      status: "Нанимает",
    },
    {
      id: "user-admin",
      fullName: "Мария Орлова",
      email: "admin@hrplatform.dev",
      role: "admin",
      headline: "Platform Administrator",
      city: "Москва",
      status: "На смене",
    },
  ],
  candidateProfiles: [
    {
      userId: "user-candidate",
      headline: "Старший frontend-разработчик",
      about:
        "Фокусируюсь на сложных B2B-интерфейсах, поисковых сценариях, внутренних кабинетах и продуктовой аналитике. Сильна в системном UI, работе с контрактами API и в построении предсказуемой фронтенд-архитектуры.",
      location: "Москва",
      preferredFormat: "Гибрид или удаленно",
      salaryExpectation: "250 000 ₽",
      experience: "6 лет",
      availability: "Могу выйти через 2 недели",
      skills: ["React", "TypeScript", "Design Systems", "Product Analytics", "Mentoring"],
      summary: [
        "Запустила design system для B2B-платформы с 40+ экранами.",
        "Сократила время доставки фронтенд-фич на 28% за счет переиспользуемого UI-kit.",
        "Выстроила интеграцию frontend и backend по OpenAPI-контракту.",
      ],
    },
  ],
  employerProfiles: [
    {
      userId: "user-employer",
      companyId: "company-aurum",
      companyName: "Aurum Labs",
      position: "Руководитель найма продукта",
      aboutCompany:
        "Aurum Labs строит HRTech-платформу для продуктовых и операционных команд. Мы делаем акцент на скорости найма, качестве candidate experience и прозрачных внутренних процессах.",
      office: "Москва, Белорусская",
      hiringFocus: ["Frontend", "Product Design", "Recruiting Operations"],
      teamSize: "247 сотрудников",
      responseRate: "92%",
    },
  ],
  vacancies: [
    {
      id: "vac-frontend",
      title: "Старший frontend-инженер",
      companyId: "company-aurum",
      companyName: "Aurum Labs",
      salary: "280 000 ₽",
      experience: "3-6 лет",
      location: "Москва",
      format: "Гибрид",
      employment: "Полная занятость",
      status: "published",
      publishedAt: "Опубликована 2 дня назад",
      note: "React, TypeScript, design system, сложные кабинеты и поиск по данным.",
      description:
        "Роль в продуктовой команде HR Platform. Нужен человек, который умеет строить сложный frontend не только как набор экранов, а как устойчивую систему для долгого развития.",
      responsibilities: [
        "Развивать кабинеты соискателя, работодателя и админки.",
        "Проектировать сложные формы, фильтры и списки.",
        "Интегрировать frontend с backend по контрактам и typed DTO.",
      ],
      requirements: [
        "Уверенный React и TypeScript.",
        "Опыт работы с продуктовым UI и внутренними системами.",
        "Навык системно собирать дизайн-системы и reusable patterns.",
      ],
      perks: [
        "Сильная продуктовая команда.",
        "Гибридный формат и современный стек.",
        "Влияние на архитектуру frontend слоя.",
      ],
    },
    {
      id: "vac-designer",
      title: "Продуктовый дизайнер",
      companyId: "company-northwind",
      companyName: "Northwind HR",
      salary: "230 000 ₽",
      experience: "3-6 лет",
      location: "Санкт-Петербург",
      format: "Удаленно",
      employment: "Полная занятость",
      status: "published",
      publishedAt: "Опубликована сегодня",
      note: "Figma, UX research, поисковые сценарии, HRTech.",
      description:
        "Ищем продуктового дизайнера для сценариев поиска, коммуникации и внутренних HR-процессов.",
      responsibilities: [
        "Вести поток от discovery до handoff.",
        "Проектировать фильтры, карточки и сложные рабочие флоу.",
        "Работать в тесной связке с frontend-разработкой.",
      ],
      requirements: [
        "Опыт в продуктовых B2B-интерфейсах.",
        "Сильная визуальная и UX-дисциплина.",
        "Умение защищать решения на языке метрик и сценариев.",
      ],
      perks: ["Удаленный формат", "Сильная дизайн-культура", "Гибкий график"],
    },
    {
      id: "vac-analytics",
      title: "HR-аналитик",
      companyId: "company-atlas",
      companyName: "Atlas Systems",
      salary: "170 000 ₽",
      experience: "1-3 года",
      location: "Москва",
      format: "Офис",
      employment: "Полная занятость",
      status: "published",
      publishedAt: "Опубликована 4 дня назад",
      note: "Отчетность, дашборды, воронка найма и SLA.",
      description:
        "Роль для человека, который соединяет подбор, аналитику и понятные управленческие решения.",
      responsibilities: [
        "Собирать дашборды по найму.",
        "Следить за скоростью закрытия вакансий.",
        "Поддерживать аналитику для hiring managers.",
      ],
      requirements: ["SQL и BI-инструменты", "Опыт с HR-данными", "Внимание к качеству данных"],
      perks: ["Доступ к данным продукта", "Наставничество", "Понятный growth track"],
    },
    {
      id: "vac-recruiting",
      title: "Руководитель подбора",
      companyId: "company-verve",
      companyName: "Verve Group",
      salary: "320 000 ₽",
      experience: "6+ лет",
      location: "Москва",
      format: "Гибрид",
      employment: "Полная занятость",
      status: "published",
      publishedAt: "Опубликована 6 дней назад",
      note: "Leadership, hiring operations, stakeholder management.",
      description:
        "Нужен лидер, который возьмет на себя процесс найма и выстроит прозрачную воронку под ключевые роли.",
      responsibilities: [
        "Управлять командой рекрутинга.",
        "Настроить intake и SLA.",
        "Работать со стейкхолдерами и hiring dashboards.",
      ],
      requirements: ["Опыт управления рекрутингом", "Сильный stakeholder management", "Навык построения процессов"],
      perks: ["Влияние на стратегию найма", "Команда в росте", "Компенсация выше рынка"],
    },
  ],
  resumes: [
    {
      id: "resume-anna",
      candidateId: "user-candidate",
      candidateName: "Анна Смирнова",
      role: "Старший frontend-разработчик",
      experience: "6 лет опыта",
      salary: "250 000 ₽",
      location: "Москва",
      visibility: "Открыто для работодателей",
      updatedAt: "Обновлено 2 дня назад",
      about:
        "Работала над кабинетом клиентов, аналитическими интерфейсами и системными дизайн-компонентами. Сильна в архитектуре frontend, контрактной интеграции и продуктовой разработке.",
      skills: ["React", "TypeScript", "TanStack", "Accessibility", "Design Systems"],
      education: "МГТУ им. Баумана",
      formatPreference: "Гибрид или удаленно",
    },
    {
      id: "resume-ilya",
      candidateId: "candidate-ilya",
      candidateName: "Илья Воронцов",
      role: "Продуктовый дизайнер",
      experience: "4 года опыта",
      salary: "220 000 ₽",
      location: "Санкт-Петербург",
      visibility: "По ссылке",
      updatedAt: "Обновлено вчера",
      about:
        "Делает интерфейсы для B2B-поиска, CRM и сложных системных кабинетов. Силен в UX-исследованиях и handoff-процессе.",
      skills: ["Figma", "UX Research", "Design Systems", "Prototyping"],
      education: "СПбГУПТД",
      formatPreference: "Удаленно",
    },
    {
      id: "resume-maria",
      candidateId: "candidate-maria",
      candidateName: "Мария Волкова",
      role: "Руководитель подбора",
      experience: "7 лет опыта",
      salary: "260 000 ₽",
      location: "Удаленно",
      visibility: "Открыто для работодателей",
      updatedAt: "Обновлено 5 дней назад",
      about:
        "Лидировала hiring operations и команду рекрутинга в продуктовых компаниях. Умеет выстраивать intake, SLA и hiring analytics.",
      skills: ["Recruiting", "Analytics", "Stakeholder Management", "Operations"],
      education: "НИУ ВШЭ",
      formatPreference: "Удаленно или гибрид",
    },
  ],
  applications: [
    { id: "app-1", vacancyId: "vac-frontend", candidateId: "user-candidate", status: "Первичный скрининг", updatedAt: "Сегодня, 12:45" },
    { id: "app-2", vacancyId: "vac-designer", candidateId: "user-candidate", status: "Рассматривается", updatedAt: "Вчера, 18:20" },
  ],
  chats: [
    {
      id: "chat-anna",
      title: "Aurum Labs",
      subtitle: "Старший frontend-инженер",
      vacancyId: "vac-frontend",
      unreadCount: 2,
      lastMessageAt: "12:45",
      nextStep: "Назначить первичный звонок",
      messages: [
        {
          id: "msg-1",
          sender: "candidate",
          author: "Анна Смирнова",
          text: "Добрый день. Посмотрела описание роли и готова обсудить команду и стек.",
          sentAt: "12:40",
        },
        {
          id: "msg-2",
          sender: "employer",
          author: "Игорь Беляев",
          text: "Отлично. Давайте созвонимся завтра после 15:00, я пришлю детали по процессу найма.",
          sentAt: "12:43",
        },
        {
          id: "msg-3",
          sender: "candidate",
          author: "Анна Смирнова",
          text: "Подойдет. Буду ждать приглашение и краткий контекст по роли.",
          sentAt: "12:45",
        },
      ],
    },
    {
      id: "chat-northwind",
      title: "Northwind HR",
      subtitle: "Продуктовый дизайнер",
      vacancyId: "vac-designer",
      unreadCount: 0,
      lastMessageAt: "Вчера",
      nextStep: "Отправить тестовое задание",
      messages: [
        {
          id: "msg-4",
          sender: "system",
          author: "Система",
          text: "Отклик переведен в этап “Интервью с командой”.",
          sentAt: "Вчера, 17:05",
        },
      ],
    },
  ],
  calls: [
    {
      id: "call-1",
      participant: "Анна Смирнова",
      role: "Старший frontend-разработчик",
      status: "Соединение стабильное",
      duration: "02:14",
      summary: "Первичный разговор о роли, стеке и команде. Следующий шаг: отправить контекст по процессу интервью.",
      timeline: [
        "12:43 • Соединение установлено",
        "12:44 • Подтвержден интерес к роли и формату работы",
        "12:45 • Обсудили стек и ожидания по архитектуре frontend",
        "12:46 • Зафиксирован follow-up в чат",
      ],
      context: "Звонок из чата по вакансии “Старший frontend-инженер”",
    },
  ],
  notifications: [
    {
      id: "notification-1",
      title: "Новый ответ от работодателя",
      description: "Aurum Labs ответили в чате по вакансии старшего frontend-инженера.",
      isRead: false,
    },
    {
      id: "notification-2",
      title: "Обновлен статус отклика",
      description: "Отклик по вакансии продуктового дизайнера переведен в этап интервью.",
      isRead: false,
    },
    {
      id: "notification-3",
      title: "Профиль компании подтвержден",
      description: "Верификация компании Aurum Labs завершена.",
      isRead: true,
    },
  ],
  adminCases: [
    {
      id: "case-1",
      title: "Жалоба на вакансию #8812",
      subtitle: "Проверить корректность зарплатной вилки и описание условий.",
      priority: "Высокий приоритет",
      actionLabel: "Разобрать кейс",
    },
    {
      id: "case-2",
      title: "Новая компания на модерации",
      subtitle: "Northwind HR ожидает подтверждение документов.",
      priority: "Средний приоритет",
      actionLabel: "Проверить документы",
    },
    {
      id: "case-3",
      title: "Проверка профиля работодателя",
      subtitle: "Обновлены данные о роли и корпоративном email.",
      priority: "Низкий приоритет",
      actionLabel: "Просмотреть изменения",
    },
  ],
  savedSearches: [
    {
      id: "search-1",
      title: "Senior frontend • Москва • гибрид",
      description: "12 новых вакансий за последние 48 часов",
    },
    {
      id: "search-2",
      title: "Продуктовый дизайнер • удаленно",
      description: "7 релевантных вакансий в активной выборке",
    },
  ],
};

const AppContext = createContext<AppContextValue | null>(null);

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function readStorage():
  | {
      data: AppSnapshot;
      session: Session;
    }
  | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    return JSON.parse(rawValue) as { data: AppSnapshot; session: Session };
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
  const [data, setData] = useState<AppSnapshot>(initialData);
  const [session, setSession] = useState<Session>({ userId: null });
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const stored = readStorage();
    if (stored) {
      setData(stored.data);
      setSession(stored.session);
    }
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        data,
        session,
      }),
    );
  }, [authReady, data, session]);

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
      async signIn(email) {
        await wait(650);
        const user = data.users.find((item) => item.email.toLowerCase() === email.toLowerCase());
        if (!user) {
          throw new Error("Пользователь с таким email не найден. Используй учетные записи из текущих mock-данных или зарегистрируй нового пользователя.");
        }
        setSession({ userId: user.id });
      },
      async register(payload) {
        await wait(850);

        if (data.users.some((item) => item.email.toLowerCase() === payload.email.toLowerCase())) {
          throw new Error("Пользователь с таким email уже существует.");
        }

        const nextUserId = `user-${Date.now()}`;
        const nextUser: User = {
          id: nextUserId,
          fullName: payload.fullName,
          email: payload.email,
          role: payload.role,
          headline: payload.role === "candidate" ? "Новый кандидат" : "Новый работодатель",
          city: "Москва",
          status: payload.role === "candidate" ? "Профиль заполняется" : "Компания подключается",
        };

        setData((current) => ({
          ...current,
          users: [...current.users, nextUser],
          candidateProfiles:
            payload.role === "candidate"
              ? [
                  ...current.candidateProfiles,
                  {
                    userId: nextUserId,
                    headline: "Специалист",
                    about: "Новый профиль соискателя. Заполните информацию о себе, чтобы начать получать релевантные вакансии.",
                    location: "Москва",
                    preferredFormat: "Удаленно или гибрид",
                    salaryExpectation: "По договоренности",
                    experience: "До 1 года",
                    availability: "Готов обсудить",
                    skills: ["Communication", "Growth mindset"],
                    summary: ["Профиль создан и готов к заполнению."],
                  },
                ]
              : current.candidateProfiles,
          employerProfiles:
            payload.role === "employer"
              ? [
                  ...current.employerProfiles,
                  {
                    userId: nextUserId,
                    companyId: `company-${Date.now()}`,
                    companyName: payload.companyName?.trim() || "Новая компания",
                    position: "Hiring Manager",
                    aboutCompany: "Компания только что подключена к платформе. Заполните профиль, чтобы открыть доступ к публикации вакансий и поиску кандидатов.",
                    office: "Москва",
                    hiringFocus: ["Product", "Engineering"],
                    teamSize: "До 50 сотрудников",
                    responseRate: "0%",
                  },
                ]
              : current.employerProfiles,
        }));

        setSession({ userId: nextUserId });
      },
      async requestPasswordReset(email) {
        await wait(780);
        if (!data.users.some((item) => item.email.toLowerCase() === email.toLowerCase())) {
          throw new Error("Пользователь с таким email не найден.");
        }
      },
      signOut() {
        setSession({ userId: null });
      },
      async updateCandidateProfile(payload) {
        await wait(620);
        if (!sessionUser || sessionUser.role !== "candidate") {
          throw new Error("Редактирование доступно только соискателю.");
        }

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
          candidateProfiles: current.candidateProfiles.map((profile) =>
            profile.userId === sessionUser.id
              ? {
                  ...profile,
                  ...payload,
                }
              : profile,
          ),
        }));
      },
      async updateEmployerProfile(payload) {
        await wait(620);
        if (!sessionUser || sessionUser.role !== "employer") {
          throw new Error("Редактирование доступно только работодателю.");
        }

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
          employerProfiles: current.employerProfiles.map((profile) =>
            profile.userId === sessionUser.id
              ? {
                  ...profile,
                  ...payload,
                }
              : profile,
          ),
        }));
      },
      toggleNotificationRead(notificationId) {
        setData((current) => ({
          ...current,
          notifications: current.notifications.map((notification) =>
            notification.id === notificationId
              ? {
                  ...notification,
                  isRead: !notification.isRead,
                }
              : notification,
          ),
        }));
      },
    }),
    [activeCandidateProfile, activeEmployerProfile, authReady, data, role, sessionUser],
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
