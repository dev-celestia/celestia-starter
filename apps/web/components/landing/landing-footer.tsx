import Link from "next/link"
import { CheckCircleIcon } from "@phosphor-icons/react/dist/ssr"
import { Badge } from "@celestia-project/ui"

import { LogoMark } from "@/components/shared/logo-mark"

import { FOOTER_COLUMNS } from "./content"

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="container">
        <div className="landing-footer-grid">
          <div className="landing-footer-col">
            <span className="landing-brand">
              <LogoMark />
              <span className="landing-brand-name">Celestia</span>
            </span>
            <p className="landing-body">
              A decoupled full-stack monorepo starter. Next.js and Hono on
              either side of a typed contract, with features you install instead
              of copy.
            </p>
            <Badge variant="success">
              <CheckCircleIcon />
              All features verified
            </Badge>
          </div>

          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading} className="landing-footer-col">
              <span className="landing-footer-heading">{column.heading}</span>
              {column.links.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="landing-footer-link"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>

        <div className="landing-footer-bottom">
          <span>© 2026 Celestia Starter. MIT licensed.</span>
          <span className="landing-mono">
            Next.js 16 · Hono on Node · @celestia-project/ui v0.4.0
          </span>
        </div>
      </div>
    </footer>
  )
}
