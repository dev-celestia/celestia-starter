import * as React from "react"
import { FlatList, StyleSheet, View } from "react-native"
import { MobileEmptyState } from "../composite/empty-state"
import {
  MobileInfiniteScrollFooter,
  type MobileInfiniteScrollFooterState,
} from "../composite/infinite-scroll-footer"
import { MobileSearchBar } from "../composite/search-bar"
import { MobileScreen, type MobileScreenProps } from "./screen"

export interface MobileListScreenProps<T>
  extends Omit<
    MobileScreenProps,
    "children" | "scroll" | "footer" | "contentContainerStyle"
  > {
  /** Header title. */
  title?: string
  /**
   * Controlled search value. The search bar renders only when `onSearchChange`
   * is supplied — a bar whose typing goes nowhere is worse than no bar.
   */
  searchValue?: string
  onSearchChange?: (text: string) => void
  searchPlaceholder?: string
  /** The rows, in display order. */
  items: T[]
  /** Row renderer. The screen owns the list chrome; the caller owns the row. */
  renderItem: (item: T, index: number) => React.ReactNode
  /**
   * Row identity. Defaults to the index, which is fine for static lists and
   * wrong for anything that reorders — pass a real key extractor then.
   */
  keyExtractor?: (item: T, index: number) => string
  /** Enables pull-to-refresh. */
  onRefresh?: () => void
  refreshing?: boolean
  /** Infinite-scroll state drawn under the last row. `null` draws nothing. */
  footerState?: MobileInfiniteScrollFooterState | null
  /** Retry affordance for `footerState === 'error'`. */
  onRetry?: () => void
  /** Empty-state headline. @default 'Nothing here' */
  emptyTitle?: string
  /** Empty-state copy. */
  emptyMessage?: string
  /** Empty-state action, typically a `MobileButton`. */
  emptyAction?: React.ReactNode
}

/**
 * MobileListScreen
 *
 * The generic browse screen: optional search bar, pull-to-refresh, infinite
 * scroll footer, and an empty state — wired once so every list in an app gets
 * the same behaviour for free.
 *
 * The item type is a free generic and rows arrive through `renderItem`, so the
 * screen stays presentational: it knows about list *states* (refreshing,
 * loading more, failed, empty) but nothing about the data itself.
 *
 * Scrolling belongs to the `FlatList`; the screen runs with `scroll` off, as
 * nesting two scrollers breaks recycling and gesture handling.
 */
export function MobileListScreen<T>({
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  items,
  renderItem,
  keyExtractor,
  onRefresh,
  refreshing = false,
  footerState = null,
  onRetry,
  emptyTitle = "Nothing here",
  emptyMessage,
  emptyAction,
  ...screenProps
}: MobileListScreenProps<T>) {
  const showSearch = onSearchChange !== undefined

  const resolvedKeyExtractor =
    keyExtractor ?? ((_item: T, index: number) => String(index))

  return (
    <MobileScreen {...screenProps} title={title} scroll={false}>
      {showSearch ? (
        <MobileSearchBar
          value={searchValue ?? ""}
          onValueChange={onSearchChange}
          placeholder={searchPlaceholder}
          style={styles.searchBar}
        />
      ) : null}

      <FlatList
        data={items}
        keyExtractor={resolvedKeyExtractor}
        renderItem={({ item, index }) => (
          // Rows are keyed by the list itself; this fragment only adapts the
          // caller's `ReactNode` return to the `ReactElement` FlatList wants.
          <>{renderItem(item, index)}</>
        )}
        refreshing={onRefresh ? refreshing : undefined}
        onRefresh={onRefresh}
        ListFooterComponent={
          footerState ? (
            <MobileInfiniteScrollFooter state={footerState} onRetry={onRetry} />
          ) : null
        }
        ListEmptyComponent={
          // While refreshing, an empty list is a spinner's job, not an empty
          // state's — announcing "Nothing here" mid-refresh is a lie in flight.
          refreshing ? null : (
            <View style={styles.emptyWrap}>
              <MobileEmptyState
                title={emptyTitle}
                description={emptyMessage}
                action={emptyAction}
              />
            </View>
          )
        }
        contentContainerStyle={[
          styles.listContent,
          items.length === 0 && !refreshing && styles.listContentEmpty,
        ]}
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      />
    </MobileScreen>
  )
}

const styles = StyleSheet.create({
  searchBar: {
    marginHorizontal: 16,
    marginTop: 8,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
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
