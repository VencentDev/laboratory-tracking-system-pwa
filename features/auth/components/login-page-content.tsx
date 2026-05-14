"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { BoxesIcon, GraduationCapIcon, HashIcon, LayersIcon, LockIcon, UserIcon } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/core/ui/button";
import { Input } from "@/core/ui/input";
import { Label } from "@/core/ui/label";
import { useAuth } from "@/features/auth/hooks/use-auth";

type Role = "admin" | "toolkeeper";

const adminLoginSchema = z.object({
  username: z.string().trim().min(1, "Enter the admin username."),
  password: z.string().min(1, "Enter the admin password."),
});

const toolkeeperLoginSchema = z.object({
  name: z.string().trim().min(2, "Enter your name."),
  studentId: z.string().trim().min(2, "Enter your student ID."),
  yearLevel: z.string().trim().min(1, "Select your year level."),
  section: z.string().trim().min(1, "Enter your section."),
});

type AdminLoginInput = z.infer<typeof adminLoginSchema>;
type ToolkeeperLoginInput = z.infer<typeof toolkeeperLoginSchema>;

export function LoginPageContent() {
  const router = useRouter();
  const { isLoading, loginAdmin, loginToolkeeper, session } = useAuth();
  const [role, setRole] = useState<Role>("admin");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const adminForm = useForm<AdminLoginInput>({
    resolver: zodResolver(adminLoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  const toolkeeperForm = useForm<ToolkeeperLoginInput>({
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

  const submitAdmin = adminForm.handleSubmit(async (values) => {
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

  const submitToolkeeper = toolkeeperForm.handleSubmit(async (values) => {
    setIsSubmitting(true);

    try {
      await loginToolkeeper(values);
      router.push("/scan" as Route);
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-2">
        <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-muted/30 p-10 lg:flex">
          <BrandLockup />

          <div className="flex flex-1 items-center justify-center py-10">
            <div className="relative flex aspect-[4/5] max-h-[60vh] w-full max-w-[430px] items-center justify-center overflow-hidden rounded-[2rem] border border-border/70 bg-background shadow-soft">
              <div className="absolute inset-x-8 bottom-10 top-16 rounded-3xl border border-border/70 bg-muted/45" />
              <div className="absolute left-12 right-12 top-24 grid gap-4">
                {["bg-primary/15", "bg-emerald-500/15", "bg-amber-500/15", "bg-sky-500/15"].map((color, rowIndex) => (
                  <div key={color} className="grid grid-cols-4 gap-3">
                    {Array.from({ length: 4 }).map((_, columnIndex) => (
                      <div
                        key={`${rowIndex}-${columnIndex}`}
                        className={`aspect-square rounded-xl border border-border/70 ${color}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
              <div className="absolute bottom-8 right-10 flex size-24 items-center justify-center rounded-3xl border border-border bg-background shadow-soft">
                <Image src="/icon-512.png" alt="" width={72} height={72} className="rounded-2xl" priority />
              </div>
            </div>
          </div>

          <div className="max-w-sm">
            <h2 className="text-lg font-medium tracking-tight">Track every tool. Trust every check-out.</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A quiet, reliable system for keeping your laboratory inventory accountable.
            </p>
          </div>
        </aside>

        <section className="flex items-center justify-center px-6 py-12 sm:px-10">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <BrandLockup />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Sign in to continue to your dashboard.</p>

            <div
              role="tablist"
              aria-label="Select role"
              className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-muted/40 p-1"
            >
              {(["admin", "toolkeeper"] as Role[]).map((nextRole) => (
                <button
                  key={nextRole}
                  type="button"
                  role="tab"
                  aria-selected={role === nextRole}
                  onClick={() => setRole(nextRole)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
                    role === nextRole
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {nextRole}
                </button>
              ))}
            </div>

            {role === "admin" ? (
              <form className="mt-6 space-y-4" onSubmit={submitAdmin}>
                <AdminFields form={adminForm} />
                <Button type="submit" className="mt-2 w-full" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            ) : (
              <form className="mt-6 space-y-4" onSubmit={submitToolkeeper}>
                <ToolkeeperFields form={toolkeeperForm} />
                <Button type="submit" className="mt-2 w-full" disabled={isSubmitting || isLoading}>
                  {isSubmitting ? "Starting session..." : "Sign in"}
                </Button>
              </form>
            )}

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By signing in, you agree to follow the lab inventory policy.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

function BrandLockup() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-background">
        <BoxesIcon className="size-4" />
      </div>
      <span className="text-sm font-medium tracking-tight">Laboratory Tracking</span>
    </div>
  );
}

function Field({
  id,
  label,
  icon: Icon,
  children,
  error,
}: {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs font-medium text-muted-foreground">
        {label}
      </Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
        <div className="[&_input]:pl-9 [&_select]:pl-9">{children}</div>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function AdminFields({ form }: { form: ReturnType<typeof useForm<AdminLoginInput>> }) {
  return (
    <>
      <Field
        id="admin-username"
        label="Username"
        icon={UserIcon}
        error={form.formState.errors.username?.message}
      >
        <Input id="admin-username" placeholder="admin" autoComplete="username" {...form.register("username")} />
      </Field>
      <Field
        id="admin-password"
        label="Password"
        icon={LockIcon}
        error={form.formState.errors.password?.message}
      >
        <Input
          id="admin-password"
          type="password"
          placeholder="Password"
          autoComplete="current-password"
          {...form.register("password")}
        />
      </Field>
    </>
  );
}

function ToolkeeperFields({ form }: { form: ReturnType<typeof useForm<ToolkeeperLoginInput>> }) {
  return (
    <>
      <Field id="tk-name" label="Name" icon={UserIcon} error={form.formState.errors.name?.message}>
        <Input id="tk-name" placeholder="Juan Dela Cruz" autoComplete="name" {...form.register("name")} />
      </Field>
      <Field id="tk-id" label="Student ID" icon={HashIcon} error={form.formState.errors.studentId?.message}>
        <Input id="tk-id" placeholder="2024-00123" inputMode="numeric" {...form.register("studentId")} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field
          id="tk-year"
          label="Year level"
          icon={GraduationCapIcon}
          error={form.formState.errors.yearLevel?.message}
        >
          <select
            id="tk-year"
            className="h-9 w-full min-w-0 rounded-xl border border-border/80 bg-background/80 py-1 pr-3 text-base transition-[color,box-shadow,background-color,border-color] duration-200 outline-none focus-visible:border-ring focus-visible:ring-4 focus-visible:ring-ring/15 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/30 disabled:opacity-50 md:text-sm"
            {...form.register("yearLevel")}
          >
            <option value="">Year</option>
            <option value="1st Year">1st Year</option>
            <option value="2nd Year">2nd Year</option>
            <option value="3rd Year">3rd Year</option>
            <option value="4th Year">4th Year</option>
          </select>
        </Field>
        <Field id="tk-section" label="Section" icon={LayersIcon} error={form.formState.errors.section?.message}>
          <Input id="tk-section" placeholder="A" {...form.register("section")} />
        </Field>
      </div>
    </>
  );
}
