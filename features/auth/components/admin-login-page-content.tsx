"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { OverlappingField } from "@/core/ui/overlapping-field";
import { useAuth } from "@/features/auth/hooks/use-auth";

const adminLoginSchema = z.object({
  username: z.string().trim().min(1, "Enter the admin username."),
  password: z.string().min(1, "Enter the admin password."),
});

type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export function AdminLoginPageContent() {
  const router = useRouter();
  const { isLoading, loginAdmin, session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!isLoading && session?.role === "admin") {
      router.replace("/admin" as Route);
    }
  }, [isLoading, router, session]);

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      const isLoggedIn = await loginAdmin(values.username, values.password);

      if (!isLoggedIn) {
        toast.error("Admin login failed. Check the username and password.");
        return;
      }

      router.push("/admin" as Route);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,hsl(var(--foreground)/0.05),transparent_30%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))] px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Sign in to review audit logs and manage admin credentials.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <OverlappingField htmlFor="admin-username" label="Username">
                <Input id="admin-username" autoComplete="username" {...form.register("username")} />
              </OverlappingField>
              {form.formState.errors.username ? (
                <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <OverlappingField htmlFor="admin-password" label="Password">
                <Input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  {...form.register("password")}
                />
              </OverlappingField>
              {form.formState.errors.password ? (
                <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
              ) : null}
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
