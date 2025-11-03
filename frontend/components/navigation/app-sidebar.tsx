import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { navItems } from "@/constants/Navbar"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"

export function AppSidebar() {
  return (
    <Sidebar  collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Prashn</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter className="mt-auto">
          <div className="w-full flex items-center justify-center px-2 py-3 group-data-[collapsible=icon]:justify-center">
            <ModeToggle />
          </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  )
}