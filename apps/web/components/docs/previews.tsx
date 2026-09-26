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
  BellIcon,
  CalendarBlankIcon,
  ChartLineUpIcon,
  CreditCardIcon,
  DownloadSimpleIcon,
  EnvelopeSimpleIcon,
  FunnelSimpleIcon,
  GearSixIcon,
  GithubLogoIcon,
  GoogleLogoIcon,
  HouseIcon,
  LinkSimpleIcon,
  MagnifyingGlassIcon,
  MapPinIcon,
  MoonStarsIcon,
  NoteBlankIcon,
  PencilSimpleIcon,
  PlusIcon,
  ShieldCheckIcon,
  SignOutIcon,
  SquaresFourIcon,
  TrendDownIcon,
  TrashIcon,
  UserIcon,
  UsersThreeIcon,
} from "@phosphor-icons/react"
import { useMemo, useState } from "react"
import type { ReactNode } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { AuthShell } from "@celestia-project/ui/layout/auth-shell"
import { PageShell } from "@celestia-project/ui/layout/page-shell"
import { DashboardShell } from "@celestia-project/ui/layout/dashboard-shell"
import { SignInPage } from "@celestia-project/ui/layout/sign-in-page"
import { SignUpPage } from "@celestia-project/ui/layout/sign-up-page"
import { ForgotPasswordPage } from "@celestia-project/ui/layout/forgot-password-page"
import { ResetPasswordPage } from "@celestia-project/ui/layout/reset-password-page"
import { TwoFactorPage } from "@celestia-project/ui/layout/two-factor-page"
import { DashboardPage } from "@celestia-project/ui/layout/dashboard-page"
import { ProfilePage } from "@celestia-project/ui/layout/profile-page"
import { SettingsPage } from "@celestia-project/ui/layout/settings-page"
import { ListPage } from "@celestia-project/ui/layout/list-page"
import { BillingPage } from "@celestia-project/ui/layout/billing-page"
import { StatusPage } from "@celestia-project/ui/layout/status-page"
import { NotFoundPage } from "@celestia-project/ui/layout/not-found-page"
import { ErrorPage } from "@celestia-project/ui/layout/error-page"
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
} from "@celestia-project/ui"
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
      <div className="w-full max-w-xl overflow-hidden rounded-lg border border-fd-border bg-background">
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
              className="bg-[#1f1f1f]"
              value="#1f1f1f"
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
                background: "linear-gradient(90deg, #89aacc 0%, #4e85bf 100%)",
              }}
            />
            <div className="flex flex-col">
              <span className="text-sm font-medium">accent-gradient</span>
              <span className="font-mono text-xs text-muted-foreground">
                #89aacc → #4e85bf
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
              value="oklch(0.205 0 0)"
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
        "not-prose bg-background w-full overflow-hidden rounded-lg border border-fd-border",
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
    <div className="bg-primary text-primary-foreground flex size-9 items-center justify-center rounded-lg">
      <MoonStarsIcon className="size-5" weight="fill" />
    </div>
  )
}

const LAYOUT_PROJECT_ROWS = [
  { id: "prj_01", name: "Atlas API", meta: "Deployed 12 minutes ago", status: "Live" },
  { id: "prj_02", name: "Nebula Web", meta: "Build queued", status: "Building" },
  { id: "prj_03", name: "Comet CLI", meta: "Last release v2.4.1", status: "Stable" },
  { id: "prj_04", name: "Orbit Mobile", meta: "Review pending", status: "Draft" },
]

function LayoutProjectCards() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {LAYOUT_PROJECT_ROWS.map((row) => (
        <div key={row.id} className="rounded-lg border border-border/70 bg-card p-3">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-medium">{row.name}</span>
            <Badge variant="secondary">{row.status}</Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">{row.meta}</p>
        </div>
      ))}
    </div>
  )
}

const LAYOUT_SOCIAL_PROVIDERS = [
  { id: "google", label: "Google", icon: <GoogleLogoIcon className="size-4" /> },
  { id: "github", label: "GitHub", icon: <GithubLogoIcon className="size-4" /> },
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
          <span className="bg-muted text-muted-foreground mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-3xs font-medium">
            {entry.who.slice(0, 1)}
          </span>
          <span className="min-w-0 flex-1 text-xs">
            <span className="font-medium">{entry.who}</span>{" "}
            <span className="text-muted-foreground">{entry.what}</span>
          </span>
          <span className="text-muted-foreground shrink-0 text-3xs tabular-nums">
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
              <span className="text-foreground font-medium">Terms of Service</span>
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
              <blockquote className="text-foreground text-lg font-medium leading-snug tracking-tight">
                “Celestia cut our design-to-ship time in half.”
              </blockquote>
              <p className="text-muted-foreground text-sm">
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
            <span className="bg-primary text-primary-foreground flex size-7 items-center justify-center rounded-md">
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
              <span className="text-muted-foreground truncate text-3xs">
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
    <div className="border-border/70 bg-card flex items-start justify-between gap-6 rounded-lg border p-4">
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="text-xs font-medium">{label}</span>
        {description && (
          <span className="text-muted-foreground text-xs">{description}</span>
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
        <LayoutSettingRow label="Workspace name" description="Shown to every member.">
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
        <LayoutSettingRow label="Active sessions" description="3 devices signed in.">
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
      <div className="border-destructive/30 bg-destructive/5 flex flex-col gap-3 rounded-lg border p-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-destructive text-xs font-medium">
            Delete this workspace
          </span>
          <span className="text-muted-foreground text-xs">
            Every project, post and member will be removed. This cannot be undone.
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
  { id: "prj_01", name: "Atlas API", owner: "Nadia Okonkwo", status: "Live", updated: "12 minutes ago" },
  { id: "prj_02", name: "Nebula Web", owner: "Sam Iversen", status: "Building", updated: "48 minutes ago" },
  { id: "prj_03", name: "Comet CLI", owner: "Ravi Shah", status: "Stable", updated: "2 hours ago" },
  { id: "prj_04", name: "Orbit Mobile", owner: "Ada Lin", status: "Draft", updated: "5 hours ago" },
  { id: "prj_05", name: "Pulsar Worker", owner: "Mira Chen", status: "Live", updated: "Yesterday" },
  { id: "prj_06", name: "Vega Docs", owner: "Tom Ríos", status: "Stable", updated: "3 days ago" },
]

type LayoutListRow = (typeof LAYOUT_LIST_ROWS)[number]

const LAYOUT_LIST_COLUMNS: ListColumn<LayoutListRow>[] = [
  {
    id: "name",
    header: "Project",
    cell: (row) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-medium">{row.name}</span>
        <span className="text-muted-foreground font-mono text-3xs">{row.id}</span>
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
  { id: "INV-0091", date: "1 Sep 2026", amount: "$96.00", status: <Badge variant="success">Paid</Badge> },
  { id: "INV-0084", date: "1 Aug 2026", amount: "$96.00", status: <Badge variant="success">Paid</Badge> },
  { id: "INV-0077", date: "1 Jul 2026", amount: "$72.00", status: <Badge variant="secondary">Refunded</Badge> },
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
            <span className="bg-muted text-muted-foreground flex size-8 shrink-0 items-center justify-center rounded-md">
              <CreditCardIcon className="size-4" />
            </span>
            <span className="flex min-w-0 flex-col">
              <span className="text-xs font-medium">Visa ending 4242</span>
              <span className="text-muted-foreground text-xs">Expires 04 / 2029</span>
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
