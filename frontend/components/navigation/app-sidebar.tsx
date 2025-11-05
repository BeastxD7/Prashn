"use client"

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
import { useAuth } from "@/context/auth-provider"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"

export function AppSidebar() {
  const { logout, user } = useAuth()

  return (
    <Sidebar  collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Prashn</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                // only show dashboard link to authenticated users
                if (item.url === "/dashboard" && !user) return null
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarFooter className="mt-auto">
          <div className="w-full flex items-center justify-between px-2 py-3
            group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:gap-2">

            {/* Mode toggle with tooltip */}
            <div className="flex items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <ModeToggle />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right">Toggle theme</TooltipContent>
              </Tooltip>
            </div>

            {/* Logout button - visible in both expanded and collapsed states */}
            <div className="flex items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  {user ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          await logout()
                        } catch (e) {
                          console.error("Logout failed", e)
                        }
                      }}
                      aria-label="Log out"
                      className="p-2"
                    >
                      <LogOut className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className="p-2">
                        Login
                      </Button>
                    </Link>
                  )}
                </TooltipTrigger>
                <TooltipContent side="left">{user ? 'Log out' : 'Log in'}</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </SidebarFooter>
      </SidebarContent>
    </Sidebar>
  )
}