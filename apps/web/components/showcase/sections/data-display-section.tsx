"use client"

import * as React from "react"
import {
  SparkleIcon,
  CheckCircleIcon,
  ClockIcon,
  UserIcon,
  ArrowRightIcon,
  CalendarBlankIcon,
  DatabaseIcon,
  ShieldCheckIcon,
  CloudCheckIcon,
  FileCodeIcon,
  TagIcon,
  PlusIcon,
} from "@phosphor-icons/react"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  ArticleCard,
  Badge,
  Avatar,
  AvatarImage,
  AvatarFallback,
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
  DataTable,
  type ColumnDef,
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  Item,
  ItemGroup,
  ItemContent,
  ItemTitle,
  ItemDescription,
  ItemMedia,
  ItemActions,
  Marker,
  MarkerIcon,
  MarkerContent,
  Kbd,
  Skeleton,
  AspectRatio,
  Separator,
  Button,
} from "@celestia-project/ui"
import { ShowcaseCard } from "../showcase-card"

interface SampleUser {
  id: string
  name: string
  email: string
  role: string
  status: "Active" | "Pending" | "Suspended"
  spent: string
}

const SAMPLE_USERS: SampleUser[] = [
  { id: "1", name: "Sarah Connor", email: "sarah@skynet.ai", role: "Admin", status: "Active", spent: "$1,240.00" },
  { id: "2", name: "Alex Mercer", email: "alex@blacklight.org", role: "Developer", status: "Active", spent: "$450.00" },
  { id: "3", name: "Elena Fisher", email: "elena@uncharted.com", role: "Designer", status: "Pending", spent: "$120.00" },
  { id: "4", name: "Gordon Freeman", email: "gordon@blackmesa.gov", role: "Scientist", status: "Active", spent: "$3,890.00" },
]

const COLUMNS: ColumnDef<SampleUser>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Avatar className="size-6">
          <AvatarFallback className="text-[10px]">
            {row.original.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium text-xs text-foreground">{row.original.name}</span>
          <span className="text-[10px] text-muted-foreground">{row.original.email}</span>
        </div>
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant="outline" className="text-[10px] font-normal">
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <span className={row.original.status === "Active" ? "text-green-500 text-xs font-medium" : "text-amber-500 text-xs font-medium"}>
        {row.original.status}
      </span>
    ),
  },
  {
    accessorKey: "spent",
    header: "Usage",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium">{row.original.spent}</span>
    ),
  },
]

const CARD_CODE = `import * as React from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Button } from "@celestia-project/ui"
import { CheckCircleIcon } from "@phosphor-icons/react"

export function CardDemo() {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>PostgreSQL Database</CardTitle>
          <Badge variant="secondary" className="gap-1">
            <CheckCircleIcon className="size-3 text-green-500" weight="fill" />
            Healthy
          </Badge>
        </div>
        <CardDescription>Serverless instance hosted in us-east-1.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-xs">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Active Connections</span>
          <span className="font-mono font-medium">14 / 100</span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        <Button size="xs" variant="outline">Settings</Button>
        <Button size="xs" variant="default">Manage Pool</Button>
      </CardFooter>
    </Card>
  )
}`

const ARTICLE_CARD_CODE = `import * as React from "react"
import { ArticleCard } from "@celestia-project/ui"
import { CalendarBlankIcon, UserIcon, ArrowRightIcon } from "@phosphor-icons/react"

export function ArticleCardDemo() {
  return (
    <ArticleCard
      title="Building High-Performance Fullstack Apps with Celestia"
      excerpt="Learn how Decoupled Next.js 16 and Hono backends work together seamlessly with shared Drizzle ORM models."
      category="Engineering"
      date="Aug 15, 2026"
      author="Dev Team"
      slug="building-high-performance-fullstack"
      dateIcon={<CalendarBlankIcon className="size-3" />}
      authorIcon={<UserIcon className="size-3" />}
      arrowIcon={<ArrowRightIcon className="size-3" />}
      className="w-full max-w-sm"
    />
  )
}`

const BADGE_CODE = `import * as React from "react"
import { Badge } from "@celestia-project/ui"
import { SparkleIcon, ClockIcon } from "@phosphor-icons/react"

export function BadgeDemo() {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <Badge variant="default">Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
      <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-500">
        <SparkleIcon className="size-3" weight="fill" />
        Pro Feature
      </Badge>
      <Badge variant="outline" className="gap-1 font-mono text-[10px]">
        <ClockIcon className="size-3" />
        v0.2.1
      </Badge>
    </div>
  )
}`

const AVATAR_CODE = `import * as React from "react"
import { Avatar, AvatarImage, AvatarFallback } from "@celestia-project/ui"

export function AvatarDemo() {
  return (
    <div className="flex items-center gap-4">
      <Avatar className="size-10">
        <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" />
        <AvatarFallback>SC</AvatarFallback>
      </Avatar>

      <Avatar className="size-10 bg-primary/10 text-primary">
        <AvatarFallback>CL</AvatarFallback>
      </Avatar>

      {/* Avatar Stack */}
      <div className="flex -space-x-2.5">
        <Avatar className="size-8 ring-2 ring-background">
          <AvatarFallback className="bg-sky-500 text-white text-[10px]">A</AvatarFallback>
        </Avatar>
        <Avatar className="size-8 ring-2 ring-background">
          <AvatarFallback className="bg-purple-500 text-white text-[10px]">+4</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}`

const TABLE_CODE = `import * as React from "react"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell, Badge } from "@celestia-project/ui"

export function TableDemo() {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Endpoint</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Latency</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell className="font-mono text-xs font-medium">/api/v1/auth/session</TableCell>
          <TableCell><Badge variant="secondary">GET</Badge></TableCell>
          <TableCell className="text-green-500 font-medium">200 OK</TableCell>
          <TableCell className="text-right font-mono">12 ms</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}`

const DATA_TABLE_CODE = `import * as React from "react"
import { DataTable, type ColumnDef, Badge, Avatar, AvatarFallback } from "@celestia-project/ui"

interface User {
  id: string
  name: string
  email: string
  role: string
}

const columns: ColumnDef<User>[] = [
  { accessorKey: "name", header: "User" },
  { accessorKey: "role", header: "Role" },
]

export function DataTableDemo({ data }: { data: User[] }) {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchKey="name"
      searchPlaceholder="Filter members..."
    />
  )
}`

const EMPTY_CODE = `import * as React from "react"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia, Button } from "@celestia-project/ui"
import { DatabaseIcon, PlusIcon } from "@phosphor-icons/react"

export function EmptyDemo() {
  return (
    <Empty className="w-full max-w-sm border">
      <EmptyMedia variant="icon">
        <DatabaseIcon className="size-5 text-muted-foreground" />
      </EmptyMedia>
      <EmptyHeader>
        <EmptyTitle>No database records</EmptyTitle>
        <EmptyDescription>Get started by creating your first migration.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button size="xs" variant="default">
          <PlusIcon className="size-3.5 mr-1" />
          Create New Model
        </Button>
      </EmptyContent>
    </Empty>
  )
}`

const ITEM_CODE = `import * as React from "react"
import { Item, ItemGroup, ItemContent, ItemTitle, ItemDescription, ItemMedia, ItemActions, Badge } from "@celestia-project/ui"
import { ShieldCheckIcon } from "@phosphor-icons/react"

export function ItemDemo() {
  return (
    <ItemGroup className="w-full max-w-sm">
      <Item variant="outline" className="p-3">
        <ItemMedia>
          <div className="grid size-8 place-items-center rounded bg-primary/10 text-primary">
            <ShieldCheckIcon className="size-4" />
          </div>
        </ItemMedia>
        <ItemContent>
          <ItemTitle>Access Control</ItemTitle>
          <ItemDescription>Manage RBAC permissions per workspace.</ItemDescription>
        </ItemContent>
        <ItemActions>
          <Badge variant="outline">Active</Badge>
        </ItemActions>
      </Item>
    </ItemGroup>
  )
}`

const MARKER_CODE = `import * as React from "react"
import { Marker, MarkerIcon, MarkerContent } from "@celestia-project/ui"
import { TagIcon, SparkleIcon } from "@phosphor-icons/react"

export function MarkerDemo() {
  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <Marker variant="default">
        <MarkerIcon><TagIcon className="text-primary" /></MarkerIcon>
        <MarkerContent>Release v1.0.4 published</MarkerContent>
      </Marker>
      <Marker variant="separator">
        <MarkerContent>Today</MarkerContent>
      </Marker>
    </div>
  )
}`

const KBD_CODE = `import * as React from "react"
import { Kbd } from "@celestia-project/ui"

export function KbdDemo() {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Quick search:</span>
      <Kbd>⌘</Kbd>
      <Kbd>K</Kbd>
    </div>
  )
}`

const SKELETON_CODE = `import * as React from "react"
import { Skeleton } from "@celestia-project/ui"

export function SkeletonDemo() {
  return (
    <div className="flex items-center gap-3 max-w-sm">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-3.5 w-3/4 rounded" />
        <Skeleton className="h-2.5 w-1/2 rounded" />
      </div>
    </div>
  )
}`

const ASPECT_RATIO_CODE = `import * as React from "react"
import { AspectRatio } from "@celestia-project/ui"
import { FileCodeIcon } from "@phosphor-icons/react"

export function AspectRatioDemo() {
  return (
    <AspectRatio ratio={16 / 9} className="bg-muted flex items-center justify-center rounded-lg">
      <FileCodeIcon className="size-6 text-muted-foreground" />
    </AspectRatio>
  )
}`

const SEPARATOR_CODE = `import * as React from "react"
import { Separator } from "@celestia-project/ui"

export function SeparatorDemo() {
  return (
    <div className="flex items-center gap-3">
      <span>Home</span>
      <Separator orientation="vertical" className="h-4" />
      <span>Components</span>
      <Separator orientation="vertical" className="h-4" />
      <span>Docs</span>
    </div>
  )
}`

export function DataDisplaySection() {
  return (
    <div id="data-display" className="flex flex-col gap-6 pt-6">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          Data Display
        </h2>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          13 components
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 1. Card */}
        <ShowcaseCard
          id="card"
          title="Card"
          category="Data Display"
          description="Structured container component with header, title, description, content body, and footer."
          docsSlug="card"
          importSnippet={`import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@celestia-project/ui"`}
          codeExample={CARD_CODE}
        >
          <Card className="w-full max-w-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">PostgreSQL Database</CardTitle>
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <CheckCircleIcon className="size-3 text-green-500" weight="fill" />
                  Healthy
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Neon serverless instance hosted in us-east-1.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-xs">
              <div className="flex justify-between border-b border-border/50 pb-1.5">
                <span className="text-muted-foreground">Active Connections</span>
                <span className="font-mono font-medium">14 / 100</span>
              </div>
              <div className="flex justify-between border-b border-border/50 pb-1.5">
                <span className="text-muted-foreground">Storage Used</span>
                <span className="font-mono font-medium">1.42 GB (14%)</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 pt-0">
              <Button size="xs" variant="outline">Settings</Button>
              <Button size="xs" variant="default">Manage Pool</Button>
            </CardFooter>
          </Card>
        </ShowcaseCard>

        {/* 2. Article Card */}
        <ShowcaseCard
          id="article-card"
          title="Article Card"
          category="Data Display"
          description="Pre-styled editorial card for blog posts, documentation tutorials, and feature announcements."
          docsSlug="article-card"
          importSnippet={`import { ArticleCard } from "@celestia-project/ui"`}
          codeExample={ARTICLE_CARD_CODE}
        >
          <ArticleCard
            title="Building High-Performance Fullstack Apps with Celestia"
            excerpt="Discover how Decoupled Next.js 16 and Hono backends work together seamlessly with shared Drizzle ORM models."
            category="Engineering"
            date="Aug 15, 2026"
            author="Dev Team"
            slug="building-high-performance-fullstack"
            dateIcon={<CalendarBlankIcon className="size-3" />}
            authorIcon={<UserIcon className="size-3" />}
            arrowIcon={<ArrowRightIcon className="size-3" />}
            className="w-full max-w-sm"
          />
        </ShowcaseCard>

        {/* 3. Badge */}
        <ShowcaseCard
          id="badge"
          title="Badge"
          category="Data Display"
          description="Small status descriptors and tags in default, secondary, destructive, and outline variants."
          docsSlug="badge"
          importSnippet={`import { Badge } from "@celestia-project/ui"`}
          codeExample={BADGE_CODE}
        >
          <div className="flex flex-wrap items-center justify-center gap-2.5">
            <Badge variant="default">Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
            <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-500 border-amber-500/20">
              <SparkleIcon className="size-3" weight="fill" />
              Pro Feature
            </Badge>
            <Badge variant="outline" className="gap-1 font-mono text-[10px]">
              <ClockIcon className="size-3" />
              v0.2.1
            </Badge>
          </div>
        </ShowcaseCard>

        {/* 4. Avatar */}
        <ShowcaseCard
          id="avatar"
          title="Avatar"
          category="Data Display"
          description="An image element with fallback initials for representing users and organizations."
          docsSlug="avatar"
          importSnippet={`import { Avatar, AvatarImage, AvatarFallback } from "@celestia-project/ui"`}
          codeExample={AVATAR_CODE}
        >
          <div className="flex items-center gap-4">
            <Avatar className="size-10">
              <AvatarImage src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="Avatar" />
              <AvatarFallback>SC</AvatarFallback>
            </Avatar>

            <Avatar className="size-10 ring-2 ring-primary/20">
              <AvatarImage src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="Avatar 2" />
              <AvatarFallback>AM</AvatarFallback>
            </Avatar>

            <Avatar className="size-10 bg-primary/10 text-primary">
              <AvatarFallback className="font-medium text-xs">CL</AvatarFallback>
            </Avatar>

            {/* Avatar Stack */}
            <div className="flex -space-x-2.5 overflow-hidden">
              <Avatar className="size-8 ring-2 ring-background">
                <AvatarFallback className="bg-sky-500 text-white text-[10px]">A</AvatarFallback>
              </Avatar>
              <Avatar className="size-8 ring-2 ring-background">
                <AvatarFallback className="bg-emerald-500 text-white text-[10px]">B</AvatarFallback>
              </Avatar>
              <Avatar className="size-8 ring-2 ring-background">
                <AvatarFallback className="bg-purple-500 text-white text-[10px]">+4</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </ShowcaseCard>

        {/* 5. Table */}
        <ShowcaseCard
          id="table"
          title="Table"
          category="Data Display"
          description="A responsive HTML table component styled with Celestia design system tokens."
          docsSlug="table"
          importSnippet={`import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@celestia-project/ui"`}
          codeExample={TABLE_CODE}
          className="md:col-span-2"
        >
          <div className="w-full overflow-hidden rounded-lg border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Endpoint</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Latency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-xs font-medium">/api/v1/auth/session</TableCell>
                  <TableCell><Badge variant="secondary" className="font-mono text-[10px]">GET</Badge></TableCell>
                  <TableCell className="text-green-500 text-xs font-medium">200 OK</TableCell>
                  <TableCell className="text-right font-mono text-xs">12 ms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs font-medium">/api/v1/users/create</TableCell>
                  <TableCell><Badge variant="default" className="font-mono text-[10px]">POST</Badge></TableCell>
                  <TableCell className="text-green-500 text-xs font-medium">201 Created</TableCell>
                  <TableCell className="text-right font-mono text-xs">48 ms</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs font-medium">/api/v1/posts/38</TableCell>
                  <TableCell><Badge variant="outline" className="font-mono text-[10px]">DELETE</Badge></TableCell>
                  <TableCell className="text-muted-foreground text-xs">204 No Content</TableCell>
                  <TableCell className="text-right font-mono text-xs">22 ms</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </ShowcaseCard>

        {/* 6. Data Table (TanStack) */}
        <ShowcaseCard
          id="data-table"
          title="Data Table"
          category="Data Display"
          description="Interactive TanStack table with column sorting, search filtering, and pagination."
          docsSlug="data-table"
          importSnippet={`import { DataTable } from "@celestia-project/ui"`}
          codeExample={DATA_TABLE_CODE}
          className="md:col-span-2"
        >
          <div className="w-full">
            <DataTable
              columns={COLUMNS}
              data={SAMPLE_USERS}
              searchKey="name"
              searchPlaceholder="Filter members..."
            />
          </div>
        </ShowcaseCard>

        {/* 7. Empty State */}
        <ShowcaseCard
          id="empty"
          title="Empty State"
          category="Data Display"
          description="Clean placeholder container to guide users when no content or records exist."
          docsSlug="empty"
          importSnippet={`import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent, EmptyMedia } from "@celestia-project/ui"`}
          codeExample={EMPTY_CODE}
        >
          <Empty className="w-full max-w-sm border border-border/80">
            <EmptyMedia variant="icon">
              <DatabaseIcon className="size-5 text-muted-foreground" />
            </EmptyMedia>
            <EmptyHeader>
              <EmptyTitle>No database records found</EmptyTitle>
              <EmptyDescription>
                Get started by creating your first migration or seeding sample data.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="xs" variant="default" className="gap-1">
                <PlusIcon className="size-3.5" />
                Create New Model
              </Button>
            </EmptyContent>
          </Empty>
        </ShowcaseCard>

        {/* 8. Item & Item Group */}
        <ShowcaseCard
          id="item"
          title="Item & Item Group"
          category="Data Display"
          description="Compound list item primitive for structured feeds, activity logs, and settings."
          docsSlug="item"
          importSnippet={`import { Item, ItemGroup, ItemContent, ItemTitle, ItemDescription, ItemMedia, ItemActions } from "@celestia-project/ui"`}
          codeExample={ITEM_CODE}
        >
          <ItemGroup className="w-full max-w-sm">
            <Item variant="outline" className="p-3">
              <ItemMedia>
                <div className="grid size-8 place-items-center rounded-md bg-primary/10 text-primary">
                  <ShieldCheckIcon className="size-4" />
                </div>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Role-Based Access Control</ItemTitle>
                <ItemDescription>Manage RBAC permissions per workspace.</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge variant="outline" className="text-[10px]">Active</Badge>
              </ItemActions>
            </Item>

            <Item variant="outline" className="p-3">
              <ItemMedia>
                <div className="grid size-8 place-items-center rounded-md bg-sky-500/10 text-sky-500">
                  <CloudCheckIcon className="size-4" />
                </div>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>Automated Backups</ItemTitle>
                <ItemDescription>Daily point-in-time recovery enabled.</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Badge variant="secondary" className="text-[10px]">Daily</Badge>
              </ItemActions>
            </Item>
          </ItemGroup>
        </ShowcaseCard>

        {/* 9. Marker */}
        <ShowcaseCard
          id="marker"
          title="Marker"
          category="Data Display"
          description="Inline badge and separator markers to highlight timeline events and metadata."
          docsSlug="marker"
          importSnippet={`import { Marker, MarkerIcon, MarkerContent } from "@celestia-project/ui"`}
          codeExample={MARKER_CODE}
        >
          <div className="flex w-full max-w-sm flex-col gap-3">
            <Marker variant="default">
              <MarkerIcon>
                <TagIcon className="text-primary" />
              </MarkerIcon>
              <MarkerContent>Release v1.0.4 published to NPM</MarkerContent>
            </Marker>

            <Marker variant="separator">
              <MarkerContent>Today</MarkerContent>
            </Marker>

            <Marker variant="border">
              <MarkerIcon>
                <SparkleIcon className="text-amber-400" />
              </MarkerIcon>
              <MarkerContent>New AI Chat Bubble primitives enabled</MarkerContent>
            </Marker>
          </div>
        </ShowcaseCard>

        {/* 10. Kbd */}
        <ShowcaseCard
          id="kbd"
          title="Kbd (Keyboard)"
          category="Data Display"
          description="Displays keyboard buttons and shortcut combinations with authentic keycap styling."
          docsSlug="kbd"
          importSnippet={`import { Kbd } from "@celestia-project/ui"`}
          codeExample={KBD_CODE}
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Command Palette:</span>
              <Kbd>⌘</Kbd>
              <Kbd>K</Kbd>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Toggle Dark:</span>
              <Kbd>D</Kbd>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Save:</span>
              <Kbd>Ctrl</Kbd>
              <Kbd>S</Kbd>
            </div>
          </div>
        </ShowcaseCard>

        {/* 11. Skeleton */}
        <ShowcaseCard
          id="skeleton"
          title="Skeleton"
          category="Data Display"
          description="Displays a subtle pulsing placeholder preview while asynchronous data is loading."
          docsSlug="skeleton"
          importSnippet={`import { Skeleton } from "@celestia-project/ui"`}
          codeExample={SKELETON_CODE}
        >
          <div className="flex w-full max-w-sm items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-3/4 rounded" />
              <Skeleton className="h-2.5 w-1/2 rounded" />
            </div>
          </div>
        </ShowcaseCard>

        {/* 12. Aspect Ratio */}
        <ShowcaseCard
          id="aspect-ratio"
          title="Aspect Ratio"
          category="Data Display"
          description="Displays media content within a fixed proportional aspect ratio (e.g. 16:9, 4:3, 1:1)."
          docsSlug="aspect-ratio"
          importSnippet={`import { AspectRatio } from "@celestia-project/ui"`}
          codeExample={ASPECT_RATIO_CODE}
        >
          <div className="w-full max-w-xs overflow-hidden rounded-lg border border-border">
            <AspectRatio ratio={16 / 9} className="bg-muted flex items-center justify-center">
              <div className="flex flex-col items-center gap-1 text-muted-foreground">
                <FileCodeIcon className="size-6" />
                <span className="font-mono text-[11px]">16:9 Aspect Ratio</span>
              </div>
            </AspectRatio>
          </div>
        </ShowcaseCard>

        {/* 13. Separator */}
        <ShowcaseCard
          id="separator"
          title="Separator"
          category="Data Display"
          description="Visually or semantically separates content horizontally or vertically."
          docsSlug="separator"
          importSnippet={`import { Separator } from "@celestia-project/ui"`}
          codeExample={SEPARATOR_CODE}
        >
          <div className="flex flex-col items-center gap-3 w-full max-w-sm text-xs">
            <div className="flex items-center gap-3">
              <span>Home</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Components</span>
              <Separator orientation="vertical" className="h-4" />
              <span>Docs</span>
            </div>
            <Separator orientation="horizontal" className="w-full" />
            <span className="text-[11px] text-muted-foreground">Horizontal & Vertical dividers</span>
          </div>
        </ShowcaseCard>
      </div>
    </div>
  )
}
