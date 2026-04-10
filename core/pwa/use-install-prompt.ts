"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
};

function isStandaloneDisplayMode() {
  if (typeof window === "undefined") {
    return false;
  }

  const iosStandalone =
    "standalone" in window.navigator
      ? Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
      : false;

  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: window-controls-overlay)").matches ||
    iosStandalone
  );
}

export function useInstallPrompt() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const syncInstalledState = () => {
      setIsInstalled(isStandaloneDisplayMode());
    };

    const frameId = window.requestAnimationFrame(syncInstalledState);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };

    const handleInstalled = () => {
      setInstallEvent(null);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!installEvent) {
      return false;
    }

    await installEvent.prompt();
    const result = await installEvent.userChoice;

    if (result.outcome === "accepted") {
      setInstallEvent(null);
      setIsInstalled(true);
      return true;
    }

    return false;
  }

  return {
    isInstallable: installEvent !== null,
    isInstalled,
    promptInstall,
  };
}
