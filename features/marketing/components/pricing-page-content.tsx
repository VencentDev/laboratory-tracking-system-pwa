import Link from "next/link";

import { Button } from "@/core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";

const plans = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for validating the architecture and building the first module.",
  },
  {
    name: "Team",
    price: "$29",
    description: "Best for internal tools and SaaS dashboards with multiple domains.",
  },
  {
    name: "Scale",
    price: "Custom",
    description: "When you need adapters, jobs, billing, and more feature slices.",
  },
];

export function PricingPageContent() {
  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">Pricing</h1>
        <p className="max-w-2xl text-lg text-muted-foreground">
          Placeholder public content lives here so you can keep marketing pages separated from the
          app shell.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.price}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{plan.description}</p>
              <Button asChild className="w-full">
                <Link href="/item-logs">Choose {plan.name}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
