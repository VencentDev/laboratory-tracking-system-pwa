import type { ReactNode } from "react";

type SettingsSectionProps = {
  index: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function SettingsSection({ index, title, description, children }: SettingsSectionProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-xl font-semibold tracking-[-0.03em] text-foreground">{title}</h2>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        <span className="shrink-0 pt-1 text-[10px] font-medium uppercase tracking-[0.24em] text-muted-foreground/80">
          {index}
        </span>
      </div>

      {children}
    </section>
  );
}
