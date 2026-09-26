import * as React from "react"
import {
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from "react-native"
import { useMobileTheme } from "../../host"
import { metrics } from "../../tokens"
import { MobileButton } from "../primitive/button"
import { MobileText } from "../primitive/text"
import { MobileScreen } from "./screen"

const ACTIVE_DOT_WIDTH = 20
const DOT_SIZE = 6

export interface MobileOnboardingSlide {
  /**
   * Stable identity, used as the React key and as the page identity.
   */
  id: string
  /**
   * Slide headline.
   */
  title: string
  /**
   * Optional supporting copy.
   */
  description?: string
  /**
   * Illustration or icon node shown above the title. Icons arrive as props.
   */
  media?: React.ReactNode
}

export interface MobileOnboardingScreenProps {
  /**
   * Slides, in order. Must be non-empty — an onboarding screen with nothing to
   * onboard is a bug in the caller, so it renders nothing rather than an empty
   * frame with a live "Get started" button.
   */
  slides: MobileOnboardingSlide[]
  /**
   * Controlled page index. Omit to let the screen own it.
   */
  activeIndex?: number
  /**
   * Called whenever the page changes, from either a swipe or the next button.
   */
  onIndexChange?: (index: number) => void
  /**
   * Called when the primary button is pressed on the last slide.
   */
  onDone?: () => void
  /**
   * Called when skip is pressed.
   */
  onSkip?: () => void
  /**
   * @default 'Skip'
   */
  skipLabel?: string
  /**
   * @default 'Next'
   */
  nextLabel?: string
  /**
   * @default 'Get started'
   */
  doneLabel?: string
  /**
   * Hides the skip affordance on the final slide regardless of this value,
   * since there is nothing left to skip past.
   * @default true
   */
  showSkip?: boolean
  /**
   * Screen-reader label for the page indicator.
   * @default 'Onboarding progress'
   */
  progressAccessibilityLabel?: string
  /**
   * Test identifier.
   */
  testID?: string
  /**
   * Optional style override for the frame.
   */
  style?: StyleProp<ViewStyle>
}

/**
 * MobileOnboardingScreen
 *
 * Paged introduction: swipeable slides, a page indicator, and skip / next /
 * get-started actions.
 *
 * The pager is a horizontal `ScrollView` with `pagingEnabled` and no gesture
 * library — the native pager already handles snapping, momentum and the
 * rubber-band edge, and adding a gesture dependency for this would be pure
 * weight. The page width is measured from the pager's own layout rather than
 * read from `useWindowDimensions`, because a screen nested under any horizontal
 * inset would otherwise snap to the wrong offset; the window width is only the
 * initial guess so the first frame is not zero-width.
 *
 * The indicator is a read-only `progressbar`, not an adjustable control. Making
 * the dots tappable would promise a jump that the component does not implement.
 */
export function MobileOnboardingScreen({
  slides,
  activeIndex,
  onIndexChange,
  onDone,
  onSkip,
  skipLabel = "Skip",
  nextLabel = "Next",
  doneLabel = "Get started",
  showSkip = true,
  progressAccessibilityLabel = "Onboarding progress",
  testID,
  style,
}: MobileOnboardingScreenProps) {
  const { colors } = useMobileTheme()
  const { width: windowWidth } = useWindowDimensions()
  const scrollRef = React.useRef<ScrollView>(null)

  const [pageWidth, setPageWidth] = React.useState(windowWidth)
  const [internalIndex, setInternalIndex] = React.useState(0)

  const lastIndex = Math.max(slides.length - 1, 0)
  const isControlled = activeIndex !== undefined
  const requestedIndex = isControlled ? activeIndex : internalIndex
  const index = Math.min(Math.max(requestedIndex, 0), lastIndex)
  const isLastSlide = index >= lastIndex

  const goTo = (next: number) => {
    const clamped = Math.min(Math.max(next, 0), lastIndex)
    if (!isControlled) setInternalIndex(clamped)
    onIndexChange?.(clamped)
    scrollRef.current?.scrollTo({ x: clamped * pageWidth, animated: true })
  }

  const handleLayout = (event: LayoutChangeEvent) => {
    const nextWidth = event.nativeEvent.layout.width
    if (nextWidth <= 0 || nextWidth === pageWidth) return
    setPageWidth(nextWidth)
    // Re-align after a rotation, otherwise the pager sits mid-slide.
    scrollRef.current?.scrollTo({ x: index * nextWidth, animated: false })
  }

  const handleMomentumEnd = (
    event: NativeSyntheticEvent<NativeScrollEvent>
  ) => {
    if (pageWidth <= 0) return
    const next = Math.round(event.nativeEvent.contentOffset.x / pageWidth)
    const clamped = Math.min(Math.max(next, 0), lastIndex)
    if (clamped === index) return
    if (!isControlled) setInternalIndex(clamped)
    onIndexChange?.(clamped)
  }

  const handlePrimaryPress = () => {
    if (isLastSlide) {
      onDone?.()
      return
    }
    goTo(index + 1)
  }

  // A controlled parent may move the page without a swipe — for example by
  // restoring a saved position — so follow it.
  React.useEffect(() => {
    if (!isControlled) return
    scrollRef.current?.scrollTo({ x: index * pageWidth, animated: true })
  }, [isControlled, index, pageWidth])

  if (slides.length === 0) return null

  const showSkipButton = showSkip && !isLastSlide

  return (
    <MobileScreen
      testID={testID}
      style={style}
      header={null}
      // The pager scrolls horizontally; nesting it in the screen's vertical
      // scroll view would make the two gestures fight.
      scroll={false}
      footer={
        <View>
          <View
            accessibilityRole="progressbar"
            accessibilityLabel={progressAccessibilityLabel}
            accessibilityValue={{
              min: 1,
              max: slides.length,
              now: index + 1,
            }}
            style={styles.dots}
          >
            {slides.map((slide, dotIndex) => (
              <View
                key={slide.id}
                style={[
                  styles.dot,
                  dotIndex === index
                    ? {
                        width: ACTIVE_DOT_WIDTH,
                        backgroundColor: colors.primary,
                      }
                    : { backgroundColor: colors.border },
                ]}
              />
            ))}
          </View>

          <View style={styles.actions}>
            {showSkipButton ? (
              <MobileButton
                variant="ghost"
                onPress={onSkip}
                disabled={!onSkip}
              >
                {skipLabel}
              </MobileButton>
            ) : null}

            <MobileButton
              onPress={handlePrimaryPress}
              containerStyle={styles.primary}
            >
              {isLastSlide ? doneLabel : nextLabel}
            </MobileButton>
          </View>
        </View>
      }
    >
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onLayout={handleLayout}
        onMomentumScrollEnd={handleMomentumEnd}
        style={styles.pager}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={[styles.slide, { width: pageWidth }]}>
            {slide.media ? (
              <View style={styles.media}>{slide.media}</View>
            ) : null}

            <MobileText
              variant="display"
              align="center"
              accessibilityRole="header"
            >
              {slide.title}
            </MobileText>

            {slide.description ? (
              <MobileText
                variant="body"
                color="muted"
                align="center"
                style={styles.slideDescription}
              >
                {slide.description}
              </MobileText>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </MobileScreen>
  )
}

const styles = StyleSheet.create({
  pager: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
  media: {
    marginBottom: 28,
  },
  slideDescription: {
    marginTop: 10,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    minHeight: metrics.minTouchTarget,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },
  primary: {
    flex: 1,
  },
})
