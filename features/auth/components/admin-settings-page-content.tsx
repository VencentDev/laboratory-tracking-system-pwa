"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/core/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/ui/card";
import { Input } from "@/core/ui/input";
import { OverlappingField } from "@/core/ui/overlapping-field";
import { updateAdminCredentials } from "@/features/auth/lib/auth-repository";

const adminSettingsSchema = z
  .object({
    username: z.string().trim().min(1, "Enter a new username."),
    password: z.string().min(8, "Use at least 8 characters."),
    confirmPassword: z.string().min(8, "Confirm the new password."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

type AdminSettingsInput = z.infer<typeof adminSettingsSchema>;

export function AdminSettingsPageContent() {
  const [isSaving, setIsSaving] = useState(false);
  const form = useForm<AdminSettingsInput>({
    resolver: zodResolver(adminSettingsSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setIsSaving(true);

    try {
      await updateAdminCredentials(values.username, values.password);
      form.reset();
      toast.success("Admin credentials updated.");
    } catch {
      toast.error("Admin credentials could not be updated.");
    } finally {
      setIsSaving(false);
    }
  });

  return (
    <Card className="mx-auto w-full max-w-xl">
      <CardHeader>
        <CardTitle>Admin Credentials</CardTitle>
        <CardDescription>Update the local admin username and password stored in IndexedDB.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <OverlappingField htmlFor="admin-settings-username" label="New Username">
              <Input id="admin-settings-username" autoComplete="username" {...form.register("username")} />
            </OverlappingField>
            {form.formState.errors.username ? (
              <p className="text-sm text-destructive">{form.formState.errors.username.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <OverlappingField htmlFor="admin-settings-password" label="New Password">
              <Input
                id="admin-settings-password"
                type="password"
                autoComplete="new-password"
                {...form.register("password")}
              />
            </OverlappingField>
            {form.formState.errors.password ? (
              <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <OverlappingField htmlFor="admin-settings-confirm-password" label="Confirm Password">
              <Input
                id="admin-settings-confirm-password"
                type="password"
                autoComplete="new-password"
                {...form.register("confirmPassword")}
              />
            </OverlappingField>
            {form.formState.errors.confirmPassword ? (
              <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
            ) : null}
          </div>

          <Button type="submit" className="w-full" disabled={isSaving}>
            {isSaving ? "Saving..." : "Update credentials"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
