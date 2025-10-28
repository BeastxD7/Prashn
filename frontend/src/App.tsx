import { ThemeProvider } from "@/components/theme-provider"
import { BrowserRouter, Routes, Route, useLocation, Outlet } from "react-router-dom"
import { useState, useEffect } from 'react'
import { NavbarDemo } from "./components/navigation/Navbar"
import Sidebar from "./components/navigation/Sidebar"

import HomePage from "./pages/Home"
import { LoginPage } from "./pages/Auth/Login"
import { RegisterPage } from "./pages/Auth/Register"
import DashboardPage from "./pages/Dashboard"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import TestPage from "./pages/TestPage"
import GenerateQuizByTextPage from "./pages/GenerateQuizByText"
import GeneratedQuizPage from "./pages/GeneratedQuiz"
import GenerateQuizByPdf from "./pages/GenerateQuizByPdf"

const navbarIncludedRoutes = ['/login', '/register', '/']

function NavbarRenderer() {
  const location = useLocation()
  // show navbar only on listed routes
  if (navbarIncludedRoutes.includes(location.pathname)) {
    return <NavbarDemo />
  }
  // render sidebar for all other routes where navbar is not shown
  return <Sidebar />
}


function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('prashn.sidebar.collapsed') === '1'
    } catch {
      return false
    }
  })

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'prashn.sidebar.collapsed') {
        setSidebarCollapsed(e.newValue === '1')
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // ensure no horizontal scroll across the app
  useEffect(() => {
    const prev = document.body.style.overflowX
    document.body.style.overflowX = 'hidden'
    return () => {
      document.body.style.overflowX = prev
    }
  }, [])

  return (
    <>
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <main className={`container w-screen min-h-screen m-auto flex flex-col items-center overflow-x-hidden ${
            sidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
          }`}>
            <NavbarRenderer />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

              {/* Nested routes for the text generator so relative navigation works */}
              <Route path="/generateQuizByText" element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                <Route index element={<GenerateQuizByTextPage />} />
                <Route path=":id" element={<GeneratedQuizPage />} />
              </Route>

              <Route path="/generateQuizByPdf" element={<ProtectedRoute><GenerateQuizByPdf /></ProtectedRoute>} />
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/test" element={<TestPage />} />
            </Routes>
          </main>
        </ThemeProvider>
      </BrowserRouter>
      <Toaster />
      </AuthProvider>
    </>
  )
}

export default App
