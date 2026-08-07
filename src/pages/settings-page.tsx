import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Settings</p>
        <h1 className="text-3xl font-semibold tracking-normal">Workspace controls</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Backend connection</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Configure repository providers, API base URL, and alert routing when the backend is connected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
