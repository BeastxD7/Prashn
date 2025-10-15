import { ThemeProvider } from "@/components/theme-provider"
import { NavbarDemo } from "./components/navigation/Navbar"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import LoginPage from "./pages/Login"
import HomePage from "./pages/Home"

function App() {

  return (
    <>
      <BrowserRouter>
        <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
          <main className="container w-screen h-screen m-auto flex flex-col items-center ">
            <NavbarDemo />
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<HomePage />} />
            </Routes>
          </main>
        </ThemeProvider>
      </BrowserRouter>
    </>
  )
}

export default App
