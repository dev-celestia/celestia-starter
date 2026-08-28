export interface ColorToken {
  name: string
  cssVar: string
  token: string
  lightVal: string
  darkVal: string
  description: string
}

export interface TypographyToken {
  label: string
  token: string
  specs: string
  size: string
  sample: string
}

export interface RadiusToken {
  name: string
  token: string
  px: string
  rem: string
  usage: string
}

export interface ShadowToken {
  name: string
  token: string
  desc: string
}

export type ExportFormat = "tailwind-v4" | "css-vars" | "json"
