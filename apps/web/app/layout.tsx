import type { Metadata } from "next"
import { Inter, Geist_Mono } from "next/font/google"

import "@celestia-project/ui/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@celestia-project/ui/lib/utils"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: {
    default: "Celestia",
    template: "%s — Celestia",
  },
  description: "A decoupled full-stack monorepo with Next.js 16, Hono, Better Auth, and Drizzle ORM.",
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
