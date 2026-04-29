import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import MobileNav from "@/components/admin/MobileNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login-admin");
  }

  return (
    <div className="flex min-h-screen bg-[#F0F0F0] text-black font-sans">
      <AdminSidebar />
      <main className="flex-1 pb-24 lg:pb-10 p-4 md:p-10 lg:p-14 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
