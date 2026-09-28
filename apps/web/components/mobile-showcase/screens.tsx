import * as React from "react"
import {
  AppleLogoIcon,
  CaretLeftIcon,
  CaretRightIcon,
  CheckIcon,
  EyeIcon,
  GoogleLogoIcon,
  HouseIcon,
  MagnifyingGlassIcon,
  NotePencilIcon,
  SquaresFourIcon,
  UserIcon,
  WarningIcon,
} from "@phosphor-icons/react/dist/ssr"
import { cn } from "@celestia-project/ui/lib/utils"
import type { MobileScreenId } from "@/lib/mobile-showcase"

/**
 * Static recreations of the `layout/` screens.
 *
 * **These are not the real components.** `@celestia-project/mobile` renders
 * through `@expo/ui`, which has no web implementation — see the platform matrix
 * further down the page. What is drawn here is an HTML/CSS transcription of the
 * same arrangement, at the same type scale and the same 44pt touch floor, so
 * the page can show the shape of a screen without claiming to run it. Buttons
 * are drawn at their real 32px control height, which is why they read shorter
 * than the 44pt rows around them.
 *
 * Everything is built on the site's semantic tokens rather than the mobile
 * package's hex ramp, so the gallery follows the docs theme (and the accent
 * customiser) like every other surface. The mobile ramp itself is shown
 * verbatim in the Foundations section.
 */

/* -------------------------------------------------------------------------- */
/* Shared pieces                                                               */
/* -------------------------------------------------------------------------- */

function ScreenShell({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("bg-background text-foreground flex h-full flex-col", className)}>
      {children}
    </div>
  )
}

/** Nav bar. `onBack` is what draws the chevron — there is no separate flag. */
function NavBar({
  title,
  back = true,
  large = false,
  trailing,
}: {
  title: string
  back?: boolean
  large?: boolean
  trailing?: React.ReactNode
}) {
  return (
    <div className="border-border/70 flex shrink-0 items-center gap-2 border-b px-3 py-2">
      {back ? (
        <span className="text-foreground -ms-1 flex size-8 items-center justify-center">
          <CaretLeftIcon className="size-4" weight="bold" />
        </span>
      ) : (
        <span className="size-8" />
      )}
      <span
        className={cn(
          "flex-1 truncate",
          large ? "text-base font-semibold" : "text-xs font-semibold"
        )}
      >
        {title}
      </span>
      <span className="flex items-center">{trailing}</span>
    </div>
  )
}

function Field({
  label,
  value,
  placeholder,
  secure,
  trailing,
  className,
}: {
  label: string
  value?: string
  placeholder?: string
  secure?: boolean
  trailing?: React.ReactNode
  className?: string
}) {
  const filled = value !== undefined && value.length > 0

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <span className="text-2xs font-medium">{label}</span>
      <div className="border-input bg-background flex min-h-11 items-center gap-2 rounded-md border px-3">
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-xs",
            filled ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {secure && filled ? "•".repeat(value.length) : (value ?? placeholder)}
        </span>
        {trailing}
      </div>
    </div>
  )
}

/**
 * The auth CTA, transcribed from `MobileButton` at its default size.
 *
 * `h-8` — the control is 32px and the 44pt touch floor is met by `hitSlop` on
 * the real component, so the visible box is deliberately shorter than the floor
 * the rows around it sit on. The 2px `shadow-3d-*` edge is the same lift the
 * web button uses.
 */
function PrimaryButton({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode
  variant?: "default" | "outline"
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-sm border px-3 text-xs/relaxed font-medium",
        variant === "default"
          ? "border-primary bg-background text-primary shadow-3d-primary"
          : "border-border bg-background text-foreground shadow-3d",
        className
      )}
    >
      {children}
    </div>
  )
}

/** The @expo/ui switch, drawn to scale — 51×31pt with a 27pt knob. */
function SwitchMark({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex h-[31px] w-[51px] shrink-0 items-center rounded-full p-[2px] transition-colors",
        on ? "bg-primary" : "bg-muted-foreground/35"
      )}
    >
      <span
        className={cn(
          "size-[27px] rounded-full bg-background shadow-sm",
          on ? "translate-x-5" : "translate-x-0"
        )}
      />
    </span>
  )
}

function SettingRow({
  label,
  value,
  trailing,
  chevron,
  last,
}: {
  label: string
  value?: string
  trailing?: React.ReactNode
  chevron?: boolean
  last?: boolean
}) {
  return (
    <div className="relative flex min-h-11 items-center gap-2 px-3">
      <span className="min-w-0 flex-1 truncate text-xs">{label}</span>
      {value ? (
        <span className="text-muted-foreground shrink-0 text-xs">{value}</span>
      ) : null}
      {trailing}
      {chevron ? (
        <CaretRightIcon className="text-muted-foreground/70 size-3.5 shrink-0" weight="bold" />
      ) : null}
      {!last ? (
        <span aria-hidden className="bg-border/70 absolute inset-x-3 bottom-0 h-px" />
      ) : null}
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-muted-foreground px-3 pb-1 text-3xs font-semibold tracking-wider uppercase">
      {children}
    </p>
  )
}

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="border-border/70 bg-card overflow-hidden rounded-lg border">
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Screens                                                                     */
/* -------------------------------------------------------------------------- */

function SignInScreen() {
  return (
    <ScreenShell>
      <NavBar title="" />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-4 pt-2 pb-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold tracking-[-0.02em]">Welcome back</h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Sign in to continue to your workspace.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <PrimaryButton variant="outline">
            <AppleLogoIcon className="size-3.5" weight="fill" />
            Apple
          </PrimaryButton>
          <PrimaryButton variant="outline">
            <GoogleLogoIcon className="size-3.5" weight="fill" />
            Google
          </PrimaryButton>
        </div>

        <div className="flex items-center gap-3">
          <span aria-hidden className="bg-border h-px flex-1" />
          <span className="text-muted-foreground text-3xs">or</span>
          <span aria-hidden className="bg-border h-px flex-1" />
        </div>

        <Field label="Email" value="ada@example.com" />
        <Field
          label="Password"
          value="supersecret"
          secure
          trailing={<EyeIcon className="text-muted-foreground size-3.5" />}
        />

        <div className="flex items-center justify-between gap-2">
          <span className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground flex size-[18px] items-center justify-center rounded-[5px]">
              <CheckIcon className="size-2.5" weight="bold" />
            </span>
            <span className="text-xs">Remember me</span>
          </span>
          <span className="text-2xs font-medium underline underline-offset-2">
            Forgot password?
          </span>
        </div>

        <PrimaryButton>Sign in</PrimaryButton>

        <p className="text-muted-foreground mt-auto text-center text-2xs">
          New here? <span className="text-foreground font-medium">Create an account</span>
        </p>
      </div>
    </ScreenShell>
  )
}

function OnboardingScreen() {
  return (
    <ScreenShell className="justify-between px-4 pt-3 pb-5">
      <div className="flex justify-end">
        <span className="text-muted-foreground text-2xs font-medium">Skip</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
        <span className="bg-muted text-foreground flex size-24 items-center justify-center rounded-3xl">
          <NotePencilIcon className="size-11" weight="duotone" />
        </span>
        <h3 className="text-lg font-semibold tracking-[-0.02em]">Capture anything</h3>
        <p className="text-muted-foreground max-w-[210px] text-xs leading-relaxed">
          Notes, links and files land in one inbox. No folders to file them into before you
          can move on.
        </p>
      </div>

      <div className="flex flex-col items-center gap-5">
        <span aria-hidden className="flex items-center gap-1.5">
          <span className="bg-primary h-1.5 w-5 rounded-full" />
          <span className="bg-muted-foreground/30 size-1.5 rounded-full" />
          <span className="bg-muted-foreground/30 size-1.5 rounded-full" />
        </span>
        <PrimaryButton className="w-full">Next</PrimaryButton>
      </div>
    </ScreenShell>
  )
}

function SettingsScreen() {
  return (
    <ScreenShell>
      <NavBar title="Settings" />

      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-hidden px-3 pt-3">
        <div className="flex items-center gap-3 px-1">
          <span className="bg-muted text-foreground flex size-11 items-center justify-center rounded-full text-xs font-semibold">
            AL
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold">Ada Lovelace</span>
            <span className="text-muted-foreground truncate text-2xs">
              ada@example.com
            </span>
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <SectionLabel>Account</SectionLabel>
          <SectionCard>
            <SettingRow label="Name" value="Ada Lovelace" chevron />
            <SettingRow label="Email" value="ada@example.com" chevron />
            <SettingRow label="Plan" value="Pro" chevron last />
          </SectionCard>
          <p className="text-muted-foreground px-3 text-3xs leading-relaxed">
            Changing your email requires re-verification.
          </p>
        </div>

        <div className="flex flex-col gap-1">
          <SectionLabel>Preferences</SectionLabel>
          <SectionCard>
            <SettingRow label="Download over Wi-Fi only" trailing={<SwitchMark on />} />
            <SettingRow
              label="Haptic feedback"
              trailing={<SwitchMark on={false} />}
              last
            />
          </SectionCard>
        </div>
      </div>

      <div className="shrink-0 px-4 pt-3 pb-4">
        <PrimaryButton variant="outline" className="w-full">
          Sign out
        </PrimaryButton>
      </div>
    </ScreenShell>
  )
}

function OtpVerifyScreen() {
  const digits = ["4", "2", "9", "1", "", ""]

  return (
    <ScreenShell>
      <NavBar title="" />

      <div className="flex min-h-0 flex-1 flex-col gap-5 px-4 pt-2">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold tracking-[-0.02em]">Enter the code</h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            We sent a 6-digit code to{" "}
            <span className="text-foreground font-medium">a•••@example.com</span>.
          </p>
        </div>

        <div className="flex items-center justify-between gap-1.5">
          {digits.map((digit, index) => (
            <span
              key={index}
              className={cn(
                "flex h-12 flex-1 items-center justify-center rounded-md border text-base font-semibold tabular-nums",
                digit
                  ? "border-border bg-card text-foreground"
                  : index === 4
                    ? "border-primary bg-background text-foreground"
                    : "border-input bg-muted/40 text-muted-foreground"
              )}
            >
              {digit || (index === 4 ? <span className="bg-primary h-5 w-px" /> : "")}
            </span>
          ))}
        </div>

        <p className="text-muted-foreground text-center text-2xs tabular-nums">
          Resend code in 0:24
        </p>

        <PrimaryButton>Verify</PrimaryButton>
      </div>
    </ScreenShell>
  )
}

function StatusScreen() {
  return (
    <ScreenShell className="items-center justify-center gap-4 px-5 text-center">
      <span className="bg-warning/15 text-warning flex size-20 items-center justify-center rounded-full">
        <WarningIcon className="size-10" weight="duotone" />
      </span>

      <div className="flex flex-col gap-1.5">
        <h3 className="text-lg font-semibold tracking-[-0.02em]">Storage nearly full</h3>
        <p className="text-muted-foreground text-xs leading-relaxed">
          You have used 47 of 50 GB. New uploads will fail soon.
        </p>
      </div>

      <div className="mt-1 flex w-full flex-col items-center gap-3">
        <PrimaryButton className="w-full">Upgrade storage</PrimaryButton>
        <span className="text-2xs font-medium underline underline-offset-2">
          Manage my plan
        </span>
      </div>
    </ScreenShell>
  )
}

function ResetPasswordScreen() {
  const strength = 3

  return (
    <ScreenShell>
      <NavBar title="" />

      <div className="flex min-h-0 flex-1 flex-col gap-4 px-4 pt-2">
        <div className="flex flex-col gap-1">
          <h3 className="text-xl font-semibold tracking-[-0.02em]">
            Choose a new password
          </h3>
          <p className="text-muted-foreground text-xs leading-relaxed">
            At least 8 characters, with a number.
          </p>
        </div>

        <Field
          label="New password"
          value="correct-horse"
          secure
          trailing={<EyeIcon className="text-muted-foreground size-3.5" />}
        />

        {/* Strength meter — scored by the same function that gates submit */}
        <div className="flex flex-col gap-1.5">
          <span aria-hidden className="flex gap-1">
            {[0, 1, 2, 3].map((step) => (
              <span
                key={step}
                className={cn(
                  "h-1 flex-1 rounded-full",
                  step < strength ? "bg-success" : "bg-muted"
                )}
              />
            ))}
          </span>
          <span className="text-success text-3xs font-medium">Strong</span>
        </div>

        <Field
          label="Confirm password"
          value="correct-horse"
          secure
          trailing={<CheckIcon className="text-success size-3.5" weight="bold" />}
        />

        <PrimaryButton>Update password</PrimaryButton>
      </div>
    </ScreenShell>
  )
}

/** Tab bar, drawn once so the settings preview can hint at the app frame. */
export function TabBarMark() {
  const items = [
    { id: "home", label: "Home", Icon: HouseIcon, active: true },
    { id: "search", label: "Search", Icon: MagnifyingGlassIcon, active: false },
    { id: "library", label: "Library", Icon: SquaresFourIcon, active: false },
    { id: "profile", label: "Profile", Icon: UserIcon, active: false },
  ]

  return (
    <div className="border-border/70 flex shrink-0 items-center border-t px-2 pt-2 pb-1">
      {items.map((item) => (
        <span
          key={item.id}
          className={cn(
            "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5",
            item.active ? "text-foreground" : "text-muted-foreground"
          )}
        >
          <item.Icon className="size-[18px]" weight={item.active ? "fill" : "regular"} />
          <span className="text-4xs font-medium">{item.label}</span>
        </span>
      ))}
    </div>
  )
}

export const MOBILE_SCREEN_RENDERERS: Record<MobileScreenId, () => React.ReactElement> = {
  "sign-in": SignInScreen,
  onboarding: OnboardingScreen,
  settings: SettingsScreen,
  "otp-verify": OtpVerifyScreen,
  status: StatusScreen,
  "reset-password": ResetPasswordScreen,
}
