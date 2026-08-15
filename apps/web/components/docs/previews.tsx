"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@celestia-project/ui/components/accordion"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@celestia-project/ui/components/alert"
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
} from "@celestia-project/ui/components/alert-dialog"
import { AspectRatio } from "@celestia-project/ui/components/aspect-ratio"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@celestia-project/ui/components/avatar"
import { Badge } from "@celestia-project/ui/components/badge"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@celestia-project/ui/components/breadcrumb"
import { Button } from "@celestia-project/ui/components/button"
import {
  ButtonGroup,
  ButtonGroupSeparator,
} from "@celestia-project/ui/components/button-group"
import { Calendar } from "@celestia-project/ui/components/calendar"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@celestia-project/ui/components/card"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@celestia-project/ui/components/carousel"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@celestia-project/ui/components/chart"
import { Checkbox } from "@celestia-project/ui/components/checkbox"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@celestia-project/ui/components/collapsible"
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@celestia-project/ui/components/combobox"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@celestia-project/ui/components/command"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@celestia-project/ui/components/context-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@celestia-project/ui/components/dialog"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@celestia-project/ui/components/drawer"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@celestia-project/ui/components/dropdown-menu"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@celestia-project/ui/components/empty"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@celestia-project/ui/components/field"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@celestia-project/ui/components/hover-card"
import { Input } from "@celestia-project/ui/components/input"
import {
  InputGroup,
  InputGroupInput,
  InputGroupText,
} from "@celestia-project/ui/components/input-group"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@celestia-project/ui/components/input-otp"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@celestia-project/ui/components/item"
import { Kbd, KbdGroup } from "@celestia-project/ui/components/kbd"
import { Label } from "@celestia-project/ui/components/label"
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
} from "@celestia-project/ui/components/menu"
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarTrigger,
} from "@celestia-project/ui/components/menubar"
import {
  NativeSelect,
  NativeSelectOption,
} from "@celestia-project/ui/components/native-select"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@celestia-project/ui/components/navigation-menu"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@celestia-project/ui/components/pagination"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@celestia-project/ui/components/popover"
import { Progress } from "@celestia-project/ui/components/progress"
import {
  RadioGroup,
  RadioGroupItem,
} from "@celestia-project/ui/components/radio-group"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@celestia-project/ui/components/resizable"
import { ScrollArea } from "@celestia-project/ui/components/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@celestia-project/ui/components/select"
import { Separator } from "@celestia-project/ui/components/separator"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@celestia-project/ui/components/sheet"
import { Skeleton } from "@celestia-project/ui/components/skeleton"
import { Slider } from "@celestia-project/ui/components/slider"
import { Toaster } from "@celestia-project/ui/components/sonner"
import { Spinner } from "@celestia-project/ui/components/spinner"
import { Switch } from "@celestia-project/ui/components/switch"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@celestia-project/ui/components/table"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@celestia-project/ui/components/tabs"
import { Textarea } from "@celestia-project/ui/components/textarea"
import { Toggle } from "@celestia-project/ui/components/toggle"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@celestia-project/ui/components/toggle-group"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@celestia-project/ui/components/tooltip"
import { BellIcon, NoteBlankIcon, UserIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts"
import { toast } from "sonner"

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
            <TableHead className="text-right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell className="font-medium">INV-001</TableCell>
            <TableCell>Paid</TableCell>
            <TableCell>Credit Card</TableCell>
            <TableCell className="text-right">$250.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">INV-002</TableCell>
            <TableCell>Pending</TableCell>
            <TableCell>PayPal</TableCell>
            <TableCell className="text-right">$150.00</TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-medium">INV-003</TableCell>
            <TableCell>Unpaid</TableCell>
            <TableCell>Bank Transfer</TableCell>
            <TableCell className="text-right">$350.00</TableCell>
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
          <h4 className="text-sm font-semibold">Landing Tokens</h4>
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
          <h4 className="text-sm font-semibold">Brand Accent</h4>
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
          <h4 className="text-sm font-semibold">Semantic Tokens</h4>
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
          <h4 className="text-sm font-semibold">Chart Colors</h4>
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
