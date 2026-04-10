import { redirect } from "next/navigation";

export function HomeRedirectPageContent() {
  redirect("/scan");
  return null;
}
