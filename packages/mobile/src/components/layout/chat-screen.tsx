import * as React from "react"
import { FlatList, StyleSheet, View } from "react-native"
import { MobileText } from "../primitive/text"
import { MobileChatInput } from "../composite/chat-input"
import { MobileMessageBubble } from "../composite/message-bubble"
import { MobileScreen, type MobileScreenProps } from "./screen"

export interface MobileChatScreenMessage {
  /** Stable identity for the row. */
  id: string
  text: string
  /** Own messages align right and take the accent treatment. */
  mine?: boolean
  /** Pre-formatted timestamp shown inside the bubble. */
  time?: string
  /** Delivery state for own messages. */
  status?: "sending" | "sent" | "failed"
}

export interface MobileChatScreenProps
  extends Omit<
    MobileScreenProps,
    "children" | "scroll" | "footer" | "contentContainerStyle" | "keyboardAvoiding"
  > {
  /** Header title, conventionally the other party's name. */
  title?: string
  /** Header subline, conventionally presence ("Online", "typing…"). */
  subtitle?: string
  /** The conversation, oldest first. */
  messages: MobileChatScreenMessage[]
  /** Controlled composer value — the caller owns the text state. */
  inputValue: string
  onChangeText: (text: string) => void
  onSend: () => void
  placeholder?: string
  /** Disables the composer, e.g. while a message is uploading. */
  sendDisabled?: boolean
  /** Copy shown when the conversation has no messages. @default 'No messages yet' */
  emptyMessage?: string
}

/**
 * MobileChatScreen
 *
 * One-to-one conversation: nav-bar header, an inverted message list, and a
 * keyboard-avoiding composer pinned to the bottom.
 *
 * The list is `inverted`, which is the platform's own idiom for chat: index 0
 * renders at the bottom, new messages appear without any scroll-to-end maths,
 * and the list naturally rests at the newest message. The incoming `messages`
 * array is chronological (oldest first) because that is the order a caller
 * accumulates it in — the reversal for the inverted list happens here, so the
 * prop stays in the order the data arrives.
 *
 * The composer sits in `MobileScreen`'s pinned footer slot, outside the list,
 * inside the screen's `KeyboardAvoidingView` — it must never scroll away and
 * never hide behind the keyboard.
 */
export function MobileChatScreen({
  title,
  subtitle,
  messages,
  inputValue,
  onChangeText,
  onSend,
  placeholder,
  sendDisabled = false,
  emptyMessage = "No messages yet",
  ...screenProps
}: MobileChatScreenProps) {
  // Reversed once per change; the inverted list draws index 0 at the bottom.
  const invertedData = React.useMemo(
    () => [...messages].reverse(),
    [messages]
  )

  return (
    <MobileScreen
      {...screenProps}
      title={title}
      subtitle={subtitle}
      scroll={false}
      keyboardAvoiding
      footerBordered
      footer={
        <MobileChatInput
          value={inputValue}
          onChangeText={onChangeText}
          onSend={onSend}
          placeholder={placeholder}
          disabled={sendDisabled}
        />
      }
    >
      <FlatList
        inverted
        data={invertedData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MobileMessageBubble
            text={item.text}
            mine={item.mine}
            time={item.time}
            status={item.status}
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <MobileText variant="body" color="muted" align="center">
              {emptyMessage}
            </MobileText>
          </View>
        }
        contentContainerStyle={styles.listContent}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </MobileScreen>
  )
}

const styles = StyleSheet.create({
  // In an inverted list, "vertical" padding reads bottom-to-top: paddingTop
  // lands beside the composer and paddingBottom above the header.
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  emptyWrap: {
    // The inverted list gives the empty component no height to centre in, so
    // it settles mid-viewport on its own.
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
})
