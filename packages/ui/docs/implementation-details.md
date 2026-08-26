# Implementation Details & Import Reference

This document provides technical implementation details for `@celestia-project/ui`, including import conventions, component module mappings, sub-component exports, underlying primitives, and prop APIs.

---

## Import Conventions

The `@celestia-project/ui` library supports both **barrel imports** and **deep imports**.

### 1. Styles & CSS Variables

Choose the integration method based on whether the consuming project already configures Tailwind CSS v4:

#### Option A: Quickstart (Standalone or new apps)

Import the global stylesheet once in your top-level application file (`app/layout.tsx` or `pages/_app.tsx` / `main.tsx`):

```tsx
import "@celestia-project/ui/globals.css"
```

This stylesheet injects Tailwind CSS v4, `tw-animate-css`, shadcn base styles, and oklch theme variables (light + dark mode).

#### Option B: Existing Tailwind v4 Apps (`@source` directive)

In existing Tailwind v4 applications that define their own CSS variables, color palettes, or `@theme` blocks, **do not import `@celestia-project/ui/globals.css`** directly. Doing so can cause duplicate utility injection or overwrite app-level theme variables.

Instead, add the `@source` directive in your project's main stylesheet (e.g. `src/styles/globals.css`):

```css
@import "tailwindcss";

/* 1. Instruct Tailwind to scan the UI package for used class names */
@source "../../node_modules/@celestia-project/ui";
@source "../**";

@custom-variant dark (&:is(.dark *));

/* 2. Map shadcn & Celestia design tokens to Tailwind theme utilities */
@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --radius-2xl: calc(var(--radius) + 8px);
  --radius-3xl: calc(var(--radius) + 12px);
  --radius-4xl: calc(var(--radius) + 16px);

  /* Celestia UI tokens & motion */
  --color-bg: hsl(var(--bg, 0 0% 4%));
  --color-surface: hsl(var(--surface, 0 0% 8%));
  --color-text-primary: hsl(var(--text, 0 0% 96%));
  --color-fog: hsl(0 0% 53%);
  --color-stroke: hsl(var(--stroke, 0 0% 12%));

  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);

  --animate-scroll-down: scroll-down 1.5s ease-in-out infinite;
  --animate-role-fade-in: role-fade-in 0.4s cubic-bezier(0.23, 1, 0.32, 1) both;
  --animate-gradient-shift: gradient-shift 6s ease infinite;

  @keyframes scroll-down {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(200%); }
  }

  @keyframes role-fade-in {
    from { opacity: 0; transform: translateY(8px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }

  @keyframes gradient-shift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
  }
}
```

### 2. Barrel Imports (Recommended for Most Apps)

Barrel imports pull directly from `@celestia-project/ui`. All components are tree-shakeable in modern bundlers (Next.js, Vite).

```tsx
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  cn
} from "@celestia-project/ui"
```

> **Note on Toast Collisions:** Both Base UI Toast and Sonner provide toaster components. In the root barrel export:
> - Base UI `Toast` / `Toaster` is exported as `Toast` / `Toaster`.
> - Sonner `Toaster` is exported as `SonnerToaster`.

### 3. Deep Imports

For strict bundle-size optimizations or non-bundler environments, import directly from the component module paths:

```tsx
import { Button } from "@celestia-project/ui/components/button"
import { Card, CardHeader, CardTitle, CardContent } from "@celestia-project/ui/components/card"
import { Dialog, DialogContent, DialogTrigger } from "@celestia-project/ui/components/dialog"
import { useIsMobile } from "@celestia-project/ui/hooks/use-mobile"
import { cn } from "@celestia-project/ui/lib/utils"
```

### 4. Utilities & Hooks

| Export Name | Import Specifier | Description |
|-------------|------------------|-------------|
| `cn` | `@celestia-project/ui/lib/utils` or barrel | `clsx` + `tailwind-merge` class name helper |
| `useIsMobile` | `@celestia-project/ui/hooks/use-mobile` or barrel | Custom React hook returning boolean for `< 768px` viewport |
| `SonnerToaster` | `@celestia-project/ui` (barrel) | Re-exported Sonner `Toaster` |
| `toast` | `@celestia-project/ui/components/sonner` | Sonner toast trigger function |

---

## Complete Component Mapping Reference

Below is the complete mapping of all 117+ component modules in `packages/ui/src/components/` (63 core UI modules + 54 specialized AI & chat modules), listing their deep import specifiers, exported sub-components, and underlying base primitives.

### Layout & Structure

| Module | Deep Import | Exported Sub-Components | Base Primitive |
|--------|-------------|-------------------------|----------------|
| `aspect-ratio` | `@celestia-project/ui/components/aspect-ratio` | `AspectRatio` | Radix AspectRatio |
| `card` | `@celestia-project/ui/components/card` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` | Custom HTML |
| `resizable` | `@celestia-project/ui/components/resizable` | `Resizable`, `ResizablePanel`, `ResizablePanelGroup`, `ResizableHandle` | `react-resizable-panels` |
| `separator` | `@celestia-project/ui/components/separator` | `Separator` | Base UI `Separator` |
| `sidebar` | `@celestia-project/ui/components/sidebar` | `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupAction`, `SidebarGroupContent`, `SidebarFooter`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuAction`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`, `SidebarMenuBadge`, `SidebarMenuSkeleton`, `SidebarRail`, `SidebarTrigger`, `SidebarInset`, `SidebarInput`, `useSidebar` | Custom + Base UI Tooltip & Sheet |

---

### Typography & Display

| Module | Deep Import | Exported Sub-Components | Base Primitive |
|--------|-------------|-------------------------|----------------|
| `alert` | `@celestia-project/ui/components/alert` | `Alert`, `AlertTitle`, `AlertDescription` | Custom HTML |
| `badge` | `@celestia-project/ui/components/badge` | `Badge`, `badgeVariants` | Custom HTML / CVA |
| `breadcrumb` | `@celestia-project/ui/components/breadcrumb` | `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis` | Custom HTML |
| `empty` | `@celestia-project/ui/components/empty` | `Empty`, `EmptyHeader`, `EmptyTitle`, `EmptyDescription`, `EmptyContent`, `EmptyActions`, `EmptyMedia` | Custom HTML |
| `item` | `@celestia-project/ui/components/item` | `Item`, `ItemGroup`, `ItemHeader`, `ItemFooter`, `ItemTitle`, `ItemDescription`, `ItemMedia`, `ItemActions`, `ItemContent` | Base UI `useRender` |
| `kbd` | `@celestia-project/ui/components/kbd` | `Kbd` | Custom HTML |
| `marker` | `@celestia-project/ui/components/marker` | `Marker` | Custom HTML |
| `message` | `@celestia-project/ui/components/message` | `Message`, `MessageBubble` | Custom HTML |
| `skeleton` | `@celestia-project/ui/components/skeleton` | `Skeleton` | Custom HTML |
| `table` | `@celestia-project/ui/components/table` | `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`, `TableCaption` | Custom HTML |

---

### Forms & Inputs

| Module | Deep Import | Exported Sub-Components | Base Primitive |
|--------|-------------|-------------------------|----------------|
| `button` | `@celestia-project/ui/components/button` | `Button`, `buttonVariants` | Base UI `useRender` |
| `button-group` | `@celestia-project/ui/components/button-group` | `ButtonGroup`, `ButtonGroupText` | Custom HTML |
| `checkbox` | `@celestia-project/ui/components/checkbox` | `Checkbox` | Base UI `Checkbox` |
| `combobox` | `@celestia-project/ui/components/combobox` | `Combobox`, `ComboboxInput`, `ComboboxContent`, `ComboboxList`, `ComboboxItem`, `ComboboxEmpty`, `ComboboxGroup`, `ComboboxLabel` | Base UI `Combobox` |
| `field` | `@celestia-project/ui/components/field` | `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldGroup`, `FieldLegend`, `FieldSeparator` | Base UI `Field` |
| `input` | `@celestia-project/ui/components/input` | `Input` | Custom HTML |
| `input-group` | `@celestia-project/ui/components/input-group` | `InputGroup`, `InputGroupAddon`, `InputGroupInput` | Custom HTML |
| `input-otp` | `@celestia-project/ui/components/input-otp` | `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator` | `input-otp` |
| `label` | `@celestia-project/ui/components/label` | `Label` | Custom HTML |
| `native-select` | `@celestia-project/ui/components/native-select` | `NativeSelect`, `NativeSelectOptGroup`, `NativeSelectOption` | Custom HTML |
| `radio-group` | `@celestia-project/ui/components/radio-group` | `RadioGroup`, `RadioGroupItem` | Base UI `RadioGroup` |
| `select` | `@celestia-project/ui/components/select` | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectLabel`, `SelectSeparator` | Base UI `Select` |
| `slider` | `@celestia-project/ui/components/slider` | `Slider` | Base UI `Slider` |
| `switch` | `@celestia-project/ui/components/switch` | `Switch` | Base UI `Switch` |
| `textarea` | `@celestia-project/ui/components/textarea` | `Textarea` | Custom HTML |
| `toggle` | `@celestia-project/ui/components/toggle` | `Toggle`, `toggleVariants` | Base UI `Toggle` |
| `toggle-group` | `@celestia-project/ui/components/toggle-group` | `ToggleGroup`, `ToggleGroupItem` | Base UI `ToggleGroup` |

---

### Overlays & Popups

| Module | Deep Import | Exported Sub-Components | Base Primitive |
|--------|-------------|-------------------------|----------------|
| `alert-dialog` | `@celestia-project/ui/components/alert-dialog` | `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel`, `AlertDialogClose` | Base UI `AlertDialog` |
| `context-menu` | `@celestia-project/ui/components/context-menu` | `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuCheckboxItem`, `ContextMenuRadioItem`, `ContextMenuLabel`, `ContextMenuSeparator`, `ContextMenuSub`, `ContextMenuSubTrigger`, `ContextMenuSubContent` | Base UI `ContextMenu` |
| `dialog` | `@celestia-project/ui/components/dialog` | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `DialogClose` | Base UI `Dialog` |
| `drawer` | `@celestia-project/ui/components/drawer` | `Drawer`, `DrawerTrigger`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`, `DrawerClose` | `vaul` / Base UI |
| `dropdown-menu` | `@celestia-project/ui/components/dropdown-menu` | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent` | Base UI `DropdownMenu` |
| `hover-card` | `@celestia-project/ui/components/hover-card` | `HoverCard`, `HoverCardTrigger`, `HoverCardContent` | Base UI `HoverCard` |
| `popover` | `@celestia-project/ui/components/popover` | `Popover`, `PopoverTrigger`, `PopoverContent` | Base UI `Popover` |
| `sheet` | `@celestia-project/ui/components/sheet` | `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`, `SheetClose` | Base UI `Dialog` |
| `tooltip` | `@celestia-project/ui/components/tooltip` | `TooltipProvider`, `Tooltip`, `TooltipTrigger`, `TooltipContent` | Base UI `Tooltip` |

---

### Navigation

| Module | Deep Import | Exported Sub-Components | Base Primitive |
|--------|-------------|-------------------------|----------------|
| `menu` | `@celestia-project/ui/components/menu` | `Menu`, `MenuTrigger`, `MenuContent`, `MenuItem`, `MenuGroup`, `MenuSeparator`, `MenuCheckboxItem`, `MenuRadioItem` | Base UI `Menu` |
| `menubar` | `@celestia-project/ui/components/menubar` | `Menubar`, `MenubarMenu`, `MenubarTrigger`, `MenubarContent`, `MenubarItem`, `MenubarSeparator`, `MenubarSub`, `MenubarSubTrigger`, `MenubarSubContent` | Base UI `Menubar` |
| `navigation-menu` | `@celestia-project/ui/components/navigation-menu` | `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuLink` | Radix NavigationMenu |
| `pagination` | `@celestia-project/ui/components/pagination` | `Pagination`, `PaginationContent`, `PaginationLink`, `PaginationItem`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis` | Custom HTML |
| `tabs` | `@celestia-project/ui/components/tabs` | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | Base UI `Tabs` |

---

### Data & Media

| Module | Deep Import | Exported Sub-Components | Base Primitive |
|--------|-------------|-------------------------|----------------|
| `avatar` | `@celestia-project/ui/components/avatar` | `Avatar`, `AvatarImage`, `AvatarFallback` | Base UI `Avatar` |
| `calendar` | `@celestia-project/ui/components/calendar` | `Calendar` | `react-day-picker` |
| `carousel` | `@celestia-project/ui/components/carousel` | `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext` | `embla-carousel-react` |
| `chart` | `@celestia-project/ui/components/chart` | `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `ChartStyle` | Recharts wrapper |
| `progress` | `@celestia-project/ui/components/progress` | `Progress` | Base UI `Progress` |
| `scroll-area` | `@celestia-project/ui/components/scroll-area` | `ScrollArea`, `ScrollBar` | Radix ScrollArea |

---

### AI & Chat Development (`@celestia-project/ui/ai` & `@celestia-project/ui`)

Comprehensive suite of 54 AI development primitives, interactive elements, streaming displays, and agent tools.

| Module | Deep Import | Exported Sub-Components | Purpose |
|--------|-------------|-------------------------|---------|
| `agent` | `@celestia-project/ui/components/ai/agent` | `Agent`, `AgentHeader`, `AgentTools`, `AgentOutput` | Visual AI agent profile with registered tool manifests |
| `artifact` | `@celestia-project/ui/components/ai/artifact` | `Artifact`, `ArtifactHeader`, `ArtifactContent`, `ArtifactAction`, `ArtifactActions`, `ArtifactClose`, `ArtifactTitle`, `ArtifactDescription` | Sidecar artifact container for generated documents, websites, and code |
| `attachment` | `@celestia-project/ui/components/ai/attachment` | `Attachment`, `AttachmentGroup`, `AttachmentMedia`, `AttachmentContent`, `AttachmentTitle`, `AttachmentDescription`, `AttachmentActions`, `AttachmentAction` | Single upload item badge with progress state indicators |
| `attachments` | `@celestia-project/ui/components/ai/attachments` | `Attachments`, `AttachmentItem`, `AttachmentPreview`, `AttachmentRemove`, `AttachmentEmpty`, `AttachmentHoverCard`, `AttachmentHoverCardTrigger`, `AttachmentHoverCardContent` | Multi-file attachment carousel and thumbnail hover preview grid |
| `audio-player` | `@celestia-project/ui/components/ai/audio-player` | `AudioPlayer`, `AudioPlayerElement`, `AudioPlayerControlBar`, `AudioPlayerPlayButton`, `AudioPlayerSeekBackwardButton`, `AudioPlayerSeekForwardButton`, `AudioPlayerTimeDisplay`, `AudioPlayerTimeRange`, `AudioPlayerDurationDisplay`, `AudioPlayerMuteButton`, `AudioPlayerVolumeRange` | AI speech and voice synthesis audio playback controller powered by MediaChrome |
| `bubble` | `@celestia-project/ui/components/ai/bubble` | `Bubble`, `BubbleGroup`, `BubbleContent`, `BubbleReactions` | Chat message speech bubble with customizable alignments, variants, and reactions |
| `canvas` | `@celestia-project/ui/components/ai/canvas` | `Canvas` | Infinite canvas surface for AI workflow visual graphs |
| `chain-of-thought` | `@celestia-project/ui/components/ai/chain-of-thought` | `ChainOfThought`, `ChainOfThoughtStep`, `ChainOfThoughtOutput` | Step-by-step reasoning step timeline |
| `chat-input` | `@celestia-project/ui/components/ai/chat-input` | `ChatInput` | Multi-line text input field tailored for conversational prompt entry |
| `chat-message-area` | `@celestia-project/ui/components/ai/chat-message-area` | `ChatMessageArea` | Scrollable message container layout with automatic bubble stacking |
| `chat-message` | `@celestia-project/ui/components/ai/chat-message` | `ChatMessage` | Role-based message container (user vs assistant) with distinct styling |
| `checkpoint` | `@celestia-project/ui/components/ai/checkpoint` | `Checkpoint`, `CheckpointTrigger`, `CheckpointContent`, `CheckpointRestore`, `CheckpointBadge` | Checkpoint and snapshot version tracker for iterative AI generations |
| `code-block` | `@celestia-project/ui/components/ai/code-block` | `CodeBlock`, `CodeBlockHeader`, `CodeBlockTitle`, `CodeBlockCopyButton`, `CodeBlockLanguageSelect` | Syntax-highlighted code container powered by Shiki with copy button and language selector |
| `commit` | `@celestia-project/ui/components/ai/commit` | `Commit`, `CommitHeader`, `CommitContent`, `CommitDiff` | Git commit and code modification diff viewer for AI code generators |
| `confirmation` | `@celestia-project/ui/components/ai/confirmation` | `Confirmation`, `ConfirmationTitle`, `ConfirmationRequest`, `ConfirmationAccepted`, `ConfirmationRejected`, `ConfirmationActions`, `ConfirmationAction` | Human-in-the-loop tool execution approval alert dialog |
| `connection` | `@celestia-project/ui/components/ai/connection` | `Connection` | Node connection routing line for AI graph workflows |
| `context` | `@celestia-project/ui/components/ai/context` | `Context`, `ContextTrigger`, `ContextContent`, `ContextTokens`, `ContextCacheUsage` | LLM context window token counter and cache utilization monitor |
| `controls` | `@celestia-project/ui/components/ai/controls` | `Controls`, `ControlItem` | Zoom, pan, and fit-to-view navigation controls for canvas workflows |
| `conversation` | `@celestia-project/ui/components/ai/conversation` | `Conversation`, `ConversationContent`, `ConversationEmptyState`, `ConversationScrollToBottom` | Pinned auto-scrolling chat stream container with stick-to-bottom behavior |
| `edge` | `@celestia-project/ui/components/ai/edge` | `Edge` | Visual graph edge connector between workflow nodes |
| `environment-variables` | `@celestia-project/ui/components/ai/environment-variables` | `EnvironmentVariables`, `EnvironmentVariablesHeader`, `EnvironmentVariablesContent` | Key-value environment variable editor for AI tool sandboxes |
| `file-tree` | `@celestia-project/ui/components/ai/file-tree` | `FileTree`, `FileTreeFolder`, `FileTreeFile` | Interactive workspace file tree hierarchy viewer |
| `image` | `@celestia-project/ui/components/ai/image` | `ImageZoom`, `ImagePreview` | AI generated image viewer with lightbox magnification and metadata |
| `inline-citation` | `@celestia-project/ui/components/ai/inline-citation` | `InlineCitation`, `InlineCitationCard`, `InlineCitationSource` | Per-sentence footnote popover linking directly to source citations |
| `jsx-preview` | `@celestia-project/ui/components/ai/jsx-preview` | `JSXPreview` | Safe JSX string sandbox renderer for live AI UI generation |
| `message-scroller` | `@celestia-project/ui/components/ai/message-scroller` | `MessageScroller` | Auto-scrolling viewport maintaining scroll anchor during real-time streaming |
| `message` | `@celestia-project/ui/components/ai/message` | `AiMessage`, `AiMessageContent`, `MessageActions`, `MessageAction`, `MessageBranch`, `MessageBranchContent`, `MessageBranchSelector`, `MessageBranchPrevious`, `MessageBranchNext`, `MessageBranchPage`, `MessageResponse`, `MessageToolbar` | Markdown-rendered message item with multi-branch switching and response actions |
| `mic-selector` | `@celestia-project/ui/components/ai/mic-selector` | `MicSelector`, `MicSelectorTrigger`, `MicSelectorContent` | Input microphone device selector dropdown |
| `model-selector` | `@celestia-project/ui/components/ai/model-selector` | `ModelSelector`, `ModelSelectorTrigger`, `ModelSelectorContent`, `ModelSelectorInput`, `ModelSelectorList`, `ModelSelectorEmpty`, `ModelSelectorGroup`, `ModelSelectorItem`, `ModelSelectorShortcut`, `ModelSelectorSeparator`, `ModelSelectorLogo`, `ModelSelectorLogoGroup`, `ModelSelectorName` | LLM model switcher with provider logos, shortcuts, and context metadata |
| `node` | `@celestia-project/ui/components/ai/node` | `Node`, `NodeHeader`, `NodeContent`, `NodeAction` | Interactive workflow canvas node card |
| `open-in-chat` | `@celestia-project/ui/components/ai/open-in-chat` | `OpenInChat`, `OpenInTrigger`, `OpenInChatGPT`, `OpenInClaude` | Quick-launch external query in ChatGPT, Claude, or Perplexity |
| `package-info` | `@celestia-project/ui/components/ai/package-info` | `PackageInfo`, `PackageInfoHeader`, `PackageInfoContent` | Package manifest and npm dependency analyzer |
| `panel` | `@celestia-project/ui/components/ai/panel` | `Panel`, `PanelHeader`, `PanelContent` | Floating sidecar tool panel on infinite canvases |
| `persona` | `@celestia-project/ui/components/ai/persona` | `Persona`, `PersonaAvatar`, `PersonaName`, `PersonaRole` | AI assistant persona profile badge and role indicator |
| `plan` | `@celestia-project/ui/components/ai/plan` | `Plan`, `PlanHeader`, `PlanTitle`, `PlanDescription`, `PlanAction`, `PlanContent`, `PlanFooter`, `PlanTrigger` | Collapsible multi-step plan breakdown with live streaming shimmer |
| `prompt-input` | `@celestia-project/ui/components/ai/prompt-input` | `PromptInput`, `PromptInputTextarea`, `PromptInputHeader`, `PromptInputFooter`, `PromptInputTools`, `PromptInputButton`, `PromptInputSubmit`, `PromptInputActionMenu`, `PromptInputSelect` | Rich AI prompt bar with multi-line expand, file upload dropzone, command autocomplete, and status controls |
| `queue` | `@celestia-project/ui/components/ai/queue` | `Queue`, `QueueHeader`, `QueueItem`, `QueueContent` | Background job execution and generation queue monitor |
| `reasoning` | `@celestia-project/ui/components/ai/reasoning` | `Reasoning`, `ReasoningTrigger`, `ReasoningContent` | Collapsible streaming chain-of-thought and model reasoning display with timer |
| `sandbox` | `@celestia-project/ui/components/ai/sandbox` | `Sandbox`, `SandboxHeader`, `SandboxContent`, `SandboxRunButton` | Live code execution sandbox with output viewer |
| `schema-display` | `@celestia-project/ui/components/ai/schema-display` | `SchemaDisplay` | Interactive JSON Schema explorer and validator |
| `shimmer` | `@celestia-project/ui/components/ai/shimmer` | `Shimmer` | Text skeleton shimmer animation effect during streaming generation |
| `snippet` | `@celestia-project/ui/components/ai/snippet` | `Snippet`, `SnippetHeader`, `SnippetContent`, `SnippetCopyButton` | Compact code snippet preview and one-click copy card |
| `sources` | `@celestia-project/ui/components/ai/sources` | `Sources`, `SourcesTrigger`, `SourcesContent`, `Source` | Collapsible RAG source references panel with external links |
| `speech-input` | `@celestia-project/ui/components/ai/speech-input` | `SpeechInput` | Speech-to-text voice input controller and audio visualizer |
| `stack-trace` | `@celestia-project/ui/components/ai/stack-trace` | `StackTrace`, `StackTraceHeader`, `StackTraceFrames` | Formatted error stack trace analyzer and frame inspector |
| `suggestion` | `@celestia-project/ui/components/ai/suggestion` | `Suggestions`, `Suggestion` | Horizontal scrollable prompt suggestions and quick action pills |
| `task` | `@celestia-project/ui/components/ai/task` | `Task`, `TaskTrigger`, `TaskContent`, `TaskItem`, `TaskItemFile` | Multi-step agent task progress display with status icons |
| `terminal` | `@celestia-project/ui/components/ai/terminal` | `Terminal`, `TerminalHeader`, `TerminalContent` | Simulated terminal command executor and CLI output stream |
| `test-results` | `@celestia-project/ui/components/ai/test-results` | `TestResults`, `TestResultSummary`, `TestResultList` | Test suite execution breakdown with pass/fail counts |
| `tool` | `@celestia-project/ui/components/ai/tool` | `Tool`, `ToolHeader`, `ToolContent`, `ToolInput`, `ToolOutput` | Agent tool call inspection and execution viewer with status badges |
| `toolbar` | `@celestia-project/ui/components/ai/toolbar` | `Toolbar`, `ToolbarButton`, `ToolbarSeparator`, `ToolbarGroup` | Floating AI action toolbar for canvas and text selections |
| `transcription` | `@celestia-project/ui/components/ai/transcription` | `Transcription`, `TranscriptionSegment` | Audio transcription synchronized viewer |
| `voice-selector` | `@celestia-project/ui/components/ai/voice-selector` | `VoiceSelector`, `VoiceSelectorTrigger`, `VoiceSelectorContent`, `VoiceSelectorList` | Voice selection dialog with audio previews and gender badges |
| `web-preview` | `@celestia-project/ui/components/ai/web-preview` | `WebPreview`, `WebPreviewNavigation`, `WebPreviewAddressBar` | Responsive viewport browser frame for previewing generated web pages |

---

### Feedback & Utilities

| Module | Deep Import | Exported Sub-Components | Base Primitive |
|--------|-------------|-------------------------|----------------|
| `accordion` | `@celestia-project/ui/components/accordion` | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` | Base UI `Accordion` |
| `collapsible` | `@celestia-project/ui/components/collapsible` | `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` | Base UI `Collapsible` |
| `command` | `@celestia-project/ui/components/command` | `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator` | `cmdk` |
| `direction` | `@celestia-project/ui/components/direction` | `DirectionProvider`, `useDirection` | Radix Direction |
| `sonner` | `@celestia-project/ui/components/sonner` | `Toaster`, `toast` | `sonner` |
| `spinner` | `@celestia-project/ui/components/spinner` | `Spinner` | Phosphor Icon |
| `toast` | `@celestia-project/ui/components/toast` | `ToastProvider`, `ToastPortal`, `ToastViewport`, `Toast`, `ToastContent`, `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`, `toast` | Base UI `Toast` |

---

## Key Component Props Reference

### 1. Button (`button.tsx`)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "secondary" \| "outline" \| "ghost" \| "destructive" \| "link"` | `"default"` | Visual style variant |
| `size` | `"default" \| "xs" \| "sm" \| "lg" \| "icon" \| "icon-xs" \| "icon-sm" \| "icon-lg"` | `"default"` | Sizing option |
| `render` | `ReactElement \| ((props, state) => ReactElement)` | `undefined` | Base UI polymorphic render prop |
| `className` | `string` | `undefined` | Custom CSS class overrides |

### 2. Card (`card.tsx`)

| Component | Key Props | Description |
|-----------|-----------|-------------|
| `Card` | `size?: "default" \| "sm"` | Card container with border, radius, and shadow |
| `CardHeader` | `className?: string` | Header wrapper for title and description |
| `CardTitle` | `className?: string` | Card title heading |
| `CardDescription` | `className?: string` | Subtitle / description copy |
| `CardContent` | `className?: string` | Card body container |
| `CardFooter` | `className?: string` | Bottom action bar |

### 3. Sidebar (`sidebar.tsx`)

| Component | Prop | Type | Default | Description |
|-----------|------|------|---------|-------------|
| `SidebarProvider` | `defaultOpen` | `boolean` | `true` | Initial state of sidebar |
| `SidebarProvider` | `open` | `boolean` | `undefined` | Controlled state |
| `SidebarProvider` | `onOpenChange` | `(open: boolean) => void` | `undefined` | Toggle handler |
| `Sidebar` | `side` | `"left" \| "right"` | `"left"` | Dock side |
| `Sidebar` | `variant` | `"sidebar" \| "floating" \| "inset"` | `"sidebar"` | Layout style |
| `Sidebar` | `collapsible` | `"offcanvas" \| "icon" \| "none"` | `"offcanvas"` | Collapse strategy |
| `SidebarMenuButton` | `isActive` | `boolean` | `false` | Highlights active menu item |
| `SidebarMenuButton` | `tooltip` | `string \| TooltipContentProps` | `undefined` | Auto-tooltip on collapse |

### 4. Dialog & Sheet (`dialog.tsx`, `sheet.tsx`)

| Component | Prop | Type | Default | Description |
|-----------|------|------|---------|-------------|
| `Dialog` / `Sheet` | `open` | `boolean` | `undefined` | Controlled open state |
| `Dialog` / `Sheet` | `onOpenChange` | `(open: boolean) => void` | `undefined` | State change callback |
| `SheetContent` | `side` | `"top" \| "bottom" \| "left" \| "right"` | `"right"` | Sheet slide-in position |

### 5. Attachment (`attachment.tsx`)

| Component | Prop | Type | Default | Description |
|-----------|------|------|---------|-------------|
| `Attachment` | `state` | `"idle" \| "uploading" \| "processing" \| "error" \| "done"` | `"done"` | Upload state indicator |
| `Attachment` | `size` | `"default" \| "sm" \| "xs"` | `"default"` | Attachment sizing |
| `Attachment` | `orientation` | `"horizontal" \| "vertical"` | `"horizontal"` | Layout direction |
| `AttachmentMedia` | `variant` | `"icon" \| "image"` | `"icon"` | Media thumbnail display |
