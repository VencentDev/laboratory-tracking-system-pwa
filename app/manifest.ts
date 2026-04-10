import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Laboratory Tracking System",
    short_name: "Lab Tracking",
    description: "Local-first inventory, borrower, and borrow-return tracking for laboratory operations.",
    start_url: "/item-logs",
    display: "standalone",
    background_color: "#f5f3ee",
    theme_color: "#1f4c43",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
