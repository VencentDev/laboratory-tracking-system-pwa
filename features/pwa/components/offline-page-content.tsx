export function OfflinePageContent() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="inline-flex rounded-full border border-border/70 bg-card/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
        Offline
      </div>
      <h1 className="text-3xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
        The app shell is unavailable right now.
      </h1>
      <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
        Open the installed app again once you have loaded it online at least once. Your records stay in local storage,
        but the browser still needs the app shell cached on this device.
      </p>
    </div>
  );
}

