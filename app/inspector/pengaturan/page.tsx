import { getSessionUser } from "@/server/admin/auth-actions";
import ProfileSettings from "./Profile"; 
import { redirect } from "next/navigation";

export default async function UniversalSettingsPage() {
  const user = await getSessionUser();

  // Jika karena suatu alasan user tidak ditemukan, redirect ke login
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 font-sans antialiased pb-24">
      <ProfileSettings
        user={user}
      />
    </div>
  );
}