"use client";
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
import { navItems } from "@/constants/Navbar";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useAuth } from "@/context/auth-provider";



export function NavbarDemo() {

  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const resolvedNavItems = useMemo(() => {
    return navItems.map((item) => {
      if (!user && item.requiresAuth) {
        const encoded = encodeURIComponent(item.url || "/");
        return { ...item, url: `/login?from=${encoded}` };
      }
      return item;
    });
  }, [user]);

  return (
    <div className="relative w-full ">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={resolvedNavItems} />
          <div className="flex items-center gap-4">
            <NavbarButton as={Link} variant="primary" href="/login">Login</NavbarButton>
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
            {resolvedNavItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.url}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.title}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
                href="/login"
              >
                Login
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Navbar */}
    </div>
  );
}

