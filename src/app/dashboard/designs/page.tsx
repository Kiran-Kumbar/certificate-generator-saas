import { redirect } from "next/navigation";

export default function SavedDesignsRedirect() {
  redirect("/dashboard/templates");
}
