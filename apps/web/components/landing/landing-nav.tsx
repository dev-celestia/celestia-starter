"use client"

import * as React from "react"
import Link from "next/link"
import { ArrowRightIcon, ListIcon } from "@phosphor-icons/react"
import {
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@celestia-project/ui"

import { LogoMark } from "@/components/shared/logo-mark"

import { NAV_LINKS } from "./content"

/**
 * Sticky nav for the home page.
 *
 * The home page is forced-dark (see `.landing` in app/landing.css), so this bar
 * uses the landing palette rather than `bg-background` — the app-shell token
 * would follow the user's theme and turn the bar white in light mode.
 */
export function LandingNav() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)

  return (
    <header className="landing-nav">
      <nav className="landing-nav-inner container" aria-label="Primary">
        <Link href="/" className="landing-brand">
          <LogoMark />
          <span className="landing-brand-name">Celestia</span>
        </Link>

        <div className="landing-nav-links">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="landing-nav-link">
              {link.label}
            </a>
          ))}
        </div>

        <div className="landing-nav-actions">
          {/*
            `nativeButton={false}` is required whenever `render` targets an
            anchor. Base UI defaults to assuming a real <button>, so without it
            the server emits `<a role="button">` while the client emits
            `<a type="button">` — a hydration mismatch on both attributes.
          */}
          <div className="landing-nav-desktop-only">
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href="/docs" />}
            >
              Docs
            </Button>
          </div>

          <div className="landing-nav-desktop-only">
            <Button
              variant="default"
              size="sm"
              nativeButton={false}
              render={<Link href="/feature-installer" />}
            >
              Install a feature
              <ArrowRightIcon />
            </Button>
          </div>

          <div className="landing-nav-mobile">
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Open navigation"
              onClick={() => setIsMenuOpen(true)}
            >
              <ListIcon />
            </Button>
          </div>
        </div>
      </nav>

      <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
        <SheetContent side="right">
          <SheetHeader>
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Jump to a section of this page.</SheetDescription>
          </SheetHeader>

          <div className="landing-sheet-body">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="landing-sheet-link"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="landing-sheet-body">
            <Button
              variant="default"
              size="lg"
              nativeButton={false}
              render={
                <Link
                  href="/feature-installer"
                  onClick={() => setIsMenuOpen(false)}
                />
              }
            >
              Install a feature
              <ArrowRightIcon />
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  )
}
