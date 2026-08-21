"use client"

import * as React from "react"
import {
  PaperPlaneRightIcon,
  FilePdfIcon,
  FileImageIcon,
  FileCodeIcon,
  ThumbsUpIcon,
  HeartIcon,
  XIcon,
  BrainIcon,
  WrenchIcon,
  SparkleIcon,
  GlobeIcon,
  BookBookmarkIcon,
  PlayIcon,
  CheckCircleIcon,
} from "@phosphor-icons/react"
import {
  ChatMessage,
  ChatMessageArea,
  ChatInput,
  Bubble,
  BubbleGroup,
  BubbleContent,
  BubbleReactions,
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  Button,
  Badge,
  PromptInput,
  PromptInputTextarea,
  PromptInputHeader,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputSelect,
  PromptInputSelectTrigger,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectValue,
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
  Tool,
  ToolHeader,
  ToolContent,
  ToolInput,
  ToolOutput,
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
  TaskItemFile,
  Plan,
  PlanHeader,
  PlanTitle,
  PlanDescription,
  PlanContent,
  PlanTrigger,
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
  Suggestions,
  Suggestion,
  AudioPlayer,
  AudioPlayerControlBar,
  AudioPlayerPlayButton,
  AudioPlayerSeekBackwardButton,
  AudioPlayerSeekForwardButton,
  AudioPlayerTimeDisplay,
  AudioPlayerTimeRange,
  AudioPlayerDurationDisplay,
  AudioPlayerMuteButton,
  FileTree,
  FileTreeFolder,
  FileTreeFile,
  Confirmation,
  ConfirmationTitle,
  ConfirmationActions,
  ConfirmationAction,
  Context,
  ContextTrigger,
  ContextContent,
  ContextTokens,
  ContextCacheUsage,
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorLogo,
  ModelSelectorName,
} from "@celestia-project/ui"
import { ShowcaseCard } from "../showcase-card"

// Code Examples for Cards
const PROMPT_INPUT_CODE = `import * as React from "react"
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputHeader,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputSelect,
  PromptInputSelectTrigger,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectValue,
} from "@celestia-project/ui"
import { SparkleIcon } from "@phosphor-icons/react"

export function PromptInputDemo() {
  const [prompt, setPrompt] = React.useState("")
  const [model, setModel] = React.useState("gpt-4o")

  return (
    <PromptInput
      value={prompt}
      onValueChange={setPrompt}
      onSubmit={() => console.log("Submit:", prompt)}
      className="w-full max-w-lg rounded-xl border bg-background/95 backdrop-blur-md shadow-xs"
    >
      <PromptInputHeader>
        <PromptInputSelect value={model} onValueChange={setModel}>
          <PromptInputSelectTrigger className="h-7 text-xs font-mono">
            <SparkleIcon className="size-3 text-primary mr-1" weight="fill" />
            <PromptInputSelectValue placeholder="Select model" />
          </PromptInputSelectTrigger>
          <PromptInputSelectContent>
            <PromptInputSelectItem value="claude-3-7-sonnet">Claude 3.7 Sonnet</PromptInputSelectItem>
            <PromptInputSelectItem value="gpt-4o">GPT-4o</PromptInputSelectItem>
            <PromptInputSelectItem value="gemini-2-flash">Gemini 2.0 Flash</PromptInputSelectItem>
          </PromptInputSelectContent>
        </PromptInputSelect>
      </PromptInputHeader>

      <PromptInputTextarea
        placeholder="Ask anything or request agent refactoring..."
        className="min-h-[72px] text-sm"
      />

      <PromptInputFooter>
        <PromptInputTools>
          <PromptInputButton variant="ghost" size="icon-xs" aria-label="Add file">
            📎
          </PromptInputButton>
        </PromptInputTools>
        <PromptInputSubmit disabled={!prompt.trim()} size="sm" className="rounded-lg">
          Generate
        </PromptInputSubmit>
      </PromptInputFooter>
    </PromptInput>
  )
}`

const REASONING_CODE = `import * as React from "react"
import { Reasoning, ReasoningTrigger, ReasoningContent } from "@celestia-project/ui"

export function ReasoningDemo() {
  return (
    <Reasoning defaultOpen duration={4} className="w-full max-w-md rounded-xl border p-4 bg-muted/20">
      <ReasoningTrigger />
      <ReasoningContent>
        The user wants to generate database indexes for Drizzle ORM.
        1. Analyzed schema relationships in \`packages/db/src/schema\`.
        2. Computed compound indexes on foreign keys (\`userId\`, \`createdAt\`).
        3. Formatted migration SQL with transactional safety.
      </ReasoningContent>
    </Reasoning>
  )
}`

const TOOL_CODE = `import * as React from "react"
import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from "@celestia-project/ui"

export function ToolDemo() {
  return (
    <Tool defaultOpen className="w-full max-w-md rounded-xl border bg-card/60">
      <ToolHeader
        toolName="executeSqlMigration"
        type="dynamic-tool"
        state="output-available"
      />
      <ToolContent>
        <ToolInput input={{ migration: "0002_add_posts_idx.sql", target: "postgresql" }} />
        <ToolOutput output={{ applied: 3, durationMs: 42, status: "SUCCESS" }} />
      </ToolContent>
    </Tool>
  )
}`

const MODEL_SELECTOR_CODE = `import * as React from "react"
import {
  ModelSelector,
  ModelSelectorTrigger,
  ModelSelectorContent,
  ModelSelectorInput,
  ModelSelectorList,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorItem,
  ModelSelectorLogo,
  ModelSelectorName,
  Button
} from "@celestia-project/ui"
import { SparkleIcon } from "@phosphor-icons/react"

export function ModelSelectorDemo() {
  const [model, setModel] = React.useState("claude-3-7-sonnet")

  return (
    <ModelSelector>
      <ModelSelectorTrigger>
        <Button variant="outline" size="sm" className="gap-2 font-mono text-xs">
          <SparkleIcon className="size-3.5 text-primary" weight="fill" />
          <span>{model}</span>
        </Button>
      </ModelSelectorTrigger>
      <ModelSelectorContent>
        <ModelSelectorInput placeholder="Search 50+ models..." />
        <ModelSelectorList>
          <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
          <ModelSelectorGroup heading="Anthropic">
            <ModelSelectorItem onSelect={() => setModel("claude-3-7-sonnet")}>
              <ModelSelectorLogo provider="anthropic" />
              <ModelSelectorName>Claude 3.7 Sonnet</ModelSelectorName>
            </ModelSelectorItem>
          </ModelSelectorGroup>
          <ModelSelectorGroup heading="OpenAI">
            <ModelSelectorItem onSelect={() => setModel("gpt-4o")}>
              <ModelSelectorLogo provider="openai" />
              <ModelSelectorName>GPT-4o</ModelSelectorName>
            </ModelSelectorItem>
          </ModelSelectorGroup>
        </ModelSelectorList>
      </ModelSelectorContent>
    </ModelSelector>
  )
}`

const PLAN_TASK_CODE = `import * as React from "react"
import {
  Plan,
  PlanHeader,
  PlanTitle,
  PlanDescription,
  PlanContent,
  PlanTrigger,
  Task,
  TaskTrigger,
  TaskContent,
  TaskItem,
  TaskItemFile
} from "@celestia-project/ui"

export function PlanTaskDemo() {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      <Plan defaultOpen>
        <PlanHeader>
          <PlanTitle>Refactor Authentication Layer</PlanTitle>
          <PlanDescription>Decouple Better Auth server to apps/api</PlanDescription>
          <PlanTrigger />
        </PlanHeader>
        <PlanContent>
          <Task defaultOpen status="in_progress" completed={2} total={3}>
            <TaskTrigger title="Execution Steps" status="in_progress" completed={2} total={3} />
            <TaskContent>
              <TaskItem status="completed">
                Move auth instance to <TaskItemFile>apps/api/src/auth.ts</TaskItemFile>
              </TaskItem>
              <TaskItem status="completed">
                Export client from <TaskItemFile>packages/ui</TaskItemFile>
              </TaskItem>
              <TaskItem status="in_progress">
                Configure Next.js proxy route rewrite
              </TaskItem>
            </TaskContent>
          </Task>
        </PlanContent>
      </Plan>
    </div>
  )
}`

const SUGGESTIONS_CODE = `import * as React from "react"
import { Suggestions, Suggestion } from "@celestia-project/ui"

export function SuggestionsDemo() {
  const [selected, setSelected] = React.useState("")

  return (
    <Suggestions>
      <Suggestion suggestion="Create Drizzle schema" onClick={setSelected} />
      <Suggestion suggestion="Add Better Auth Google OAuth" onClick={setSelected} />
      <Suggestion suggestion="Scaffold Next.js 16 UI route" onClick={setSelected} />
      <Suggestion suggestion="Run typecheck & build" onClick={setSelected} />
    </Suggestions>
  )
}`

const SOURCES_CODE = `import * as React from "react"
import { Sources, SourcesTrigger, SourcesContent, Source, InlineCitation, InlineCitationCard, InlineCitationCardTrigger } from "@celestia-project/ui"

export function SourcesDemo() {
  return (
    <div className="space-y-4 text-xs leading-relaxed">
      <p>
        Celestia Starter strictly isolates secret environment variables to the backend
        <InlineCitation>
          <InlineCitationCard>
            <InlineCitationCardTrigger sources={["apps/api/.env", "AGENTS.md"]} />
          </InlineCitationCard>
        </InlineCitation>
        while providing end-to-end typed RPC endpoints.
      </p>

      <Sources defaultOpen>
        <SourcesTrigger count={2} />
        <SourcesContent>
          <Source href="/docs/architecture" title="Decoupled Architecture Guide" />
          <Source href="/docs/backend" title="Hono RPC & Drizzle Integration" />
        </SourcesContent>
      </Sources>
    </div>
  )
}`

const AUDIO_PLAYER_CODE = `import * as React from "react"
import {
  AudioPlayer,
  AudioPlayerControlBar,
  AudioPlayerPlayButton,
  AudioPlayerSeekBackwardButton,
  AudioPlayerSeekForwardButton,
  AudioPlayerTimeDisplay,
  AudioPlayerTimeRange,
  AudioPlayerDurationDisplay,
  AudioPlayerMuteButton
} from "@celestia-project/ui"

export function AudioPlayerDemo() {
  return (
    <AudioPlayer className="w-full max-w-md rounded-xl border p-2 bg-card/60">
      <AudioPlayerControlBar>
        <AudioPlayerPlayButton />
        <AudioPlayerSeekBackwardButton seekOffset={5} />
        <AudioPlayerSeekForwardButton seekOffset={5} />
        <AudioPlayerTimeDisplay />
        <AudioPlayerTimeRange />
        <AudioPlayerDurationDisplay />
        <AudioPlayerMuteButton />
      </AudioPlayerControlBar>
    </AudioPlayer>
  )
}`

const FILE_TREE_CODE = `import * as React from "react"
import { FileTree, FileTreeFolder, FileTreeFile } from "@celestia-project/ui"

export function FileTreeDemo() {
  return (
    <FileTree defaultExpanded={new Set(["apps", "apps/api", "packages", "packages/ui"])} className="w-full max-w-sm rounded-xl border p-3 bg-card/40 text-xs">
      <FileTreeFolder path="apps" name="apps">
        <FileTreeFolder path="apps/api" name="api">
          <FileTreeFile path="apps/api/src/index.ts" name="index.ts" />
          <FileTreeFile path="apps/api/src/auth.ts" name="auth.ts" />
        </FileTreeFolder>
        <FileTreeFolder path="apps/web" name="web">
          <FileTreeFile path="apps/web/app/page.tsx" name="page.tsx" />
        </FileTreeFolder>
      </FileTreeFolder>
      <FileTreeFolder path="packages" name="packages">
        <FileTreeFolder path="packages/ui" name="ui">
          <FileTreeFile path="packages/ui/src/index.ts" name="index.ts" />
        </FileTreeFolder>
      </FileTreeFolder>
    </FileTree>
  )
}`

const CONFIRMATION_CODE = `import * as React from "react"
import { Confirmation, ConfirmationTitle, ConfirmationActions, ConfirmationAction } from "@celestia-project/ui"

export function ConfirmationDemo() {
  return (
    <Confirmation
      state="approval-requested"
      approval={{ id: "tool-migrate-1", approved: undefined as any }}
      className="w-full max-w-md border-amber-500/30 bg-amber-500/5 text-xs"
    >
      <ConfirmationTitle>
        Agent requests permission to execute database migration: <code>0002_drop_legacy_tables.sql</code>
      </ConfirmationTitle>
      <ConfirmationActions>
        <ConfirmationAction variant="outline" size="xs">Deny</ConfirmationAction>
        <ConfirmationAction variant="default" size="xs">Approve & Execute</ConfirmationAction>
      </ConfirmationActions>
    </Confirmation>
  )
}`

const CONTEXT_CODE = `import * as React from "react"
import { Context, ContextTrigger, ContextContent, ContextTokens, ContextCacheUsage } from "@celestia-project/ui"

export function ContextDemo() {
  return (
    <Context className="w-full max-w-sm rounded-xl border p-3 bg-card/40">
      <ContextTrigger className="flex items-center justify-between text-xs font-mono">
        <span>Context Window</span>
        <span className="text-primary font-semibold">12,450 / 128,000 tokens (9.7%)</span>
      </ContextTrigger>
      <ContextContent className="pt-2">
        <ContextTokens used={12450} total={128000} />
        <ContextCacheUsage cachedTokens={8200} promptTokens={4250} />
      </ContextContent>
    </Context>
  )
}`

export function ChatAiSection() {
  const [promptText, setPromptText] = React.useState("Generate an accessible Base UI navigation bar with responsive drawer sheet.")
  const [selectedModel, setSelectedModel] = React.useState("claude-3-7-sonnet")
  const [approvalState, setApprovalState] = React.useState<"pending" | "approved" | "denied">("pending")

  return (
    <div id="chat-ai" className="flex flex-col gap-6 pt-6">
      {/* Section Title with Apple-Style Fluid Badge */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-2.5">
          <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            AI & Conversational Primitives
          </h2>
          <Badge variant="outline" className="gap-1.5 border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs text-primary font-mono">
            <SparkleIcon className="size-3 text-primary" weight="fill" />
            54 Primitives
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground hidden sm:inline">
          Designed with fluid tactile physics, zero latency, and stream-down rendering
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 1. Prompt Input & Multimodal Composer */}
        <ShowcaseCard
          id="prompt-input"
          title="Prompt Input"
          category="AI & Chat"
          description="Tactile, multi-line prompt bar with model switcher, attachment dropzone, and responsive action triggers."
          docsSlug="prompt-input"
          importSnippet={`import { PromptInput, PromptInputTextarea, PromptInputHeader, PromptInputFooter, PromptInputTools, PromptInputButton, PromptInputSubmit, PromptInputSelect } from "@celestia-project/ui"`}
          codeExample={PROMPT_INPUT_CODE}
          className="md:col-span-2"
        >
          <div className="w-full max-w-xl">
            <PromptInput
              value={promptText}
              onValueChange={setPromptText}
              onSubmit={() => {}}
              className="w-full rounded-2xl border border-border/80 bg-background/90 p-3 shadow-sm backdrop-blur-md transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20"
            >
              <PromptInputHeader className="flex items-center justify-between pb-2 border-b border-border/40">
                <PromptInputSelect value={selectedModel} onValueChange={setSelectedModel}>
                  <PromptInputSelectTrigger className="h-7 rounded-lg border-border/60 bg-muted/40 px-2 text-xs font-medium text-foreground transition-all hover:bg-muted active:scale-[0.98]">
                    <SparkleIcon className="size-3.5 text-primary mr-1.5" weight="fill" />
                    <PromptInputSelectValue placeholder="Model" />
                  </PromptInputSelectTrigger>
                  <PromptInputSelectContent>
                    <PromptInputSelectItem value="claude-3-7-sonnet">Claude 3.7 Sonnet</PromptInputSelectItem>
                    <PromptInputSelectItem value="gpt-4o">GPT-4o Omni</PromptInputSelectItem>
                    <PromptInputSelectItem value="gemini-2-flash">Gemini 2.0 Flash</PromptInputSelectItem>
                    <PromptInputSelectItem value="deepseek-r1">DeepSeek R1</PromptInputSelectItem>
                  </PromptInputSelectContent>
                </PromptInputSelect>

                <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                  Shift + Enter for new line
                </Badge>
              </PromptInputHeader>

              <PromptInputTextarea
                placeholder="Ask Celestia AI a question or request code generation..."
                className="min-h-[76px] resize-none border-0 bg-transparent text-xs sm:text-sm p-1 placeholder:text-muted-foreground/60 focus-visible:ring-0 focus-visible:ring-offset-0"
              />

              <PromptInputFooter className="flex items-center justify-between pt-2 border-t border-border/40 mt-1">
                <PromptInputTools className="flex items-center gap-1.5">
                  <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground active:scale-95" aria-label="Attach File">
                    <FileCodeIcon className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-xs" className="text-muted-foreground hover:text-foreground active:scale-95" aria-label="Web search">
                    <GlobeIcon className="size-4" />
                  </Button>
                </PromptInputTools>

                <div className="flex items-center gap-2">
                  <PromptInputSubmit
                    size="sm"
                    className="rounded-xl px-3.5 text-xs gap-1.5 font-medium transition-all active:scale-95 shadow-xs"
                  >
                    <span>Send</span>
                    <PaperPlaneRightIcon className="size-3.5" weight="fill" />
                  </PromptInputSubmit>
                </div>
              </PromptInputFooter>
            </PromptInput>
          </div>
        </ShowcaseCard>

        {/* 2. Model Reasoning & Chain of Thought */}
        <ShowcaseCard
          id="reasoning"
          title="Reasoning & Chain-of-Thought"
          category="AI & Chat"
          description="Collapsible thinking process with live duration counter and markdown streamdown rendering."
          docsSlug="reasoning"
          importSnippet={`import { Reasoning, ReasoningTrigger, ReasoningContent } from "@celestia-project/ui"`}
          codeExample={REASONING_CODE}
        >
          <div className="w-full max-w-sm">
            <Reasoning defaultOpen duration={4} className="rounded-xl border border-border/80 bg-card/60 p-3.5 shadow-xs transition-all">
              <ReasoningTrigger className="cursor-pointer font-medium text-xs text-foreground/90 hover:text-primary" />
              <ReasoningContent className="text-xs leading-relaxed text-muted-foreground pt-2">
                1. Inspecting database schema definitions in `packages/db/src/schema`.
                2. Formatted SQL migration file with transactional isolation.
                3. Generated TypeScript client types with RPC inference.
              </ReasoningContent>
            </Reasoning>
          </div>
        </ShowcaseCard>

        {/* 3. Agent Tool Call Viewer */}
        <ShowcaseCard
          id="tool"
          title="Agent Tools & Execution"
          category="AI & Chat"
          description="Interactive agent tool execution viewer with status indicators (Running, Completed, Awaiting Approval)."
          docsSlug="tool"
          importSnippet={`import { Tool, ToolHeader, ToolContent, ToolInput, ToolOutput } from "@celestia-project/ui"`}
          codeExample={TOOL_CODE}
        >
          <div className="w-full max-w-sm">
            <Tool defaultOpen className="rounded-xl border border-border/80 bg-card/60 shadow-xs">
              <ToolHeader
                toolName="runDrizzleMigration"
                type="dynamic-tool"
                state="output-available"
                className="cursor-pointer text-xs"
              />
              <ToolContent className="border-t border-border/40 p-3 text-xs space-y-2">
                <ToolInput input={{ migration: "0002_add_posts_index.sql", schema: "public" }} />
                <ToolOutput output={{ appliedCount: 2, executionTimeMs: 38, status: "OK" }} />
              </ToolContent>
            </Tool>
          </div>
        </ShowcaseCard>

        {/* 4. Model Selector Dialog */}
        <ShowcaseCard
          id="model-selector"
          title="Model Selector"
          category="AI & Chat"
          description="Searchable command palette dialog for switching LLM foundation models and providers."
          docsSlug="model-selector"
          importSnippet={`import { ModelSelector, ModelSelectorTrigger, ModelSelectorContent, ModelSelectorInput, ModelSelectorList, ModelSelectorGroup, ModelSelectorItem, ModelSelectorLogo, ModelSelectorName } from "@celestia-project/ui"`}
          codeExample={MODEL_SELECTOR_CODE}
        >
          <div className="flex flex-col items-center gap-3">
            <ModelSelector>
              <ModelSelectorTrigger>
                <Button variant="outline" size="sm" className="gap-2 font-mono text-xs rounded-xl transition-all active:scale-95 shadow-xs">
                  <SparkleIcon className="size-3.5 text-primary" weight="fill" />
                  <span>Switch LLM Model</span>
                </Button>
              </ModelSelectorTrigger>
              <ModelSelectorContent className="rounded-2xl">
                <ModelSelectorInput placeholder="Search 50+ models (Claude, OpenAI, Gemini)..." />
                <ModelSelectorList className="max-h-64 p-1">
                  <ModelSelectorEmpty>No model found.</ModelSelectorEmpty>
                  <ModelSelectorGroup heading="Anthropic">
                    <ModelSelectorItem className="cursor-pointer rounded-lg text-xs gap-2">
                      <ModelSelectorLogo provider="anthropic" />
                      <ModelSelectorName>Claude 3.7 Sonnet</ModelSelectorName>
                      <Badge variant="outline" className="text-[10px] font-mono">200K</Badge>
                    </ModelSelectorItem>
                  </ModelSelectorGroup>
                  <ModelSelectorGroup heading="OpenAI">
                    <ModelSelectorItem className="cursor-pointer rounded-lg text-xs gap-2">
                      <ModelSelectorLogo provider="openai" />
                      <ModelSelectorName>GPT-4o (Omni)</ModelSelectorName>
                      <Badge variant="outline" className="text-[10px] font-mono">128K</Badge>
                    </ModelSelectorItem>
                  </ModelSelectorGroup>
                  <ModelSelectorGroup heading="Google">
                    <ModelSelectorItem className="cursor-pointer rounded-lg text-xs gap-2">
                      <ModelSelectorLogo provider="google" />
                      <ModelSelectorName>Gemini 2.0 Flash</ModelSelectorName>
                      <Badge variant="outline" className="text-[10px] font-mono">1M</Badge>
                    </ModelSelectorItem>
                  </ModelSelectorGroup>
                </ModelSelectorList>
              </ModelSelectorContent>
            </ModelSelector>
            <span className="text-[11px] text-muted-foreground">Click button to open model switcher</span>
          </div>
        </ShowcaseCard>

        {/* 5. Agent Plan & Tasks Breakdown */}
        <ShowcaseCard
          id="plan-task"
          title="Agent Plan & Tasks"
          category="AI & Chat"
          description="Hierarchical execution plan and step-by-step task checklist with status indicators."
          docsSlug="plan"
          importSnippet={`import { Plan, PlanHeader, PlanTitle, PlanDescription, PlanContent, PlanTrigger, Task, TaskTrigger, TaskContent, TaskItem, TaskItemFile } from "@celestia-project/ui"`}
          codeExample={PLAN_TASK_CODE}
        >
          <div className="w-full max-w-sm">
            <Plan defaultOpen className="rounded-xl border border-border/80 bg-card/60">
              <PlanHeader className="p-3">
                <div className="flex-1 min-w-0">
                  <PlanTitle className="text-xs font-semibold">Refactor Auth Architecture</PlanTitle>
                  <PlanDescription className="text-[11px] text-muted-foreground">Decouple Better Auth into Hono API</PlanDescription>
                </div>
                <PlanTrigger />
              </PlanHeader>
              <PlanContent className="p-3 pt-0 border-t border-border/40">
                <Task defaultOpen status="in_progress" completed={2} total={3}>
                  <TaskTrigger title="Execution Progress" status="in_progress" completed={2} total={3} />
                  <TaskContent className="pt-2">
                    <TaskItem status="completed">
                      Configured server in <TaskItemFile>apps/api/src/auth.ts</TaskItemFile>
                    </TaskItem>
                    <TaskItem status="completed">
                      Exported client from <TaskItemFile>packages/ui</TaskItemFile>
                    </TaskItem>
                    <TaskItem status="in_progress">
                      Configuring proxy route in <TaskItemFile>next.config.ts</TaskItemFile>
                    </TaskItem>
                  </TaskContent>
                </Task>
              </PlanContent>
            </Plan>
          </div>
        </ShowcaseCard>

        {/* 6. Prompt Suggestions */}
        <ShowcaseCard
          id="suggestion"
          title="Prompt Suggestions"
          category="AI & Chat"
          description="Horizontal scrolling suggestion chips that auto-populate the active prompt on click."
          docsSlug="suggestion"
          importSnippet={`import { Suggestions, Suggestion } from "@celestia-project/ui"`}
          codeExample={SUGGESTIONS_CODE}
        >
          <div className="w-full max-w-sm flex flex-col gap-2.5">
            <Suggestions className="py-1">
              <Suggestion
                suggestion="Create Drizzle schema"
                onClick={(s) => setPromptText(s)}
                className="text-xs active:scale-95 transition-all"
              />
              <Suggestion
                suggestion="Add Google OAuth"
                onClick={(s) => setPromptText(s)}
                className="text-xs active:scale-95 transition-all"
              />
              <Suggestion
                suggestion="Generate API route"
                onClick={(s) => setPromptText(s)}
                className="text-xs active:scale-95 transition-all"
              />
            </Suggestions>
            <span className="text-[11px] text-muted-foreground">Click a chip to populate the prompt composer</span>
          </div>
        </ShowcaseCard>

        {/* 7. Sources & RAG Citations */}
        <ShowcaseCard
          id="sources"
          title="Sources & Citations"
          category="AI & Chat"
          description="Collapsible RAG source references panel and interactive inline citation badges."
          docsSlug="sources"
          importSnippet={`import { Sources, SourcesTrigger, SourcesContent, Source, InlineCitation, InlineCitationCard, InlineCitationCardTrigger } from "@celestia-project/ui"`}
          codeExample={SOURCES_CODE}
        >
          <div className="w-full max-w-sm rounded-xl border border-border/80 bg-card/60 p-3.5 space-y-3">
            <p className="text-xs leading-relaxed text-foreground">
              Celestia keeps secrets strictly in the Hono backend
              <InlineCitation>
                <InlineCitationCard>
                  <InlineCitationCardTrigger sources={["apps/api/.env", "AGENTS.md"]} className="text-[10px] cursor-pointer" />
                </InlineCitationCard>
              </InlineCitation>
              while Next.js acts as a pure UI client.
            </p>

            <Sources defaultOpen>
              <SourcesTrigger count={2} className="text-xs font-medium cursor-pointer" />
              <SourcesContent className="pt-1 text-xs">
                <Source href="/docs/architecture" title="Architecture Rules" className="text-primary hover:underline text-xs" />
                <Source href="/docs/backend" title="Hono Backend Guide" className="text-primary hover:underline text-xs" />
              </SourcesContent>
            </Sources>
          </div>
        </ShowcaseCard>

        {/* 8. AI Speech Audio Player */}
        <ShowcaseCard
          id="audio-player"
          title="AI Audio Player"
          category="AI & Chat"
          description="MediaChrome-powered text-to-speech audio controller with seeker and duration controls."
          docsSlug="audio-player"
          importSnippet={`import { AudioPlayer, AudioPlayerControlBar, AudioPlayerPlayButton, AudioPlayerSeekBackwardButton, AudioPlayerSeekForwardButton, AudioPlayerTimeDisplay, AudioPlayerTimeRange, AudioPlayerDurationDisplay, AudioPlayerMuteButton } from "@celestia-project/ui"`}
          codeExample={AUDIO_PLAYER_CODE}
        >
          <div className="w-full max-w-sm rounded-xl border border-border/80 bg-card/60 p-2.5">
            <AudioPlayer className="w-full">
              <AudioPlayerControlBar className="w-full flex items-center justify-between gap-1">
                <AudioPlayerPlayButton />
                <AudioPlayerSeekBackwardButton seekOffset={5} />
                <AudioPlayerSeekForwardButton seekOffset={5} />
                <AudioPlayerTimeDisplay className="text-[10px]" />
                <AudioPlayerTimeRange />
                <AudioPlayerDurationDisplay className="text-[10px]" />
                <AudioPlayerMuteButton />
              </AudioPlayerControlBar>
            </AudioPlayer>
          </div>
        </ShowcaseCard>

        {/* 9. Workspace File Tree */}
        <ShowcaseCard
          id="file-tree"
          title="Workspace File Tree"
          category="AI & Chat"
          description="Interactive directory tree browser with folder expand/collapse and file item selection."
          docsSlug="file-tree"
          importSnippet={`import { FileTree, FileTreeFolder, FileTreeFile } from "@celestia-project/ui"`}
          codeExample={FILE_TREE_CODE}
        >
          <div className="w-full max-w-sm rounded-xl border border-border/80 bg-card/60 p-3">
            <FileTree defaultExpanded={new Set(["apps", "apps/api", "packages"])} className="text-xs">
              <FileTreeFolder path="apps" name="apps">
                <FileTreeFolder path="apps/api" name="api">
                  <FileTreeFile path="apps/api/src/index.ts" name="index.ts" />
                  <FileTreeFile path="apps/api/src/auth.ts" name="auth.ts" />
                </FileTreeFolder>
                <FileTreeFolder path="apps/web" name="web">
                  <FileTreeFile path="apps/web/app/page.tsx" name="page.tsx" />
                </FileTreeFolder>
              </FileTreeFolder>
              <FileTreeFolder path="packages" name="packages">
                <FileTreeFile path="packages/ui/src/index.ts" name="ui/index.ts" />
              </FileTreeFolder>
            </FileTree>
          </div>
        </ShowcaseCard>

        {/* 10. Action Confirmation Guardrail */}
        <ShowcaseCard
          id="confirmation"
          title="Action Confirmation"
          category="AI & Chat"
          description="Human-in-the-loop permission request alert for approving critical agent tool executions."
          docsSlug="confirmation"
          importSnippet={`import { Confirmation, ConfirmationTitle, ConfirmationActions, ConfirmationAction } from "@celestia-project/ui"`}
          codeExample={CONFIRMATION_CODE}
        >
          <div className="w-full max-w-sm">
            <Confirmation
              state={approvalState === "pending" ? "approval-requested" : "approval-responded"}
              approval={{ id: "tool-migrate-1", approved: approvalState === "approved" }}
              className="rounded-xl border-amber-500/30 bg-amber-500/5 text-xs p-3"
            >
              <ConfirmationTitle className="text-xs leading-relaxed">
                Agent requests approval to execute <code className="font-mono text-primary">0002_drop_legacy_tables.sql</code>
              </ConfirmationTitle>
              <ConfirmationActions className="mt-2 flex items-center justify-end gap-2">
                <ConfirmationAction
                  variant="outline"
                  size="xs"
                  onClick={() => setApprovalState("denied")}
                  className="rounded-lg text-xs"
                >
                  Deny
                </ConfirmationAction>
                <ConfirmationAction
                  variant="default"
                  size="xs"
                  onClick={() => setApprovalState("approved")}
                  className="rounded-lg text-xs"
                >
                  Approve
                </ConfirmationAction>
              </ConfirmationActions>
            </Confirmation>
          </div>
        </ShowcaseCard>

        {/* 11. Context & Token Monitor */}
        <ShowcaseCard
          id="context"
          title="Context & Token Monitor"
          category="AI & Chat"
          description="Live LLM context window meter and prompt cache visualizer."
          docsSlug="context"
          importSnippet={`import { Context, ContextTrigger, ContextContent, ContextTokens, ContextCacheUsage } from "@celestia-project/ui"`}
          codeExample={CONTEXT_CODE}
        >
          <div className="w-full max-w-sm rounded-xl border border-border/80 bg-card/60 p-3.5">
            <Context>
              <ContextTrigger className="flex items-center justify-between text-xs font-mono">
                <span>Context Window</span>
                <span className="text-primary font-semibold">14,200 / 128,000 (11.1%)</span>
              </ContextTrigger>
              <ContextContent className="pt-2">
                <ContextTokens used={14200} total={128000} />
                <ContextCacheUsage cachedTokens={9100} promptTokens={5100} />
              </ContextContent>
            </Context>
          </div>
        </ShowcaseCard>

        {/* 12. Chat Message & Bubble */}
        <ShowcaseCard
          id="chat-message"
          title="Chat Message & Bubbles"
          category="AI & Chat"
          description="Structured chat message stream with user and assistant bubbles and reaction badges."
          docsSlug="message"
          importSnippet={`import { ChatMessage, ChatMessageArea, Bubble, BubbleGroup, BubbleContent, BubbleReactions } from "@celestia-project/ui"`}
          codeExample={`import { ChatMessageArea, ChatMessage, Bubble, BubbleContent, BubbleReactions } from "@celestia-project/ui"`}
        >
          <div className="w-full max-w-sm rounded-xl border border-border/80 bg-card/40 p-3 space-y-3">
            <ChatMessageArea className="gap-3">
              <ChatMessage role="user">
                <p className="text-xs">How do I setup OAuth in Celestia?</p>
              </ChatMessage>
              <ChatMessage role="assistant">
                <p className="text-xs">
                  Add secrets to <code className="text-primary font-mono text-[11px]">apps/api/.env</code>. The auth server is in <code className="text-primary font-mono text-[11px]">apps/api/src/auth.ts</code>.
                </p>
              </ChatMessage>
            </ChatMessageArea>
          </div>
        </ShowcaseCard>

        {/* 13. File Attachments */}
        <ShowcaseCard
          id="attachment"
          title="Attachments & Media"
          category="AI & Chat"
          description="File attachment badges with upload state indicators and deletion actions."
          docsSlug="attachment"
          importSnippet={`import { Attachment, AttachmentMedia, AttachmentContent, AttachmentTitle, AttachmentDescription, AttachmentActions, AttachmentAction } from "@celestia-project/ui"`}
          codeExample={`import { Attachment, AttachmentMedia, AttachmentContent, AttachmentTitle } from "@celestia-project/ui"`}
          className="md:col-span-2"
        >
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Attachment state="done" size="default" className="rounded-xl border bg-card/60">
              <AttachmentMedia variant="icon">
                <FilePdfIcon className="size-5 text-red-500" weight="fill" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>API-Specification.pdf</AttachmentTitle>
                <AttachmentDescription>2.4 MB • Complete</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction aria-label="Remove">
                  <XIcon className="size-3.5" />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>

            <Attachment state="done" size="default" className="rounded-xl border bg-card/60">
              <AttachmentMedia variant="icon">
                <FileImageIcon className="size-5 text-sky-500" weight="fill" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>system-architecture.png</AttachmentTitle>
                <AttachmentDescription>840 KB • Image</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction aria-label="Remove">
                  <XIcon className="size-3.5" />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>
          </div>
        </ShowcaseCard>
      </div>
    </div>
  )
}
