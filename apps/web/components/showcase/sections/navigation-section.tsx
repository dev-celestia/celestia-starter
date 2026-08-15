"use client"

import * as React from "react"
import {
  CaretDownIcon,
  FolderIcon,
  FileIcon,
  GearIcon,
  UserIcon,
  SignOutIcon,
  CopyIcon,
  TrashIcon,
  CodeIcon,
  BookOpenIcon,
} from "@phosphor-icons/react"
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabBar,
  type TabItem,
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
  Button,
} from "@celestia-project/ui"
import { toast } from "sonner"
import { ShowcaseCard } from "../showcase-card"

const TABS_CODE = `import * as React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@celestia-project/ui"

export function TabsDemo() {
  return (
    <Tabs defaultValue="account" className="w-full max-w-sm">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="p-3 border rounded-lg">
        <p className="font-semibold text-xs">Account Settings</p>
        <p className="text-xs text-muted-foreground">Manage your team email and subscription.</p>
      </TabsContent>
      <TabsContent value="password" className="p-3 border rounded-lg">
        <p className="font-semibold text-xs">Password & Security</p>
        <p className="text-xs text-muted-foreground">Configure multi-factor authentication.</p>
      </TabsContent>
    </Tabs>
  )
}`

const TAB_BAR_CODE = `import * as React from "react"
import { TabBar, type TabItem } from "@celestia-project/ui"

export function TabBarDemo() {
  const [activeTabId, setActiveTabId] = React.useState("tab-1")
  const [tabs, setTabs] = React.useState<TabItem[]>([
    { id: "tab-1", name: "auth.ts", method: "GET" },
    { id: "tab-2", name: "routes.ts", method: "POST" },
  ])

  return (
    <TabBar
      tabs={tabs}
      activeTabId={activeTabId}
      onSelectTab={setActiveTabId}
      onAddTab={() => setTabs([...tabs, { id: \`tab-\${Date.now()}\`, name: "new.ts", method: "GET" }])}
      onRemoveTab={(id) => setTabs(tabs.filter((t) => t.id !== id))}
    />
  )
}`

const BREADCRUMB_CODE = `import * as React from "react"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@celestia-project/ui"

export function BreadcrumbDemo() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink href="#">Home</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbLink href="#">Packages</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem><BreadcrumbPage>UI Primitives</BreadcrumbPage></BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}`

const PAGINATION_CODE = `import * as React from "react"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@celestia-project/ui"

export function PaginationDemo() {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem><PaginationPrevious href="#" /></PaginationItem>
        <PaginationItem><PaginationLink href="#" isActive>1</PaginationLink></PaginationItem>
        <PaginationItem><PaginationLink href="#">2</PaginationLink></PaginationItem>
        <PaginationItem><PaginationEllipsis /></PaginationItem>
        <PaginationItem><PaginationNext href="#" /></PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}`

const ACCORDION_CODE = `import * as React from "react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@celestia-project/ui"

export function AccordionDemo() {
  return (
    <Accordion defaultValue={["item-1"]} className="w-full max-w-sm">
      <AccordionItem value="item-1">
        <AccordionTrigger>Is Celestia accessible?</AccordionTrigger>
        <AccordionContent>Yes. All primitives follow WAI-ARIA authoring guidelines.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How does monorepo sharing work?</AccordionTrigger>
        <AccordionContent>Packages are linked via pnpm workspaces.</AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}`

const COLLAPSIBLE_CODE = `import * as React from "react"
import { Collapsible, CollapsibleTrigger, CollapsibleContent, Button } from "@celestia-project/ui"
import { FolderIcon, CaretDownIcon, FileIcon } from "@phosphor-icons/react"

export function CollapsibleDemo() {
  const [open, setOpen] = React.useState(false)

  return (
    <Collapsible open={open} onOpenChange={setOpen} className="w-full max-w-sm border rounded-lg p-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderIcon className="size-4 text-primary" weight="fill" />
          <span className="text-xs font-semibold">src/components</span>
        </div>
        <CollapsibleTrigger
          render={
            <Button variant="ghost" size="icon-xs">
              <CaretDownIcon className={open ? "rotate-180" : ""} />
            </Button>
          }
        />
      </div>
      <CollapsibleContent className="pt-2 flex flex-col gap-1 border-t mt-2">
        <span className="text-xs text-muted-foreground">button.tsx</span>
      </CollapsibleContent>
    </Collapsible>
  )
}`

const DROPDOWN_CODE = `import * as React from "react"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  Button,
} from "@celestia-project/ui"
import { GearIcon, UserIcon, SignOutIcon } from "@phosphor-icons/react"

export function DropdownMenuDemo() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm">
            <GearIcon className="size-4 mr-2" />
            Workspace Options
          </Button>
        }
      />
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <UserIcon className="size-4 mr-2" />
          Profile Details
          <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem className="text-destructive">
          <SignOutIcon className="size-4 mr-2" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}`

const CONTEXT_MENU_CODE = `import * as React from "react"
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
} from "@celestia-project/ui"

export function ContextMenuDemo() {
  return (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-24 w-full border border-dashed rounded-lg items-center justify-center text-xs text-muted-foreground">
        Right-click inside this zone
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem>
          Refresh View
          <ContextMenuShortcut>⌘R</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem className="text-destructive">Delete Node</ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
}`

const MENUBAR_CODE = `import * as React from "react"
import {
  Menubar,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarItem,
  MenubarSeparator,
  MenubarShortcut,
} from "@celestia-project/ui"

export function MenubarDemo() {
  return (
    <Menubar>
      <MenubarMenu>
        <MenubarTrigger>File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>New Tab <MenubarShortcut>⌘T</MenubarShortcut></MenubarItem>
          <MenubarSeparator />
          <MenubarItem>Export Schema...</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>Undo <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  )
}`

const COMMAND_CODE = `import * as React from "react"
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@celestia-project/ui"
import { BookOpenIcon, CodeIcon } from "@phosphor-icons/react"

export function CommandDemo() {
  return (
    <Command className="rounded-lg border">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem><BookOpenIcon className="size-4 mr-2" />Documentation</CommandItem>
          <CommandItem><CodeIcon className="size-4 mr-2" />Browse Components</CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}`

export function NavigationSection() {
  const [collapsibleOpen, setCollapsibleOpen] = React.useState(false)
  const [activeTabId, setActiveTabId] = React.useState("tab-1")
  const [tabs, setTabs] = React.useState<TabItem[]>([
    { id: "tab-1", name: "auth.ts", method: "GET" },
    { id: "tab-2", name: "routes.ts", method: "POST" },
    { id: "tab-3", name: "schema.prisma", method: "PUT" },
  ])

  const [showBookmarks, setShowBookmarks] = React.useState(true)

  const handleAddTab = () => {
    const newId = `tab-${Date.now()}`
    setTabs([...tabs, { id: newId, name: `endpoint-${tabs.length + 1}.ts`, method: "GET" }])
    setActiveTabId(newId)
  }

  const handleRemoveTab = (id: string) => {
    const nextTabs = tabs.filter((t) => t.id !== id)
    setTabs(nextTabs)
    if (activeTabId === id && nextTabs.length > 0 && nextTabs[0]) {
      setActiveTabId(nextTabs[0].id)
    }
  }

  return (
    <div id="navigation" className="flex flex-col gap-6 pt-6">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          Navigation & Menus
        </h2>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          11 components
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 1. Tabs */}
        <ShowcaseCard
          id="tabs"
          title="Tabs"
          category="Navigation"
          description="A set of layered sections of content—known as tab panels—that are displayed one at a time."
          docsSlug="tabs"
          importSnippet={`import { Tabs, TabsList, TabsTrigger, TabsContent } from "@celestia-project/ui"`}
          codeExample={TABS_CODE}
        >
          <Tabs defaultValue="account" className="w-full max-w-sm">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="password">Password</TabsTrigger>
            </TabsList>
            <TabsContent value="account" className="rounded-lg border border-border p-3 text-xs">
              <p className="font-semibold text-foreground">Account Information</p>
              <p className="text-muted-foreground mt-1">Manage your team email addresses and subscription plan.</p>
            </TabsContent>
            <TabsContent value="password" className="rounded-lg border border-border p-3 text-xs">
              <p className="font-semibold text-foreground">Password & Security</p>
              <p className="text-muted-foreground mt-1">Update your password or configure multi-factor authenticator.</p>
            </TabsContent>
          </Tabs>
        </ShowcaseCard>

        {/* 2. Tab Bar */}
        <ShowcaseCard
          id="tab-bar"
          title="Tab Bar"
          category="Navigation"
          description="IDE and API client style tab bar with HTTP method badges, active borders, and add/close actions."
          docsSlug="tab-bar"
          importSnippet={`import { TabBar } from "@celestia-project/ui"`}
          codeExample={TAB_BAR_CODE}
        >
          <div className="w-full max-w-sm rounded-lg border border-border overflow-hidden bg-background p-2">
            <TabBar
              tabs={tabs}
              activeTabId={activeTabId}
              onSelectTab={setActiveTabId}
              onAddTab={handleAddTab}
              onRemoveTab={handleRemoveTab}
            />
          </div>
        </ShowcaseCard>

        {/* 3. Breadcrumb */}
        <ShowcaseCard
          id="breadcrumb"
          title="Breadcrumb"
          category="Navigation"
          description="Displays the path to the current resource using a hierarchy of links."
          docsSlug="breadcrumb"
          importSnippet={`import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis } from "@celestia-project/ui"`}
          codeExample={BREADCRUMB_CODE}
        >
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbEllipsis />
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Packages</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>UI Primitives</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </ShowcaseCard>

        {/* 4. Pagination */}
        <ShowcaseCard
          id="pagination"
          title="Pagination"
          category="Navigation"
          description="Pagination with page numbers, next/previous buttons, and accessible active states."
          docsSlug="pagination"
          importSnippet={`import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@celestia-project/ui"`}
          codeExample={PAGINATION_CODE}
        >
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#" isActive>1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">2</PaginationLink>
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
        </ShowcaseCard>

        {/* 5. Accordion */}
        <ShowcaseCard
          id="accordion"
          title="Accordion"
          category="Navigation"
          description="A vertically stacked set of interactive headings that each reveal a section of content."
          docsSlug="accordion"
          importSnippet={`import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@celestia-project/ui"`}
          codeExample={ACCORDION_CODE}
        >
          <Accordion defaultValue={["item-1"]} className="w-full max-w-sm">
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-xs font-semibold">Is Celestia accessible?</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">
                Yes. All components are built on Base UI primitives adhering to WAI-ARIA authoring guidelines.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger className="text-xs font-semibold">How does monorepo sharing work?</AccordionTrigger>
              <AccordionContent className="text-xs text-muted-foreground">
                Packages are linked via pnpm workspaces, allowing apps/web and apps/api to share TypeScript models and UI tokens.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ShowcaseCard>

        {/* 6. Collapsible */}
        <ShowcaseCard
          id="collapsible"
          title="Collapsible"
          category="Navigation"
          description="An interactive component which expands and collapses a content panel."
          docsSlug="collapsible"
          importSnippet={`import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@celestia-project/ui"`}
          codeExample={COLLAPSIBLE_CODE}
        >
          <Collapsible
            open={collapsibleOpen}
            onOpenChange={setCollapsibleOpen}
            className="w-full max-w-sm rounded-lg border border-border p-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderIcon className="size-4 text-primary" weight="fill" />
                <span className="text-xs font-semibold">@celestia-project/ui/src</span>
              </div>
              <CollapsibleTrigger
                render={
                  <Button variant="ghost" size="icon-xs">
                    <CaretDownIcon className={`size-3.5 transition-transform ${collapsibleOpen ? "rotate-180" : ""}`} />
                  </Button>
                }
              />
            </div>
            <CollapsibleContent className="pt-2 flex flex-col gap-1.5 border-t border-border/50 mt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground pl-2">
                <FileIcon className="size-3.5" />
                <span>button.tsx</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground pl-2">
                <FileIcon className="size-3.5" />
                <span>dialog.tsx</span>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </ShowcaseCard>

        {/* 7. Dropdown Menu */}
        <ShowcaseCard
          id="dropdown-menu"
          title="Dropdown Menu"
          category="Navigation"
          description="Displays a menu to the user—such as a set of actions or functions—triggered by a button."
          docsSlug="dropdown-menu"
          importSnippet={`import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@celestia-project/ui"`}
          codeExample={DROPDOWN_CODE}
        >
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="sm" className="gap-2">
                  <GearIcon className="size-4" />
                  Workspace Options
                </Button>
              }
            />
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => toast.info("Opening profile")}>
                <UserIcon className="size-4 mr-2" />
                Profile Details
                <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Copied API Key")}>
                <CopyIcon className="size-4 mr-2" />
                Copy API Key
                <DropdownMenuShortcut>⌘C</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked={showBookmarks} onCheckedChange={setShowBookmarks}>
                Show Bookmarks Bar
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive">
                <SignOutIcon className="size-4 mr-2" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </ShowcaseCard>

        {/* 8. Context Menu */}
        <ShowcaseCard
          id="context-menu"
          title="Context Menu"
          category="Navigation"
          description="Displays a menu located at the pointer coordinates, triggered by a right-click."
          docsSlug="context-menu"
          importSnippet={`import { ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem } from "@celestia-project/ui"`}
          codeExample={CONTEXT_MENU_CODE}
        >
          <ContextMenu>
            <ContextMenuTrigger className="flex h-24 w-full max-w-sm items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 text-center text-xs text-muted-foreground select-none">
              Right-click inside this zone
            </ContextMenuTrigger>
            <ContextMenuContent className="w-48">
              <ContextMenuItem onClick={() => toast.success("Refreshed!")}>
                Refresh View
                <ContextMenuShortcut>⌘R</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuItem onClick={() => toast.info("Inspect source")}>
                Inspect Component
                <ContextMenuShortcut>⌥⌘I</ContextMenuShortcut>
              </ContextMenuItem>
              <ContextMenuSeparator />
              <ContextMenuItem className="text-destructive">
                <TrashIcon className="size-3.5 mr-2" />
                Delete Node
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>
        </ShowcaseCard>

        {/* 9. Menubar */}
        <ShowcaseCard
          id="menubar"
          title="Menubar"
          category="Navigation"
          description="A desktop-style horizontal menubar with nested commands and shortcuts."
          docsSlug="menubar"
          importSnippet={`import { Menubar, MenubarMenu, MenubarTrigger, MenubarContent, MenubarItem } from "@celestia-project/ui"`}
          codeExample={MENUBAR_CODE}
          className="md:col-span-2"
        >
          <Menubar>
            <MenubarMenu>
              <MenubarTrigger>File</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>New Tab <MenubarShortcut>⌘T</MenubarShortcut></MenubarItem>
                <MenubarItem>New Window <MenubarShortcut>⌘N</MenubarShortcut></MenubarItem>
                <MenubarSeparator />
                <MenubarItem>Export Schema...</MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>Edit</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Undo <MenubarShortcut>⌘Z</MenubarShortcut></MenubarItem>
                <MenubarItem>Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut></MenubarItem>
              </MenubarContent>
            </MenubarMenu>
            <MenubarMenu>
              <MenubarTrigger>View</MenubarTrigger>
              <MenubarContent>
                <MenubarItem>Toggle Fullscreen <MenubarShortcut>⌃⌘F</MenubarShortcut></MenubarItem>
                <MenubarItem>Zoom In <MenubarShortcut>⌘+</MenubarShortcut></MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </ShowcaseCard>

        {/* 10. Command Palette */}
        <ShowcaseCard
          id="command"
          title="Command Palette"
          category="Navigation"
          description="Fast, composable, unstyled command menu for React powered by cmdk."
          docsSlug="command"
          importSnippet={`import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from "@celestia-project/ui"`}
          codeExample={COMMAND_CODE}
          className="md:col-span-2"
        >
          <div className="w-full max-w-md rounded-lg border border-border shadow-md">
            <Command className="rounded-lg">
              <CommandInput placeholder="Type a command or search documentation..." />
              <CommandList className="max-h-44">
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup heading="Suggestions">
                  <CommandItem onSelect={() => toast.info("Opening Calendar")}>
                    <BookOpenIcon className="size-4 mr-2" />
                    <span>View Docs Overview</span>
                  </CommandItem>
                  <CommandItem onSelect={() => toast.info("Opening Components")}>
                    <CodeIcon className="size-4 mr-2" />
                    <span>Browse All Components</span>
                  </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Settings">
                  <CommandItem onSelect={() => toast.info("Opening Profile")}>
                    <UserIcon className="size-4 mr-2" />
                    <span>Manage Profile</span>
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </ShowcaseCard>
      </div>
    </div>
  )
}
