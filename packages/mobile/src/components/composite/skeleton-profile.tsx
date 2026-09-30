import * as React from "react"
import { StyleSheet, View } from "react-native"
import { MobileSkeleton } from "../primitive/skeleton"
import { metrics } from "../../tokens"

/**
 * MobileSkeletonProfile
 *
 * A loading placeholder shaped like a profile header: a large centred avatar, a
 * name bar, two shorter bio bars, and a row of three equal stat blocks. It
 * composes the primitive `MobileSkeleton` and, like it, is hidden from assistive
 * technology — the assembly carries `accessible={false}` and hides its
 * descendants so a screen reader hears the screen's loading state, not empty
 * boxes.
 *
 * It takes no props: a profile header has one recognisable shape, and exposing
 * knobs here would only invite layouts the surrounding screen should own.
 */
export function MobileSkeletonProfile() {
  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      style={styles.container}
    >
      <MobileSkeleton
        width={72}
        height={72}
        radius={metrics.radius.full}
        style={styles.avatar}
      />
      <MobileSkeleton width="40%" height={16} style={styles.name} />
      <View style={styles.bio}>
        <MobileSkeleton width="60%" height={12} />
        <MobileSkeleton width="45%" height={12} />
      </View>
      <View style={styles.stats}>
        {[0, 1, 2].map((index) => (
          <View key={index} style={styles.statCell}>
            <MobileSkeleton
              width="100%"
              height={48}
              radius={metrics.radius.md}
            />
          </View>
        ))}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 16,
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    marginBottom: 12,
  },
  bio: {
    width: "100%",
    alignItems: "center",
    gap: 8,
    marginBottom: 20,
  },
  stats: {
    width: "100%",
    flexDirection: "row",
    gap: 12,
  },
  statCell: {
    flex: 1,
  },
})
