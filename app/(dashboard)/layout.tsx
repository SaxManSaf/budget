import SideNav from "@/components/dashboard/SideNav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SideNav />
      <main className="flex-1 overflow-y-auto pt-4 pb-6 px-4 lg:p-8 lg:pt-6 mt-14 lg:mt-0 mb-16 lg:mb-0">
        {children}
      </main>
    </div>
  );
}
