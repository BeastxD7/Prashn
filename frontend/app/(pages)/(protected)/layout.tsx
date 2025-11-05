import { AppSidebar } from "@/components/navigation/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar  />
      <div className="relative flex-1 flex flex-col w-full">
        <div className="absolute top-4 left-4 z-50">
          <SidebarTrigger />
        </div>
        <main className="w-full">
          {children}
        </main>
      </div>
    </SidebarProvider>
  )
}