import { ThemeProvider } from "@/components/theme-provider"
import { BrowserRouter, Routes, Route, useLocation, Outlet, Navigate, useParams } from "react-router-dom"
import { useState, useEffect } from 'react'
import type { Dispatch, SetStateAction } from 'react'
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

function NavbarRenderer({ sidebarCollapsed, setSidebarCollapsed }: { sidebarCollapsed: boolean; setSidebarCollapsed: Dispatch<SetStateAction<boolean>> }) {
  const location = useLocation()
  // show navbar only on listed routes
  if (navbarIncludedRoutes.includes(location.pathname)) {
    return <NavbarDemo />
  }
  // render sidebar for all other routes where navbar is not shown
  return <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
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

  // persist collapsed state when it changes (keeps Sidebar and other tabs in sync)
  useEffect(() => {
    try {
      localStorage.setItem('prashn.sidebar.collapsed', sidebarCollapsed ? '1' : '0')
    } catch {}
  }, [sidebarCollapsed])

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
            {/* Layout uses useLocation, so keep it inside BrowserRouter */}
            <Layout sidebarCollapsed={sidebarCollapsed}>
              <NavbarRenderer sidebarCollapsed={sidebarCollapsed} setSidebarCollapsed={setSidebarCollapsed} />

              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />

                {/* Nested routes for the text generator so relative navigation works */}
                <Route path="/generateQuizByText" element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                  <Route index element={<GenerateQuizByTextPage />} />
                  <Route path=":id" element={<GeneratedQuizPage />} />
                </Route>

                {/* New canonical quiz resource route */}
                <Route path="/quizzes/:id/view" element={<GeneratedQuizPage />} />

                {/* Backwards-compat redirect from old generate route to new resource route */}
                <Route path="/generateQuizByText/:id" element={<RedirectOldQuiz />} />

                <Route path="/generateQuizByPdf" element={<ProtectedRoute><GenerateQuizByPdf /></ProtectedRoute>} />
                <Route path="/" element={<HomePage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/test" element={<TestPage />} />
              </Routes>
            </Layout>
          </ThemeProvider>
        </BrowserRouter>
        <Toaster />
      </AuthProvider>
    </>
  )
}

// Layout component determines padding based on whether the navbar is shown
function Layout({ children, sidebarCollapsed }: { children: React.ReactNode; sidebarCollapsed: boolean }) {
  const location = useLocation()
  const showNavbar = navbarIncludedRoutes.includes(location.pathname)

  // when navbar is visible we don't apply left padding; when sidebar is visible apply it
  const paddingClass = showNavbar ? '' : (sidebarCollapsed ? 'md:pl-20' : 'md:pl-64')

  return (
    <main className={`container w-screen min-h-screen m-auto flex flex-col items-center overflow-x-hidden ${paddingClass}`}>
      {children}
    </main>
  )
}

// Redirect component to map old generate routes to the new canonical quiz resource route
function RedirectOldQuiz() {
  const params = useParams()
  const id = params.id
  // preserve location state if present
  const location = useLocation()
  if (!id) return <></>
  return <Navigate to={`/quizzes/${id}/view`} replace state={(location.state as any) ?? undefined} />
}

export default App
