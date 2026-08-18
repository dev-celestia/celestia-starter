"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ChatCircleIcon,
  EnvelopeSimpleIcon,
  GithubLogoIcon,
  LinkedinLogoIcon,
  WhatsappLogoIcon,
  XIcon,
  CheckIcon,
  CopyIcon,
} from "@phosphor-icons/react"
import { cn } from "@celestia-project/ui/lib/utils"

const FREELANCER_CONFIG = {
  name: "Arham",
  role: "Software Developer",
  status: "Available for freelance & contract work",
  avatarUrl: "/1775011264570.jpg",
  email: "arhamymr@gmail.com",
  githubUrl: "https://github.com/arhamymr",
  linkedinUrl: "https://www.linkedin.com/in/arhamymr/",
  whatsappUrl:
    "https://wa.me/6289669594959?text=Hi%20Arham%2C%20I'm%20interested%20in%20your%20web%2Fsoftware%20development%20services!",
  emailUrl:
    "mailto:arhamymr@gmail.com?subject=Freelance%20Project%20Inquiry&body=Hi%20Arham%2C%0A%0AI'm%20interested%20in%20discussing%20a%20project%20with%20you.%0A%0ABest%20regards%2C",
}

export function FloatingFreelancerWidget() {
  const [isOpen, setIsOpen] = React.useState(false)
  const [copiedEmail, setCopiedEmail] = React.useState(false)
  const widgetRef = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("touchstart", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("touchstart", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(FREELANCER_CONFIG.email)
    setCopiedEmail(true)
    setTimeout(() => setCopiedEmail(false), 2000)
  }

  return (
    <aside
      ref={widgetRef}
      aria-label="Freelance Developer Contact"
      className="fixed bottom-5 right-5 z-50 flex flex-col items-end font-sans"
    >
      {/* Expanded Profile Card */}
      {isOpen ? (
        <div className="relative mb-2 w-[340px] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-xl border border-stroke bg-bg/95 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 sm:w-[360px]">
          {/* Ambient Celestia Brand Glow */}
          <div className="pointer-events-none absolute -top-12 -left-12 size-36 rounded-full bg-[#89aacc]/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -right-12 size-36 rounded-full bg-[#4e85bf]/15 blur-2xl" />

          {/* Header Row */}
          <div className="relative flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Profile Photo / Avatar */}
              <div className="relative size-10 shrink-0">
                <div className="relative size-10 overflow-hidden rounded-full ring-2 ring-stroke shadow-md">
                  <Image
                    src={FREELANCER_CONFIG.avatarUrl}
                    alt={FREELANCER_CONFIG.name}
                    width={28}
                    height={48}
                    className="size-full object-cover"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5 mb-0.5">
                  <h3 className="text-sm font-medium tracking-tight text-text-primary">
                    {FREELANCER_CONFIG.name}
                  </h3>
                  <span className="inline-flex items-center rounded-full border border-[#89aacc]/30 bg-[#89aacc]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#89aacc]">
                    Available
                  </span>
                </div>
                <p className="text-xs text-fog">
                  {FREELANCER_CONFIG.role}
                </p>
              </div>
            </div>

            {/* Minimize / Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Minimize contact widget"
              className="rounded-lg p-1 text-fog transition-colors hover:bg-surface hover:text-text-primary"
            >
              <XIcon className="size-4" />
            </button>
          </div>

          {/* Availability Status Banner */}
          <div className="relative mt-3.5 flex items-center gap-2 rounded-xl border border-stroke bg-surface/70 px-3 py-2 text-xs">
            <span className="relative flex size-2 shrink-0">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#89aacc] opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-[#89aacc]" />
            </span>
            <span className="font-medium text-fog">
              {FREELANCER_CONFIG.status}
            </span>
          </div>

          {/* Action Buttons: WhatsApp, GitHub, LinkedIn, Email */}
          <div className="mt-4 grid grid-cols-4 gap-1.5">
            {/* WhatsApp Contact */}
            <Link
              href={FREELANCER_CONFIG.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col items-center justify-center gap-1.5 rounded-xl border border-stroke bg-surface p-2 text-center text-xs font-medium text-text-primary transition-all duration-200 hover:border-[#89aacc]/50 hover:bg-surface/80 active:scale-[0.98]"
            >
              <WhatsappLogoIcon className="size-4 shrink-0 text-[#89aacc] transition-colors group-hover:text-white" weight="fill" />
              <span className="text-[10px] leading-none">WhatsApp</span>
            </Link>

            {/* GitHub Profile */}
            <Link
              href={FREELANCER_CONFIG.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col items-center justify-center gap-1.5 rounded-xl border border-stroke bg-surface p-2 text-center text-xs font-medium text-text-primary transition-all duration-200 hover:border-[#89aacc]/50 hover:bg-surface/80 active:scale-[0.98]"
            >
              <GithubLogoIcon className="size-4 shrink-0 text-[#89aacc] transition-colors group-hover:text-white" weight="fill" />
              <span className="text-[10px] leading-none">GitHub</span>
            </Link>

            {/* LinkedIn Profile */}
            <Link
              href={FREELANCER_CONFIG.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col items-center justify-center gap-1.5 rounded-xl border border-stroke bg-surface p-2 text-center text-xs font-medium text-text-primary transition-all duration-200 hover:border-[#89aacc]/50 hover:bg-surface/80 active:scale-[0.98]"
            >
              <LinkedinLogoIcon className="size-4 shrink-0 text-[#89aacc] transition-colors group-hover:text-white" weight="fill" />
              <span className="text-[10px] leading-none">LinkedIn</span>
            </Link>

            {/* Email Contact */}
            <Link
              href={FREELANCER_CONFIG.emailUrl}
              className="group flex flex-col items-center justify-center gap-1.5 rounded-xl border border-stroke bg-surface p-2 text-center text-xs font-medium text-text-primary transition-all duration-200 hover:border-[#89aacc]/50 hover:bg-surface/80 active:scale-[0.98]"
            >
              <EnvelopeSimpleIcon className="size-4 shrink-0 text-[#89aacc] transition-colors group-hover:text-white" weight="bold" />
              <span className="text-[10px] leading-none">Email</span>
            </Link>
          </div>

          {/* Quick Copy Contact Bar */}
          <div className="mt-3.5 flex items-center justify-between border-t border-stroke pt-2.5 text-[11px] text-fog">
            <span className="truncate pr-2 font-mono">{FREELANCER_CONFIG.email}</span>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-1 font-medium text-[#89aacc] transition-colors hover:text-white"
            >
              {copiedEmail ? (
                <>
                  <CheckIcon className="size-3 text-[#89aacc]" weight="bold" />
                  <span className="text-[#89aacc]">Copied</span>
                </>
              ) : (
                <>
                  <CopyIcon className="size-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      ) : null}

      {/* Collapsed Pill Button / Toggle Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "group flex items-center gap-2.5 rounded-xl border border-stroke bg-bg/90 px-3.5 py-2 text-xs shadow-xl backdrop-blur-md transition-all duration-300 hover:border-[#89aacc]/50 hover:bg-surface active:scale-[0.97]",
          isOpen ? "border-[#89aacc]/40" : ""
        )}
      >
        {/* Profile Photo Avatar */}
        <div className="relative size-6 shrink-0 overflow-hidden rounded-full ring-1 ring-stroke">
          <Image
            src={FREELANCER_CONFIG.avatarUrl}
            alt={FREELANCER_CONFIG.name}
            width={24}
            height={24}
            className="size-full object-cover"
          />
        </div>

        <div className="flex items-center gap-2 text-left">
          <span className="font-medium text-text-primary group-hover:text-white transition-colors">
            Need custom app development?
          </span>
          <span className="hidden sm:inline-block text-fog">·</span>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-fog">
            <span className="size-1.5 rounded-full bg-[#89aacc] animate-pulse" />
            Let&apos;s talk
          </span>
        </div>

        <div className="ml-1 flex size-5 items-center justify-center rounded-full bg-surface text-fog group-hover:text-[#89aacc]">
          <ChatCircleIcon className="size-3.5" />
        </div>
      </button>
    </aside>
  )
}
