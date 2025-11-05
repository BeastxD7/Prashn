import { Home, FileText, File, Mic, Youtube } from "lucide-react"

type NavItem = {
    title: string
    url: string
    icon: typeof Home
    requiresAuth?: boolean
}

export const navItems: NavItem[] = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
        requiresAuth: true,
    },
    {
        title: "Generate by Text",
        url: "/generate-by-text",
        icon: FileText,
    },
    {
        title: "Generate by PDF",
        url: "/generate-by-pdf",
        icon: File,
    },
    {
        title: "Generate by Audio",
        url: "/generate-by-audio",
        icon: Mic,
    },
    {
        title: "Generate by YouTube",
        url: "/generate-by-youtube",
        icon: Youtube,
    },
]