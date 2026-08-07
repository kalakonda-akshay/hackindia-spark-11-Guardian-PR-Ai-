import { reports } from "../features/reports/data";
import type { SecurityReport } from "../types/security";
import { postOrMock, requestOrMock } from "./api-client";

export function getReports() {
  return requestOrMock<SecurityReport[]>("/reports", () => reports);
}

export function exportReport(reportId: string, format: "PDF" | "CSV" | "JSON") {
  return postOrMock(
    `/reports/${reportId}/export`,
    { format },
    () => ({
      reportId,
      format,
      status: "ready" as const,
      downloadUrl: `/mock-downloads/${reportId}.${format.toLowerCase()}`,
    }),
  );
}
