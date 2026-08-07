import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-4xl font-semibold tracking-normal">Route not found</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The requested surface is not registered in the security review console.
      </p>
      <Button asChild className="mt-6">
        <Link to="/">Return to dashboard</Link>
      </Button>
    </div>
  );
}
