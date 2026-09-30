import * as React from "react"
import { StyleSheet, View, type ImageSourcePropType } from "react-native"
import { metrics } from "../../tokens"
import { MobileGrid } from "../primitive/grid"
import { MobileImage } from "../primitive/image"
import { MobilePressableScale } from "../primitive/pressable-scale"
import { MobileEmptyState } from "../composite/empty-state"
import { MobileScreen, type MobileScreenProps } from "./screen"

export interface MobileMediaGridScreenProps
  extends Omit<
    MobileScreenProps,
    "children" | "footer" | "scroll"
  > {
  /** Header title. @default 'Photos' */
  title?: string
  /** The images, in display order. */
  images: ImageSourcePropType[]
  /** Cells per row. @default 3 */
  columns?: number
  /** Gap between cells, in points. @default 4 */
  gap?: number
  /** Called with the tapped image's index. */
  onSelectImage?: (index: number) => void
  /** Empty-state copy. @default 'No images yet' */
  emptyMessage?: string
  /** Screen-reader prefix for cell labels. @default 'Photo' */
  imageAccessibilityLabel?: string
}

/**
 * MobileMediaGridScreen
 *
 * Photo/gallery browser: a header and a grid of square, tappable thumbnails.
 *
 * Cells are `MobilePressableScale` around a ratio-1 `MobileImage`, so the press
 * feedback is the whole tile shrinking rather than an opacity flicker — which
 * matters in a grid, where a flat highlight is hard to attribute to one cell
 * among identical neighbours.
 *
 * Selection reports the *index*, not the source: the caller already has the
 * array, and an index survives sources that are objects with no stable
 * identity to compare on.
 */
export function MobileMediaGridScreen({
  title = "Photos",
  images,
  columns = 3,
  gap = 4,
  onSelectImage,
  emptyMessage = "No images yet",
  imageAccessibilityLabel = "Photo",
  contentContainerStyle,
  ...screenProps
}: MobileMediaGridScreenProps) {
  return (
    <MobileScreen
      {...screenProps}
      title={title}
      contentContainerStyle={[styles.content, contentContainerStyle]}
    >
      {images.length === 0 ? (
        <View style={styles.emptyWrap}>
          <MobileEmptyState title={emptyMessage} />
        </View>
      ) : (
        <MobileGrid columns={columns} gap={gap}>
          {images.map((source, index) => (
            <MobilePressableScale
              key={`media-cell-${index}`}
              onPress={onSelectImage ? () => onSelectImage(index) : undefined}
              accessibilityLabel={`${imageAccessibilityLabel} ${index + 1} of ${images.length}`}
            >
              <MobileImage source={source} ratio={1} radius={metrics.radius.sm} />
            </MobilePressableScale>
          ))}
        </MobileGrid>
      )}
    </MobileScreen>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
  },
})
