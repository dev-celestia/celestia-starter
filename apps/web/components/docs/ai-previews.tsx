"use client"

import * as React from "react"
import {
  SparkleIcon,
  FilePdfIcon,
  ThumbsUpIcon,
  XIcon,
  CopyIcon,
  EyeIcon,
} from "@phosphor-icons/react"
import {
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
  TaskItemFile,
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
  Sources,
  SourcesTrigger,
  SourcesContent,
  Source,
  InlineCitation,
  InlineCitationCard,
  InlineCitationCardTrigger,
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
  ContextContentHeader,
  ContextContentBody,
  Agent,
  AgentHeader,
  AgentContent,
  AgentInstructions,
  AgentOutput,
  Artifact,
  ArtifactHeader,
  ArtifactTitle,
  ArtifactDescription,
  ArtifactActions,
  ArtifactContent,
  ArtifactClose,
  Attachment,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
  Attachments,
  AttachmentItem,
  AttachmentPreview as AttachmentsPreviewItem,
  AttachmentRemove,
  Bubble,
  BubbleGroup,
  BubbleContent,
  BubbleReactions,
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
  ChainOfThoughtContent,
  ChatInput,
  ChatMessage,
  ChatMessageArea,
  Checkpoint,
  CheckpointIcon,
  CheckpointTrigger,
  CodeBlock,
  Commit,
  CommitHeader,
  CommitContent,
  CommitHash,
  CommitMessage,
  CommitFiles,
  CommitFile,
  CommitFilePath,
  CommitFileChanges,
  CommitFileAdditions,
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  EnvironmentVariables,
  EnvironmentVariablesHeader,
  EnvironmentVariablesTitle,
  EnvironmentVariablesContent,
  EnvironmentVariable,
  JSXPreview,
  MessageScrollerProvider,
  MessageScroller,
  MessageScrollerViewport,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerButton,
  AiMessage,
  AiMessageContent,
  MessageActions,
  MessageAction,
  MicSelector,
  MicSelectorTrigger,
  MicSelectorContent,
  OpenIn,
  OpenInContent,
  OpenInTrigger,
  OpenInChatGPT,
  OpenInClaude,
  PackageInfo,
  PackageInfoHeader,
  PackageInfoName,
  PackageInfoContent,
  Persona,
  Queue,
  QueueList,
  QueueItem,
  QueueItemContent,
  QueueItemIndicator,
  Sandbox,
  SandboxHeader,
  SandboxContent,
  SchemaDisplay,
  Shimmer,
  Snippet,
  SnippetInput,
  SnippetCopyButton,
  SpeechInput,
  StackTrace,
  StackTraceHeader,
  StackTraceContent,
  Terminal,
  TestResults,
  TestResultsHeader,
  Transcription,
  TranscriptionSegment,
  VoiceSelector,
  VoiceSelectorTrigger,
  VoiceSelectorContent,
  WebPreview,
  WebPreviewNavigation,
} from "@celestia-project/ui"

function AiPreviewShell({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`not-prose border-fd-border bg-fd-card/50 my-4 flex flex-col items-center justify-center gap-3 rounded-xl border p-6 backdrop-blur-sm overflow-hidden ${className}`}>
      {children}
    </div>
  )
}

export function PromptInputPreview() {
  const [prompt, setPrompt] = React.useState("")
  const [model, setModel] = React.useState("gpt-4o")

  return (
    <AiPreviewShell>
      <PromptInput
        onSubmit={({ text }) => console.log("Submit:", text)}
        className="w-full max-w-lg rounded-xl border bg-background/95 backdrop-blur-md shadow-xs"
      >
        <PromptInputHeader>
          <PromptInputSelect value={model} onValueChange={(v) => setModel(String(v))}>
            <PromptInputSelectTrigger className="h-7 text-xs font-mono">
              <SparkleIcon className="size-3 text-primary me-1" weight="fill" />
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
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
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
    </AiPreviewShell>
  )
}

export function ReasoningPreview() {
  return (
    <AiPreviewShell>
      <Reasoning defaultOpen duration={4} className="w-full max-w-md rounded-xl border p-4 bg-muted/20">
        <ReasoningTrigger />
        <ReasoningContent>
          The user is requesting an automated PostgreSQL migration for post tagging. Analyzed schema in packages/db/src/schema/tags.ts and computed foreign keys.
        </ReasoningContent>
      </Reasoning>
    </AiPreviewShell>
  )
}

export function ToolPreview() {
  return (
    <AiPreviewShell>
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
    </AiPreviewShell>
  )
}

export function ModelSelectorPreview() {
  const [model, setModel] = React.useState("claude-3-7-sonnet")

  return (
    <AiPreviewShell>
      <ModelSelector>
        <ModelSelectorTrigger render={<Button variant="outline" size="sm" className="gap-2 font-mono text-xs" />}>
          <SparkleIcon className="size-3.5 text-primary" weight="fill" />
          <span>{model}</span>
        </ModelSelectorTrigger>
        <ModelSelectorContent>
          <ModelSelectorInput placeholder="Search models..." />
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
    </AiPreviewShell>
  )
}

export function PlanPreview() {
  return (
    <AiPreviewShell>
      <Plan defaultOpen className="w-full max-w-md">
        <PlanHeader>
          <PlanTitle>Refactor Backend Architecture</PlanTitle>
          <PlanDescription>Decouple Better Auth server to standalone API</PlanDescription>
          <PlanTrigger />
        </PlanHeader>
        <PlanContent>
          <div className="space-y-2 text-xs text-muted-foreground">
            <p>1. Isolate auth instance in `apps/api/src/auth.ts`.</p>
            <p>2. Mount Hono route handlers for session endpoints.</p>
            <p>3. Update Next.js rewrite proxy in `next.config.ts`.</p>
          </div>
        </PlanContent>
      </Plan>
    </AiPreviewShell>
  )
}

export function TaskPreview() {
  return (
    <AiPreviewShell>
      <Task defaultOpen status="in_progress" completed={2} total={3} className="w-full max-w-md">
        <TaskTrigger title="Execution Steps" status="in_progress" completed={2} total={3} />
        <TaskContent>
          <TaskItem status="completed">
            Create schema in <TaskItemFile>packages/db/src/schema/auth.ts</TaskItemFile>
          </TaskItem>
          <TaskItem status="completed">
            Export client in <TaskItemFile>packages/ui</TaskItemFile>
          </TaskItem>
          <TaskItem status="in_progress">
            Verify Hono RPC type bindings
          </TaskItem>
        </TaskContent>
      </Task>
    </AiPreviewShell>
  )
}

export function SourcesPreview() {
  return (
    <AiPreviewShell>
      <Sources defaultOpen className="w-full max-w-md">
        <SourcesTrigger count={2} />
        <SourcesContent>
          <Source
            title="Drizzle ORM Documentation"
            href="https://orm.drizzle.team/docs/overview"
          />
          <Source
            title="Better Auth Architecture"
            href="https://better-auth.com/docs"
          />
        </SourcesContent>
      </Sources>
    </AiPreviewShell>
  )
}

export function InlineCitationPreview() {
  return (
    <AiPreviewShell>
      <div className="text-sm text-muted-foreground leading-relaxed max-w-md">
        <span>Celestia Starter isolates backend secrets </span>
        <InlineCitation>
          <InlineCitationCard>
            <InlineCitationCardTrigger sources={["apps/api/.env", "AGENTS.md"]} />
          </InlineCitationCard>
        </InlineCitation>
        <span> while providing end-to-end typed RPC endpoints.</span>
      </div>
    </AiPreviewShell>
  )
}

export function SuggestionsPreview() {
  return (
    <AiPreviewShell>
      <Suggestions className="w-full max-w-md justify-center">
        <Suggestion suggestion="Scaffold Hono CRUD route" onClick={(s) => alert(s)} />
        <Suggestion suggestion="Add Better Auth Google OAuth" onClick={(s) => alert(s)} />
        <Suggestion suggestion="Create Drizzle Migration" onClick={(s) => alert(s)} />
      </Suggestions>
    </AiPreviewShell>
  )
}

export function AudioPlayerPreview() {
  return (
    <AiPreviewShell>
      <AudioPlayer className="w-full max-w-md">
        <AudioPlayerControlBar>
          <AudioPlayerPlayButton />
          <AudioPlayerSeekBackwardButton />
          <AudioPlayerSeekForwardButton />
          <AudioPlayerTimeDisplay />
          <AudioPlayerTimeRange />
          <AudioPlayerDurationDisplay />
          <AudioPlayerMuteButton />
        </AudioPlayerControlBar>
      </AudioPlayer>
    </AiPreviewShell>
  )
}

export function FileTreePreview() {
  return (
    <AiPreviewShell>
      <FileTree defaultExpanded={new Set(["apps", "apps/api", "packages"])} className="w-full max-w-sm rounded-lg border p-2">
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
          <FileTreeFile path="packages/db/src/schema.ts" name="schema.ts" />
        </FileTreeFolder>
      </FileTree>
    </AiPreviewShell>
  )
}

export function ConfirmationPreview() {
  return (
    <AiPreviewShell>
      <Confirmation
        state="approval-requested"
        approval={{ id: "tool-1", approved: undefined as any }}
        className="w-full max-w-md rounded-xl border p-4"
      >
        <ConfirmationTitle>
          Run database migration on production cluster?
        </ConfirmationTitle>
        <ConfirmationActions>
          <ConfirmationAction variant="outline" size="sm">
            Cancel
          </ConfirmationAction>
          <ConfirmationAction variant="default" size="sm">
            Confirm & Execute
          </ConfirmationAction>
        </ConfirmationActions>
      </Confirmation>
    </AiPreviewShell>
  )
}

export function ContextPreview() {
  return (
    <AiPreviewShell>
      <Context usedTokens={14200} maxTokens={128000}>
        <ContextTrigger />
        <ContextContent>
          <ContextContentHeader />
          <ContextContentBody>
            <div className="flex justify-between text-xs py-1">
              <span>Tokens Used:</span>
              <span className="font-mono font-medium">14,200 / 128,000</span>
            </div>
          </ContextContentBody>
        </ContextContent>
      </Context>
    </AiPreviewShell>
  )
}

export function AgentPreview() {
  return (
    <AiPreviewShell>
      <Agent className="w-full max-w-md">
        <AgentHeader name="Database Architect" model="Claude 3.7 Sonnet" />
        <AgentContent>
          <AgentInstructions>
            Analyze SQL performance, suggest compound indexes, and create Drizzle ORM schema migrations.
          </AgentInstructions>
          <AgentOutput schema="interface MigrationResult { applied: number; durationMs: number; }" />
        </AgentContent>
      </Agent>
    </AiPreviewShell>
  )
}

export function ArtifactPreview() {
  return (
    <AiPreviewShell>
      <Artifact className="w-full max-w-md">
        <ArtifactHeader>
          <div>
            <ArtifactTitle>schema.ts</ArtifactTitle>
            <ArtifactDescription>Generated Drizzle ORM Schema</ArtifactDescription>
          </div>
          <ArtifactActions>
            <ArtifactClose />
          </ArtifactActions>
        </ArtifactHeader>
        <ArtifactContent>
          <pre className="text-xs font-mono text-muted-foreground p-2">
            {`export const users = pgTable("users", {\n  id: text("id").primaryKey(),\n  name: text("name").notNull(),\n});`}
          </pre>
        </ArtifactContent>
      </Artifact>
    </AiPreviewShell>
  )
}

export function AttachmentPreview() {
  return (
    <AiPreviewShell>
      <AttachmentGroup>
        <Attachment size="default" state="done" orientation="horizontal">
          <AttachmentMedia variant="icon">
            <FilePdfIcon className="size-4 text-rose-500" />
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>architecture.pdf</AttachmentTitle>
            <AttachmentDescription>1.8 MB</AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction variant="ghost" size="icon-xs">
              <XIcon className="size-3.5" />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      </AttachmentGroup>
    </AiPreviewShell>
  )
}

export function AttachmentsPreview() {
  const sampleAttachments = [
    { id: "1", type: "file" as const, url: "/design-system.png", filename: "design-system.png", mediaType: "image/png" },
    { id: "2", type: "file" as const, url: "/database.sql", filename: "database.sql", mediaType: "text/plain" },
  ]

  return (
    <AiPreviewShell>
      <Attachments variant="grid" className="w-full max-w-md">
        {sampleAttachments.map((file) => (
          <AttachmentItem key={file.id} data={file}>
            <AttachmentsPreviewItem />
            <AttachmentRemove />
          </AttachmentItem>
        ))}
      </Attachments>
    </AiPreviewShell>
  )
}

export function BubblePreview() {
  return (
    <AiPreviewShell>
      <BubbleGroup className="w-full max-w-md">
        <Bubble variant="secondary">
          <BubbleContent>Can you generate the Better Auth schema?</BubbleContent>
        </Bubble>
        <Bubble variant="default">
          <BubbleContent>
            Certainly! I will scaffold `user`, `session`, `account`, and `verification` tables in Drizzle.
          </BubbleContent>
          <BubbleReactions />
        </Bubble>
      </BubbleGroup>
    </AiPreviewShell>
  )
}

export function ChainOfThoughtPreview() {
  return (
    <AiPreviewShell>
      <ChainOfThought defaultOpen className="w-full max-w-md rounded-xl border p-4">
        <ChainOfThoughtHeader>Reasoning Pipeline</ChainOfThoughtHeader>
        <ChainOfThoughtContent>
          <ChainOfThoughtStep status="complete" label="Fetched table metadata" description="Examined PostgreSQL catalog" />
          <ChainOfThoughtStep status="active" label="Computing foreign key constraints" description="Resolving many-to-many joins" />
          <ChainOfThoughtStep status="pending" label="Generating TypeScript types" />
        </ChainOfThoughtContent>
      </ChainOfThought>
    </AiPreviewShell>
  )
}

export function CodeBlockPreview() {
  return (
    <AiPreviewShell>
      <CodeBlock
        code={`import { Hono } from "hono"\nconst app = new Hono()\napp.get("/health", (c) => c.json({ status: "ok" }))\nexport default app`}
        language="typescript"
        className="w-full max-w-md"
      />
    </AiPreviewShell>
  )
}

export function CommitPreview() {
  return (
    <AiPreviewShell>
      <Commit className="w-full max-w-md">
        <CommitHeader>
          <div className="flex items-center gap-2">
            <CommitHash>7a8f9c1</CommitHash>
            <CommitMessage>feat: add Hono RPC typed client route</CommitMessage>
          </div>
        </CommitHeader>
        <CommitContent>
          <CommitFiles>
            <CommitFile>
              <CommitFilePath>apps/api/src/index.ts</CommitFilePath>
              <CommitFileChanges>
                <CommitFileAdditions count={18} />
              </CommitFileChanges>
            </CommitFile>
          </CommitFiles>
        </CommitContent>
      </Commit>
    </AiPreviewShell>
  )
}

export function CheckpointPreview() {
  return (
    <AiPreviewShell>
      <Checkpoint className="w-full max-w-md">
        <CheckpointIcon />
        <CheckpointTrigger tooltip="Restore snapshot v1.4.0">
          Restore Checkpoint (v1.4.0)
        </CheckpointTrigger>
      </Checkpoint>
    </AiPreviewShell>
  )
}

export function EnvironmentVariablesPreview() {
  return (
    <AiPreviewShell>
      <EnvironmentVariables className="w-full max-w-md">
        <EnvironmentVariablesHeader>
          <EnvironmentVariablesTitle />
        </EnvironmentVariablesHeader>
        <EnvironmentVariablesContent>
          <EnvironmentVariable name="DATABASE_URL" value="postgresql://postgres:secret@localhost:5432/celestia" />
          <EnvironmentVariable name="PORT" value="4000" />
        </EnvironmentVariablesContent>
      </EnvironmentVariables>
    </AiPreviewShell>
  )
}

export function MessagePreview() {
  return (
    <AiPreviewShell>
      <AiMessage from="assistant" className="w-full max-w-md">
        <AiMessageContent>
          Here is your configured Hono RPC client with end-to-end type safety across the monorepo.
        </AiMessageContent>
        <MessageActions>
          <MessageAction>
            <ThumbsUpIcon className="size-4" />
          </MessageAction>
          <MessageAction>
            <CopyIcon className="size-4" />
          </MessageAction>
        </MessageActions>
      </AiMessage>
    </AiPreviewShell>
  )
}

export function MicSelectorPreview() {
  return (
    <AiPreviewShell>
      <MicSelector>
        <MicSelectorTrigger className="h-8 text-xs gap-2" />
        <MicSelectorContent />
      </MicSelector>
    </AiPreviewShell>
  )
}

export function PersonaPreview() {
  return (
    <AiPreviewShell>
      <div className="flex items-center justify-center p-4">
        <Persona state="thinking" className="size-24" />
      </div>
    </AiPreviewShell>
  )
}

export function QueuePreview() {
  return (
    <AiPreviewShell>
      <Queue className="w-full max-w-md">
        <QueueList>
          <QueueItem>
            <div className="flex items-center gap-2">
              <QueueItemIndicator />
              <QueueItemContent>Building Next.js 16 production bundle</QueueItemContent>
            </div>
          </QueueItem>
          <QueueItem>
            <div className="flex items-center gap-2">
              <QueueItemIndicator />
              <QueueItemContent>Running typecheck across packages</QueueItemContent>
            </div>
          </QueueItem>
        </QueueList>
      </Queue>
    </AiPreviewShell>
  )
}

export function SandboxPreview() {
  return (
    <AiPreviewShell>
      <Sandbox className="w-full max-w-md">
        <SandboxHeader title="Live TS Execution" state="output-available" />
        <SandboxContent>
          <pre className="p-3 text-xs font-mono text-muted-foreground">
            console.log(&apos;Hello from Celestia Sandbox!&apos;)
          </pre>
        </SandboxContent>
      </Sandbox>
    </AiPreviewShell>
  )
}

export function SchemaDisplayPreview() {
  return (
    <AiPreviewShell>
      <SchemaDisplay
        method="POST"
        path="/api/posts"
        description="Create a new blog post"
        requestBody={[
          { name: "title", type: "string", required: true, description: "Post title" },
          { name: "content", type: "string", required: true, description: "Markdown body" },
        ]}
        className="w-full max-w-md"
      />
    </AiPreviewShell>
  )
}

export function ShimmerPreview() {
  return (
    <AiPreviewShell>
      <div className="w-full max-w-md space-y-2 p-2">
        <Shimmer className="text-sm font-medium">Generating streaming response...</Shimmer>
        <Shimmer className="text-xs text-muted-foreground">Indexing code across 12 packages in monorepo</Shimmer>
      </div>
    </AiPreviewShell>
  )
}

export function SnippetPreview() {
  return (
    <AiPreviewShell>
      <Snippet code="npx @celestia-project/create my-app" className="w-full max-w-md">
        <SnippetInput />
        <SnippetCopyButton />
      </Snippet>
    </AiPreviewShell>
  )
}

export function SpeechInputPreview() {
  return (
    <AiPreviewShell>
      <SpeechInput className="w-full max-w-md" />
    </AiPreviewShell>
  )
}

export function StackTracePreview() {
  const sampleTrace = `Error: Connection refused on postgres:5432
    at createPool (/packages/db/src/client.ts:24:12)
    at initServer (/apps/api/src/index.ts:12:5)`

  return (
    <AiPreviewShell>
      <StackTrace trace={sampleTrace} className="w-full max-w-md">
        <StackTraceHeader />
        <StackTraceContent />
      </StackTrace>
    </AiPreviewShell>
  )
}

export function TerminalPreview() {
  return (
    <AiPreviewShell>
      <Terminal
        output={`$ pnpm build\n> @celestia-project/ui:build\n> tsup\n✓ Build completed in 420ms`}
        className="w-full max-w-md"
      />
    </AiPreviewShell>
  )
}

export function TestResultsPreview() {
  return (
    <AiPreviewShell>
      <TestResults
        summary={{ passed: 14, failed: 0, skipped: 0, total: 14, duration: 890 }}
        className="w-full max-w-md"
      >
        <TestResultsHeader />
      </TestResults>
    </AiPreviewShell>
  )
}

export function TranscriptionPreview() {
  const segments = [
    { startSecond: 0, endSecond: 2.4, text: "Welcome to Celestia Starter." },
    { startSecond: 2.5, endSecond: 5.1, text: "A decoupled monorepo architecture for modern web applications." },
  ]

  return (
    <AiPreviewShell>
      <Transcription segments={segments} className="w-full max-w-md">
        {(segment, idx) => (
          <TranscriptionSegment key={idx} segment={segment} index={idx} />
        )}
      </Transcription>
    </AiPreviewShell>
  )
}

export function VoiceSelectorPreview() {
  return (
    <AiPreviewShell>
      <VoiceSelector>
        <VoiceSelectorTrigger className="h-8 text-xs" />
        <VoiceSelectorContent />
      </VoiceSelector>
    </AiPreviewShell>
  )
}

export function WebPreviewPreview() {
  return (
    <AiPreviewShell>
      <WebPreview defaultUrl="http://localhost:3000/dashboard" className="w-full max-w-md h-48 border rounded-lg overflow-hidden">
        <WebPreviewNavigation />
        <div className="flex h-full items-center justify-center p-4 text-xs text-muted-foreground">
          Live Rendered Page View
        </div>
      </WebPreview>
    </AiPreviewShell>
  )
}

export function ChatInputPreview() {
  const [val, setVal] = React.useState("")
  return (
    <AiPreviewShell>
      <ChatInput
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Type a message..."
        className="w-full max-w-md"
      />
    </AiPreviewShell>
  )
}

export function ChatMessagePreview() {
  return (
    <AiPreviewShell>
      <div className="flex flex-col gap-3 w-full max-w-md">
        <ChatMessage role="user">How does the Hono backend connect to Drizzle?</ChatMessage>
        <ChatMessage role="assistant">
          The backend imports the shared `@workspace/db` client and exports type-safe RPC route schemas.
        </ChatMessage>
      </div>
    </AiPreviewShell>
  )
}

export function ChatMessageAreaPreview() {
  return (
    <AiPreviewShell>
      <ChatMessageArea className="w-full max-w-md h-32 border rounded-lg p-3">
        <div className="text-xs text-muted-foreground">ChatMessageArea with auto-scroll and stream management</div>
      </ChatMessageArea>
    </AiPreviewShell>
  )
}

export function MessageScrollerPreview() {
  return (
    <AiPreviewShell>
      <MessageScrollerProvider>
        <MessageScroller className="w-full max-w-md h-36 border rounded-lg p-3">
          <MessageScrollerViewport>
            <MessageScrollerContent>
              <MessageScrollerItem messageId="msg-1" className="p-2 text-xs bg-muted/40 rounded">
                User: Can you explain the monorepo architecture?
              </MessageScrollerItem>
              <MessageScrollerItem messageId="msg-2" className="p-2 text-xs bg-card border rounded">
                AI: Celestia Starter isolates backend Hono APIs from the Next.js UI client.
              </MessageScrollerItem>
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>
    </AiPreviewShell>
  )
}

export function ConversationPreview() {
  return (
    <AiPreviewShell>
      <Conversation className="w-full max-w-md h-36 border rounded-lg">
        <ConversationContent>
          <ConversationEmptyState
            title="No active conversations"
            description="Type a prompt to begin chatting with the AI agent."
          />
        </ConversationContent>
      </Conversation>
    </AiPreviewShell>
  )
}

export function OpenInChatPreview() {
  return (
    <AiPreviewShell>
      <OpenIn query="How to configure Better Auth in Hono?">
        <OpenInTrigger className="h-8 text-xs" />
        <OpenInContent>
          <OpenInChatGPT />
          <OpenInClaude />
        </OpenInContent>
      </OpenIn>
    </AiPreviewShell>
  )
}

export function PackageInfoPreview() {
  return (
    <AiPreviewShell>
      <PackageInfo name="@celestia-project/ui" currentVersion="0.2.2" newVersion="0.2.3" changeType="patch" className="w-full max-w-md">
        <PackageInfoHeader>
          <PackageInfoName />
        </PackageInfoHeader>
        <PackageInfoContent />
      </PackageInfo>
    </AiPreviewShell>
  )
}

export function JsxPreviewPreview() {
  return (
    <AiPreviewShell>
      <JSXPreview
        jsx={`<div className="p-3 bg-primary/10 rounded-lg text-primary text-xs font-semibold text-center">Live Generated JSX Component</div>`}
        className="w-full max-w-md"
      />
    </AiPreviewShell>
  )
}

export function ToolbarPreview() {
  return (
    <AiPreviewShell>
      <div className="flex items-center gap-1 rounded-lg border bg-background p-1.5 shadow-xs">
        <Button variant="ghost" size="icon-xs" aria-label="Improve with AI">
          <SparkleIcon className="size-3.5 text-primary" weight="fill" />
        </Button>
        <Button variant="ghost" size="icon-xs" aria-label="Copy snippet">
          <CopyIcon className="size-3.5" />
        </Button>
      </div>
    </AiPreviewShell>
  )
}

