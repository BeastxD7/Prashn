import { navItems } from "@/constants/Navbar";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState } from "react";
import { ModeToggle } from "../mode-toggle";
import { useNavigate } from "react-router-dom";
import { useAuth } from '@/context/AuthContext'
import { toast } from 'sonner'
export function NavbarDemo() {


    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout } = useAuth()

    const handleLogout = async () => {
      try {
        await logout()
        toast.success('Logged out')
        navigate('/')
      } catch (err) {
        console.error('Logout failed', err)
        toast.error('Logout failed')
      }
    }

  return (
    <div className="fixed w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4 z-50">
            {!user ? (
              <NavbarButton onClick={() => navigate('/login')} variant="secondary">Login</NavbarButton>
            ) : (
              <NavbarButton onClick={handleLogout} variant="secondary">Logout</NavbarButton>
            )}
            <ModeToggle />
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              {!user ? (
                <NavbarButton
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/login') }}
                  variant="primary"
                  className="w-full"
                >
                  Login
                </NavbarButton>
              ) : (
                <NavbarButton
                  onClick={() => { setIsMobileMenuOpen(false); handleLogout() }}
                  variant="primary"
                  className="w-full"
                >
                  Logout
                </NavbarButton>
              )}
              <ModeToggle />
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

    </div>
  );
}

// Usage example: