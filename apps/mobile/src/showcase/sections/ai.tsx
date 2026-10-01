import * as React from "react"
import { View } from "react-native"
import {
  MobileAgentCard,
  MobileAgentTaskRow,
  MobileAiAvatar,
  MobileAiCopyButton,
  MobileAiDisclaimer,
  MobileAiErrorCard,
  MobileAiFeedbackBar,
  MobileAiMessage,
  MobileAiSkeletonMessage,
  MobileAiUsageCard,
  MobileAttachmentTray,
  MobileAudioWaveform,
  MobileCitationChip,
  MobileCodeBlock,
  MobileImageResultCard,
  MobileModelSelector,
  MobilePromptGallery,
  MobilePromptInput,
  MobileSourceList,
  MobileStopButton,
  MobileStreamingText,
  MobileSuggestionChips,
  MobileThinkingBlock,
  MobileTokenMeter,
  MobileToolCallCard,
  MobileTypingIndicator,
  MobileVoiceButton,
  MobileText,
  useMobileTheme,
  type MobileAiAvatarState,
  type MobileAiErrorKind,
  type MobileAiFeedback,
  type MobileVoiceState,
} from "@celestia-project/mobile"
import sampleImage from "../../../assets/ai-generated-sample.png"
import type { ShowcaseContext } from "../types"
import { ShowcaseIcon, type ShowcaseIconName } from "../icons"
import { DemoLabel, Readout, Row, SPACE, Spacer, Specimen, Stack } from "../ui"
import {
  AI_AGENTS,
  AI_ANSWER,
  AI_ATTACHMENTS,
  AI_CODE_SAMPLE,
  AI_MODELS,
  AI_PROMPTS,
  AI_QUESTION,
  AI_SOURCES,
  AI_STREAMING_ANSWER,
  AI_SUGGESTIONS,
  AI_TASKS,
  AI_THINKING,
  AI_TOOL_ARGS,
  AI_TOOL_RESULT,
  AI_VOICE_LEVELS,
} from "../sample-data"

/**
 * AI — the assistant, agent and generative surfaces.
 *
 * `ai-message`, `streaming-text`, `typing-indicator`, `ai-skeleton-message`,
 * `ai-avatar`, `thinking-block`, `tool-call-card`, `code-block`, `citation-chip`,
 * `source-list`, `ai-feedback-bar`, `copy-button`, `ai-error-card`,
 * `ai-disclaimer`, `prompt-input`, `attachment-tray`, `voice-button`,
 * `audio-waveform`, `stop-button`, `model-selector`, `token-meter`,
 * `suggestion-chips`, `prompt-gallery`, `agent-card`, `agent-task-row`,
 * `ai-usage-card` and `image-result-card`.
 *
 * Two things make this section different from the other seven, and both are
 * worth watching for:
 *
 * 1. **Almost every specimen is stateful**, because almost every AI component
 *    is a *state* rather than a control. A transcript without a streaming turn,
 *    a composer without a generating turn and a tool card without a running one
 *    would all be demonstrating the easy half. The section therefore keeps more
 *    local state than any other — but it is still the *host app's* state, which
 *    is exactly the contract: the library renders what it is handed.
 * 2. **The content is the same world as every other section.** The assistant
 *    answers questions about the Celestia Analytics dashboard the Charts
 *    specimens draw, cites the same week of signups, and its token meter reads
 *    against the same plan. An AI section full of `Lorem ipsum` would prove the
 *    components compose; this one proves they compose *into the product*.
 */

/** The five avatar states, in the order the ring reads them. */
const AVATAR_STATES: MobileAiAvatarState[] = [
  "idle",
  "thinking",
  "streaming",
  "speaking",
  "error",
]

/** The three microphone states. */
const VOICE_STATES: MobileVoiceState[] = ["idle", "recording", "processing"]

/**
 * The failures worth showing. `context_length` and `content_filter` are here
 * precisely because they are the two where the card *withholds* the retry
 * button — a demo that only showed retryable errors would hide the rule.
 */
const ERROR_KINDS: MobileAiErrorKind[] = [
  "rate_limit",
  "context_length",
  "content_filter",
]

/**
 * One icon per starter prompt, keyed by the fixture id.
 *
 * The prompt fixtures live in `sample-data.ts` and deliberately carry no icon —
 * `@celestia-project/mobile` ships no icon dependency, so an icon is a *host
 * app* concern and belongs on this side of the seam. Keying by id keeps the
 * fixture file free of showcase-only imports.
 */
const PROMPT_ICONS: Record<string, ShowcaseIconName> = {
  summarise: "note",
  anomaly: "search",
  sql: "code",
  brief: "capture",
}

/** One glyph per agent, so three otherwise-identical cards stay distinguishable. */
const AGENT_GLYPHS: Record<string, ShowcaseIconName> = {
  analyst: "model",
  researcher: "web",
  captain: "fast",
}

export function AiSection({ ctx }: { ctx: ShowcaseContext }) {
  const { colors } = useMobileTheme()

  // Transcript
  const [feedback, setFeedback] = React.useState<MobileAiFeedback>(null)
  const [lastAction, setLastAction] = React.useState("—")

  // Composer
  const [draft, setDraft] = React.useState("")
  const [generating, setGenerating] = React.useState(false)
  const [attachments, setAttachments] = React.useState(AI_ATTACHMENTS)
  const [voice, setVoice] = React.useState<MobileVoiceState>("idle")

  // Model & agents
  const [model, setModel] = React.useState("celestia-pro")
  const [agent, setAgent] = React.useState("analyst")

  // The gallery's icons are a host-app concern (see PROMPT_ICONS), so they are
  // attached here rather than baked into the fixtures.
  const promptsWithIcons = AI_PROMPTS.map((prompt) => ({
    ...prompt,
    icon: (
      <ShowcaseIcon name={PROMPT_ICONS[prompt.id] ?? "assistant"} size="sm" />
    ),
  }))

  return (
    <View>
      <Specimen
        title="Transcript — one turn per role"
        description="The user's turn is a filled bubble pinned right. The assistant's is unboxed and left-aligned beside its avatar, because a bubble caps the width of prose that has room to breathe. The system note is centred — it is not a speaker, so it gets no side. A tool turn sits on a card, marking output the model did not write itself."
        modulePath="ai/ai-message · ai/ai-avatar · ai/ai-feedback-bar"
      >
        <Stack gap={SPACE.block}>
          <MobileAiMessage
            role="system"
            text="New conversation · Celestia Assistant"
          />

          <MobileAiMessage role="user" text={AI_QUESTION} time="09:12" />

          <MobileAiMessage
            role="assistant"
            avatar={<MobileAiAvatar state="idle" />}
            text={AI_ANSWER}
            time="09:12"
            actions={
              <MobileAiFeedbackBar
                value={feedback}
                onChange={setFeedback}
                onCopy={() => setLastAction("copy · answer")}
                onRegenerate={() => setLastAction("regenerate · answer")}
                onShare={() => setLastAction("share · answer")}
              />
            }
          />

          <MobileAiMessage
            role="tool"
            avatar={<MobileAiAvatar state="idle" />}
            text="ledger.query returned 3 rows in 820ms"
          />

          <MobileAiMessage
            role="assistant"
            avatar={<MobileAiAvatar state="streaming" />}
            text={AI_STREAMING_ANSWER}
            streaming
          />
        </Stack>

        <Readout
          label="rating / last action"
          value={`${feedback ?? "none"} · ${lastAction}`}
        />
      </Specimen>

      <Specimen
        title="Waiting — three ways to say “not finished”"
        description="A skeleton reserves the answer's shape so nothing jumps when the text lands; a typing indicator names the wait; a caret marks text that is still arriving. The avatar ring pulses on scale and opacity, so it never resizes the disc it wraps — a border-width animation would relayout the row on every frame."
        modulePath="ai/streaming-text · ai/typing-indicator · ai/ai-skeleton-message · ai/ai-avatar"
      >
        <DemoLabel>Streaming — the caret blinks while tokens arrive</DemoLabel>
        <Row gap={SPACE.row} align="flex-start" wrap={false}>
          <MobileAiAvatar state="streaming" />
          <View style={{ flex: 1 }}>
            <MobileStreamingText text={AI_STREAMING_ANSWER} streaming />
          </View>
        </Row>

        <Spacer size={SPACE.block} />
        <DemoLabel>Waiting for the first token</DemoLabel>
        <MobileTypingIndicator label="Searching the ledger…" />

        <Spacer size={SPACE.block} />
        <DemoLabel>Reserving the answer's shape</DemoLabel>
        <MobileAiSkeletonMessage lines={3} />

        <Spacer size={SPACE.block} />
        <DemoLabel>Avatar states</DemoLabel>
        <Row gap={SPACE.block}>
          {AVATAR_STATES.map((state) => (
            <View
              key={state}
              style={{ alignItems: "center", gap: SPACE.inline }}
            >
              <MobileAiAvatar state={state} />
              <MobileText variant="caption" color="muted">
                {state}
              </MobileText>
            </View>
          ))}
        </Row>
      </Specimen>

      <Specimen
        title="Reasoning, tool calls and code"
        description="The parts of an answer that are not prose. A reasoning trace is a disclosure, not a message — collapsed by default, muted and indented so the eye can skip it. A tool call opens itself while running and settles to a glyph and a word; the word is what carries `skipped`, which has no natural glyph. Code scrolls horizontally rather than wrapping, because indentation is the only structure a non-highlighted block has left."
        modulePath="ai/thinking-block · ai/tool-call-card · ai/code-block"
      >
        <DemoLabel>Collapsed by default — tap to reveal</DemoLabel>
        <MobileThinkingBlock duration="4.2s">{AI_THINKING}</MobileThinkingBlock>

        <Spacer size={SPACE.block} />
        <DemoLabel>Expanded</DemoLabel>
        <MobileThinkingBlock duration="4.2s" defaultOpen>
          {AI_THINKING}
        </MobileThinkingBlock>

        <Spacer size={SPACE.block} />
        <DemoLabel>Tool calls — running, done, failed</DemoLabel>
        <Stack gap={SPACE.row}>
          <MobileToolCallCard
            name="ledger.query"
            status="running"
            args={AI_TOOL_ARGS}
            onCopyArgs={() => setLastAction("copy · args")}
          />
          <MobileToolCallCard
            name="ledger.query"
            status="success"
            duration="820ms"
            args={AI_TOOL_ARGS}
            result={AI_TOOL_RESULT}
            onCopyArgs={() => setLastAction("copy · args")}
            onCopyResult={() => setLastAction("copy · result")}
          />
          <MobileToolCallCard
            name="web.search"
            status="error"
            duration="2.1s"
            result="HTTP 429 — provider rate limit reached"
          />
        </Stack>

        <Spacer size={SPACE.block} />
        <DemoLabel>Code</DemoLabel>
        <MobileCodeBlock
          code={AI_CODE_SAMPLE}
          language="sql"
          filename="refunds-by-plan.sql"
          onCopy={() => setLastAction("copy · code")}
        />
      </Specimen>

      <Specimen
        title="Citations"
        description="A claim is only as good as its source. The inline chip carries the number that joins the sentence to the bibliography, and the list repeats it as a visible badge — the reader is scanning for the “3” they just read in the paragraph, so the number is a join key rather than a list marker. Rows go flat when there is no onSelect, so a read-only bibliography never presents itself as a button."
        modulePath="ai/citation-chip · ai/source-list"
      >
        <DemoLabel>Inline markers</DemoLabel>
        <Row gap={SPACE.label}>
          <MobileCitationChip
            index={1}
            onPress={() => setLastAction("cite · 1")}
          />
          <MobileCitationChip
            index={2}
            onPress={() => setLastAction("cite · 2")}
          />
          <MobileCitationChip
            index={3}
            label="celestia.dev"
            active
            onPress={() => setLastAction("cite · 3")}
          />
        </Row>

        <Spacer size={SPACE.block} />
        <DemoLabel>Static — no onPress, so no touch target</DemoLabel>
        <Row gap={SPACE.label}>
          <MobileCitationChip index={1} />
          <MobileCitationChip index={2} />
        </Row>

        <Spacer size={SPACE.block} />
        <DemoLabel>The bibliography</DemoLabel>
        <MobileSourceList
          sources={AI_SOURCES}
          onSelect={(source) => setLastAction(`source · ${source.id}`)}
        />
      </Specimen>

      <Specimen
        title="Feedback and failure"
        description="Rating is reversible: tapping the active thumb clears the vote, because a one-way control traps a mis-tap with no way back — and null is exactly what the API wants when a user changes their mind. The error card names the failure and the fix, and withholds retry for the two kinds where retrying the same input cannot help: a button guaranteed to fail is worse than no button."
        modulePath="ai/ai-feedback-bar · ai/copy-button · ai/ai-error-card · ai/ai-disclaimer"
      >
        <DemoLabel>Feedback bar — tap a thumb twice to clear it</DemoLabel>
        <MobileAiFeedbackBar
          value={feedback}
          onChange={setFeedback}
          onCopy={() => setLastAction("copy · answer")}
          onRegenerate={() => setLastAction("regenerate · answer")}
          onShare={() => setLastAction("share · answer")}
        />
        <Readout label="rating" value={feedback ?? "none"} />

        <Spacer size={SPACE.block} />
        <DemoLabel>
          Copy — the confirmation is ours, the clipboard is not
        </DemoLabel>
        <Row gap={SPACE.label}>
          <MobileAiCopyButton onCopy={() => setLastAction("copy · answer")} />
          <MobileAiCopyButton
            label="Copy query"
            copiedLabel="Query copied"
            onCopy={() => setLastAction("copy · query")}
          />
        </Row>

        <Spacer size={SPACE.block} />
        <DemoLabel>Errors — note which two have no retry</DemoLabel>
        <Stack gap={SPACE.row}>
          {ERROR_KINDS.map((kind) => (
            <MobileAiErrorCard
              key={kind}
              kind={kind}
              onRetry={() => setLastAction(`retry · ${kind}`)}
            />
          ))}
        </Stack>

        <Spacer size={SPACE.block} />
        <DemoLabel>Disclaimer — default, warning tone, and compact</DemoLabel>
        <Stack gap={SPACE.row}>
          <MobileAiDisclaimer />
          <MobileAiDisclaimer
            tone="warning"
            text="Not medical advice. Talk to a clinician before acting on anything here."
          />
          <MobileAiDisclaimer compact />
        </Stack>
      </Specimen>

      <Specimen
        title="Composer"
        description="The composer is where the draft lives — the component holds none of it, which is what makes an optimistic send possible. Send is disabled on an empty draft, unlike a form submit: the draft is on screen and empty, so “nothing to send” is self-evident rather than a puzzle. While the model responds, stop replaces send in place rather than moving elsewhere at the exact moment you want to interrupt."
        modulePath="ai/prompt-input · ai/attachment-tray · ai/voice-button · ai/audio-waveform · ai/stop-button"
      >
        <MobilePromptInput
          value={draft}
          onChangeText={setDraft}
          onSend={() => {
            setLastAction(`send · ${draft.trim() || "empty"}`)
            setDraft("")
          }}
          onStop={() => {
            setLastAction("stop · generation")
            setGenerating(false)
          }}
          generating={generating}
          modelLabel={AI_MODELS[0]!.name}
          onModelPress={() => setLastAction("model · open picker")}
          leading={
            <MobileVoiceButton onPress={() => setLastAction("voice · tap")} />
          }
          attachments={
            <MobileAttachmentTray
              attachments={attachments}
              title={`${attachments.length} attached`}
              onRemove={(id) =>
                setAttachments((current) =>
                  current.filter((item) => item.id !== id)
                )
              }
            />
          }
          hint="Enter to send · drafts are yours to keep"
          maxLength={400}
        />

        <Spacer size={SPACE.block} />
        <DemoLabel>Generating — send has become stop</DemoLabel>
        <Row gap={SPACE.label}>
          <MobileStopButton
            onPress={() => setLastAction("stop · generation")}
          />
          <MobileAiCopyButton
            label={generating ? "Generating…" : "Simulate generating"}
            copiedLabel="Generating…"
            onCopy={() => setGenerating(true)}
          />
        </Row>

        <Spacer size={SPACE.block} />
        <DemoLabel>Voice — idle, recording, transcribing</DemoLabel>
        <Row gap={SPACE.block}>
          {VOICE_STATES.map((state) => (
            <View
              key={state}
              style={{ alignItems: "center", gap: SPACE.inline }}
            >
              <MobileVoiceButton
                state={state}
                onPress={() => setVoice(state)}
              />
              <MobileText variant="caption" color="muted">
                {state}
              </MobileText>
            </View>
          ))}
        </Row>
        <Readout label="voice" value={voice} />

        <Spacer size={SPACE.block} />
        <DemoLabel>Waveform — recording, and playback at 35%</DemoLabel>
        <Stack gap={SPACE.row}>
          <MobileAudioWaveform active />
          <MobileAudioWaveform levels={AI_VOICE_LEVELS} progress={0.35} />
        </Stack>
      </Specimen>

      <Specimen
        title="Model and context"
        description="Locked tiers are rendered, not filtered — the ladder of what you have and what you could have is the entire point of showing a model list. The token meter escalates its tone in two steps rather than one, because a single threshold either cries wolf or warns too late. Suggestions wrap instead of scrolling: a nudge whose second half is off-screen is not a nudge."
        modulePath="ai/model-selector · ai/token-meter · ai/suggestion-chips · ai/prompt-gallery"
      >
        <DemoLabel>Model — composer picker</DemoLabel>
        <MobileModelSelector
          models={AI_MODELS}
          value={model}
          onChange={setModel}
        />

        <Spacer size={SPACE.block} />
        <DemoLabel>Model — settings list, with descriptions</DemoLabel>
        <MobileModelSelector
          models={AI_MODELS}
          value={model}
          onChange={setModel}
          orientation="vertical"
        />

        <Spacer size={SPACE.block} />
        <DemoLabel>Context window</DemoLabel>
        <Stack gap={SPACE.block}>
          <MobileTokenMeter used={41_200} limit={128_000} />
          <MobileTokenMeter
            used={122_400}
            limit={128_000}
            label="Context — nearly full"
          />
        </Stack>

        <Spacer size={SPACE.block} />
        <DemoLabel>Suggested prompts</DemoLabel>
        <MobileSuggestionChips
          title="Try one of these"
          suggestions={AI_SUGGESTIONS}
          onSelect={(suggestion) => setLastAction(`suggestion · ${suggestion}`)}
        />

        <Spacer size={SPACE.block} />
        <DemoLabel>Starter gallery — one column</DemoLabel>
        <MobilePromptGallery
          title="Start with"
          prompts={promptsWithIcons}
          onSelect={(prompt) => setLastAction(`prompt · ${prompt.id}`)}
        />

        <Spacer size={SPACE.block} />
        <DemoLabel>
          Starter gallery — two columns, description dropped
        </DemoLabel>
        <MobilePromptGallery
          columns={2}
          title="Quick actions"
          prompts={promptsWithIcons}
          onSelect={(prompt) => setLastAction(`prompt · ${prompt.id}`)}
        />
        <Readout
          label="model / last action"
          value={`${model} · ${lastAction}`}
        />
      </Specimen>

      <Specimen
        title="Agents, tasks and account"
        description="The agent rail draws its connector behind the status node, which is what makes a list of steps read as a sequence rather than an unrelated checklist — and why the row takes an explicit connector flag instead of guessing its own position. The usage card omits its upgrade action entirely rather than disabling it: a dead button on a quota card is the worst possible place for one."
        modulePath="ai/agent-card · ai/agent-task-row · ai/ai-usage-card · ai/image-result-card"
      >
        <DemoLabel>Agents — locked entries stay visible</DemoLabel>
        <Stack gap={SPACE.row}>
          {AI_AGENTS.map((candidate) => (
            <MobileAgentCard
              key={candidate.id}
              name={candidate.name}
              description={candidate.description}
              capabilities={candidate.capabilities}
              badge={candidate.badge}
              selected={agent === candidate.id}
              avatar={
                <MobileAiAvatar
                  state="idle"
                  glyph={
                    <ShowcaseIcon
                      name={AGENT_GLYPHS[candidate.id] ?? "assistant"}
                      size="sm"
                      color={colors.primary}
                    />
                  }
                />
              }
              onPress={() => setAgent(candidate.id)}
            />
          ))}
        </Stack>

        <Spacer size={SPACE.block} />
        <DemoLabel>Task rail — one step still running</DemoLabel>
        <View>
          {AI_TASKS.map((task, index) => (
            <MobileAgentTaskRow
              key={task.id}
              task={task}
              index={index + 1}
              total={AI_TASKS.length}
              connector={index < AI_TASKS.length - 1}
            />
          ))}
        </View>

        <Spacer size={SPACE.block} />
        <DemoLabel>Usage — healthy, and exhausted</DemoLabel>
        <Stack gap={SPACE.row}>
          <MobileAiUsageCard
            planLabel="Team plan"
            used={1_240}
            limit={4_000}
            renewsAt="Renews 14 Nov · 4,000 credits / month"
            onUpgrade={() => setLastAction("upgrade · plan")}
          />
          <MobileAiUsageCard
            planLabel="Trial"
            used={500}
            limit={500}
            unit="messages"
            renewsAt="Trial ends 3 Oct"
            onUpgrade={() => setLastAction("upgrade · trial")}
          />
        </Stack>

        <Spacer size={SPACE.block} />
        <DemoLabel>Image result — ready, then loading and failed</DemoLabel>
        <MobileImageResultCard
          source={sampleImage}
          prompt="Abstract aurora over a dark field, four-colour ramp, soft bloom"
          onPress={() => setLastAction("image · open lightbox")}
          onDownload={() => setLastAction("image · download")}
          onRegenerate={() => setLastAction("image · regenerate")}
        />
        <Spacer size={SPACE.row} />
        <Row gap={SPACE.row} align="flex-start" wrap={false}>
          <View style={{ flex: 1 }}>
            <MobileImageResultCard status="loading" aspectRatio={1} />
          </View>
          <View style={{ flex: 1 }}>
            <MobileImageResultCard status="error" aspectRatio={1} />
          </View>
        </Row>

        <Readout label="agent / scheme" value={`${agent} · ${ctx.scheme}`} />
      </Specimen>
    </View>
  )
}
