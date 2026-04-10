import { redirect } from "next/navigation";

export function HomeRedirectPageContent() {
  redirect("/item-logs");
  return null;
}
