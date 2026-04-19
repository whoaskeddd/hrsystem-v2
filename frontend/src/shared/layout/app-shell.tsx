import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { getDashboardPath, useAppContext } from "../../app/app-context";
import { Button } from "../ui/button";

type NavigationItem = {
  to: string;
  label: string;
  end?: boolean;
  badge?: number;
};

const MessageIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
    <path d="M7 10h10" strokeLinecap="round" />
    <path d="M7 14h6" strokeLinecap="round" />
    <path d="M5 5h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H9l-4 3v-3H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

function NavigationLink({ item, compact = false }: { item: NavigationItem; compact?: boolean }) {
  return (
    <NavLink
      to={item.to}
      end={item.end}
      className={({ isActive }) =>
        [
          compact
            ? "rounded-[18px] px-3 py-3 text-center text-xs font-medium transition"
            : "rounded-full border px-4 py-2 text-sm transition duration-200",
          isActive
            ? compact
              ? "bg-gold/10 text-gold-soft shadow-glow"
              : "border-gold/60 bg-gold/10 text-gold-soft shadow-glow"
            : compact
              ? "bg-white/5 text-secondary"
              : "border-transparent text-secondary hover:border-white/10 hover:bg-white/5 hover:text-primary",
        ].join(" ")
      }
    >
      <span className="inline-flex items-center gap-2">
        <span>{item.label}</span>
        {item.badge && item.badge > 0 ? (
          <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-black">
            {item.badge > 99 ? "99+" : item.badge}
          </span>
        ) : null}
      </span>
    </NavLink>
  );
}

export function AppShell() {
  const navigate = useNavigate();
  const { data, role, sessionUser, signOut, theme, toggleTheme } = useAppContext();
  const unreadNotifications = data.notifications.filter((item) => !item.isRead).length;
  const unreadMessages = data.chats.reduce((total, chat) => total + chat.unreadCount, 0);
  const dashboardPath = getDashboardPath(role);
  const dashboardLabel = role === "employer" ? "Кабинет компании" : role === "admin" ? "Админка" : "Мой кабинет";

  const publicNavigation: NavigationItem[] = [
    { to: "/", label: "Главная", end: true },
    { to: "/vacancies", label: "Вакансии" },
    { to: "/resumes", label: "Кандидаты" },
    { to: "/messages", label: "Сообщения", badge: unreadMessages },
  ];
  const roleNavigation: NavigationItem[] =
    role === "guest" ? [] : role === "admin" ? [{ to: "/admin", label: "Админка" }] : [{ to: dashboardPath, label: dashboardLabel }];
  const navigation: NavigationItem[] = [...publicNavigation, ...roleNavigation];

  return (
    <div className="min-h-screen bg-base text-primary">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-[520px] bg-[radial-gradient(circle_at_top,_rgba(218,186,121,0.18),_transparent_42%)]" />
        <div className="absolute left-[-8%] top-[18%] h-72 w-72 rounded-full bg-gold/6 blur-3xl" />
        <div className="absolute right-[-6%] top-[32%] h-80 w-80 rounded-full bg-white/4 blur-3xl" />
      </div>

      <header className="sticky top-0 z-20 border-b border-white/5 bg-base/80 backdrop-blur-xl">
        <div className="flex w-full items-center justify-between gap-6 px-4 py-4 sm:px-6 xl:px-10 2xl:px-14">
          <div className="flex items-center gap-8">
            <NavLink to="/" className="font-display text-lg font-semibold tracking-[0.18em] text-gold-soft">
              HR PLATFORM
            </NavLink>
            <div className="hidden text-xs uppercase tracking-[0.24em] text-secondary 2xl:block">Премиальная HR-платформа</div>
          </div>

          <nav className="hidden items-center gap-2 xl:flex">
            {navigation.map((item) => (
              <NavigationLink key={item.to} item={item} />
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-white/8 bg-white/5 px-4 py-2 text-sm text-secondary lg:block">
              {sessionUser ? `${sessionUser.fullName} • ${unreadNotifications} новых уведомлений` : "Москва • 12 480 вакансий"}
            </div>

            {sessionUser ? (
              <button
                type="button"
                onClick={() => navigate("/messages")}
                className={[
                  "relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/8 bg-white/5 text-secondary transition hover:border-gold/30 hover:text-primary",
                  unreadMessages > 0 ? "message-arrival-blink" : "",
                ].join(" ")}
                aria-label="Открыть сообщения"
              >
                <MessageIcon />
                {unreadMessages > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-gold px-1.5 py-0.5 text-[10px] font-semibold text-black">
                    {unreadMessages > 99 ? "99+" : unreadMessages}
                  </span>
                ) : null}
              </button>
            ) : null}

            <Button variant="secondary" onClick={toggleTheme}>
              {theme === "dark" ? "Светлая тема" : "Тёмная тема"}
            </Button>

            {sessionUser ? (
              <div className="hidden items-center gap-2 sm:flex">
                <Button variant="secondary" onClick={() => navigate(dashboardPath)}>
                  {dashboardLabel}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    signOut();
                    navigate("/");
                  }}
                >
                  Выйти
                </Button>
              </div>
            ) : (
              <Button className="hidden sm:inline-flex" onClick={() => navigate("/auth/login")}>
                Вход / Регистрация
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="min-h-[calc(100vh-81px)] w-full px-4 py-8 sm:px-6 xl:px-10 2xl:px-14">
        <Outlet />
      </main>

      <nav className="sticky bottom-0 z-20 border-t border-white/8 bg-base/90 px-3 py-3 backdrop-blur xl:hidden">
        <div className="grid w-full grid-cols-4 gap-2">
          {navigation.slice(0, 4).map((item) => (
            <NavigationLink key={item.to} item={item} compact />
          ))}
        </div>
      </nav>
    </div>
  );
}
