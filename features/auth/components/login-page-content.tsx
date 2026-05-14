"use client";

import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  BoxesIcon,
  ChevronDownIcon,
  GraduationCapIcon,
  HashIcon,
  LayersIcon,
  LockIcon,
  UserIcon,
} from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/core/components/theme-toggle";
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
      <div className="absolute left-6 right-6 top-6 z-20 flex items-center justify-between sm:left-10 sm:right-10">
        <BrandLockup />
        <ThemeToggle />
      </div>
      <div className="grid min-h-screen lg:grid-cols-2">
        <aside className="relative hidden flex-col justify-between overflow-hidden border-r border-border bg-muted/30 px-10 pb-10 pt-24 lg:flex">
          <div className="flex flex-1 items-center justify-center py-10">
            <div className="relative aspect-[4/5] max-h-[68vh] w-full max-w-[440px] overflow-hidden rounded-[2rem] border border-border/70 bg-background shadow-soft">
              <Image
                src="/laboratory-image.jpg"
                alt="Organized laboratory inventory shelves with tools and boxes"
                fill
                priority
                sizes="440px"
                className="object-cover"
              />
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
        <div className="[&_button]:pl-9 [&_input]:pl-9">{children}</div>
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
  const yearLevel = form.watch("yearLevel");

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button id="tk-year" type="button" variant="outline" className="w-full justify-between rounded-xl">
                <span className={yearLevel ? undefined : "text-muted-foreground"}>{yearLevel || "Year"}</span>
                <ChevronDownIcon className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[var(--radix-dropdown-menu-trigger-width)]">
              <DropdownMenuRadioGroup
                value={yearLevel}
                onValueChange={(nextValue) => {
                  form.setValue("yearLevel", nextValue, {
                    shouldDirty: true,
                    shouldTouch: true,
                    shouldValidate: true,
                  });
                }}
              >
                {["1st Year", "2nd Year", "3rd Year", "4th Year"].map((option) => (
                  <DropdownMenuRadioItem key={option} value={option}>
                    {option}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </Field>
        <Field id="tk-section" label="Section" icon={LayersIcon} error={form.formState.errors.section?.message}>
          <Input id="tk-section" placeholder="A" {...form.register("section")} />
        </Field>
      </div>
    </>
  );
}
