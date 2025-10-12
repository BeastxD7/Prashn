import { ModeToggle } from "@/components/mode-toggle"

export function Navbar() {
  return (
    <nav className="flex justify-between items-center border-b bg-background/95 backdrop-blur  py-3">
      <div className="flex items-center px-10">
        <img src="/logo.png" alt=" Logo" className="h-8" />
        <h2 className="text-3xl font-semibold">Think</h2>
      </div>
      <ModeToggle />
    </nav>
  )
}