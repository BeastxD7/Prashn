import { NavbarDemo } from '@/components/navigation/Navbar'
import React from 'react'

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div>
        <NavbarDemo />
        {children}
    </div>
  )
}

export default layout