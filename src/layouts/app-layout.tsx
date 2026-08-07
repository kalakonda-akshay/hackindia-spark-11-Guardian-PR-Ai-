import { useState } from "react";
import { Outlet } from "react-router-dom";
import { MobileNav } from "../components/layout/mobile-nav";
import { NotificationPanel } from "../components/layout/notification-panel";
import { Sidebar } from "../components/layout/sidebar";
import { Topbar } from "../components/layout/topbar";

export function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed((value) => !value)} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar onMenuClick={() => setMobileNavOpen(true)} onNotificationsClick={() => setNotificationsOpen(true)} />
          <main className="flex-1 px-4 py-5 md:px-6 lg:px-8">
            <Outlet />
          </main>
        </div>
      </div>
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
}
