"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { OverlappingField } from "@/core/ui/overlapping-field";
import { useAuth } from "@/features/auth/hooks/use-auth";

const toolkeeperLoginSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  studentId: z.string().trim().min(2, "Enter your student ID."),
  yearLevel: z.string().trim().min(1, "Enter your year level."),
  section: z.string().trim().min(1, "Enter your section."),
});

type ToolkeeperLoginInput = z.infer<typeof toolkeeperLoginSchema>;

export function ToolkeeperLoginPageContent() {
  const router = useRouter();
  const { isLoading, loginToolkeeper, session } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const form = useForm<ToolkeeperLoginInput>({
    resolver: zodResolver(toolkeeperLoginSchema),
    defaultValues: {
      name: "",
      studentId: "",
      yearLevel: "",
      section: "",
    },
  });

  useEffect(() => {
    if (isLoading || !session) {
      return;
    }

    router.replace((session.role === "admin" ? "/admin" : "/scan") as Route);
  }, [isLoading, router, session]);

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      await loginToolkeeper(values);
      router.push("/scan" as Route);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,hsl(var(--foreground)/0.05),transparent_30%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--background)))] px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Toolkeeper Login</CardTitle>
          <CardDescription>Start a toolkeeper session before using the scanner workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <OverlappingField htmlFor="toolkeeper-name" label="Name">
                <Input id="toolkeeper-name" autoComplete="name" {...form.register("name")} />
              </OverlappingField>
              {form.formState.errors.name ? (
                <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <OverlappingField htmlFor="toolkeeper-student-id" label="Student ID">
                <Input id="toolkeeper-student-id" autoComplete="username" {...form.register("studentId")} />
              </OverlappingField>
              {form.formState.errors.studentId ? (
                <p className="text-sm text-destructive">{form.formState.errors.studentId.message}</p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <OverlappingField htmlFor="toolkeeper-year-level" label="Year Level">
                  <Input id="toolkeeper-year-level" {...form.register("yearLevel")} />
                </OverlappingField>
                {form.formState.errors.yearLevel ? (
                  <p className="text-sm text-destructive">{form.formState.errors.yearLevel.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <OverlappingField htmlFor="toolkeeper-section" label="Section">
                  <Input id="toolkeeper-section" {...form.register("section")} />
                </OverlappingField>
                {form.formState.errors.section ? (
                  <p className="text-sm text-destructive">{form.formState.errors.section.message}</p>
                ) : null}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
              {isSubmitting ? "Starting session..." : "Start session"}
            </Button>
          </form>

          <div className="mt-5 text-center text-sm text-muted-foreground">
            <Link href={"/admin/login" as Route} className="font-medium text-primary hover:underline">
              Admin login
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
