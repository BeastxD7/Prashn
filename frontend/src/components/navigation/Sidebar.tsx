import { NavLink } from 'react-router-dom'
import { Home, LayoutGrid, FileText, CreditCard, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const v = localStorage.getItem('prashn.sidebar.collapsed')
      return v === '1'
    } catch {
      return false
    }
  })

  const [mobileOpen, setMobileOpen] = useState<boolean>(false)

  useEffect(() => {
    try {
      localStorage.setItem('prashn.sidebar.collapsed', collapsed ? '1' : '0')
    } catch {}
  }, [collapsed])

  const items = [
    { to: '/', label: 'Home', icon: <Home className="h-4 w-4" /> },
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutGrid className="h-4 w-4" /> },
    { to: '/generateQuizByText', label: 'Generator', icon: <FileText className="h-4 w-4" /> },
    { to: '/generateQuizByPdf', label: 'PDF', icon: <FileText className="h-4 w-4" /> },
    { to: '/credits', label: 'Credits', icon: <CreditCard className="h-4 w-4" /> },
  ]

  return (
    <>
      {/* Mobile: floating hamburger to open overlay */}
      <button
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMobileOpen((s) => !s)}
        className="fixed top-3 left-3 z-50 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/60 text-muted-foreground shadow md:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Desktop sidebar */}
      <aside
        className={`hidden md:flex fixed left-0 top-0 z-20 h-screen md:flex-col gap-6 border-r border-border/60 bg-background/70 p-2 backdrop-blur transition-all ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="px-2 w-full">
          <div className="flex items-center justify-between gap-2 py-2">
            <div className="flex items-center gap-2">
              <div className={`${collapsed ? 'h-10 w-10' : 'h-12 w-12'} rounded-md bg-gradient-to-br from-blue-500 to-cyan-400`} />
              {!collapsed && <div className="text-sm font-semibold">Prashn</div>}
            </div>

            {/* Toggle button at the top-right */}
            <button
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              onClick={() => setCollapsed((s) => !s)}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/40 text-muted-foreground shadow hover:bg-background/50"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <nav className="mt-2 flex flex-1 flex-col gap-1 px-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => {
              const base = `flex items-center ${collapsed ? 'justify-center' : 'gap-3'} rounded-md py-2 text-sm transition-colors hover:bg-accent/40 w-full`
              const padding = collapsed ? 'px-0' : 'px-3'
              const active = isActive ? 'bg-accent/60 font-medium' : 'text-muted-foreground'
              return `${base} ${padding} ${active}`
            }}
          >
            <span className="text-muted-foreground flex-shrink-0">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

        <div className="px-3 pb-4">
          {!collapsed && (
            <div className="mt-3">
              <small className="text-xs text-muted-foreground">v0.1</small>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay sidebar */}
      {mobileOpen && (
        <aside className="md:hidden fixed inset-0 z-50 w-full bg-background/95 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-md bg-gradient-to-br from-blue-500 to-cyan-400" />
              <div className="text-sm font-semibold">Prashn</div>
            </div>
            <button
              aria-label="Close menu"
              onClick={() => setMobileOpen(false)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/40 text-muted-foreground shadow"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="mt-6 flex flex-col gap-2">
            {items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-md px-3 py-3 text-sm transition-colors hover:bg-accent/40 ${
                    isActive ? 'bg-accent/60 font-medium' : 'text-muted-foreground'
                  }`
                }
              >
                <span className="text-muted-foreground">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>
      )}
    </>
  )
}
