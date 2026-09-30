import * as React from "react"
import { FlatList, StyleSheet, View } from "react-native"
import { MobileButton } from "../primitive/button"
import { MobileEmptyState } from "../composite/empty-state"
import { MobileNotificationCard } from "../composite/notification-card"
import { MobileScreen, type MobileScreenProps } from "./screen"

export interface MobileNotificationsScreenItem {
  /** Stable identity for the row and the press/dismiss callbacks. */
  id: string
  title: string
  body?: string
  /** Pre-formatted timestamp, e.g. the output of `formatRelativeTime`. */
  time?: string
  /** Unread cards get the accent treatment and count toward "Mark all read". */
  unread?: boolean
}

export interface MobileNotificationsScreenProps
  extends Omit<
    MobileScreenProps,
    "children" | "scroll" | "footer" | "contentContainerStyle"
  > {
  /** Header title. @default 'Notifications' */
  title?: string
  /** The notifications, newest first by convention. */
  notifications: MobileNotificationsScreenItem[]
  /** Called with the notification's id when its card is pressed. */
  onPressNotification?: (id: string) => void
  /** Called with the notification's id when its dismiss affordance is pressed. */
  onDismissNotification?: (id: string) => void
  /** Renders the header action whenever any notification is unread. */
  onMarkAllRead?: () => void
  /** Label for the header action. @default 'Mark all read' */
  markAllReadLabel?: string
  /** Empty-state headline. @default 'No notifications' */
  emptyTitle?: string
  /** Empty-state copy. */
  emptyMessage?: string
}

/**
 * MobileNotificationsScreen
 *
 * Notification inbox: a header with a contextual "Mark all read" action and a
 * flat list of `MobileNotificationCard`s.
 *
 * Scrolling belongs to the `FlatList`, not to `MobileScreen` — nesting the list
 * in the screen's scroll view would break recycling and rubber-band the two
 * scrollers against each other, so the screen runs with `scroll` off.
 *
 * The bulk action appears only while something is actually unread; a "mark all
 * read" button on an all-read inbox is an offer that does nothing.
 */
export function MobileNotificationsScreen({
  title = "Notifications",
  notifications,
  onPressNotification,
  onDismissNotification,
  onMarkAllRead,
  markAllReadLabel = "Mark all read",
  emptyTitle = "No notifications",
  emptyMessage = "When something happens, it will show up here.",
  headerRight,
  ...screenProps
}: MobileNotificationsScreenProps) {
  const hasUnread = notifications.some((item) => item.unread)

  const resolvedHeaderRight =
    onMarkAllRead && hasUnread ? (
      <MobileButton
        size="sm"
        variant="ghost"
        onPress={onMarkAllRead}
        accessibilityHint="Marks every notification as read"
      >
        {markAllReadLabel}
      </MobileButton>
    ) : (
      headerRight
    )

  return (
    <MobileScreen
      {...screenProps}
      title={title}
      headerRight={resolvedHeaderRight}
      scroll={false}
    >
      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MobileNotificationCard
            title={item.title}
            body={item.body}
            time={item.time}
            unread={item.unread}
            onPress={
              onPressNotification
                ? () => onPressNotification(item.id)
                : undefined
            }
            onDismiss={
              onDismissNotification
                ? () => onDismissNotification(item.id)
                : undefined
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <MobileEmptyState title={emptyTitle} description={emptyMessage} />
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          notifications.length === 0 && styles.listContentEmpty,
        ]}
        showsVerticalScrollIndicator={false}
      />
    </MobileScreen>
  )
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
  },
  // Lets the empty state centre vertically instead of hugging the header.
  listContentEmpty: {
    flexGrow: 1,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
  },
})
