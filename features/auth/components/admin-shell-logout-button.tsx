"use client";

import { LogOutIcon } from "lucide-react";

import { Button } from "@/core/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";

export function AdminShellLogoutButton() {
  const { logout } = useAuth();

  return (
    <Button type="button" variant="ghost" size="sm" onClick={() => void logout()}>
      <LogOutIcon />
      Logout
    </Button>
  );
}
