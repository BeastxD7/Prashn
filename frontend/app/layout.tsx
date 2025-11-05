import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/context/auth-provider"


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://prashn.swastify.life"),
  title: "Prashn - Next-Gen Edtech Platform",
  description: "Empowering the future of education with AI-driven solutions",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://prashn.swastify.life",
  },
  openGraph: {
    title: "Prashn - Next-Gen Edtech Platform",
    description: "Empowering the future of education with AI-driven solutions",
    url: "https://prashn.swastify.life",
    siteName: "Prashn",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Prashn Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prashn - Next-Gen Edtech Platform",
    description: "Empowering the future of education with AI-driven solutions",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
              <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
        </ThemeProvider>
      </body>

    </html>
  );
}
