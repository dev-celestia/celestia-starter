import type { NextConfig } from "next"
import os from "node:os"

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

function getAllowedDevOrigins(): string[] {
  const origins = new Set<string>([
    "localhost",
    "localhost:1212",
    "127.0.0.1",
    "127.0.0.1:1212",
    "0.0.0.0",
    "0.0.0.0:1212",
    "*.local",
    "*.local:1212",
  ])

  try {
    const interfaces = os.networkInterfaces()
    for (const ifaceList of Object.values(interfaces)) {
      for (const iface of ifaceList ?? []) {
        if (iface.family === "IPv4" && !iface.internal) {
          origins.add(iface.address)
          origins.add(`${iface.address}:1212`)
          origins.add(`${iface.address}:3000`)
          origins.add(`${iface.address}:8080`)
        }
      }
    }
  } catch (e) {
    console.error("Failed to detect network interfaces for allowedDevOrigins:", e)
  }

  return Array.from(origins)
}

const nextConfig: NextConfig = {
  transpilePackages: ["@celestia-project/ui"],
  allowedDevOrigins: getAllowedDevOrigins(),
  async rewrites() {
    return [
      {
        // The frontend is pure UI: every /api/* call is proxied to the
        // backend (apps/api). Same-origin from the browser's point of view, so
        // session cookies work without cross-origin configuration.
        source: "/api/:path*",
        destination: `${API_URL}/api/:path*`,
      },
    ]
  },
}

export default nextConfig
