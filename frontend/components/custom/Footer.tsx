"use client"

import Link from "next/link"
import { Zap, Github, Twitter, Linkedin, Mail } from "lucide-react"
import Image from "next/image"

export default function Footer() {
  return (
    <footer className="w-full border-t border-border/40 dark:border-white/10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Image src={"/logo.svg"} alt="Prashn Logo" width={32} height={32} />
              <span className="text-xl font-bold text-foreground dark:text-white">Prashn</span>
            </div>
            <p className="text-sm text-muted-foreground dark:text-gray-400 max-w-md mb-6">
              Transform your content into engaging quizzes with AI. Perfect for educators, trainers, and content creators looking to enhance learning experiences.
            </p>
            <div className="flex items-center gap-4">
              <Link 
                href="https://github.com" 
                target="_blank"
                className="w-9 h-9 rounded-lg bg-muted dark:bg-white/5 hover:bg-muted/80 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <Github className="w-4 h-4 text-foreground dark:text-white" />
              </Link>
              <Link 
                href="https://twitter.com" 
                target="_blank"
                className="w-9 h-9 rounded-lg bg-muted dark:bg-white/5 hover:bg-muted/80 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <Twitter className="w-4 h-4 text-foreground dark:text-white" />
              </Link>
              <Link 
                href="https://linkedin.com" 
                target="_blank"
                className="w-9 h-9 rounded-lg bg-muted dark:bg-white/5 hover:bg-muted/80 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <Linkedin className="w-4 h-4 text-foreground dark:text-white" />
              </Link>
              <Link 
                href="mailto:support@prashn.com"
                className="w-9 h-9 rounded-lg bg-muted dark:bg-white/5 hover:bg-muted/80 dark:hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <Mail className="w-4 h-4 text-foreground dark:text-white" />
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground dark:text-white mb-4">Product</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/dashboard" className="text-sm text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/generate-by-text" className="text-sm text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/add-credits" className="text-sm text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/quizzes" className="text-sm text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-colors">
                  My Quizzes
                </Link>
              </li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-foreground dark:text-white mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border/40 dark:border-white/10">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              © {new Date().getFullYear()} Prashn. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-sm text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-sm text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="text-sm text-muted-foreground dark:text-gray-400 hover:text-foreground dark:hover:text-white transition-colors">
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
