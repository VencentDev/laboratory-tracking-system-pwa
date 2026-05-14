"use client";

import { useState } from "react";
import { LogOutIcon } from "lucide-react";

import { SidebarMenuButton } from "@/components/ui/sidebar";
import { DestructiveConfirmDialog } from "@/core/components/destructive-confirm-dialog";
import { Button } from "@/core/ui/button";
import { useAuth } from "@/features/auth/hooks/use-auth";

type LogoutConfirmButtonProps = {
  mode?: "button" | "sidebar";
};

export function LogoutConfirmButton({ mode = "button" }: LogoutConfirmButtonProps) {
  const { logout } = useAuth();
  const [isConfirmingLogout, setIsConfirmingLogout] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
      setIsConfirmingLogout(false);
    }
  }

  return (
    <>
      {mode === "sidebar" ? (
        <SidebarMenuButton tooltip="Logout" onClick={() => setIsConfirmingLogout(true)}>
          <LogOutIcon />
          <span>Logout</span>
        </SidebarMenuButton>
      ) : (
        <Button type="button" variant="ghost" size="sm" onClick={() => setIsConfirmingLogout(true)}>
          <LogOutIcon />
          Logout
        </Button>
      )}

      <DestructiveConfirmDialog
        open={isConfirmingLogout}
        onOpenChange={setIsConfirmingLogout}
        title="Log out of this session?"
        description="You will return to the login screen and this browser session will be cleared."
        confirmLabel="Log out"
        pendingLabel="Logging out..."
        isPending={isLoggingOut}
        onConfirm={handleLogout}
      />
    </>
  );
}
