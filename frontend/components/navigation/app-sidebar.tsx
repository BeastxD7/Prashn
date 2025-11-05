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
  SidebarHeader,
} from "@/components/ui/sidebar"
import { navItems } from "@/constants/Navbar"
import { ModeToggle } from "@/components/mode-toggle"
import { useAuth } from "@/context/auth-provider"
import { Button } from "@/components/ui/button"
import { LogOut, Sparkles } from "lucide-react"
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip"
import Link from "next/link"

export function AppSidebar() {
  const { logout, user } = useAuth()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-4 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
            <Link href={"/"} className="text-center bg-linear-to-b from-blue-500 to-blue-950 bg-clip-text text-transparent dark:to-blue-400 font-sans relative z-20 font-bold tracking-tight lg:text-3xl md:text-2xl text-2xl"> प्रश्न</Link>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="font-bold text-lg truncate text-center  bg-linear-to-b from-neutral-900 to-neutral-700 dark:from-neutral-600 dark:to-white bg-clip-text text-transparent  l font-sans relative z-20  tracking-tight">Prashn</span>
            <span className="text-xs text-muted-foreground truncate">AI Quiz Generator</span>
          </div>
        </div>
      </SidebarHeader>
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