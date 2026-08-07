import { useQuery } from "@tanstack/react-query";
import { getRepositories } from "../services/repository";

export function useRepositories() {
  return useQuery({
    queryKey: ["repositories"],
    queryFn: getRepositories,
  });
}
