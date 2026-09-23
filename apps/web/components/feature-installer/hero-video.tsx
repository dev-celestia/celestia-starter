"use client"

import Hls from "hls.js"
import * as React from "react"

const HLS_SOURCE =
  "https://stream.mux.com/Aa02T7oM1wH5Mk5EEVDYhbZ1ChcdhRsS2m1NYyx4Ua1g.m3u8"

export function HeroVideo() {
  const videoRef = React.useRef<HTMLVideoElement>(null)

  React.useEffect(() => {
    const video = videoRef.current
    if (!video) return

    // Dev hook: ?novideo skips the stream (screenshots, slow networks).
    if (window.location.search.includes("novideo")) {
      return
    }

    // Decorative footage — never autoplay for reduced-motion users.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
        backBufferLength: 30,
      })
      hls.loadSource(HLS_SOURCE)
      hls.attachMedia(video)
      return () => hls.destroy()
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = HLS_SOURCE
    }
  }, [])

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-bg">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        tabIndex={-1}
        className="absolute inset-0 size-full object-cover"
      />
      {/* Dark overlay + fade into the page background */}
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-bg to-transparent" />
    </div>
  )
}
