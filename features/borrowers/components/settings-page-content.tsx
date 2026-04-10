import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";
import { PageHeader } from "@/core/ui/page-header";

export function SettingsPageContent() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace"
        title="Settings"
        description="Manage account preferences and reserve space for future system configuration."
      />
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Application Settings</CardTitle>
          <CardDescription>This area is reserved for account and system preferences.</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Borrower recording is now managed from the Register Borrower and Borrower Logs pages.
        </CardContent>
      </Card>
    </div>
  );
}
