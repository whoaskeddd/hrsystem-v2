import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { getDashboardPath, useAppContext } from "../../app/app-context";
import { Button } from "../ui/button";

type NavigationItem = {
  to: string;
  label: string;
  end?: boolean;
};

const publicNavigation: NavigationItem[] = [
  { to: "/", label: "Главная", end: true },
  { to: "/vacancies", label: "Вакансии" },
  { to: "/resumes", label: "Кандидаты" },
  { to: "/messages", label: "Сообщения" },
  { to: "/calls", label: "Звонки" },
];

export function AppShell() {
  const navigate = useNavigate();
  const { data, role, sessionUser, signOut, theme, toggleTheme } = useAppContext();
  const unreadNotifications = data.notifications.filter((item) => !item.isRead).length;
  const dashboardPath = getDashboardPath(role);
  const dashboardLabel = role === "employer" ? "Кабинет компании" : role === "admin" ? "Админка" : "Мой кабинет";
  const roleNavigation: NavigationItem[] =
    role === "guest"
      ? []
      : role === "admin"
        ? [{ to: "/admin", label: "Админка" }]
        : [{ to: dashboardPath, label: dashboardLabel }];
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
            <div className="hidden text-xs uppercase tracking-[0.24em] text-secondary 2xl:block">
              Премиальная HR-платформа
            </div>
          </div>

          <nav className="hidden items-center gap-2 xl:flex">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  [
                    "rounded-full border px-4 py-2 text-sm transition duration-200",
                    isActive
                      ? "border-gold/60 bg-gold/10 text-gold-soft shadow-glow"
                      : "border-transparent text-secondary hover:border-white/10 hover:bg-white/5 hover:text-primary",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden rounded-full border border-white/8 bg-white/5 px-4 py-2 text-sm text-secondary lg:block">
              {sessionUser ? `${sessionUser.fullName} • ${unreadNotifications} новых уведомления` : "Москва • 12 480 вакансий"}
            </div>
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
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                [
                  "rounded-[18px] px-3 py-3 text-center text-xs font-medium transition",
                  isActive ? "bg-gold/10 text-gold-soft shadow-glow" : "bg-white/5 text-secondary",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
