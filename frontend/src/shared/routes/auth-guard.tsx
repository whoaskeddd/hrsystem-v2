import { Navigate, Outlet, useLocation } from "react-router-dom";

import { getDashboardPath, useAppContext, type UserRole } from "../../app/app-context";

type AuthGuardProps = {
  allowedRoles?: UserRole[];
};

export function AuthGuard({ allowedRoles }: AuthGuardProps) {
  const { authReady, role } = useAppContext();
  const location = useLocation();

  if (!authReady) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-sm text-secondary">
        Проверяем сессию...
      </div>
    );
  }

  if (role === "guest") {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to={getDashboardPath(role)} replace />;
  }

  return <Outlet />;
}
