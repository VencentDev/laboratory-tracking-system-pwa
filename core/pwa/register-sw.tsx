"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return;
    }

    const clearLabTrackingCaches = async () => {
      if (!("caches" in window)) {
        return;
      }

      const cacheKeys = await caches.keys();

      await Promise.all(
        cacheKeys
          .filter((cacheKey) => cacheKey.startsWith("lab-tracking-"))
          .map((cacheKey) => caches.delete(cacheKey)),
      );
    };

    const unregisterExistingWorkers = async () => {
      const registrations = await navigator.serviceWorker.getRegistrations();

      await Promise.all(registrations.map((registration) => registration.unregister()));
      await clearLabTrackingCaches();
    };

    if (process.env.NODE_ENV !== "production") {
      void unregisterExistingWorkers();
      return;
    }

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch {
        // Ignore failed registrations so the app still works without offline support.
      }
    };

    void register();
  }, []);

  return null;
}
