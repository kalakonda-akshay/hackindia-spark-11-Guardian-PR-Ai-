import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./layouts/app-layout";

const DashboardPage = lazy(() => import("./pages/dashboard-page"));
const ReportsPage = lazy(() => import("./pages/reports-page"));
const SettingsPage = lazy(() => import("./pages/settings-page"));
const NotFoundPage = lazy(() => import("./pages/not-found-page"));

function RouteFallback() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-label="Loading route" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
