import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../utils/cn";

const notifications = [
  { title: "Review completed", body: "#482 finished with 2 high-risk findings", tone: "success" },
  { title: "Agent finished", body: "Dependency agent completed payments-api scan", tone: "info" },
  { title: "Critical finding", body: "Hardcoded Stripe test secret detected in diff", tone: "danger" },
  { title: "Dependency issue", body: "jsonwebtoken requires security patch review", tone: "warning" },
];

type NotificationPanelProps = {
  open: boolean;
  onClose: () => void;
};

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Notifications">
      <button className="absolute inset-0 bg-background/70 backdrop-blur-sm" onClick={onClose} aria-label="Close notifications" />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md border-l bg-card shadow-security-card">
        <div className="flex h-16 items-center justify-between border-b px-5">
          <div>
            <p className="font-semibold">Notifications</p>
            <p className="text-xs text-muted-foreground">Agent activity and review events</p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close notifications">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3 p-5">
          {notifications.map((item) => {
            const Icon = item.tone === "success" ? CheckCircle2 : item.tone === "danger" ? AlertTriangle : Info;
            return (
              <article key={item.title} className="rounded-lg border bg-background p-4">
                <div className="flex gap-3">
                  <Icon
                    className={cn(
                      "mt-0.5 h-4 w-4",
                      item.tone === "success" && "text-emerald-500",
                      item.tone === "danger" && "text-red-500",
                      item.tone === "warning" && "text-amber-500",
                      item.tone === "info" && "text-cyan-500",
                    )}
                  />
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
