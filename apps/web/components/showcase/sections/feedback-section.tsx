"use client"

import * as React from "react"
import {
  InfoIcon,
  WarningIcon,
  CheckCircleIcon,
  XCircleIcon,
  GearIcon,
  SparkleIcon,
  BellIcon,
} from "@phosphor-icons/react"
import {
  Alert,
  AlertTitle,
  AlertDescription,
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  Progress,
  Spinner,
  Button,
  Input,
  Label,
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@celestia-project/ui"
import { toast } from "@celestia-project/ui/components/sonner"
import { ShowcaseCard } from "../showcase-card"

const ALERT_CODE = `import * as React from "react"
import { Alert, AlertTitle, AlertDescription } from "@celestia-project/ui"
import { InfoIcon, WarningIcon } from "@phosphor-icons/react"

export function AlertDemo() {
  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <Alert variant="default">
        <InfoIcon className="size-4 text-primary" />
        <AlertTitle>System Update Available</AlertTitle>
        <AlertDescription>
          Celestia v0.2.1 is available with updated Base UI primitives.
        </AlertDescription>
      </Alert>

      <Alert variant="destructive">
        <WarningIcon className="size-4 text-destructive" />
        <AlertTitle>OAuth Credentials Missing</AlertTitle>
        <AlertDescription>
          Please configure GITHUB_CLIENT_ID in apps/api/.env.
        </AlertDescription>
      </Alert>
    </div>
  )
}`

const TOAST_CODE = `import * as React from "react"
import { Button } from "@celestia-project/ui"
import { toast } from "sonner"
import { CheckCircleIcon, XCircleIcon, InfoIcon } from "@phosphor-icons/react"

export function ToastDemo() {
  return (
    <div className="flex items-center gap-2.5">
      <Button
        variant="outline"
        size="xs"
        onClick={() => toast.success("Deployment finished successfully!")}
      >
        <CheckCircleIcon className="size-3.5 me-1" />
        Success Toast
      </Button>

      <Button
        variant="outline"
        size="xs"
        onClick={() => toast.error("Database connection timeout.")}
      >
        <XCircleIcon className="size-3.5 me-1" />
        Error Toast
      </Button>

      <Button
        variant="outline"
        size="xs"
        onClick={() => toast.info("New webhook event received.")}
      >
        <InfoIcon className="size-3.5 me-1" />
        Info Toast
      </Button>
    </div>
  )
}`

const DIALOG_CODE = `import * as React from "react"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Button,
  Input,
  Label,
} from "@celestia-project/ui"
import { GearIcon } from "@phosphor-icons/react"

export function DialogDemo() {
  return (
    <Dialog>
      <DialogTrigger render={<Button variant="default" size="sm" className="gap-1.5" />}>
        <GearIcon className="size-4" />
        Edit Profile Dialog
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>
            Make changes to your user account profile here.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div className="flex flex-col gap-1">
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue="Arham" />
          </div>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" size="sm">Cancel</Button>
          <Button variant="default" size="sm">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}`

const ALERT_DIALOG_CODE = `import * as React from "react"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
  Button,
} from "@celestia-project/ui"
import { WarningIcon } from "@phosphor-icons/react"

export function AlertDialogDemo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" className="gap-1.5" />}>
        <WarningIcon className="size-4" />
        Delete Project
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your workspace repository.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Confirm Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}`

const SHEET_CODE = `import * as React from "react"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  Button,
} from "@celestia-project/ui"
import { BellIcon } from "@phosphor-icons/react"

export function SheetDemo() {
  return (
    <Sheet>
      <SheetTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
        <BellIcon className="size-4" />
        Open Side Sheet
      </SheetTrigger>
      <SheetContent side="right" className="p-6">
        <SheetHeader>
          <SheetTitle>Notification Preferences</SheetTitle>
          <SheetDescription>Configure delivery triggers.</SheetDescription>
        </SheetHeader>
        <div className="py-4">
          <p className="text-xs text-muted-foreground">Adjust your email & webhook alerts.</p>
        </div>
        <SheetFooter>
          <Button variant="default" size="sm" className="w-full">Save</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}`

const POPOVER_CODE = `import * as React from "react"
import { Popover, PopoverTrigger, PopoverContent, Button, Input, Label } from "@celestia-project/ui"

export function PopoverDemo() {
  return (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" size="sm" />}>
        Customize Metrics
      </PopoverTrigger>
      <PopoverContent className="w-72 p-4">
        <div className="flex flex-col gap-2">
          <Label className="text-xs font-medium">Sampling Rate</Label>
          <Input defaultValue="100%" className="h-7 text-xs" />
        </div>
      </PopoverContent>
    </Popover>
  )
}`

const TOOLTIP_CODE = `import * as React from "react"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent, Button } from "@celestia-project/ui"
import { SparkleIcon } from "@phosphor-icons/react"

export function TooltipDemo() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<Button variant="outline" size="icon-sm" />}>
          <SparkleIcon className="size-4 text-amber-400" weight="fill" />
        </TooltipTrigger>
        <TooltipContent>
          <p>AI Query Optimization Enabled</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}`

const HOVER_CARD_CODE = `import * as React from "react"
import { HoverCard, HoverCardTrigger, HoverCardContent, Avatar, AvatarImage, AvatarFallback } from "@celestia-project/ui"

export function HoverCardDemo() {
  return (
    <HoverCard>
      <HoverCardTrigger render={<span className="text-xs font-medium underline underline-offset-4 cursor-pointer" />}>
        @celestia-core
      </HoverCardTrigger>
      <HoverCardContent className="w-80 p-4">
        <div className="flex gap-3">
          <Avatar className="size-10">
            <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" />
            <AvatarFallback>CC</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-xs font-medium">Celestia Framework</h4>
            <p className="text-[11px] text-muted-foreground">Next.js 16 + Hono monorepo starter.</p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}`

const PROGRESS_CODE = `import * as React from "react"
import { Progress, Button } from "@celestia-project/ui"

export function ProgressDemo() {
  const [progress, setProgress] = React.useState(68)

  return (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <Progress value={progress} />
      <div className="flex justify-between">
        <Button size="xs" variant="outline" onClick={() => setProgress((p) => Math.max(0, p - 10))}>-10%</Button>
        <Button size="xs" variant="outline" onClick={() => setProgress((p) => Math.min(100, p + 10))}>+10%</Button>
      </div>
    </div>
  )
}`

const SPINNER_CODE = `import * as React from "react"
import { Spinner } from "@celestia-project/ui"

export function SpinnerDemo() {
  return (
    <div className="flex items-center gap-4">
      <Spinner className="size-4" />
      <Spinner className="size-6 text-primary" />
      <Spinner className="size-8 text-sky-500" />
    </div>
  )
}`

export function FeedbackSection() {
  const [progressVal, setProgressVal] = React.useState(68)

  return (
    <TooltipProvider>
      <div id="feedback" className="flex flex-col gap-6 pt-6">
        <div className="flex items-center gap-2 border-b border-border pb-2">
          <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Feedback & Overlays
          </h2>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            10 components
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* 1. Alert */}
          <ShowcaseCard
            id="alert"
            title="Alert"
            category="Feedback"
            description="Displays a callout alert box for user attention with informational or destructive themes."
            docsSlug="alert"
            importSnippet={`import { Alert, AlertTitle, AlertDescription } from "@celestia-project/ui"`}
            codeExample={ALERT_CODE}
          >
            <div className="flex w-full max-w-sm flex-col gap-3">
              <Alert variant="default" className="border-border">
                <InfoIcon className="size-4 text-primary" />
                <AlertTitle>System Update Available</AlertTitle>
                <AlertDescription>
                  Celestia v0.2.1 has been released with updated Base UI primitives.
                </AlertDescription>
              </Alert>

              <Alert variant="destructive">
                <WarningIcon className="size-4 text-destructive" />
                <AlertTitle>OAuth Credentials Missing</AlertTitle>
                <AlertDescription>
                  Please configure GITHUB_CLIENT_ID and SECRET in apps/api/.env.
                </AlertDescription>
              </Alert>
            </div>
          </ShowcaseCard>

          {/* 2. Sonner Toast */}
          <ShowcaseCard
            id="sonner"
            title="Sonner Toast"
            category="Feedback"
            description="An opinionated, silky-smooth toast component for modern web applications."
            docsSlug="sonner"
            importSnippet={`import { toast } from "sonner"`}
            codeExample={TOAST_CODE}
          >
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <Button
                variant="outline"
                size="xs"
                onClick={() => toast.success("Deployment finished successfully!")}
                className="gap-1 text-green-600 dark:text-green-400"
              >
                <CheckCircleIcon className="size-3.5" />
                Success Toast
              </Button>

              <Button
                variant="outline"
                size="xs"
                onClick={() => toast.error("Database connection timeout.")}
                className="gap-1 text-red-600 dark:text-red-400"
              >
                <XCircleIcon className="size-3.5" />
                Error Toast
              </Button>

              <Button
                variant="outline"
                size="xs"
                onClick={() => toast.info("New webhook event received.")}
                className="gap-1 text-sky-600 dark:text-sky-400"
              >
                <InfoIcon className="size-3.5" />
                Info Toast
              </Button>
            </div>
          </ShowcaseCard>

          {/* 3. Dialog */}
          <ShowcaseCard
            id="dialog"
            title="Dialog"
            category="Feedback"
            description="A window overlaid on either the primary window or another dialog window."
            docsSlug="dialog"
            importSnippet={`import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@celestia-project/ui"`}
            codeExample={DIALOG_CODE}
          >
            <Dialog>
              <DialogTrigger render={<Button variant="default" size="sm" className="gap-1.5" />}>
                <GearIcon className="size-4" />
                Edit Profile Dialog
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Make changes to your user account profile here. Click save when done.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-3 py-2">
                  <div className="flex flex-col gap-1">
                    <Label htmlFor="name" className="text-xs">Full Name</Label>
                    <Input id="name" defaultValue="Arham" className="h-8 text-xs" />
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button variant="outline" size="sm">Cancel</Button>
                  <Button variant="default" size="sm" onClick={() => toast.success("Profile saved!")}>Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </ShowcaseCard>

          {/* 4. Alert Dialog */}
          <ShowcaseCard
            id="alert-dialog"
            title="Alert Dialog"
            category="Feedback"
            description="A modal dialog that interrupts the user with important content and expects a response."
            docsSlug="alert-dialog"
            importSnippet={`import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@celestia-project/ui"`}
            codeExample={ALERT_DIALOG_CODE}
          >
            <AlertDialog>
              <AlertDialogTrigger render={<Button variant="destructive" size="sm" className="gap-1.5" />}>
                <WarningIcon className="size-4" />
                Delete Project
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your workspace repository and purge all indexed embeddings.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => toast.error("Project deleted")}>
                    Confirm Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </ShowcaseCard>

          {/* 5. Sheet / Drawer */}
          <ShowcaseCard
            id="drawer"
            title="Sheet / Drawer"
            category="Feedback"
            description="Extends the Dialog component to display content that complements the screen from the side edge."
            docsSlug="sheet"
            importSnippet={`import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@celestia-project/ui"`}
            codeExample={SHEET_CODE}
          >
            <Sheet>
              <SheetTrigger render={<Button variant="outline" size="sm" className="gap-1.5" />}>
                <BellIcon className="size-4" />
                Open Side Sheet
              </SheetTrigger>
              <SheetContent side="right" className="p-6">
                <SheetHeader>
                  <SheetTitle>Notification Preferences</SheetTitle>
                  <SheetDescription>
                    Configure real-time webhook and email delivery triggers.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col gap-4 py-6">
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <span className="text-xs font-medium">Deployment Alerts</span>
                    <Button size="xs" variant="outline">Enabled</Button>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/50 pb-3">
                    <span className="text-xs font-medium">Weekly Digest</span>
                    <Button size="xs" variant="secondary">Disabled</Button>
                  </div>
                </div>
                <SheetFooter>
                  <Button variant="default" size="sm" className="w-full">
                    Save Preferences
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          </ShowcaseCard>

          {/* 6. Popover */}
          <ShowcaseCard
            id="popover"
            title="Popover"
            category="Feedback"
            description="Displays rich floating interactive content in a portal, triggered by a button."
            docsSlug="popover"
            importSnippet={`import { Popover, PopoverTrigger, PopoverContent } from "@celestia-project/ui"`}
            codeExample={POPOVER_CODE}
          >
            <Popover>
              <PopoverTrigger render={<Button variant="outline" size="sm" />}>
                Customize Metrics
              </PopoverTrigger>
              <PopoverContent className="w-72 p-4">
                <div className="flex flex-col gap-2.5">
                  <h4 className="text-xs font-medium text-foreground">Active Telemetry</h4>
                  <p className="text-[11px] text-muted-foreground">
                    Set the automated sampling rate for distributed trace spans.
                  </p>
                  <div className="flex flex-col gap-1 pt-1">
                    <Label className="text-[11px]">Sampling Rate</Label>
                    <Input defaultValue="100%" className="h-7 text-xs" />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </ShowcaseCard>

          {/* 7. Tooltip */}
          <ShowcaseCard
            id="tooltip"
            title="Tooltip"
            category="Feedback"
            description="A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it."
            docsSlug="tooltip"
            importSnippet={`import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "@celestia-project/ui"`}
            codeExample={TOOLTIP_CODE}
          >
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger render={<Button variant="outline" size="icon-sm" />}>
                  <SparkleIcon className="size-4 text-amber-400" weight="fill" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>AI Query Optimization Enabled</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger render={<Button variant="secondary" size="sm" />}>
                  Hover for shortcut
                </TooltipTrigger>
                <TooltipContent>
                  <p>Press ⌘K to open command menu</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </ShowcaseCard>

          {/* 8. Hover Card */}
          <ShowcaseCard
            id="hover-card"
            title="Hover Card"
            category="Feedback"
            description="For sighted users to preview content available behind a link or user profile."
            docsSlug="hover-card"
            importSnippet={`import { HoverCard, HoverCardTrigger, HoverCardContent } from "@celestia-project/ui"`}
            codeExample={HOVER_CARD_CODE}
          >
            <HoverCard>
              <HoverCardTrigger render={<span className="text-xs font-medium underline underline-offset-4 cursor-pointer hover:text-primary" />}>
                @celestia-core
              </HoverCardTrigger>
              <HoverCardContent className="w-80 p-4">
                <div className="flex justify-between space-x-4">
                  <Avatar className="size-10">
                    <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" />
                    <AvatarFallback>CC</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h4 className="text-xs font-medium">Celestia Framework</h4>
                    <p className="text-[11px] text-muted-foreground">
                      The Next.js 16 + Hono fullstack monorepo starter with decoupled architecture.
                    </p>
                    <div className="flex items-center pt-1 text-[10px] text-muted-foreground">
                      <span>Joined August 2026</span>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </ShowcaseCard>

          {/* 9. Progress */}
          <ShowcaseCard
            id="progress"
            title="Progress"
            category="Feedback"
            description="Displays an indicator showing the completion progress of a task."
            docsSlug="progress"
            importSnippet={`import { Progress } from "@celestia-project/ui"`}
            codeExample={PROGRESS_CODE}
          >
            <div className="flex w-full max-w-sm flex-col gap-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Migration Status</span>
                <span className="font-mono font-medium">{progressVal}%</span>
              </div>
              <Progress value={progressVal} className="w-full" />
              <div className="flex justify-end gap-2">
                <Button size="xs" variant="outline" onClick={() => setProgressVal(Math.max(0, progressVal - 15))}>-15%</Button>
                <Button size="xs" variant="outline" onClick={() => setProgressVal(Math.min(100, progressVal + 15))}>+15%</Button>
              </div>
            </div>
          </ShowcaseCard>

          {/* 10. Spinner */}
          <ShowcaseCard
            id="spinner"
            title="Spinner"
            category="Feedback"
            description="Smoothly animated SVG loading spinner indicator for buttons and suspense fallbacks."
            docsSlug="spinner"
            importSnippet={`import { Spinner } from "@celestia-project/ui"`}
            codeExample={SPINNER_CODE}
          >
            <div className="flex items-center justify-center gap-6">
              <div className="flex flex-col items-center gap-1.5">
                <Spinner className="size-4 text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">Small</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Spinner className="size-6 text-primary" />
                <span className="text-[10px] text-muted-foreground">Medium</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <Spinner className="size-8 text-sky-500" />
                <span className="text-[10px] text-muted-foreground">Large</span>
              </div>
            </div>
          </ShowcaseCard>
        </div>
      </div>
    </TooltipProvider>
  )
}
