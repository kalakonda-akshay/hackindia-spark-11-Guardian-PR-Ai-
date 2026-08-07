import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { getDashboard } from "../services/dashboard";
import { io, Socket } from "socket.io-client";

const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

export function useDashboard() {
  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Create socket lazily inside the effect to avoid module-level crashes
    let socket: Socket;
    try {
      socket = io(API_URL, {
        reconnectionAttempts: 5,
        timeout: 5000,
        transports: ["websocket", "polling"],
      });
      socketRef.current = socket;
    } catch (e) {
      console.warn("[Dashboard] Could not connect to socket:", e);
      return;
    }

    const handleUpdate = () => {
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    };

    socket.on("status_update", handleUpdate);
    socket.on("timeline_update", handleUpdate);
    socket.on("connect_error", (err) => {
      console.warn("[Socket] Connection error:", err.message);
    });

    return () => {
      socket.off("status_update", handleUpdate);
      socket.off("timeline_update", handleUpdate);
      socket.disconnect();
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboard,
    retry: 2,
    retryDelay: 1000,
  });
}
