import { toast } from "sonner";
import { ErrorState, PageSkeleton } from "../components/ui/status-states";
import { ReportsConsole } from "../features/reports/components";
import { useExportReport, useReports } from "../hooks/use-reports";

import { API_BASE_URL } from "../services/api-client";

export default function ReportsPage() {
  const reportsQuery = useReports();
  const exportMutation = useExportReport();

  if (reportsQuery.isLoading) {
    return <PageSkeleton />;
  }

  if (reportsQuery.isError || !reportsQuery.data) {
    return (
      <ErrorState
        title="Reports could not load"
        message="The reporting service did not return review evidence."
        onRetry={() => void reportsQuery.refetch()}
      />
    );
  }

  function handleExport(reportId: string, format: "PDF" | "CSV" | "JSON") {
    exportMutation.mutate(
      { reportId, format },
      {
        onSuccess: (result) => {
          toast.success(`${result.format} export prepared`, {
            description: `${result.reportId} download is starting...`,
          });
          window.location.href = `${API_BASE_URL}${result.downloadUrl}`;
        },
        onError: () => {
          toast.error("Export failed", {
            description: "The reporting service could not prepare this export.",
          });
        },
      },
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Reports</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">Enterprise security reports</h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Searchable review evidence, expandable findings, attack simulations, recommendations, and export workflows.
          </p>
        </div>
        <div className="rounded-lg border bg-card px-4 py-3 text-sm text-muted-foreground shadow-security-card">
          Evidence retention: <span className="font-semibold text-foreground">365 days</span>
        </div>
      </div>
      <ReportsConsole reports={reportsQuery.data} onExport={handleExport} exportPending={exportMutation.isPending} />
    </div>
  );
}
