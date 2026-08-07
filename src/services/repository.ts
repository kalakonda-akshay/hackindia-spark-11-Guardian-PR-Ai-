import { pullRequests } from "../features/dashboard/data";
import { requestOrMock } from "./api-client";

export type RepositoryOption = {
  name: string;
  defaultBranch: string;
  branches: string[];
  pullRequests: string[];
};

export function getRepositories() {
  return requestOrMock<RepositoryOption[]>("/repositories", () => {
    const repositories = Array.from(new Set(pullRequests.map((pr) => pr.repository)));
    return repositories.map((repository) => ({
      name: repository,
      defaultBranch: repository === "fintech-core" ? "main" : "release/2026.08",
      branches: ["main", "release/2026.08", "feature/security-hardening"],
      pullRequests: pullRequests.filter((pr) => pr.repository === repository).map((pr) => `${pr.id} ${pr.title}`),
    }));
  });
}
