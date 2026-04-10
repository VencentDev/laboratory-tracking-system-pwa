import { Card, CardContent, CardHeader, CardTitle } from "@/core/ui/card";

export function AboutPageContent() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">About this starter</h1>
        <p className="max-w-3xl text-lg text-muted-foreground">
          It treats routing, shared infrastructure, and feature modules as separate concerns so the
          codebase stays understandable as the product grows.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["app/", "Thin route groups and layouts only."],
          ["core/", "Providers, UI primitives, shared infra, and shell components."],
          ["features/", "Every domain owns its API, UI, validation, hooks, and types."],
        ].map(([title, description]) => (
          <Card key={title}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{description}</CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
