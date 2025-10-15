import { ThemeProvider } from "@/components/theme-provider"
import { NavbarDemo } from "./components/navigation/Navbar"
function App() {


  return (
    <>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <NavbarDemo/>
      </ThemeProvider>
    </>
  )
}

export default App
