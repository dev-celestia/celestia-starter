import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"

import "@celestia-project/ui/globals.css"
import { ThemeProvider } from "@/lib/theme"
import { cn } from "@celestia-project/ui/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  // `--font-sans-family` (not `--font-sans`) is the design system's public font
  // override hook. Pointing next/font at `--font-sans` would collide with the
  // theme token of the same name and make `font-sans` resolve to nothing.
  variable: "--font-sans-family",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono-family",
})

export const metadata: Metadata = {
  title: {
    default: "Celestia",
    template: "%s — Celestia",
  },
  description: "A decoupled full-stack monorepo with Next.js 16, Hono, Better Auth, and Drizzle ORM.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/celestia-icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", inter.variable)}
    >
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
