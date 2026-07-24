import { redirect } from "next/navigation";

export default function InspectorRootPage() {
  // Langsung buang akses kosong ke dashboard utama inspector yang rapi
  redirect("/inspector/dashboard");
}