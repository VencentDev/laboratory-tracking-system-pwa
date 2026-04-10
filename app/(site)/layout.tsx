import type { ReactNode } from "react";

import { Footer } from "@/core/components/footer";
import { Navbar } from "@/core/components/navbar";

type SiteLayoutProps = {
  children: ReactNode;
};

export default function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col px-6 py-16">{children}</main>
      <Footer />
    </div>
  );
}
