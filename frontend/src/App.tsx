import { ThemeProvider } from "@/components/theme-provider"
import { NavbarDemo } from "./components/navigation/Navbar"
import { BrowserRouter, Routes, Route } from "react-router-dom"

import HomePage from "./pages/Home"
import { LoginPage } from "./pages/Auth/Login"
import { RegisterPage } from "./pages/Auth/Register"
import DashboardPage from "./pages/Dashboard"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "./context/AuthContext"
import { ProtectedRoute } from "./components/auth/ProtectedRoute"
import TestPage from "./pages/TestPage"



function App() {

  return (
    <>
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <main className="container w-screen min-h-screen m-auto flex flex-col items-center ">
            <NavbarDemo />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
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
