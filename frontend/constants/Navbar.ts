import { Home, FileText, File, Mic, Youtube } from "lucide-react"

export const navItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
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