"use client"

export * from "./ai-previews"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@celestia-project/ui/primitive/accordion"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@celestia-project/ui/primitive/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@celestia-project/ui/composite/alert-dialog"
import { AspectRatio } from "@celestia-project/ui/primitive/aspect-ratio"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@celestia-project/ui/primitive/avatar"
import { Badge } from "@celestia-project/ui/primitive/badge"
import { BlockTextEditor } from "@celestia-project/ui/composite/block-text-editor"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@celestia-project/ui/primitive/breadcrumb"
import { Button } from "@celestia-project/ui/primitive/button"
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@celestia-project/ui/composite/button-group"
import { Calendar } from "@celestia-project/ui/primitive/calendar"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@celestia-project/ui/primitive/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@celestia-project/ui/primitive/carousel"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@celestia-project/ui/composite/chart"
import { ChartArea } from "@celestia-project/ui/composite/chart-area"
import { ChartPie } from "@celestia-project/ui/composite/chart-pie"
import { ChartSparkline } from "@celestia-project/ui/composite/chart-sparkline"
import { Checkbox } from "@celestia-project/ui/primitive/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@celestia-project/ui/primitive/collapsible"
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@celestia-project/ui/composite/combobox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@celestia-project/ui/primitive/command"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@celestia-project/ui/primitive/context-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@celestia-project/ui/primitive/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@celestia-project/ui/primitive/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@celestia-project/ui/primitive/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@celestia-project/ui/composite/empty"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@celestia-project/ui/composite/field"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@celestia-project/ui/primitive/hover-card"
import { Input } from "@celestia-project/ui/primitive/input"
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from "@celestia-project/ui/composite/input-group"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@celestia-project/ui/primitive/input-otp"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@celestia-project/ui/primitive/item"
import { Kbd, KbdGroup } from "@celestia-project/ui/primitive/kbd"
import { Label } from "@celestia-project/ui/primitive/label"
import {
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuPortal,
  MenuPositioner,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuShortcut,
  MenuSub,
  MenuSubTrigger,
  MenuTrigger,
} from "@celestia-project/ui/composite/menu"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@celestia-project/ui/primitive/menubar"
import {
  NativeSelect,
  NativeSelectOption,
} from "@celestia-project/ui/composite/native-select"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@celestia-project/ui/primitive/navigation-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@celestia-project/ui/composite/pagination"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@celestia-project/ui/primitive/popover"
import { Progress } from "@celestia-project/ui/primitive/progress"
import {
  RadioGroup,
  RadioGroupItem,
} from "@celestia-project/ui/primitive/radio-group"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@celestia-project/ui/primitive/resizable"
import { ScrollArea } from "@celestia-project/ui/primitive/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@celestia-project/ui/primitive/select"
import { Separator } from "@celestia-project/ui/primitive/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@celestia-project/ui/primitive/sheet"
import { Skeleton } from "@celestia-project/ui/primitive/skeleton"
import { Slider } from "@celestia-project/ui/primitive/slider"
import { Toaster, toast } from "@celestia-project/ui/primitive/sonner"
import { Spinner } from "@celestia-project/ui/primitive/spinner"
import { Switch } from "@celestia-project/ui/primitive/switch"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@celestia-project/ui/primitive/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@celestia-project/ui/primitive/tabs"
import { Textarea } from "@celestia-project/ui/primitive/textarea"
import { Toggle } from "@celestia-project/ui/primitive/toggle"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@celestia-project/ui/composite/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@celestia-project/ui/primitive/tooltip"
import {
  ArrowRightIcon,
  BellIcon,
  CalendarBlankIcon,
  ChartLineUpIcon,
  CreditCardIcon,
  CurrencyDollarIcon,
  DownloadSimpleIcon,
  EnvelopeSimpleIcon,
  FigmaLogoIcon,
  FolderIcon,
  FunnelSimpleIcon,
  GearSixIcon,
  GithubLogoIcon,
  GlobeIcon,
  GoogleLogoIcon,
  HashIcon,
  HouseIcon,
  LinkSimpleIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  MegaphoneIcon,
  MoonStarsIcon,
  NoteBlankIcon,
  NotionLogoIcon,
  PaperPlaneTiltIcon,
  PencilSimpleIcon,
  PlusIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  SignOutIcon,
  SlackLogoIcon,
  SparkleIcon,
  SquaresFourIcon,
  StripeLogoIcon,
  TrayIcon,
  TrendDownIcon,
  TrashIcon,
  UserIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react"
import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { AuthShell } from "@celestia-project/ui/composite/auth-shell"
import { PageShell } from "@celestia-project/ui/composite/page-shell"
import { DashboardShell } from "@celestia-project/ui/composite/dashboard-shell"
import { SignInPage } from "@/components/layout-templates/sign-in-page"
import { SignUpPage } from "@/components/layout-templates/sign-up-page"
import { ForgotPasswordPage } from "@/components/layout-templates/forgot-password-page"
import { ResetPasswordPage } from "@/components/layout-templates/reset-password-page"
import { TwoFactorPage } from "@/components/layout-templates/two-factor-page"
import { DashboardPage } from "@/components/layout-templates/dashboard-page"
import { ProfilePage } from "@/components/layout-templates/profile-page"
import { SettingsPage } from "@/components/layout-templates/settings-page"
import { ListPage } from "@/components/layout-templates/list-page"
import { BillingPage } from "@/components/layout-templates/billing-page"
import { StatusPage } from "@/components/layout-templates/status-page"
import { NotFoundPage } from "@/components/layout-templates/not-found-page"
import { ErrorPage } from "@/components/layout-templates/error-page"
import { MarketingShell } from "@celestia-project/ui/composite/marketing-shell"
import { LandingPage } from "@/components/layout-templates/landing-page"
import { PricingPage } from "@/components/layout-templates/pricing-page"
import { BlogIndexPage } from "@/components/layout-templates/blog-index-page"
import { ArticlePage } from "@/components/layout-templates/article-page"
import { InboxPage } from "@/components/layout-templates/inbox-page"
import { ChatPage } from "@/components/layout-templates/chat-page"
import { KanbanPage } from "@/components/layout-templates/kanban-page"
import { CalendarPage } from "@/components/layout-templates/calendar-page"
import { FilesPage } from "@/components/layout-templates/files-page"
import { AnalyticsPage } from "@/components/layout-templates/analytics-page"
import { ReportsPage } from "@/components/layout-templates/reports-page"
import { RecordDetailPage } from "@/components/layout-templates/record-detail-page"
import { SearchPage } from "@/components/layout-templates/search-page"
import { AuditLogPage } from "@/components/layout-templates/audit-log-page"
import { CheckoutPage } from "@/components/layout-templates/checkout-page"
import { InvoicePage } from "@/components/layout-templates/invoice-page"
import { OnboardingPage } from "@/components/layout-templates/onboarding-page"
import { TeamPage } from "@/components/layout-templates/team-page"
import { IntegrationsPage } from "@/components/layout-templates/integrations-page"
import type {
  BillingInvoice,
  BillingPlan,
  BillingUsage,
  DashboardStat,
  ListColumn,
  ProfileMetaItem,
  ProfileStat,
  ProfileTab,
  SettingsSection,
} from "@/components/layout-templates"
import { cn } from "@celestia-project/ui/lib/utils"

function PreviewShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="not-prose border-fd-border bg-fd-card my-4 flex flex-wrap items-center justify-center gap-3 rounded-lg border p-8">
      {children}
    </div>
  )
}

export function AccordionPreview() {
  return (
    <PreviewShell>
      <Accordion className="w-80">
        <AccordionItem value="item-1">
          <AccordionTrigger>Is it accessible?</AccordionTrigger>
          <AccordionContent>
            Yes. It uses Base UI primitives with full keyboard support.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="item-2">
          <AccordionTrigger>Is it styled?</AccordionTrigger>
          <AccordionContent>
            Yes. It comes with default styles that match the design system.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </PreviewShell>
  )
}

export function AlertPreview() {
  return (
    <PreviewShell>
      <div className="flex w-80 flex-col gap-3">
        <Alert>
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>
            You can add components using the CLI.
          </AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Your session has expired. Please log in again.
          </AlertDescription>
        </Alert>
      </div>
    </PreviewShell>
  )
}

export function AlertDialogPreview() {
  return (
    <PreviewShell>
      <AlertDialog>
        <AlertDialogTrigger render={<Button variant="outline" />}>
          Delete post
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PreviewShell>
  )
}

export function AspectRatioPreview() {
  return (
    <PreviewShell>
      <AspectRatio ratio={16 / 9} className="w-80 rounded-lg bg-muted">
        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
          16:9
        </div>
      </AspectRatio>
    </PreviewShell>
  )
}

export function AvatarPreview() {
  return (
    <PreviewShell>
      <Avatar>
        <AvatarImage src="https://github.com/shadcn.png" alt="shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>
          <UserIcon className="size-4" />
        </AvatarFallback>
      </Avatar>
    </PreviewShell>
  )
}

export function BadgePreview() {
  return (
    <PreviewShell>
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="outline">Outline</Badge>
    </PreviewShell>
  )
}

export function BreadcrumbPreview() {
  return (
    <PreviewShell>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#">Components</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Breadcrumb</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </PreviewShell>
  )
}

export function ButtonPreview() {
  return (
    <PreviewShell>
      <Button>Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
      <Button variant="link">Link</Button>
      <Button size="sm">Small</Button>
      <Button size="lg">Large</Button>
      <Button disabled>Disabled</Button>
    </PreviewShell>
  )
}

export function ButtonGroupPreview() {
  return (
    <PreviewShell>
      <ButtonGroup>
        <Button variant="outline">Year</Button>
        <ButtonGroupSeparator />
        <Button variant="outline">Month</Button>
        <ButtonGroupSeparator />
        <Button variant="outline">Day</Button>
      </ButtonGroup>
    </PreviewShell>
  )
}

export function CalendarPreview() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  return (
    <PreviewShell>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border shadow-sm"
      />
    </PreviewShell>
  )
}

export function CardPreview() {
  return (
    <PreviewShell>
      <Card className="w-72">
        <CardHeader>
          <CardTitle>Create project</CardTitle>
          <CardDescription>
            Deploy your new project in one-click.
          </CardDescription>
          <CardAction>
            <Button variant="ghost" size="icon-xs" aria-label="More options">
              ⋯
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-name">Name</Label>
            <Input id="project-name" placeholder="my-project" />
          </div>
        </CardContent>
        <CardFooter className="justify-end gap-2">
          <Button variant="outline">Cancel</Button>
          <Button>Deploy</Button>
        </CardFooter>
      </Card>
    </PreviewShell>
  )
}

export function CarouselPreview() {
  return (
    <PreviewShell>
      <Carousel className="w-64">
        <CarouselContent>
          {[
            "bg-primary/80",
            "bg-primary/60",
            "bg-primary/40",
            "bg-primary/20",
          ].map((color, index) => (
            <CarouselItem key={`${color}`}>
              <div
                className={`flex h-28 items-center justify-center rounded-md text-sm text-primary-foreground ${color}`}
              >
                {index + 1}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </PreviewShell>
  )
}

const chartData = [
  { month: "Jan", desktop: 186 },
  { month: "Feb", desktop: 305 },
  { month: "Mar", desktop: 237 },
  { month: "Apr", desktop: 173 },
  { month: "May", desktop: 209 },
]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartPreview() {
  return (
    <PreviewShell>
      <ChartContainer config={chartConfig} className="h-48 w-full max-w-md">
        <BarChart data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Bar dataKey="desktop" fill="var(--color-desktop)" radius={4} />
        </BarChart>
      </ChartContainer>
    </PreviewShell>
  )
}

const chartKitData = [
  { month: "Jan", revenue: 4200, expenses: 2400 },
  { month: "Feb", revenue: 5100, expenses: 2900 },
  { month: "Mar", revenue: 4800, expenses: 2700 },
  { month: "Apr", revenue: 6200, expenses: 3100 },
  { month: "May", revenue: 5900, expenses: 3300 },
  { month: "Jun", revenue: 7400, expenses: 3600 },
]

const chartKitPie = [
  { name: "Direct", value: 300 },
  { name: "Organic", value: 220 },
  { name: "Referral", value: 140 },
  { name: "Social", value: 90 },
]

export function ChartKitPreview() {
  return (
    <PreviewShell>
      <div className="grid w-full gap-8 md:grid-cols-2">
        <ChartArea
          data={chartKitData}
          xKey="month"
          showLegend
          className="h-56"
        />
        <ChartPie data={chartKitPie} donut className="max-w-56">
          <span className="text-2xl font-bold tabular-nums">750</span>
          <span className="text-xs text-muted-foreground">Visitors</span>
        </ChartPie>
        <ChartSparkline
          data={[12, 18, 9, 22, 15, 27, 19, 31, 24]}
          variant="area"
          className="w-40"
          showDot
        />
      </div>
    </PreviewShell>
  )
}

export function CheckboxPreview() {
  return (
    <PreviewShell>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Checkbox id="checkbox-terms" defaultChecked />
          <Label htmlFor="checkbox-terms">Accept terms and conditions</Label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="checkbox-marketing" />
          <Label htmlFor="checkbox-marketing">Receive marketing emails</Label>
        </div>
      </div>
    </PreviewShell>
  )
}

export function CollapsiblePreview() {
  const [open, setOpen] = useState(false)
  return (
    <PreviewShell>
      <Collapsible open={open} onOpenChange={setOpen} className="w-80">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium">
            @celestia-project/ui starred repositories
          </span>
          <CollapsibleTrigger render={<Button variant="ghost" size="sm" />}>
            {open ? "Close" : "Open"}
          </CollapsibleTrigger>
        </div>
        <div className="mt-2 rounded-md border px-3 py-2 text-sm">
          @workspace/db
        </div>
        <CollapsibleContent>
          <div className="mt-2 flex flex-col gap-2">
            <div className="rounded-md border px-3 py-2 text-sm">
              @celestia-project/ui
            </div>
            <div className="rounded-md border px-3 py-2 text-sm">
              @workspace/cli
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </PreviewShell>
  )
}

export function ComboboxPreview() {
  return (
    <PreviewShell>
      <Combobox>
        <ComboboxInput placeholder="Select a fruit..." className="w-56" />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxItem value="apple">Apple</ComboboxItem>
            <ComboboxItem value="banana">Banana</ComboboxItem>
            <ComboboxItem value="blueberry">Blueberry</ComboboxItem>
            <ComboboxItem value="grape">Grape</ComboboxItem>
            <ComboboxItem value="pineapple">Pineapple</ComboboxItem>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </PreviewShell>
  )
}

export function CommandPreview() {
  return (
    <PreviewShell>
      <Command className="w-72 rounded-lg border shadow-sm">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>Calendar</CommandItem>
            <CommandItem>Search Emoji</CommandItem>
            <CommandItem>Calculator</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              Profile
              <CommandShortcut>⌘P</CommandShortcut>
            </CommandItem>
            <CommandItem>
              Settings
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </PreviewShell>
  )
}

export function ContextMenuPreview() {
  return (
    <PreviewShell>
      <ContextMenu>
        <ContextMenuTrigger className="flex h-32 w-72 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground select-none">
          Right click here
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem>
            Back
            <ContextMenuShortcut>⌘[</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuItem>
            Reload
            <ContextMenuShortcut>⌘R</ContextMenuShortcut>
          </ContextMenuItem>
          <ContextMenuSeparator />
          <ContextMenuItem variant="destructive">Delete</ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
    </PreviewShell>
  )
}

export function DialogPreview() {
  return (
    <PreviewShell>
      <Dialog>
        <DialogTrigger render={<Button variant="outline" />}>
          Open Dialog
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="dialog-name">Name</Label>
            <Input id="dialog-name" placeholder="Pedro Duarte" />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Cancel
            </DialogClose>
            <Button>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PreviewShell>
  )
}

export function DrawerPreview() {
  return (
    <PreviewShell>
      <Drawer>
        <DrawerTrigger render={<Button variant="outline" />}>
          Open Drawer
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Edit profile</DrawerTitle>
            <DrawerDescription>
              Make changes to your profile here.
            </DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-2 px-4">
            <Label htmlFor="drawer-name">Name</Label>
            <Input id="drawer-name" placeholder="Pedro Duarte" />
          </div>
          <DrawerFooter>
            <Button>Save changes</Button>
            <DrawerClose render={<Button variant="outline" />}>
              Cancel
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </PreviewShell>
  )
}

export function DropdownMenuPreview() {
  return (
    <PreviewShell>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          Open Dropdown
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Profile
            <DropdownMenuShortcut>⌘P</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem>
            Billing
            <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            Log out
            <DropdownMenuShortcut>⇧⌘Q</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </PreviewShell>
  )
}

export function EmptyPreview() {
  return (
    <PreviewShell>
      <Empty className="w-80 rounded-lg border">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <NoteBlankIcon />
          </EmptyMedia>
          <EmptyTitle>No posts yet</EmptyTitle>
          <EmptyDescription>
            Create your first post to get started.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button>New Post</Button>
        </EmptyContent>
      </Empty>
    </PreviewShell>
  )
}

export function FieldPreview() {
  return (
    <PreviewShell>
      <FieldGroup className="w-72">
        <Field>
          <FieldLabel htmlFor="field-email">Email</FieldLabel>
          <Input id="field-email" type="email" placeholder="you@example.com" />
          <FieldDescription>
            We&apos;ll never share your email.
          </FieldDescription>
        </Field>
        <Field data-invalid="true">
          <FieldLabel htmlFor="field-username">Username</FieldLabel>
          <Input id="field-username" aria-invalid defaultValue="ab" />
          <FieldError>Username must be at least 3 characters.</FieldError>
        </Field>
      </FieldGroup>
    </PreviewShell>
  )
}

export function HoverCardPreview() {
  return (
    <PreviewShell>
      <HoverCard>
        <HoverCardTrigger render={<a href="#" />}>
          @celestia-project/ui
        </HoverCardTrigger>
        <HoverCardContent>
          <div className="flex gap-3">
            <Avatar>
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">@celestia-project/ui</span>
              <p className="text-xs text-muted-foreground">
                A shared component library built on Base UI and Tailwind CSS.
              </p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>
    </PreviewShell>
  )
}

export function InputPreview() {
  return (
    <PreviewShell>
      <div className="flex w-64 flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="you@example.com" />
        <Label htmlFor="disabled">Disabled</Label>
        <Input id="disabled" disabled placeholder="Unavailable" />
      </div>
    </PreviewShell>
  )
}

export function InputGroupPreview() {
  return (
    <PreviewShell>
      <InputGroup className="w-64">
        <InputGroupText>$</InputGroupText>
        <InputGroupInput type="number" placeholder="0.00" aria-label="Amount" />
        <InputGroupText>.00</InputGroupText>
      </InputGroup>
    </PreviewShell>
  )
}

export function InputOTPPreview() {
  return (
    <PreviewShell>
      <InputOTP maxLength={6}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
          <InputOTPSlot index={2} />
        </InputOTPGroup>
        <InputOTPSeparator />
        <InputOTPGroup>
          <InputOTPSlot index={3} />
          <InputOTPSlot index={4} />
          <InputOTPSlot index={5} />
        </InputOTPGroup>
      </InputOTP>
    </PreviewShell>
  )
}

export function ItemPreview() {
  return (
    <PreviewShell>
      <ItemGroup className="w-80 rounded-lg border p-2">
        <Item>
          <ItemMedia>
            <Avatar>
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </ItemMedia>
          <ItemContent>
            <ItemTitle>@celestia-project/ui</ItemTitle>
            <ItemDescription>Shared component library</ItemDescription>
          </ItemContent>
          <ItemActions>
            <Button variant="ghost" size="icon-sm" aria-label="More options">
              ⋯
            </Button>
          </ItemActions>
        </Item>
      </ItemGroup>
    </PreviewShell>
  )
}

export function KbdPreview() {
  return (
    <PreviewShell>
      <KbdGroup>
        <Kbd>⌘</Kbd>
        <Kbd>K</Kbd>
      </KbdGroup>
      <KbdGroup>
        <Kbd>Shift</Kbd>
        <span className="text-xs text-muted-foreground">+</span>
        <Kbd>Tab</Kbd>
      </KbdGroup>
    </PreviewShell>
  )
}

export function LabelPreview() {
  return (
    <PreviewShell>
      <div className="flex items-center gap-2">
        <input
          id="terms"
          type="checkbox"
          className="size-3.5 accent-[var(--primary)]"
        />
        <Label htmlFor="terms">Accept terms and conditions</Label>
      </div>
    </PreviewShell>
  )
}

export function MenuPreview() {
  const [showStatusBar, setShowStatusBar] = useState(true)
  const [panel, setPanel] = useState("top")

  return (
    <PreviewShell>
      <Menu>
        <MenuTrigger render={<Button variant="outline" />}>
          Open Menu
        </MenuTrigger>
        <MenuPortal>
          <MenuPositioner sideOffset={8} align="start">
            <MenuPopup>
              <MenuGroup>
                <MenuGroupLabel>Actions</MenuGroupLabel>
                <MenuItem>
                  New Tab
                  <MenuShortcut>⌘T</MenuShortcut>
                </MenuItem>
                <MenuItem>
                  New Window
                  <MenuShortcut>⌘N</MenuShortcut>
                </MenuItem>
                <MenuSub>
                  <MenuSubTrigger>Share</MenuSubTrigger>
                  <MenuPortal>
                    <MenuPositioner sideOffset={4}>
                      <MenuPopup>
                        <MenuItem>Copy Link</MenuItem>
                        <MenuItem>Email</MenuItem>
                        <MenuItem>Message</MenuItem>
                      </MenuPopup>
                    </MenuPositioner>
                  </MenuPortal>
                </MenuSub>
              </MenuGroup>
              <MenuSeparator />
              <MenuCheckboxItem
                checked={showStatusBar}
                onCheckedChange={setShowStatusBar}
              >
                Status Bar
              </MenuCheckboxItem>
              <MenuSeparator />
              <MenuRadioGroup value={panel} onValueChange={setPanel}>
                <MenuRadioItem value="top">Panel Top</MenuRadioItem>
                <MenuRadioItem value="bottom">Panel Bottom</MenuRadioItem>
                <MenuRadioItem value="right">Panel Right</MenuRadioItem>
              </MenuRadioGroup>
              <MenuSeparator />
              <MenuItem variant="destructive">
                Delete
                <MenuShortcut>⌘⌫</MenuShortcut>
              </MenuItem>
            </MenuPopup>
          </MenuPositioner>
        </MenuPortal>
      </Menu>
    </PreviewShell>
  )
}

export function MenubarPreview() {
  return (
    <PreviewShell>
      <Menubar>
        <MenubarMenu>
          <MenubarTrigger>File</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              New Tab
              <MenubarShortcut>⌘T</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              New Window
              <MenubarShortcut>⌘N</MenubarShortcut>
            </MenubarItem>
            <MenubarSeparator />
            <MenubarItem>Print</MenubarItem>
          </MenubarContent>
        </MenubarMenu>
        <MenubarMenu>
          <MenubarTrigger>Edit</MenubarTrigger>
          <MenubarContent>
            <MenubarItem>
              Undo
              <MenubarShortcut>⌘Z</MenubarShortcut>
            </MenubarItem>
            <MenubarItem>
              Redo
              <MenubarShortcut>⇧⌘Z</MenubarShortcut>
            </MenubarItem>
          </MenubarContent>
        </MenubarMenu>
      </Menubar>
    </PreviewShell>
  )
}

export function NativeSelectPreview() {
  return (
    <PreviewShell>
      <NativeSelect aria-label="Fruit">
        <NativeSelectOption value="apple">Apple</NativeSelectOption>
        <NativeSelectOption value="banana">Banana</NativeSelectOption>
        <NativeSelectOption value="blueberry">Blueberry</NativeSelectOption>
        <NativeSelectOption value="grape">Grape</NativeSelectOption>
      </NativeSelect>
    </PreviewShell>
  )
}

export function NavigationMenuPreview() {
  return (
    <PreviewShell>
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>Docs</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid w-56 gap-1 p-2">
                <li>
                  <NavigationMenuLink>Components</NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink>Authentication</NavigationMenuLink>
                </li>
                <li>
                  <NavigationMenuLink>Backend</NavigationMenuLink>
                </li>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink>GitHub</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </PreviewShell>
  )
}

export function PaginationPreview() {
  return (
    <PreviewShell>
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious href="#" />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#" isActive>
              2
            </PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink href="#">3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationNext href="#" />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </PreviewShell>
  )
}

export function BlockTextEditorPreview() {
  const [content, setContent] = useState(`# Launch Notes

Draft content as draggable markdown blocks. Double-click a section to edit it inline.

- [x] Design review shipped
- [ ] Write the changelog
- [ ] Schedule the announcement

> Hover a block and use the handle to reorder it.
`)

  return (
    <PreviewShell>
      <div className="border-fd-border w-full max-w-xl overflow-hidden rounded-lg border bg-background">
        <BlockTextEditor
          content={content}
          onUpdateContent={setContent}
          className="h-72"
        />
      </div>
    </PreviewShell>
  )
}

export function PopoverPreview() {
  return (
    <PreviewShell>
      <Popover>
        <PopoverTrigger render={<Button variant="outline" />}>
          Open Popover
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <PopoverHeader>
            <PopoverTitle>Dimensions</PopoverTitle>
            <PopoverDescription>
              Set the dimensions for the layer.
            </PopoverDescription>
          </PopoverHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="popover-width">Width</Label>
            <Input id="popover-width" defaultValue="100%" />
          </div>
        </PopoverContent>
      </Popover>
    </PreviewShell>
  )
}

export function ProgressPreview() {
  return (
    <PreviewShell>
      <Progress value={60} className="w-64" />
    </PreviewShell>
  )
}

export function RadioGroupPreview() {
  return (
    <PreviewShell>
      <RadioGroup defaultValue="comfortable" aria-label="Density">
        <div className="flex items-center gap-2">
          <RadioGroupItem value="default" id="radio-default" />
          <Label htmlFor="radio-default">Default</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="comfortable" id="radio-comfortable" />
          <Label htmlFor="radio-comfortable">Comfortable</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="compact" id="radio-compact" />
          <Label htmlFor="radio-compact">Compact</Label>
        </div>
      </RadioGroup>
    </PreviewShell>
  )
}

export function ResizablePreview() {
  return (
    <PreviewShell>
      <ResizablePanelGroup
        orientation="horizontal"
        className="min-h-40 w-full max-w-md rounded-lg border"
      >
        <ResizablePanel defaultSize={40}>
          <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
            Sidebar
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={60}>
          <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
            Content
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </PreviewShell>
  )
}

export function ScrollAreaPreview() {
  return (
    <PreviewShell>
      <ScrollArea className="h-36 w-72 rounded-md border p-4">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 10 }, (_, i) => (
            <div key={i} className="text-sm text-muted-foreground">
              Item {i + 1} — scroll to see more content in this region.
            </div>
          ))}
        </div>
      </ScrollArea>
    </PreviewShell>
  )
}

export function SelectPreview() {
  return (
    <PreviewShell>
      <Select defaultValue="apple">
        <SelectTrigger className="w-56">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="blueberry">Blueberry</SelectItem>
          <SelectItem value="grape">Grape</SelectItem>
          <SelectItem value="pineapple">Pineapple</SelectItem>
        </SelectContent>
      </Select>
    </PreviewShell>
  )
}

export function SeparatorPreview() {
  return (
    <PreviewShell>
      <div className="w-72">
        <div className="text-sm font-medium">Celestia Starter</div>
        <p className="text-sm text-muted-foreground">
          A monorepo starter with auth, dashboard, and blog features.
        </p>
        <Separator className="my-3" />
        <div className="flex h-5 items-center gap-3 text-sm">
          <div>Docs</div>
          <Separator orientation="vertical" />
          <div>Components</div>
          <Separator orientation="vertical" />
          <div>CLI</div>
        </div>
      </div>
    </PreviewShell>
  )
}

export function SheetPreview() {
  return (
    <PreviewShell>
      <Sheet>
        <SheetTrigger render={<Button variant="outline" />}>
          Open Sheet
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Edit profile</SheetTitle>
            <SheetDescription>
              Make changes to your profile here. Click save when you&apos;re
              done.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sheet-name">Name</Label>
            <Input id="sheet-name" placeholder="Pedro Duarte" />
          </div>
          <SheetFooter>
            <SheetClose render={<Button variant="outline" />}>
              Cancel
            </SheetClose>
            <Button>Save changes</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </PreviewShell>
  )
}

export function SkeletonPreview() {
  return (
    <PreviewShell>
      <div className="flex w-72 items-center gap-3 rounded-lg border p-4">
        <Skeleton className="size-10 rounded-full" />
        <div className="flex flex-1 flex-col gap-2">
          <Skeleton className="h-3 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    </PreviewShell>
  )
}

export function SliderPreview() {
  return (
    <PreviewShell>
      <Slider
        defaultValue={[50]}
        max={100}
        step={1}
        className="w-64"
        aria-label="Volume"
      />
    </PreviewShell>
  )
}

export function SonnerPreview() {
  return (
    <PreviewShell>
      <Toaster />
      <Button
        variant="outline"
        onClick={() =>
          toast("Event has been created", {
            description: "Sunday, December 03rd at 10:00 AM",
          })
        }
      >
        <BellIcon data-icon="inline-start" />
        Show Toast
      </Button>
    </PreviewShell>
  )
}

export function SpinnerPreview() {
  return (
    <PreviewShell>
      <Spinner />
      <Button disabled>
        <Spinner data-icon="inline-start" />
        Loading
      </Button>
    </PreviewShell>
  )
}

export function SwitchPreview() {
  return (
    <PreviewShell>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Switch id="switch-airplane" />
          <Label htmlFor="switch-airplane">Airplane mode</Label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="switch-wifi" defaultChecked />
          <Label htmlFor="switch-wifi">Wi-Fi</Label>
        </div>
      </div>
    </PreviewShell>
  )
}

export function TablePreview() {
  return (
    <PreviewShell>
      <Table className="w-96">
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-24">Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead className="text-end">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">INV-001</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Credit Card</TableCell>
            <TableCell className="text-end">$250.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">INV-002</TableCell>
            <TableCell>Pending</TableCell>
            <TableCell>PayPal</TableCell>
            <TableCell className="text-end">$150.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">INV-003</TableCell>
            <TableCell>Unpaid</TableCell>
            <TableCell>Bank Transfer</TableCell>
            <TableCell className="text-end">$350.00</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </PreviewShell>
  )
}

export function TabsPreview() {
  return (
    <PreviewShell>
      <Tabs defaultValue="account" className="w-80">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="account">
          <p className="py-3 text-sm text-muted-foreground">
            Make changes to your account here.
          </p>
        </TabsContent>
        <TabsContent value="password">
          <p className="py-3 text-sm text-muted-foreground">
            Change your password here.
          </p>
        </TabsContent>
      </Tabs>
      <Tabs defaultValue="account">
        <TabsList size="sm">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
      </Tabs>
      <Tabs defaultValue="account">
        <TabsList size="lg">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="password">Password</TabsTrigger>
        </TabsList>
      </Tabs>
    </PreviewShell>
  )
}

export function TextareaPreview() {
  return (
    <PreviewShell>
      <div className="flex w-72 flex-col gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" placeholder="Type your message here." />
        <Textarea id="message-disabled" disabled placeholder="Unavailable" />
      </div>
    </PreviewShell>
  )
}

export function TogglePreview() {
  return (
    <PreviewShell>
      <Toggle aria-label="Toggle bold">B</Toggle>
      <Toggle aria-label="Toggle italic" variant="outline">
        I
      </Toggle>
      <Toggle aria-label="Toggle disabled" disabled>
        D
      </Toggle>
    </PreviewShell>
  )
}

export function ToggleGroupPreview() {
  return (
    <PreviewShell>
      <ToggleGroup defaultValue={["center"]} aria-label="Text alignment">
        <ToggleGroupItem value="left">Left</ToggleGroupItem>
        <ToggleGroupItem value="center">Center</ToggleGroupItem>
        <ToggleGroupItem value="right">Right</ToggleGroupItem>
      </ToggleGroup>
    </PreviewShell>
  )
}

export function TooltipPreview() {
  return (
    <PreviewShell>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger render={<Button variant="outline" />}>
            Hover me
          </TooltipTrigger>
          <TooltipContent>Add to library</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </PreviewShell>
  )
}

function ColorSwatch({
  label,
  className,
  value,
}: Readonly<{ label: string; className: string; value?: string }>) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`border-fd-border size-10 shrink-0 rounded-lg border ${className}`}
      />
      <div className="flex flex-col">
        <span className="text-sm font-medium">{label}</span>
        {value && (
          <span className="font-mono text-xs text-muted-foreground">
            {value}
          </span>
        )}
      </div>
    </div>
  )
}

export function ColorsPreview() {
  return (
    <PreviewShell>
      <div className="grid w-full max-w-3xl gap-8">
        {/* Landing tokens */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm">Landing Tokens</h4>
          <div className="grid gap-3 rounded-lg bg-[#0a0a0a] p-4 sm:grid-cols-2">
            <ColorSwatch label="bg" className="bg-[#0a0a0a]" value="#0a0a0a" />
            <ColorSwatch
              label="surface"
              className="bg-[#141414]"
              value="#141414"
            />
            <ColorSwatch
              label="text-primary"
              className="bg-[#f5f5f5]"
              value="#f5f5f5"
            />
            <ColorSwatch label="fog" className="bg-[#878787]" value="#878787" />
            <ColorSwatch
              label="stroke"
              className="bg-[#262626]"
              value="#262626"
            />
          </div>
        </div>

        {/* Brand accent */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm">Brand Accent</h4>
          <div className="border-fd-border flex items-center gap-3 rounded-lg border p-4">
            <div
              className="h-10 w-20 shrink-0 rounded-lg"
              style={{
                background: "linear-gradient(90deg, #dc2626 0%, #b51230 100%)",
              }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium">accent-gradient</span>
              <span className="font-mono text-xs text-muted-foreground">
                #dc2626 → #b51230
              </span>
            </div>
          </div>
        </div>

        {/* Semantic tokens */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm">Semantic Tokens</h4>
          <div className="border-fd-border grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
            <ColorSwatch
              label="background"
              className="bg-background"
              value="oklch(1 0 0)"
            />
            <ColorSwatch
              label="foreground"
              className="bg-foreground"
              value="oklch(0.145 0 0)"
            />
            <ColorSwatch
              label="primary"
              className="bg-primary"
              value="oklch(0.55 0.22 27)"
            />
            <ColorSwatch
              label="secondary"
              className="bg-secondary"
              value="oklch(0.97 0 0)"
            />
            <ColorSwatch
              label="muted"
              className="bg-muted"
              value="oklch(0.97 0 0)"
            />
            <ColorSwatch
              label="accent"
              className="bg-accent"
              value="oklch(0.97 0 0)"
            />
            <ColorSwatch
              label="destructive"
              className="bg-destructive"
              value="oklch(0.577 0.245 27.325)"
            />
            <ColorSwatch
              label="border"
              className="bg-border"
              value="oklch(0.922 0 0)"
            />
          </div>
        </div>

        {/* Chart colors */}
        <div className="flex flex-col gap-3">
          <h4 className="text-sm">Chart Colors</h4>
          <div className="border-fd-border flex gap-2 rounded-lg border p-4">
            <div className="text-chart-1-foreground flex h-10 flex-1 items-center justify-center rounded-md bg-chart-1 text-xs font-medium">
              1
            </div>
            <div className="text-chart-2-foreground flex h-10 flex-1 items-center justify-center rounded-md bg-chart-2 text-xs font-medium">
              2
            </div>
            <div className="text-chart-3-foreground flex h-10 flex-1 items-center justify-center rounded-md bg-chart-3 text-xs font-medium">
              3
            </div>
            <div className="text-chart-4-foreground flex h-10 flex-1 items-center justify-center rounded-md bg-chart-4 text-xs font-medium">
              4
            </div>
            <div className="text-chart-5-foreground flex h-10 flex-1 items-center justify-center rounded-md bg-chart-5 text-xs font-medium">
              5
            </div>
          </div>
        </div>
      </div>
    </PreviewShell>
  )
}

// ─── Layout & Pages previews ────────────────────────────────────────────────
// Layout components are full pages, so unlike PreviewShell they render
// edge-to-edge inside a fixed-height frame instead of floating on padding.

function LayoutPreviewShell({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "not-prose border-fd-border w-full overflow-hidden rounded-lg border bg-background",
        className
      )}
    >
      {children}
    </div>
  )
}

const noop = () => undefined

function LayoutBrandMark() {
  return (
    <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
      <MoonStarsIcon className="size-5" weight="fill" />
    </div>
  )
}

const LAYOUT_PROJECT_ROWS = [
  {
    id: "prj_01",
    name: "Atlas API",
    meta: "Deployed 12 minutes ago",
    status: "Live",
  },
  {
    id: "prj_02",
    name: "Nebula Web",
    meta: "Build queued",
    status: "Building",
  },
  {
    id: "prj_03",
    name: "Comet CLI",
    meta: "Last release v2.4.1",
    status: "Stable",
  },
  {
    id: "prj_04",
    name: "Orbit Mobile",
    meta: "Review pending",
    status: "Draft",
  },
]

function LayoutProjectCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {LAYOUT_PROJECT_ROWS.map((row) => (
        <div
          key={row.id}
          className="rounded-lg border border-border/70 bg-card p-3"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium">{row.name}</span>
            <Badge variant="secondary">{row.status}</Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{row.meta}</p>
        </div>
      ))}
    </div>
  )
}

const LAYOUT_SOCIAL_PROVIDERS = [
  {
    id: "google",
    label: "Google",
    icon: <GoogleLogoIcon className="size-4" />,
  },
  {
    id: "github",
    label: "GitHub",
    icon: <GithubLogoIcon className="size-4" />,
  },
]

const LAYOUT_NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: HouseIcon, active: true },
  { id: "analytics", label: "Analytics", icon: ChartLineUpIcon, active: false },
  { id: "projects", label: "Projects", icon: SquaresFourIcon, active: false },
  { id: "team", label: "Team", icon: UsersThreeIcon, active: false },
  { id: "settings", label: "Settings", icon: GearSixIcon, active: false },
]

function LayoutDashboardNav() {
  return (
    <nav className="flex flex-col gap-1">
      {LAYOUT_NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          type="button"
          aria-label={item.label}
          title={item.label}
          className={cn(
            "flex items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:justify-start",
            item.active
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
          )}
        >
          <item.icon className="size-4 shrink-0" />
          <span className="hidden md:inline">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

const LAYOUT_ACTIVITY = [
  { id: "1", who: "Nadia", what: "deployed Atlas API", when: "12m" },
  { id: "2", who: "Sam", what: "opened a pull request", when: "48m" },
  { id: "3", who: "Ravi", what: "invited 3 teammates", when: "2h" },
  { id: "4", who: "Ada", what: "changed the billing plan", when: "5h" },
]

function LayoutActivityList() {
  return (
    <div className="flex flex-col gap-3">
      {LAYOUT_ACTIVITY.map((entry) => (
        <div key={entry.id} className="flex items-start gap-2">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted text-3xs font-medium text-muted-foreground">
            {entry.who.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1 text-xs">
            <span className="font-medium">{entry.who}</span>{" "}
            <span className="text-muted-foreground">{entry.what}</span>
          </span>
          <span className="shrink-0 text-3xs text-muted-foreground tabular-nums">
            {entry.when}
          </span>
        </div>
      ))}
    </div>
  )
}

export function AuthShellPreview() {
  return (
    <div className="not-prose flex w-full flex-col gap-3">
      <LayoutPreviewShell className="h-[21rem]">
        <AuthShell
          className="h-full min-h-0"
          maxWidth="sm"
          logo={<LayoutBrandMark />}
          heading="Celestia"
          subheading="The design system that ships itself."
          aside={
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="w-full">
                <GoogleLogoIcon className="size-4" />
                Google
              </Button>
              <Button variant="outline" className="w-full">
                <GithubLogoIcon className="size-4" />
                GitHub
              </Button>
            </div>
          }
          footer={
            <>
              By continuing you agree to our{" "}
              <span className="font-medium text-foreground">
                Terms of Service
              </span>
            </>
          }
        >
          <Button className="w-full">Continue with email</Button>
        </AuthShell>
      </LayoutPreviewShell>
      <LayoutPreviewShell className="h-[22rem]">
        <AuthShell
          className="h-full min-h-0"
          variant="split"
          maxWidth="sm"
          logo={<LayoutBrandMark />}
          heading="Welcome back"
          subheading="Sign in to your account to continue"
          sidePanel={
            <div className="flex h-full flex-col justify-end gap-3 p-10">
              <blockquote className="text-lg leading-snug font-medium tracking-tight text-foreground">
                “Celestia cut our design-to-ship time in half.”
              </blockquote>
              <p className="text-sm text-muted-foreground">
                Ada Lin — Head of Product, Northwind
              </p>
            </div>
          }
        >
          <Button className="w-full">Continue with email</Button>
        </AuthShell>
      </LayoutPreviewShell>
    </div>
  )
}

export function SignInPagePreview() {
  return (
    <LayoutPreviewShell className="h-[30rem]">
      <SignInPage
        className="h-full min-h-0"
        socialProviders={LAYOUT_SOCIAL_PROVIDERS}
        onSocialProviderClick={noop}
        onForgotPassword={noop}
        onSignUp={noop}
        onSubmit={noop}
      />
    </LayoutPreviewShell>
  )
}

export function SignUpPagePreview() {
  return (
    <LayoutPreviewShell className="h-[32rem]">
      <SignUpPage
        className="h-full min-h-0"
        termsLabel="I agree to the terms and privacy policy"
        onSignIn={noop}
        onSubmit={noop}
      />
    </LayoutPreviewShell>
  )
}

export function ForgotPasswordPagePreview() {
  const [sent, setSent] = useState(false)

  return (
    <LayoutPreviewShell className="h-[26rem]">
      <ForgotPasswordPage
        className="h-full min-h-0"
        sent={sent}
        onSubmit={() => setSent(true)}
        onBack={() => setSent(false)}
      />
    </LayoutPreviewShell>
  )
}

export function ResetPasswordPagePreview() {
  return (
    <LayoutPreviewShell className="h-[26rem]">
      <ResetPasswordPage className="h-full min-h-0" onSubmit={noop} />
    </LayoutPreviewShell>
  )
}

export function TwoFactorPagePreview() {
  return (
    <LayoutPreviewShell className="h-[26rem]">
      <TwoFactorPage
        className="h-full min-h-0"
        onBack={noop}
        onResend={noop}
        onSubmit={noop}
      />
    </LayoutPreviewShell>
  )
}

export function PageShellPreview() {
  return (
    <LayoutPreviewShell className="h-[24rem]">
      <PageShell
        className="h-full"
        title="Projects"
        description="Everything your team is building this quarter."
        width="lg"
        actions={
          <>
            <Button variant="outline" size="sm">
              Import
            </Button>
            <Button size="sm">New project</Button>
          </>
        }
      >
        <LayoutProjectCards />
      </PageShell>
    </LayoutPreviewShell>
  )
}

export function DashboardShellPreview() {
  return (
    <LayoutPreviewShell className="h-[30rem]">
      <DashboardShell
        className="h-full min-h-0"
        contentWidth="xl"
        brand={
          <span className="flex items-center gap-2 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <MoonStarsIcon className="size-4" weight="fill" />
            </span>
            <span className="hidden text-sm md:inline">Celestia</span>
          </span>
        }
        nav={<LayoutDashboardNav />}
        navFooter={
          <div className="flex items-center justify-center gap-2 md:justify-start">
            <Avatar>
              <AvatarFallback>AL</AvatarFallback>
            </Avatar>
            <span className="hidden min-w-0 flex-col md:flex">
              <span className="truncate text-xs font-medium">Ada Lin</span>
              <span className="truncate text-3xs text-muted-foreground">
                ada@northwind.dev
              </span>
            </span>
          </div>
        }
        header={
          <>
            <span className="text-sm font-medium">Overview</span>
            <div className="ms-auto flex items-center gap-1">
              <Button variant="ghost" size="icon-sm" title="Search">
                <MagnifyingGlassIcon />
              </Button>
              <Button variant="ghost" size="icon-sm" title="Notifications">
                <BellIcon />
              </Button>
            </div>
          </>
        }
        aside={
          <>
            <span className="text-xs font-medium">Activity</span>
            <LayoutActivityList />
          </>
        }
      >
        <LayoutProjectCards />
      </DashboardShell>
    </LayoutPreviewShell>
  )
}

const LAYOUT_STATS: DashboardStat[] = [
  {
    id: "mrr",
    label: "Monthly revenue",
    value: "$48,290",
    delta: "+12.4%",
    trend: "up",
    hint: "vs. last month",
    icon: <ChartLineUpIcon />,
  },
  {
    id: "users",
    label: "Active users",
    value: "12,847",
    delta: "+3.1%",
    trend: "up",
    hint: "vs. last month",
    icon: <UsersThreeIcon />,
  },
  {
    id: "churn",
    label: "Churn",
    value: "1.8%",
    delta: "-0.4%",
    trend: "down",
    hint: "vs. last month",
    icon: <TrendDownIcon />,
  },
  {
    id: "uptime",
    label: "Uptime",
    value: "99.98%",
    delta: "0.0%",
    trend: "flat",
    hint: "last 30 days",
    icon: <ShieldCheckIcon />,
  },
]

export function DashboardPagePreview() {
  return (
    <LayoutPreviewShell className="h-[30rem] overflow-y-auto">
      <DashboardPage
        className="h-full"
        title="Overview"
        description="Everything happening across your workspace."
        width="xl"
        statColumns={4}
        stats={LAYOUT_STATS}
        actions={
          <>
            <Button variant="outline" size="sm">
              Export
            </Button>
            <Button size="sm">
              <PlusIcon />
              New project
            </Button>
          </>
        }
        aside={
          <Card size="sm">
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <LayoutActivityList />
            </CardContent>
          </Card>
        }
      >
        <Card>
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              Everything your team is building this quarter.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LayoutProjectCards />
          </CardContent>
        </Card>
      </DashboardPage>
    </LayoutPreviewShell>
  )
}

const LAYOUT_PROFILE_META: ProfileMetaItem[] = [
  { id: "email", icon: <EnvelopeSimpleIcon />, label: "ada@northwind.dev" },
  { id: "location", icon: <MapPinIcon />, label: "Lisbon, Portugal" },
  { id: "site", icon: <LinkSimpleIcon />, label: "ada.northwind.dev" },
  { id: "joined", icon: <CalendarBlankIcon />, label: "Joined March 2023" },
]

const LAYOUT_PROFILE_STATS: ProfileStat[] = [
  { id: "posts", value: "128", label: "posts" },
  { id: "followers", value: "4.2k", label: "followers" },
  { id: "projects", value: "17", label: "projects" },
]

const LAYOUT_PROFILE_TABS: ProfileTab[] = [
  { id: "overview", label: "Overview", icon: <SquaresFourIcon /> },
  { id: "activity", label: "Activity", icon: <ChartLineUpIcon />, count: 24 },
  { id: "settings", label: "Preferences", icon: <GearSixIcon /> },
]

export function ProfilePagePreview() {
  return (
    <LayoutPreviewShell className="h-[30rem] overflow-y-auto">
      <ProfilePage
        name="Ada Lin"
        handle="@ada · ada@northwind.dev"
        headline="Head of Product"
        bio="Building the design system that ships itself. Previously platform at Northwind — now making sure the next team does not have to rewrite the button."
        avatarFallback="AL"
        badge={<Badge variant="secondary">Pro</Badge>}
        meta={LAYOUT_PROFILE_META}
        stats={LAYOUT_PROFILE_STATS}
        actions={
          <>
            <Button variant="outline" size="sm">
              <LinkSimpleIcon />
              Copy link
            </Button>
            <Button size="sm">
              <PencilSimpleIcon />
              Edit profile
            </Button>
          </>
        }
        tabs={LAYOUT_PROFILE_TABS}
        defaultValue="overview"
      >
        <LayoutProjectCards />
      </ProfilePage>
    </LayoutPreviewShell>
  )
}

function LayoutSettingRow({
  label,
  description,
  children,
}: {
  label: string
  description?: string
  children: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-6 rounded-lg border border-border/70 bg-card p-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs font-medium">{label}</span>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

const LAYOUT_SETTING_SECTIONS: SettingsSection[] = [
  {
    id: "general",
    label: "General",
    description: "Workspace identity and defaults.",
    icon: <GearSixIcon />,
    content: (
      <div className="flex flex-col gap-3">
        <LayoutSettingRow
          label="Workspace name"
          description="Shown to every member."
        >
          <Input defaultValue="Northwind" className="w-44" />
        </LayoutSettingRow>
        <LayoutSettingRow
          label="Product updates"
          description="A monthly digest of what shipped."
        >
          <Switch defaultChecked />
        </LayoutSettingRow>
      </div>
    ),
  },
  {
    id: "security",
    label: "Security",
    description: "Sign-in and session policy.",
    icon: <ShieldCheckIcon />,
    content: (
      <div className="flex flex-col gap-3">
        <LayoutSettingRow
          label="Two-factor authentication"
          description="Require a code at every sign-in."
        >
          <Switch defaultChecked />
        </LayoutSettingRow>
        <LayoutSettingRow
          label="Active sessions"
          description="3 devices signed in."
        >
          <Button variant="outline" size="sm">
            <SignOutIcon />
            Sign out all
          </Button>
        </LayoutSettingRow>
      </div>
    ),
  },
  {
    id: "danger",
    label: "Danger zone",
    description: "Irreversible actions.",
    icon: <TrashIcon />,
    danger: true,
    content: (
      <div className="flex flex-col gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-destructive">
            Delete this workspace
          </span>
          <span className="text-xs text-muted-foreground">
            Every project, post and member will be removed. This cannot be
            undone.
          </span>
        </div>
        <Button variant="destructive" size="sm" className="self-start">
          <TrashIcon />
          Delete workspace
        </Button>
      </div>
    ),
  },
]

export function SettingsPagePreview() {
  return (
    <LayoutPreviewShell className="h-[30rem] overflow-y-auto">
      <SettingsPage
        title="Settings"
        description="Manage your workspace, plan and security policy."
        sections={LAYOUT_SETTING_SECTIONS}
        actions={<Button size="sm">Save changes</Button>}
      />
    </LayoutPreviewShell>
  )
}

const LAYOUT_LIST_ROWS = [
  {
    id: "prj_01",
    name: "Atlas API",
    owner: "Nadia Okonkwo",
    status: "Live",
    updated: "12 minutes ago",
  },
  {
    id: "prj_02",
    name: "Nebula Web",
    owner: "Sam Iversen",
    status: "Building",
    updated: "48 minutes ago",
  },
  {
    id: "prj_03",
    name: "Comet CLI",
    owner: "Ravi Shah",
    status: "Stable",
    updated: "2 hours ago",
  },
  {
    id: "prj_04",
    name: "Orbit Mobile",
    owner: "Ada Lin",
    status: "Draft",
    updated: "5 hours ago",
  },
  {
    id: "prj_05",
    name: "Pulsar Worker",
    owner: "Mira Chen",
    status: "Live",
    updated: "Yesterday",
  },
  {
    id: "prj_06",
    name: "Vega Docs",
    owner: "Tom Ríos",
    status: "Stable",
    updated: "3 days ago",
  },
]

type LayoutListRow = (typeof LAYOUT_LIST_ROWS)[number]

const LAYOUT_LIST_COLUMNS: ListColumn<LayoutListRow>[] = [
  {
    id: "name",
    header: "Project",
    cell: (row) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{row.name}</span>
        <span className="font-mono text-3xs text-muted-foreground">
          {row.id}
        </span>
      </div>
    ),
  },
  {
    id: "owner",
    header: "Owner",
    cell: (row) => <span className="text-muted-foreground">{row.owner}</span>,
  },
  {
    id: "status",
    header: "Status",
    cell: (row) => <Badge variant="secondary">{row.status}</Badge>,
  },
  {
    id: "updated",
    header: "Updated",
    align: "end",
    cell: (row) => (
      <span className="text-muted-foreground tabular-nums">{row.updated}</span>
    ),
  },
]

export function ListPagePreview() {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string[]>(["prj_02"])
  const [page, setPage] = useState(1)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return LAYOUT_LIST_ROWS
    return LAYOUT_LIST_ROWS.filter((row) =>
      [row.name, row.owner, row.status].some((field) =>
        field.toLowerCase().includes(q)
      )
    )
  }, [query])

  return (
    <LayoutPreviewShell className="h-[32rem] overflow-y-auto">
      <ListPage
        title="Projects"
        description="Every project in the Northwind workspace."
        width="xl"
        columns={LAYOUT_LIST_COLUMNS}
        rows={rows}
        rowKey={(row) => row.id}
        search={{
          value: query,
          onValueChange: setQuery,
          placeholder: "Search projects…",
        }}
        filters={
          <Button variant="outline" size="sm">
            <FunnelSimpleIcon />
            Status
          </Button>
        }
        toolbar={
          <Button size="sm">
            <PlusIcon />
            New project
          </Button>
        }
        selectable
        selectedIds={selected}
        onSelectedIdsChange={setSelected}
        page={page}
        pageCount={3}
        onPageChange={setPage}
        totalLabel={`${rows.length} of ${LAYOUT_LIST_ROWS.length} projects${
          selected.length > 0 ? ` · ${selected.length} selected` : ""
        }`}
        empty="No projects match that search."
      />
    </LayoutPreviewShell>
  )
}

const LAYOUT_BILLING_PLAN: BillingPlan = {
  name: "Team",
  badge: <Badge variant="secondary">Current plan</Badge>,
  price: "$96",
  interval: "per month, billed annually",
  description: "12 seats, unlimited projects, 90-day history.",
  features: [
    "Unlimited projects and environments",
    "SSO and SCIM provisioning",
    "Priority support with a 4-hour response",
  ],
}

const LAYOUT_BILLING_USAGE: BillingUsage[] = [
  { id: "seats", label: "Seats", used: 9, limit: 12 },
  {
    id: "builds",
    label: "Build minutes",
    used: 1840,
    limit: 2000,
    format: (used, limit) =>
      `${used.toLocaleString()} / ${limit.toLocaleString()}`,
  },
  {
    id: "storage",
    label: "Artifact storage",
    used: 78,
    limit: 100,
    format: (used, limit) => `${used} GB / ${limit} GB`,
  },
]

const LAYOUT_BILLING_INVOICES: BillingInvoice[] = [
  {
    id: "INV-0091",
    date: "1 Sep 2026",
    amount: "$96.00",
    status: <Badge variant="success">Paid</Badge>,
  },
  {
    id: "INV-0084",
    date: "1 Aug 2026",
    amount: "$96.00",
    status: <Badge variant="success">Paid</Badge>,
  },
  {
    id: "INV-0077",
    date: "1 Jul 2026",
    amount: "$72.00",
    status: <Badge variant="secondary">Refunded</Badge>,
  },
]

export function BillingPagePreview() {
  return (
    <LayoutPreviewShell className="h-[36rem] overflow-y-auto">
      <BillingPage
        title="Billing"
        description="Plan, usage and invoices for the Northwind workspace."
        width="xl"
        plan={LAYOUT_BILLING_PLAN}
        usage={LAYOUT_BILLING_USAGE}
        invoices={LAYOUT_BILLING_INVOICES}
        onManagePlan={noop}
        onUpdatePayment={noop}
        actions={
          <Button variant="outline" size="sm">
            <DownloadSimpleIcon />
            Export
          </Button>
        }
        paymentMethod={
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <CreditCardIcon className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-xs font-medium">Visa ending 4242</span>
              <span className="text-xs text-muted-foreground">
                Expires 04 / 2029
              </span>
            </span>
          </div>
        }
      />
    </LayoutPreviewShell>
  )
}

export function StatusPagePreview() {
  return (
    <LayoutPreviewShell className="h-[22rem]">
      <StatusPage
        className="h-full min-h-0"
        code="403"
        title="You do not have access"
        description="Ask a workspace admin to invite you."
        actionLabel="Back to dashboard"
        onAction={noop}
      />
    </LayoutPreviewShell>
  )
}

export function NotFoundPagePreview() {
  return (
    <LayoutPreviewShell className="h-[22rem]">
      <NotFoundPage
        className="h-full min-h-0"
        onAction={noop}
        secondaryLabel="Contact support"
        onSecondaryAction={noop}
      />
    </LayoutPreviewShell>
  )
}

export function ErrorPagePreview() {
  return (
    <LayoutPreviewShell className="h-[24rem]">
      <ErrorPage
        className="h-full min-h-0"
        detail="digest_8f3a91c2"
        onAction={noop}
        secondaryLabel="Contact support"
        onSecondaryAction={noop}
      />
    </LayoutPreviewShell>
  )
}

// ─── Marketing & content previews ───────────────────────────────────────────

function MarketingLogo() {
  return (
    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
      <span className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
        <MoonStarsIcon className="size-3.5" weight="fill" />
      </span>
      Celestia
    </span>
  )
}

const MARKETING_NAV = ["Product", "Pricing", "Docs", "Blog"]

function MarketingNavLinks() {
  return (
    <>
      {MARKETING_NAV.map((item) => (
        <span
          key={item}
          className="cursor-pointer rounded-md px-2.5 py-1.5 transition-colors hover:text-foreground"
        >
          {item}
        </span>
      ))}
    </>
  )
}

const LANDING_FEATURES = [
  {
    id: "layouts",
    icon: <SquaresFourIcon />,
    title: "36 page layouts",
    description:
      "Shells, auth, screens, marketing and system states — every frame pre-wired to the same tokens.",
  },
  {
    id: "tokens",
    icon: <SparkleIcon />,
    title: "Measured tokens",
    description:
      "Colour ramps scored against WCAG pairings, not eyeballed. Contrast is asserted in CI.",
  },
  {
    id: "ship",
    icon: <RocketLaunchIcon />,
    title: "Install, don't copy",
    description:
      "Features land as packages. Upgrade the system without diffing a hundred files.",
  },
]

const LANDING_METRICS = [
  { id: "layouts", value: "36", label: "Page layouts" },
  { id: "components", value: "180+", label: "Components" },
  { id: "a11y", value: "AA", label: "Contrast floor" },
  { id: "packages", value: "6", label: "Installable features" },
]

export function MarketingShellPreview() {
  return (
    <LayoutPreviewShell className="h-[26rem]">
      <MarketingShell
        className="h-full min-h-0"
        stickyNav
        announcement="Celestia 0.4 is out — 36 layouts, one design system."
        logo={<MarketingLogo />}
        nav={<MarketingNavLinks />}
        actions={
          <>
            <Button variant="ghost" size="sm">
              Sign in
            </Button>
            <Button size="sm">Start free</Button>
          </>
        }
        footer={
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-foreground">
              Celestia
            </span>
            <span className="text-3xs text-muted-foreground">
              The design system that ships itself.
            </span>
          </div>
        }
      >
        <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-3 py-1 text-3xs font-medium text-muted-foreground">
            <MegaphoneIcon className="size-3" />
            v0.4.0
          </span>
          <h1 className="font-heading text-3xl font-semibold tracking-tight text-balance text-foreground">
            Ship the interface, not the scaffolding
          </h1>
          <p className="max-w-lg text-sm leading-relaxed text-muted-foreground">
            Every page frame your product needs, wired to one set of tokens.
          </p>
          <div className="flex items-center gap-3 pt-2">
            <Button size="sm">
              Get started
              <ArrowRightIcon />
            </Button>
            <Button variant="outline" size="sm">
              Read the docs
            </Button>
          </div>
        </div>
      </MarketingShell>
    </LayoutPreviewShell>
  )
}

export function LandingPagePreview() {
  return (
    <LayoutPreviewShell className="h-[34rem] overflow-y-auto">
      <MarketingShell
        className="h-full min-h-0"
        logo={<MarketingLogo />}
        nav={<MarketingNavLinks />}
        actions={<Button size="sm">Start free</Button>}
      >
        <LandingPage
          eyebrow={
            <>
              <SparkleIcon className="size-3" />
              New in 0.4
            </>
          }
          heading="The design system that ships itself"
          subheading="Layouts, pages and primitives for teams that would rather build the product than the scaffolding around it."
          primaryAction={
            <Button size="sm">
              Get started
              <ArrowRightIcon />
            </Button>
          }
          secondaryAction={
            <Button variant="outline" size="sm">
              Book a demo
            </Button>
          }
          features={LANDING_FEATURES}
          metrics={LANDING_METRICS}
          cta={{
            title: "Start building today",
            description:
              "Clone the starter, install a feature, and have a real screen in an afternoon.",
            action: <Button size="sm">Create an account</Button>,
          }}
        />
      </MarketingShell>
    </LayoutPreviewShell>
  )
}

const PRICING_PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    annualPrice: "$0",
    interval: "Free forever",
    description: "For side projects and evaluation.",
    features: ["3 projects", "Community support", "1 GB storage"],
    action: (
      <Button variant="outline" className="w-full">
        Start free
      </Button>
    ),
  },
  {
    id: "team",
    name: "Team",
    price: "$12",
    annualPrice: "$9",
    interval: "per seat, per month",
    description: "For product teams shipping weekly.",
    features: [
      "Unlimited projects",
      "SSO and SCIM",
      "90-day history",
      "Priority support",
    ],
    highlighted: true,
    badge: "Most popular",
    action: <Button className="w-full">Start 14-day trial</Button>,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    annualPrice: "Custom",
    interval: "Billed annually",
    description: "For regulated and multi-region teams.",
    features: ["Audit log export", "Dedicated region", "99.99% SLA"],
    action: (
      <Button variant="outline" className="w-full">
        Contact sales
      </Button>
    ),
  },
]

export function PricingPagePreview() {
  return (
    <LayoutPreviewShell className="h-[32rem] overflow-y-auto">
      <PricingPage
        eyebrow="Pricing"
        heading="Simple, per-seat pricing"
        description="Every plan includes the full component library. Upgrade for seats, history and support."
        plans={PRICING_PLANS}
        note="Prices in USD. Cancel any time."
      />
    </LayoutPreviewShell>
  )
}

const BLOG_CATEGORIES = ["All", "Engineering", "Design", "Product"]

const BLOG_POSTS = [
  {
    id: "tokens",
    title: "Scoring a colour ramp instead of eyeballing it",
    excerpt:
      "A status hue is a fill under white ink and ink on near-white. Both reduce to one inequality.",
    category: "Design",
    author: "Ada Lin",
    date: "12 Sep",
    readingTime: "8 min",
  },
  {
    id: "layouts",
    title: "Thirty-six page frames, one set of tokens",
    excerpt:
      "How the layout family grew from three shells to a full catalogue without forking the palette.",
    category: "Engineering",
    author: "Ravi Shah",
    date: "4 Sep",
    readingTime: "6 min",
  },
  {
    id: "a11y",
    title: "The contrast gate that fails when it should",
    excerpt:
      "A check that can emit a uniform verdict is not decisive. Here is how we proved ours is not.",
    category: "Engineering",
    author: "Sam Iversen",
    date: "28 Aug",
    readingTime: "11 min",
  },
]

export function BlogIndexPagePreview() {
  const [category, setCategory] = useState("All")

  return (
    <LayoutPreviewShell className="h-[30rem] overflow-y-auto">
      <BlogIndexPage
        eyebrow="Journal"
        heading="Notes from the design system"
        description="Deep dives on tokens, layout and the machinery that keeps them honest."
        categories={BLOG_CATEGORIES}
        activeCategory={category}
        onCategoryChange={setCategory}
        featured={{
          id: "featured",
          title: "Why the destructive token is darker than you think",
          excerpt:
            "Measured in OKLCH, primary and destructive sat a tenth of a degree apart in hue — same hue, different lightness. The fix was in the relationship, not the values.",
          category: "Design",
          author: "Ada Lin",
          date: "18 Sep",
          readingTime: "9 min",
        }}
        posts={BLOG_POSTS}
      />
    </LayoutPreviewShell>
  )
}

export function ArticlePagePreview() {
  return (
    <LayoutPreviewShell className="h-[32rem] overflow-y-auto">
      <ArticlePage
        category="Engineering"
        title="Thirty-six page frames, one set of tokens"
        description="How the layout family grew from three shells to a full catalogue without forking the palette."
        author={{
          name: "Ravi Shah",
          role: "Design Systems",
          avatarFallback: "RS",
        }}
        publishedAt="4 Sep 2026"
        readingTime="6 min read"
        toc={[
          { id: "start", label: "Where we started" },
          { id: "slots", label: "Slot-based frames" },
          { id: "collapse", label: "Collapse order", level: 2 },
          { id: "tokens", label: "One set of tokens" },
        ]}
        related={[
          {
            id: "r1",
            title: "Scoring a colour ramp",
            category: "Design",
            readingTime: "8 min",
          },
          {
            id: "r2",
            title: "The contrast gate",
            category: "Engineering",
            readingTime: "11 min",
          },
          {
            id: "r3",
            title: "Installing a feature",
            category: "Product",
            readingTime: "4 min",
          },
        ]}
      >
        <p className="text-sm leading-relaxed text-foreground">
          The layout family started as three shells: an authentication frame, a
          page frame, and a dashboard frame. Each was written for one screen and
          copied for the next, which worked right up until the fourth screen
          needed a variant the copy did not have.
        </p>
        <h2
          id="slots"
          className="pt-2 font-heading text-lg font-semibold tracking-tight text-foreground"
        >
          Slot-based frames
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          The fix was to stop describing screens and start describing slots. A
          shell takes the navigation the consumer already has, rather than
          inventing a navigation model and asking the consumer to adopt it.
        </p>
        <blockquote className="border-s-2 border-primary/40 ps-4 text-sm leading-relaxed text-foreground italic">
          “A layout you can adopt beats a layout you can only copy.”
        </blockquote>
        <p className="text-sm leading-relaxed text-muted-foreground">
          That distinction is what let the catalogue grow without the palette
          growing with it. Every frame still draws from the same ramp.
        </p>
      </ArticlePage>
    </LayoutPreviewShell>
  )
}

// ─── Collaboration previews ─────────────────────────────────────────────────

const INBOX_FOLDERS = [
  { id: "inbox", label: "Inbox", icon: <TrayIcon />, count: 4 },
  { id: "starred", label: "Starred", icon: <SparkleIcon /> },
  { id: "sent", label: "Sent", icon: <PaperPlaneTiltIcon /> },
  { id: "archive", label: "Archive", icon: <FolderIcon /> },
]

const INBOX_MESSAGES = [
  {
    id: "m1",
    from: "Nadia Okonkwo",
    subject: "Atlas API rollout plan",
    preview: "Staging is green. Can we cut the release candidate on Thursday?",
    time: "09:12",
    unread: true,
  },
  {
    id: "m2",
    from: "Sam Iversen",
    subject: "Contrast gate is failing on the new ramp",
    preview: "Two pairings dropped below 3:1 once the warning hue moved.",
    time: "08:40",
    unread: true,
  },
  {
    id: "m3",
    from: "Ravi Shah",
    subject: "Layout catalogue — first pass",
    preview:
      "Twenty frames, all drawing from the same tokens. Screenshots attached.",
    time: "Yesterday",
  },
  {
    id: "m4",
    from: "Ada Lin",
    subject: "Billing plan change",
    preview: "Moved the workspace to Team ahead of the seat increase.",
    time: "Yesterday",
  },
]

export function InboxPagePreview() {
  const [folder, setFolder] = useState("inbox")
  const [message, setMessage] = useState("m2")

  return (
    <LayoutPreviewShell className="h-[26rem] overflow-y-auto">
      <InboxPage
        className="h-full"
        folders={INBOX_FOLDERS}
        activeFolderId={folder}
        onFolderChange={setFolder}
        messages={INBOX_MESSAGES}
        activeMessageId={message}
        onSelectMessage={setMessage}
        toolbar={
          <Input
            type="search"
            placeholder="Search mail…"
            className="h-7 w-full"
            aria-label="Search mail"
          />
        }
        readingHeader={
          <>
            <span className="text-xs font-medium text-foreground">
              Contrast gate is failing on the new ramp
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              className="ms-auto"
              title="Archive"
            >
              <TrayIcon />
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-3 text-xs leading-relaxed">
          <p className="text-muted-foreground">
            Two pairings dropped below 3:1 once the warning hue moved. Both are
            on the destructive ramp, and both pass on their own — it is the
            relationship against the neighbouring step that broke.
          </p>
          <p className="text-muted-foreground">
            I re-ran the census and the only failing rows are the two you would
            expect. Everything else is unchanged.
          </p>
        </div>
      </InboxPage>
    </LayoutPreviewShell>
  )
}

const CHAT_CHANNELS = [
  { id: "general", label: "general" },
  { id: "design", label: "design", unread: 3 },
  { id: "eng", label: "engineering" },
  { id: "releases", label: "releases" },
]

const CHAT_MESSAGES = [
  {
    id: "c1",
    author: "Nadia",
    time: "09:04",
    avatarFallback: "NO",
    body: "Pushed the twenty new frames to the layout page. All green.",
  },
  {
    id: "c2",
    author: "Sam",
    time: "09:06",
    avatarFallback: "SI",
    body: "Nice. Did the collapse order survive the tablet breakpoint?",
  },
  {
    id: "c3",
    author: "Ada",
    time: "09:08",
    avatarFallback: "AL",
    body: "It does — rail goes first, then the reading pane. Screenshots in the PR.",
    own: true,
  },
]

const CHAT_MEMBERS = [
  {
    id: "1",
    name: "Ada Lin",
    role: "Product",
    avatarFallback: "AL",
    online: true,
  },
  {
    id: "2",
    name: "Nadia Okonkwo",
    role: "Platform",
    avatarFallback: "NO",
    online: true,
  },
  {
    id: "3",
    name: "Sam Iversen",
    role: "Design systems",
    avatarFallback: "SI",
  },
  {
    id: "4",
    name: "Ravi Shah",
    role: "Engineering",
    avatarFallback: "RS",
    online: true,
  },
]

export function ChatPagePreview() {
  const [channel, setChannel] = useState("design")

  return (
    <LayoutPreviewShell className="h-[26rem] overflow-y-auto">
      <ChatPage
        className="h-full"
        channels={CHAT_CHANNELS}
        activeChannelId={channel}
        onChannelChange={setChannel}
        messages={CHAT_MESSAGES}
        members={CHAT_MEMBERS}
        header={
          <>
            <HashIcon className="size-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-foreground">design</span>
            <span className="text-3xs text-muted-foreground">4 members</span>
          </>
        }
        composer={
          <div className="flex items-center gap-2">
            <Input
              placeholder="Message #design"
              className="h-8 flex-1"
              aria-label="Message"
            />
            <Button size="icon-sm" title="Send">
              <PaperPlaneTiltIcon />
            </Button>
          </div>
        }
      />
    </LayoutPreviewShell>
  )
}

const BOARD_COLUMNS = [
  {
    id: "backlog",
    title: "Backlog",
    tone: "default" as const,
    cards: [
      {
        id: "b1",
        title: "Audit the mobile token ramp",
        meta: "DS-441",
        tags: ["tokens"],
      },
      {
        id: "b2",
        title: "Document the Skia runtime",
        meta: "DS-455",
        tags: ["docs"],
      },
    ],
  },
  {
    id: "progress",
    title: "In progress",
    tone: "info" as const,
    cards: [
      {
        id: "p1",
        title: "Twenty new layout frames",
        meta: "DS-460",
        tags: ["layouts"],
        assignee: "Nadia",
        tone: "info" as const,
      },
      {
        id: "p2",
        title: "Contrast gate: warning pairing",
        meta: "DS-458",
        tags: ["a11y"],
        assignee: "Sam",
        tone: "warning" as const,
      },
    ],
  },
  {
    id: "review",
    title: "In review",
    tone: "warning" as const,
    cards: [
      {
        id: "r1",
        title: "Pricing page billing toggle",
        meta: "DS-449",
        tags: ["marketing"],
        assignee: "Ravi",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    tone: "success" as const,
    cards: [
      {
        id: "d1",
        title: "Derive the destructive edge",
        meta: "DS-431",
        tags: ["tokens"],
        assignee: "Ada",
        tone: "success" as const,
      },
      {
        id: "d2",
        title: "Ship the docs sidebar",
        meta: "DS-427",
        tags: ["docs"],
      },
    ],
  },
]

export function KanbanPagePreview() {
  return (
    <LayoutPreviewShell className="h-[26rem] overflow-y-auto">
      <KanbanPage
        className="h-full"
        title="Design system board"
        description="Everything in flight this sprint."
        columns={BOARD_COLUMNS}
        actions={<Button size="sm">New task</Button>}
      />
    </LayoutPreviewShell>
  )
}

const CALENDAR_WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

const CALENDAR_DAYS = [
  { id: "d1", date: 28, outside: true },
  { id: "d2", date: 29, outside: true },
  { id: "d3", date: 30, outside: true },
  {
    id: "d4",
    date: 1,
    events: [{ id: "e1", title: "Design review", tone: "info" as const }],
  },
  { id: "d5", date: 2 },
  { id: "d6", date: 3 },
  { id: "d7", date: 4 },
  {
    id: "d8",
    date: 5,
    events: [{ id: "e2", title: "Sprint planning", tone: "success" as const }],
  },
  {
    id: "d9",
    date: 6,
    today: true,
    events: [
      { id: "e3", title: "Contrast gate", tone: "warning" as const },
      { id: "e4", title: "Standup", tone: "info" as const },
      { id: "e5", title: "Release cut", tone: "destructive" as const },
    ],
  },
  { id: "d10", date: 7 },
  {
    id: "d11",
    date: 8,
    events: [{ id: "e6", title: "Office hours", tone: "info" as const }],
  },
  { id: "d12", date: 9 },
  { id: "d13", date: 10 },
  {
    id: "d14",
    date: 11,
    events: [{ id: "e7", title: "Retro", tone: "success" as const }],
  },
  { id: "d15", date: 12 },
  { id: "d16", date: 13 },
  {
    id: "d17",
    date: 14,
    events: [{ id: "e8", title: "Docs freeze", tone: "warning" as const }],
  },
  { id: "d18", date: 15 },
  { id: "d19", date: 16 },
  { id: "d20", date: 17 },
  { id: "d21", date: 18 },
  { id: "d22", date: 19 },
  { id: "d23", date: 20 },
  { id: "d24", date: 21 },
  { id: "d25", date: 22 },
  { id: "d26", date: 23 },
  { id: "d27", date: 24 },
  { id: "d28", date: 25 },
  { id: "d29", date: 26 },
  { id: "d30", date: 27 },
  { id: "d31", date: 28 },
  { id: "d32", date: 29 },
  { id: "d33", date: 30 },
  { id: "d34", date: 31 },
  { id: "d35", date: 1, outside: true },
]

const CALENDAR_AGENDA = [
  {
    id: "a1",
    time: "09:00",
    title: "Standup",
    meta: "Design system",
    tone: "info" as const,
  },
  {
    id: "a2",
    time: "11:30",
    title: "Contrast gate review",
    meta: "Sam · 30 min",
    tone: "warning" as const,
  },
  {
    id: "a3",
    time: "15:00",
    title: "Release cut 0.4.0",
    meta: "Nadia · 45 min",
    tone: "destructive" as const,
  },
  {
    id: "a4",
    time: "16:30",
    title: "Office hours",
    meta: "Open to the team",
    tone: "info" as const,
  },
]

export function CalendarPagePreview() {
  const [day, setDay] = useState("d9")

  return (
    <LayoutPreviewShell className="h-[30rem] overflow-y-auto">
      <CalendarPage
        // No `h-full`: the day grid's rows are `minmax(5rem,1fr)`, so a pinned
        // height squeezes the last week row past the card's `overflow-hidden`
        // and the month loses its tail.
        title="Schedule"
        description="Sprint 24 — design system"
        actions={<Button size="sm">New event</Button>}
        monthLabel="October 2026"
        weekdays={CALENDAR_WEEKDAYS}
        days={CALENDAR_DAYS}
        agenda={CALENDAR_AGENDA}
        selectedDayId={day}
        onSelectDay={setDay}
      />
    </LayoutPreviewShell>
  )
}

const FILE_FOLDERS = [
  { id: "designs", name: "Designs", count: 48 },
  { id: "exports", name: "Exports", count: 112 },
  { id: "docs", name: "Docs", count: 26 },
  { id: "archive", name: "Archive", count: 340 },
]

const FILE_ENTRIES = [
  {
    id: "f1",
    name: "token-ramp.fig",
    kind: "Figma",
    size: "4.2 MB",
    modified: "2 hours ago",
    owner: "Ada Lin",
  },
  {
    id: "f2",
    name: "contrast-report.csv",
    kind: "CSV",
    size: "88 KB",
    modified: "Yesterday",
    owner: "Sam Iversen",
  },
  {
    id: "f3",
    name: "layout-catalogue.pdf",
    kind: "PDF",
    size: "12.4 MB",
    modified: "3 days ago",
    owner: "Ravi Shah",
  },
  {
    id: "f4",
    name: "brand-marks",
    kind: "Folder",
    size: "—",
    modified: "Last week",
    owner: "Nadia Okonkwo",
  },
  {
    id: "f5",
    name: "release-0.4.0.zip",
    kind: "Archive",
    size: "64.1 MB",
    modified: "Last week",
    owner: "Nadia Okonkwo",
  },
]

export function FilesPagePreview() {
  const [folder, setFolder] = useState("designs")

  return (
    <LayoutPreviewShell className="h-[26rem] overflow-y-auto">
      <FilesPage
        className="h-full"
        title="Files"
        description="Shared assets for the design system workspace."
        breadcrumb={["Workspace", "Northwind", "Designs"]}
        folders={FILE_FOLDERS}
        activeFolderId={folder}
        onFolderChange={setFolder}
        files={FILE_ENTRIES}
        actions={<Button size="sm">Upload</Button>}
        toolbar={
          <>
            <Input
              type="search"
              placeholder="Search files…"
              className="h-7 w-48"
              aria-label="Search files"
            />
            <Button variant="outline" size="sm" className="ms-auto">
              <FunnelSimpleIcon />
              Type
            </Button>
          </>
        }
      />
    </LayoutPreviewShell>
  )
}

// ─── Data & insights previews ───────────────────────────────────────────────

const ANALYTICS_METRICS = [
  {
    id: "visitors",
    label: "Visitors",
    value: "128,470",
    delta: "+12.4%",
    trend: "up" as const,
    hint: "vs. last month",
    icon: <UsersThreeIcon />,
  },
  {
    id: "conversion",
    label: "Conversion",
    value: "4.18%",
    delta: "+0.6%",
    trend: "up" as const,
    hint: "vs. last month",
    icon: <ChartLineUpIcon />,
  },
  {
    id: "revenue",
    label: "Revenue",
    value: "$48,290",
    delta: "+9.1%",
    trend: "up" as const,
    hint: "vs. last month",
    icon: <CurrencyDollarIcon />,
  },
  {
    id: "bounce",
    label: "Bounce rate",
    value: "31.2%",
    delta: "-2.4%",
    trend: "down" as const,
    hint: "vs. last month",
    icon: <TrendDownIcon />,
  },
]

const ANALYTICS_BREAKDOWN = [
  { id: "organic", label: "Organic search", value: "52,110", share: 41 },
  { id: "direct", label: "Direct", value: "38,940", share: 30 },
  { id: "referral", label: "Referral", value: "21,320", share: 17 },
  { id: "social", label: "Social", value: "16,100", share: 12 },
]

export function AnalyticsPagePreview() {
  return (
    <LayoutPreviewShell className="h-[34rem] overflow-y-auto">
      <AnalyticsPage
        className="h-full"
        title="Analytics"
        description="Traffic, conversion and revenue for the last 30 days."
        actions={
          <Button variant="outline" size="sm">
            <DownloadSimpleIcon />
            Export
          </Button>
        }
        metrics={ANALYTICS_METRICS}
        chart={
          <ChartArea
            data={chartKitData}
            xKey="month"
            showLegend
            className="h-56"
          />
        }
        chartTitle="Revenue against expenses"
        chartDescription="Monthly totals, last six months."
        breakdown={ANALYTICS_BREAKDOWN}
        breakdownTitle="Top sources"
        breakdownDescription="Share of sessions in the period."
      />
    </LayoutPreviewShell>
  )
}

const REPORT_ENTRIES = [
  {
    id: "r1",
    name: "Weekly revenue",
    description: "MRR, expansion and churn",
    schedule: "Every Monday, 09:00",
    status: "ready" as const,
    lastRun: "3 days ago",
    owner: "Finance",
  },
  {
    id: "r2",
    name: "Contrast census",
    description: "All WCAG pairings per theme",
    schedule: "On every commit",
    status: "running" as const,
    owner: "Design systems",
  },
  {
    id: "r3",
    name: "Seat utilisation",
    description: "Active seats against plan",
    schedule: "Every Friday, 17:00",
    status: "ready" as const,
    lastRun: "6 days ago",
    owner: "Operations",
  },
  {
    id: "r4",
    name: "Audit export",
    description: "Signed activity log",
    schedule: "Monthly",
    status: "failed" as const,
    lastRun: "12 days ago",
    owner: "Security",
  },
  {
    id: "r5",
    name: "Cohort retention",
    description: "Week-over-week by signup cohort",
    status: "draft" as const,
    owner: "Growth",
  },
]

export function ReportsPagePreview() {
  return (
    <LayoutPreviewShell className="h-[26rem] overflow-y-auto">
      <ReportsPage
        className="h-full"
        title="Reports"
        description="Saved reports, their cadence and their last result."
        reports={REPORT_ENTRIES}
        actions={<Button size="sm">New report</Button>}
      />
    </LayoutPreviewShell>
  )
}

export function RecordDetailPagePreview() {
  return (
    <LayoutPreviewShell className="h-[28rem] overflow-y-auto">
      <RecordDetailPage
        className="h-full"
        name="Ada Lin"
        subtitle="ada@northwind.dev · Lisbon, Portugal"
        status={<Badge variant="success">Active</Badge>}
        avatarFallback="AL"
        actions={
          <>
            <Button variant="outline" size="sm">
              Copy link
            </Button>
            <Button size="sm">Edit</Button>
          </>
        }
        tabs={[
          { id: "overview", label: "Overview" },
          { id: "activity", label: "Activity", count: 24 },
          { id: "billing", label: "Billing" },
        ]}
        defaultTab="overview"
        metadata={[
          { id: "role", label: "Role", value: "Head of Product" },
          { id: "team", label: "Team", value: "Design systems" },
          { id: "joined", label: "Joined", value: "March 2023" },
          { id: "seats", label: "Seats", value: "9 of 12" },
          {
            id: "plan",
            label: "Plan",
            value: <Badge variant="secondary">Team</Badge>,
          },
        ]}
      >
        <div className="flex flex-col gap-2 rounded-xl border border-border/70 bg-card p-4">
          <span className="text-xs font-medium text-foreground">
            Building the design system that ships itself
          </span>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Previously platform at Northwind — now making sure the next team
            does not have to rewrite the button.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { id: "posts", value: "128", label: "Posts" },
            { id: "reviews", value: "412", label: "Reviews" },
            { id: "projects", value: "17", label: "Projects" },
          ].map((stat) => (
            <div
              key={stat.id}
              className="flex flex-col gap-0.5 rounded-xl border border-border/70 bg-card p-4"
            >
              <span className="font-heading text-xl font-semibold text-foreground tabular-nums">
                {stat.value}
              </span>
              <span className="text-3xs text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </RecordDetailPage>
    </LayoutPreviewShell>
  )
}

const SEARCH_FACETS = [
  {
    id: "type",
    label: "Type",
    options: [
      { id: "layout", label: "Layout", count: 36, checked: true },
      { id: "primitive", label: "Primitive", count: 48 },
      { id: "composite", label: "Composite", count: 33 },
    ],
  },
  {
    id: "status",
    label: "Status",
    options: [
      { id: "stable", label: "Stable", count: 102, checked: true },
      { id: "beta", label: "Beta", count: 12 },
      { id: "deprecated", label: "Deprecated", count: 3 },
    ],
  },
]

const SEARCH_RESULTS = [
  {
    id: "s1",
    title: "Dashboard Shell",
    excerpt:
      "Signed-in app frame: navigation rail with brand and footer slots, sticky header, scrolling content column and an optional right rail.",
    meta: "apps/web/components/layout-templates/dashboard-shell.tsx",
    badge: <Badge variant="success">Stable</Badge>,
  },
  {
    id: "s2",
    title: "Page Shell",
    excerpt:
      "App page frame with blurred sticky header, title, description, trailing actions and width presets.",
    meta: "apps/web/components/layout-templates/page-shell.tsx",
    badge: <Badge variant="success">Stable</Badge>,
  },
  {
    id: "s3",
    title: "Auth Shell",
    excerpt:
      "Authentication page frame with logo, heading, provider aside, footer, and centered or split-screen variants.",
    meta: "apps/web/components/layout-templates/auth-shell.tsx",
    badge: <Badge variant="success">Stable</Badge>,
  },
]

export function SearchPagePreview() {
  const [query, setQuery] = useState("shell")

  return (
    <LayoutPreviewShell className="h-[28rem] overflow-y-auto">
      <SearchPage
        className="h-full"
        title="Search"
        description="Across components, layouts and documentation."
        query={query}
        onQueryChange={setQuery}
        placeholder="Search the design system…"
        facets={SEARCH_FACETS}
        results={SEARCH_RESULTS}
        totalLabel={`${SEARCH_RESULTS.length} results in 0.04s`}
      />
    </LayoutPreviewShell>
  )
}

const AUDIT_EVENTS = [
  {
    id: "a1",
    actor: "Ada Lin",
    action: "changed the billing plan to",
    target: "Team",
    time: "Today, 09:41",
    ip: "203.0.113.24",
    tone: "info" as const,
  },
  {
    id: "a2",
    actor: "Nadia Okonkwo",
    action: "deployed",
    target: "atlas-api@2.4.1",
    time: "Today, 08:12",
    ip: "198.51.100.7",
    tone: "success" as const,
  },
  {
    id: "a3",
    actor: "Sam Iversen",
    action: "rotated the signing key for",
    target: "web",
    time: "Yesterday, 17:03",
    ip: "198.51.100.19",
    tone: "warning" as const,
  },
  {
    id: "a4",
    actor: "System",
    action: "blocked a sign-in attempt from",
    target: "unknown device",
    time: "Yesterday, 03:27",
    ip: "192.0.2.88",
    tone: "destructive" as const,
  },
  {
    id: "a5",
    actor: "Ravi Shah",
    action: "invited 3 teammates to",
    target: "Northwind",
    time: "2 days ago",
    ip: "203.0.113.51",
  },
]

export function AuditLogPagePreview() {
  return (
    <LayoutPreviewShell className="h-[28rem] overflow-y-auto">
      <AuditLogPage
        className="h-full"
        title="Audit log"
        description="Every privileged action in the workspace, newest first."
        events={AUDIT_EVENTS}
        actions={
          <Button variant="outline" size="sm">
            <DownloadSimpleIcon />
            Export
          </Button>
        }
        filters={
          <>
            <Input
              type="search"
              placeholder="Filter by actor…"
              className="h-7 w-48"
              aria-label="Filter by actor"
            />
            <Button variant="outline" size="sm">
              <FunnelSimpleIcon />
              Action
            </Button>
          </>
        }
      />
    </LayoutPreviewShell>
  )
}

// ─── Commerce & flows previews ──────────────────────────────────────────────

export function CheckoutPagePreview() {
  return (
    <LayoutPreviewShell className="h-[30rem] overflow-y-auto">
      <CheckoutPage
        className="h-full"
        title="Checkout"
        description="Twelve seats on the Team plan, billed annually."
        steps={[
          { id: "account", label: "Account" },
          { id: "payment", label: "Payment" },
          { id: "confirm", label: "Confirm" },
        ]}
        activeStep="payment"
        summary={[
          { id: "seats", label: "Team plan × 12", value: "$1,080.00" },
          { id: "annual", label: "Annual discount", value: "−$216.00" },
          { id: "tax", label: "Estimated tax", value: "$69.12" },
          {
            id: "trial",
            label: "14-day trial credit",
            value: "Applied",
            muted: true,
          },
        ]}
        total={{ label: "Due today", value: "$933.12" }}
        summaryNote="Charged on the first day after your trial. Cancel any time before then."
        submitLabel="Pay and start trial"
        backLabel="Back to account"
        onSubmit={noop}
        onBack={noop}
      >
        <div className="flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-5">
          <span className="text-xs font-medium text-foreground">
            Payment method
          </span>
          <div className="flex items-center gap-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <CreditCardIcon className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-xs font-medium text-foreground">
                Visa ending 4242
              </span>
              <span className="text-3xs text-muted-foreground">
                Expires 04 / 2029
              </span>
            </span>
            <Button variant="ghost" size="sm" className="ms-auto">
              Change
            </Button>
          </div>
          <Separator />
          <div className="flex flex-col gap-2">
            <span className="text-3xs font-medium tracking-wide text-muted-foreground uppercase">
              Billing address
            </span>
            <p className="text-xs leading-relaxed text-muted-foreground">
              Northwind Labs
              <br />
              Rua da Prata 80, 1100-052
              <br />
              Lisbon, Portugal
            </p>
          </div>
        </div>
      </CheckoutPage>
    </LayoutPreviewShell>
  )
}

export function InvoicePagePreview() {
  return (
    // Taller than its siblings on purpose: an invoice is a document, so the
    // preview has to reach the totals block or it shows only a table.
    <LayoutPreviewShell className="h-[42rem] overflow-y-auto">
      <InvoicePage
        // No `h-full`: the document is natural-height, and pinning it to the
        // frame re-clamps it so the totals block is cut off mid-table. Let the
        // shell scroll instead.
        title="Invoice"
        description="Northwind Labs — September 2026."
        number="INV-0091"
        status={<Badge variant="success">Paid</Badge>}
        issuedAt="1 Sep 2026"
        dueAt="15 Sep 2026"
        from={{
          name: "Celestia Labs",
          lines: [
            "Rua da Prata 80",
            "1100-052 Lisbon",
            "Portugal",
            "VAT PT123456789",
          ],
        }}
        to={{
          name: "Northwind Labs",
          lines: [
            "12 Harbour Street",
            "Dublin D02 XY45",
            "Ireland",
            "VAT IE9876543A",
          ],
        }}
        lineItems={[
          {
            id: "l1",
            description: "Team plan",
            detail: "12 seats, September",
            quantity: "12",
            rate: "$9.00",
            amount: "$108.00",
          },
          {
            id: "l2",
            description: "Build minutes overage",
            detail: "1,840 of 2,000 used",
            quantity: "1",
            rate: "$18.00",
            amount: "$18.00",
          },
          {
            id: "l3",
            description: "Artifact storage",
            detail: "78 GB of 100 GB",
            quantity: "1",
            rate: "$0.00",
            amount: "$0.00",
          },
          {
            id: "l4",
            description: "Priority support",
            detail: "4-hour response",
            quantity: "1",
            rate: "$45.00",
            amount: "$45.00",
          },
        ]}
        totals={[
          { label: "Subtotal", value: "$171.00" },
          { label: "VAT 23%", value: "$39.33", muted: true },
          { label: "Trial credit", value: "−$18.00", muted: true },
          { label: "Total due", value: "$192.33", strong: true },
        ]}
        notes="Payable within 14 days. Questions? Billing@celestia.dev."
        actions={<Button size="sm">Download PDF</Button>}
      />
    </LayoutPreviewShell>
  )
}

export function OnboardingPagePreview() {
  const [step, setStep] = useState("workspace")

  return (
    <LayoutPreviewShell className="h-[26rem] overflow-y-auto">
      <OnboardingPage
        className="h-full"
        title="Set up your workspace"
        description="Four short steps — you can change any of this later."
        steps={[
          {
            id: "profile",
            label: "Your profile",
            description: "Name and avatar",
          },
          {
            id: "workspace",
            label: "Workspace",
            description: "Name and region",
          },
          { id: "invite", label: "Invite teammates", description: "Optional" },
          {
            id: "finish",
            label: "Finish",
            description: "Pick a starting point",
          },
        ]}
        activeStep={step}
        onStepChange={setStep}
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-semibold text-foreground">
              Name your workspace
            </span>
            <span className="text-xs leading-relaxed text-muted-foreground">
              This is what your team sees in the sidebar and on invitations.
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-foreground">
              Workspace name
            </span>
            <Input defaultValue="Northwind" className="max-w-sm" />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium text-foreground">
              Data region
            </span>
            <div className="flex flex-wrap gap-2">
              {["EU West", "US East", "Asia Pacific"].map((region) => (
                <span
                  key={region}
                  className={
                    region === "EU West"
                      ? "inline-flex h-8 items-center rounded-lg border border-primary/60 bg-primary/5 px-3 text-xs font-medium text-foreground"
                      : "inline-flex h-8 items-center rounded-lg border border-border/70 px-3 text-xs text-muted-foreground"
                  }
                >
                  {region}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline">Back</Button>
            <Button>
              Continue
              <ArrowRightIcon />
            </Button>
          </div>
        </div>
      </OnboardingPage>
    </LayoutPreviewShell>
  )
}

const TEAM_MEMBERS = [
  {
    id: "t1",
    name: "Ada Lin",
    email: "ada@northwind.dev",
    role: "Owner",
    status: "active" as const,
    avatarFallback: "AL",
  },
  {
    id: "t2",
    name: "Nadia Okonkwo",
    email: "nadia@northwind.dev",
    role: "Admin",
    status: "active" as const,
    avatarFallback: "NO",
  },
  {
    id: "t3",
    name: "Sam Iversen",
    email: "sam@northwind.dev",
    role: "Member",
    status: "active" as const,
    avatarFallback: "SI",
  },
  {
    id: "t4",
    name: "Ravi Shah",
    email: "ravi@northwind.dev",
    role: "Member",
    status: "invited" as const,
    avatarFallback: "RS",
  },
  {
    id: "t5",
    name: "Mira Chen",
    email: "mira@northwind.dev",
    role: "Viewer",
    status: "suspended" as const,
    avatarFallback: "MC",
  },
]

export function TeamPagePreview() {
  return (
    <LayoutPreviewShell className="h-[26rem] overflow-y-auto">
      <TeamPage
        className="h-full"
        title="Team"
        description="9 of 12 seats used on the Team plan."
        members={TEAM_MEMBERS}
        actions={<Button size="sm">Invite</Button>}
        invite={
          <>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-semibold text-foreground">
                Invite teammates
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                They join as members. You can change a role afterwards.
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-foreground">
                Email address
              </span>
              <Input type="email" placeholder="name@company.com" />
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-foreground">Role</span>
              <Input defaultValue="Member" />
            </div>
            <Button className="w-full">
              <PaperPlaneTiltIcon />
              Send invitation
            </Button>
            <p className="text-3xs leading-relaxed text-muted-foreground">
              Invitations expire after 7 days.
            </p>
          </>
        }
      />
    </LayoutPreviewShell>
  )
}

const INTEGRATION_CATEGORIES = [
  "All",
  "Communication",
  "Code",
  "Design",
  "Finance",
]

const INTEGRATIONS = [
  {
    id: "slack",
    name: "Slack",
    description: "Post build and release events to a channel.",
    category: "Communication",
    connected: true,
    icon: <SlackLogoIcon />,
  },
  {
    id: "github",
    name: "GitHub",
    description: "Link pull requests to issues and previews.",
    category: "Code",
    connected: true,
    icon: <GithubLogoIcon />,
  },
  {
    id: "figma",
    name: "Figma",
    description: "Pull tokens and frames into the catalogue.",
    category: "Design",
    connected: false,
    icon: <FigmaLogoIcon />,
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Sync plans, seats and invoice history.",
    category: "Finance",
    connected: true,
    icon: <StripeLogoIcon />,
  },
  {
    id: "notion",
    name: "Notion",
    description: "Publish component docs to a shared wiki.",
    category: "Design",
    connected: false,
    icon: <NotionLogoIcon />,
  },
  {
    id: "webhooks",
    name: "Webhooks",
    description: "Send signed events to any HTTPS endpoint.",
    category: "Code",
    connected: false,
    icon: <GlobeIcon />,
  },
]

export function IntegrationsPagePreview() {
  const [category, setCategory] = useState("All")

  return (
    <LayoutPreviewShell className="h-[28rem] overflow-y-auto">
      <IntegrationsPage
        className="h-full"
        title="Integrations"
        description="Connect the tools your team already uses."
        actions={<Button size="sm">Request an app</Button>}
        categories={INTEGRATION_CATEGORIES}
        activeCategory={category}
        onCategoryChange={setCategory}
        integrations={INTEGRATIONS}
      />
    </LayoutPreviewShell>
  )
}
