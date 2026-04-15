import type { ReactNode } from "react";

import { Footer } from "@/core/components/footer";
import { Navbar } from "@/core/components/navbar";

type HomeLayoutProps = {
  children: ReactNode;
};

export default function HomeLayout({ children }: HomeLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}