"use client"

import * as React from "react"
import {
  PaperPlaneRightIcon,
  FilePdfIcon,
  FileImageIcon,
  ThumbsUpIcon,
  HeartIcon,
  XIcon,
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
} from "@celestia-project/ui"
import { ShowcaseCard } from "../showcase-card"

const CHAT_MESSAGE_CODE = `import * as React from "react"
import { ChatMessage, ChatMessageArea } from "@celestia-project/ui"

export function ChatMessageDemo() {
  return (
    <ChatMessageArea className="p-3 gap-3 rounded-lg border bg-card/40">
      <ChatMessage role="user">
        <p className="text-xs">How do I configure Better Auth OAuth providers in Celestia?</p>
      </ChatMessage>
      <ChatMessage role="assistant">
        <p className="text-xs">
          OAuth secrets live in <code>apps/api/.env</code>. The auth server is configured in <code>apps/api/src/auth.ts</code>.
        </p>
      </ChatMessage>
    </ChatMessageArea>
  )
}`

const BUBBLE_CODE = `import * as React from "react"
import { BubbleGroup, Bubble, BubbleContent, BubbleReactions } from "@celestia-project/ui"
import { ThumbsUpIcon, HeartIcon } from "@phosphor-icons/react"

export function BubbleDemo() {
  return (
    <BubbleGroup className="w-full max-w-sm gap-4">
      {/* Assistant Bubble with Reaction Counter */}
      <Bubble variant="tinted" align="start">
        <BubbleContent>
          Generated 4 optimized SQL indexes for Drizzle migration schema.
        </BubbleContent>
        <BubbleReactions side="bottom" align="end">
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground px-1">
            <ThumbsUpIcon className="size-3 text-sky-500" weight="fill" />
            <HeartIcon className="size-3 text-red-500" weight="fill" />
            2
          </span>
        </BubbleReactions>
      </Bubble>

      {/* User Bubble */}
      <Bubble variant="default" align="end">
        <BubbleContent>Looks great, deploy to staging!</BubbleContent>
      </Bubble>
    </BubbleGroup>
  )
}`

const ATTACHMENT_CODE = `import * as React from "react"
import {
  Attachment,
  AttachmentMedia,
  AttachmentContent,
  AttachmentTitle,
  AttachmentDescription,
  AttachmentActions,
  AttachmentAction,
} from "@celestia-project/ui"
import { FilePdfIcon, XIcon } from "@phosphor-icons/react"

export function AttachmentDemo() {
  return (
    <Attachment state="done" size="default">
      <AttachmentMedia variant="icon">
        <FilePdfIcon className="size-5 text-red-500" weight="fill" />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>API-Documentation.pdf</AttachmentTitle>
        <AttachmentDescription>2.4 MB • Complete</AttachmentDescription>
      </AttachmentContent>
      <AttachmentActions>
        <AttachmentAction aria-label="Remove">
          <XIcon className="size-3.5" />
        </AttachmentAction>
      </AttachmentActions>
    </Attachment>
  )
}`

const CHAT_INPUT_CODE = `import * as React from "react"
import { ChatInput, Button } from "@celestia-project/ui"
import { PaperPlaneRightIcon } from "@phosphor-icons/react"

export function ChatInputDemo() {
  const [prompt, setPrompt] = React.useState("")

  return (
    <div className="relative w-full max-w-lg rounded-lg border p-2 bg-background">
      <ChatInput
        placeholder="Ask Celestia AI a question..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="min-h-[70px] border-0"
      />
      <div className="flex items-center justify-between border-t pt-2 mt-1">
        <span className="text-[10px] text-muted-foreground">Shift + Enter for newline</span>
        <Button size="xs" variant="default" className="gap-1">
          <span>Send</span>
          <PaperPlaneRightIcon className="size-3" weight="fill" />
        </Button>
      </div>
    </div>
  )
}`

export function ChatAiSection() {
  const [inputText, setInputText] = React.useState("")

  return (
    <div id="chat-ai" className="flex flex-col gap-6 pt-6">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          AI & Chat Interfaces
        </h2>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          6 components
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 1. Chat Message Area & Chat Message */}
        <ShowcaseCard
          id="chat-message"
          title="Chat Message"
          category="AI & Chat"
          description="Structured user and assistant chat message containers with styled conversation bubbles."
          docsSlug="message"
          importSnippet={`import { ChatMessage, ChatMessageArea } from "@celestia-project/ui"`}
          codeExample={CHAT_MESSAGE_CODE}
        >
          <div className="w-full max-w-sm rounded-lg border border-border bg-card/40 overflow-hidden">
            <ChatMessageArea className="p-3 gap-3">
              <ChatMessage role="user">
                <p className="text-xs">How do I configure Better Auth OAuth providers in Celestia?</p>
              </ChatMessage>
              <ChatMessage role="assistant">
                <p className="text-xs">
                  OAuth secrets live exclusively in <code className="text-primary font-mono text-[11px]">apps/api/.env</code>. The auth server is configured in <code className="text-primary font-mono text-[11px]">apps/api/src/auth.ts</code>.
                </p>
              </ChatMessage>
            </ChatMessageArea>
          </div>
        </ShowcaseCard>

        {/* 2. Bubble & Reactions */}
        <ShowcaseCard
          id="bubble"
          title="Bubble & Reactions"
          category="AI & Chat"
          description="Interactive message bubbles with reaction pills and multiple style variants (tinted, outline, ghost)."
          docsSlug="bubble"
          importSnippet={`import { BubbleGroup, Bubble, BubbleContent, BubbleReactions } from "@celestia-project/ui"`}
          codeExample={BUBBLE_CODE}
        >
          <BubbleGroup className="w-full max-w-sm gap-4">
            <Bubble variant="tinted" align="start">
              <BubbleContent className="text-xs">
                Generated 4 optimized SQL indexes for the Drizzle migration schema.
              </BubbleContent>
              <BubbleReactions side="bottom" align="end">
                <span className="flex items-center gap-1 text-[10px] text-muted-foreground px-1">
                  <ThumbsUpIcon className="size-3 text-sky-500" weight="fill" />
                  <HeartIcon className="size-3 text-red-500" weight="fill" />
                  2
                </span>
              </BubbleReactions>
            </Bubble>

            <Bubble variant="default" align="end">
              <BubbleContent className="text-xs">
                Looks perfect, deploy to staging!
              </BubbleContent>
            </Bubble>
          </BubbleGroup>
        </ShowcaseCard>

        {/* 3. Attachment */}
        <ShowcaseCard
          id="attachment"
          title="Attachment"
          category="AI & Chat"
          description="File attachment badges with upload state indicators (idle, uploading, done, error)."
          docsSlug="attachment"
          importSnippet={`import { Attachment, AttachmentGroup, AttachmentMedia, AttachmentContent, AttachmentTitle, AttachmentDescription, AttachmentActions, AttachmentAction } from "@celestia-project/ui"`}
          codeExample={ATTACHMENT_CODE}
          className="md:col-span-2"
        >
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Attachment state="done" size="default">
              <AttachmentMedia variant="icon">
                <FilePdfIcon className="size-5 text-red-500" weight="fill" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>API-Documentation.pdf</AttachmentTitle>
                <AttachmentDescription>2.4 MB • Complete</AttachmentDescription>
              </AttachmentContent>
              <AttachmentActions>
                <AttachmentAction aria-label="Remove">
                  <XIcon className="size-3.5" />
                </AttachmentAction>
              </AttachmentActions>
            </Attachment>

            <Attachment state="done" size="default">
              <AttachmentMedia variant="icon">
                <FileImageIcon className="size-5 text-sky-500" weight="fill" />
              </AttachmentMedia>
              <AttachmentContent>
                <AttachmentTitle>architecture-diagram.png</AttachmentTitle>
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

        {/* 4. Chat Input */}
        <ShowcaseCard
          id="chat-input"
          title="Chat Input"
          category="AI & Chat"
          description="Multi-line AI prompt submission container with action buttons and keyboard shortcuts."
          docsSlug="chat-input"
          importSnippet={`import { ChatInput } from "@celestia-project/ui"`}
          codeExample={CHAT_INPUT_CODE}
          className="md:col-span-2"
        >
          <div className="relative w-full max-w-lg rounded-lg border border-border bg-background p-2 focus-within:ring-1 focus-within:ring-primary/50">
            <ChatInput
              placeholder="Ask Celestia AI a question or generate boilerplate..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="min-h-[70px] border-0 bg-transparent text-xs focus-visible:ring-0 focus-visible:ring-offset-0 p-1"
            />
            <div className="flex items-center justify-between border-t border-border/40 pt-2 mt-1">
              <span className="text-[10px] text-muted-foreground">Press Shift + Enter for new line</span>
              <Button size="xs" variant="default" className="gap-1">
                <span>Send</span>
                <PaperPlaneRightIcon className="size-3" weight="fill" />
              </Button>
            </div>
          </div>
        </ShowcaseCard>
      </div>
    </div>
  )
}
