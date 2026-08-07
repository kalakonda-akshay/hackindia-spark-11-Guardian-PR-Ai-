import { X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { Button } from "../ui/button";
import { navigationItems } from "../../constants/navigation";
import { cn } from "../../utils/cn";

type MobileNavProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileNav({ open, onClose }: MobileNavProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Mobile navigation">
      <button className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} aria-label="Close menu" />
      <div className="relative flex h-full w-80 max-w-[88vw] flex-col border-r bg-card p-4 shadow-security-card">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="font-semibold">PR Sentinel</p>
            <p className="text-xs text-muted-foreground">Security review agent</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close navigation">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <nav className="space-y-1">
          {navigationItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/"}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  "focus-ring flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium",
                  isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
