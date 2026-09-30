import * as React from "react"
import { StyleSheet, View, type ImageSourcePropType } from "react-native"
import { MobileText } from "../primitive/text"
import { MobileAvatar } from "../primitive/avatar"
import { MobileCard } from "../primitive/card"
import { getInitials } from "../../utils"

export interface MobileCommentCardProps {
  /**
   * Display name of the commenter.
   */
  author: string
  /**
   * Optional timestamp string ("2h ago", "Mar 3"), rendered muted beside
   * the author.
   */
  time?: string
  /**
   * Comment body.
   */
  text: string
  /**
   * One or two initials for the avatar fallback. Derived from `author` when
   * omitted, so a name always yields a mark.
   */
  initials?: string
  /**
   * Avatar image source. Takes precedence over initials.
   */
  avatarSource?: ImageSourcePropType
}

/**
 * MobileCommentCard
 *
 * Avatar + author/time header + body — the canonical social proof unit.
 * Purely presentational: moderation, replies and press handling belong to
 * the caller's list, not to the card.
 */
export function MobileCommentCard({
  author,
  time,
  text,
  initials,
  avatarSource,
}: MobileCommentCardProps) {
  return (
    <MobileCard style={styles.card}>
      <MobileAvatar
        source={avatarSource}
        initials={initials ?? getInitials(author)}
        size="md"
        accessibilityLabel={author}
      />

      <View style={styles.content}>
        {/* One row for name + time so a screen reader announces the byline as
            a single unit, distinct from the comment body. */}
        <View style={styles.header}>
          <MobileText
            variant="callout"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={styles.author}
          >
            {author}
          </MobileText>
          {time ? (
            <MobileText variant="caption" color="muted" numberOfLines={1}>
              {time}
            </MobileText>
          ) : null}
        </View>

        <MobileText variant="body">{text}</MobileText>
      </View>
    </MobileCard>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 16,
    gap: 12,
  },
  content: {
    flex: 1,
    gap: 4,
  },
  header: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  author: {
    fontWeight: "600",
    flexShrink: 1,
  },
})
