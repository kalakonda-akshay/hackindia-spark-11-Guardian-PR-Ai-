import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getDashboard } from "../services/dashboard";
import { io } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const socket = io(API_URL);

export function useDashboard() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    };

    socket.on("status_update", handleUpdate);
    socket.on("timeline_update", handleUpdate);

    return () => {
      socket.off("status_update", handleUpdate);
      socket.off("timeline_update", handleUpdate);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
  });
}
