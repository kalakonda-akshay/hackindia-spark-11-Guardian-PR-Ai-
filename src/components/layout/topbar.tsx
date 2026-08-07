import { Bell, GitBranch, Menu, Search } from "lucide-react";
import { ThemeToggle } from "../theme-toggle";
import { Button } from "../ui/button";
import { useRepositories } from "../../hooks/use-repositories";

type TopbarProps = {
  onMenuClick: () => void;
  onNotificationsClick: () => void;
};

export function Topbar({ onMenuClick, onNotificationsClick }: TopbarProps) {
  const repositoriesQuery = useRepositories();
  const repositories = repositoriesQuery.data ?? [];
  const firstRepository = repositories[0];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/82 px-4 backdrop-blur-xl md:px-6">
      <Button className="lg:hidden" variant="ghost" size="icon" onClick={onMenuClick} aria-label="Open navigation">
        <Menu className="h-5 w-5" />
      </Button>
      <div className="relative hidden min-w-0 flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          aria-label="Search pull requests, repositories, findings"
          placeholder="Search PRs, repositories, findings"
          className="focus-ring h-10 w-full rounded-md border bg-card pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground"
        />
      </div>
      <div className="hidden items-center gap-2 xl:flex">
        <select aria-label="Repository" className="focus-ring h-10 rounded-md border bg-card px-3 text-sm">
          {repositories.length ? (
            repositories.map((repository) => (
              <option key={repository.name}>{repository.name}</option>
            ))
          ) : (
            <option>Loading repositories</option>
          )}
        </select>
        <select aria-label="Branch" className="focus-ring h-10 rounded-md border bg-card px-3 text-sm">
          {(firstRepository?.branches ?? ["main"]).map((branch) => (
            <option key={branch}>{branch}</option>
          ))}
        </select>
        <select aria-label="Pull request" className="focus-ring h-10 rounded-md border bg-card px-3 text-sm">
          {(firstRepository?.pullRequests ?? ["No active PRs"]).map((pullRequest) => (
            <option key={pullRequest}>{pullRequest}</option>
          ))}
        </select>
      </div>
      <Button variant="outline" size="sm" className="hidden gap-2 md:inline-flex">
        <GitBranch className="h-4 w-4" />
        main
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={onNotificationsClick}
        aria-label="Open notifications"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
      </Button>
      <ThemeToggle />
      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
        HI
      </div>
    </header>
  );
}
