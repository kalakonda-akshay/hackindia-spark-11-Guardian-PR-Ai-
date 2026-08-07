import { useMutation, useQuery } from "@tanstack/react-query";
import { exportReport, getReports } from "../services/report";

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: getReports,
  });
}

export function useExportReport() {
  return useMutation({
    mutationFn: ({ reportId, format }: { reportId: string; format: "PDF" | "CSV" | "JSON" }) =>
      exportReport(reportId, format),
  });
}
