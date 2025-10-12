import { Navigate, Route, Routes } from "react-router-dom"

import { Navbar } from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"
import HomePage from "./pages/Home"
import RegisterPage from "./pages/Register"
import LoginPage from "./pages/Login"

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="flex h-screen w-screen flex-col bg-background text-foreground">
        <div className="container mx-auto flex h-full flex-1 flex-col ">
          <Navbar />
          <Routes>
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>

        </div>
      </div>
    </ThemeProvider>
  )
}

export default App