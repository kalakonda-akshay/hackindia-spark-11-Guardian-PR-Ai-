import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { Card, CardContent } from "./card";

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-label="Loading page">
      <div className="space-y-3">
        <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        <div className="h-9 w-96 max-w-full animate-pulse rounded bg-muted" />
        <div className="h-5 w-[36rem] max-w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-lg border bg-card" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="h-80 animate-pulse rounded-lg border bg-card" />
        <div className="h-80 animate-pulse rounded-lg border bg-card" />
      </div>
    </div>
  );
}

export function ErrorState({ title, message, onRetry }: { title: string; message: string; onRetry: () => void }) {
  return (
    <Card>
      <CardContent className="grid min-h-80 place-items-center p-6 text-center">
        <div>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-lg bg-destructive/12 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">{title}</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">{message}</p>
          <Button className="mt-5" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
