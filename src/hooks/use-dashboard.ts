import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getDashboard } from "../services/dashboard";
import { io } from "socket.io-client";

const socket = io("http://localhost:3001");

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
