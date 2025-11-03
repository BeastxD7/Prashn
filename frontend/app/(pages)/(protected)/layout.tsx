import { AppSidebar } from "@/components/navigation/app-sidebar"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar  />
        <SidebarTrigger />
      <main className="w-full">
        {children}
      </main>
    </SidebarProvider>
  )
}