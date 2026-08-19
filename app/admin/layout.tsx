import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import ContentWrapper from "@/components/layout/ContentWrapper";
import { getSessionUser } from "@/server/admin/auth-actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const currentUser = await getSessionUser();

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0 bg-slate-50 dark:bg-slate-950">
        <Header 
          userAvatar={currentUser?.fotoProfil} 
          userName={currentUser?.nama || currentUser?.username} 
        />
        <ContentWrapper>
          {children}
        </ContentWrapper>
        <Footer />
      </div>
    </div>
  );
}