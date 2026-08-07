import { ChevronLeft, Github, ShieldCheck } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { navigationItems } from "../../constants/navigation";
import { cn } from "../../utils/cn";

type SidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={cn(
        "hidden border-r bg-card/86 backdrop-blur-xl transition-all duration-300 lg:flex lg:min-h-screen lg:flex-col",
        collapsed ? "lg:w-20" : "lg:w-72",
      )}
      aria-label="Primary navigation"
    >
      <div className="flex h-16 items-center gap-3 border-b px-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">PR Sentinel</p>
            <p className="truncate text-xs text-muted-foreground">Security review agent</p>
          </div>
        )}
        <Button
          className="ml-auto"
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft className={cn("h-4 w-4 transition", collapsed && "rotate-180")} />
        </Button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navigationItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === "/"}
            className={({ isActive }) =>
              cn(
                "focus-ring flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-0",
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t p-3">
        <div className={cn("mb-3 flex items-center", collapsed ? "justify-center" : "justify-between")}>
          {!collapsed && <span className="text-xs font-medium text-muted-foreground">Theme</span>}
          <ThemeToggle />
        </div>
        <div className={cn("flex items-center gap-3 rounded-lg bg-muted/70 p-3", collapsed && "justify-center p-2")}>
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-background text-foreground">
            <Github className="h-4 w-4" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Hack India Team</p>
              <p className="truncate text-xs text-muted-foreground">admin@prsentry.ai</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
