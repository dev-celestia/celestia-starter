import type { Alpine } from "alpinejs"
import { textEditor } from "./components/text-editor"

export interface AccordionConfig {
  multiple?: boolean
  defaultValue?: string | string[]
}

export interface DialogConfig {
  open?: boolean
}

export interface DropdownConfig {
  open?: boolean
}

export interface TabsConfig {
  defaultTab?: string
}

export interface SwitchConfig {
  checked?: boolean
}

export function alpineUI(Alpine: Alpine): void {
  // Accordion component
  Alpine.data("accordion", (config: AccordionConfig = {}) => ({
    multiple: config.multiple ?? false,
    active: config.defaultValue ?? (config.multiple ? [] : null),

    isOpen(id: string) {
      if (Array.isArray(this.active)) {
        return this.active.includes(id)
      }
      return this.active === id
    },

    toggle(id: string) {
      if (this.multiple) {
        if (!Array.isArray(this.active)) {
          this.active = []
        }
        if (this.active.includes(id)) {
          this.active = this.active.filter((item: string) => item !== id)
        } else {
          this.active.push(id)
        }
      } else {
        this.active = this.active === id ? null : id
      }
    },
  }))

  // Dialog / Modal component
  Alpine.data("dialog", (config: DialogConfig = {}) => ({
    open: config.open ?? false,

    show() {
      this.open = true
    },

    close() {
      this.open = false
    },

    toggle() {
      this.open = !this.open
    },
  }))

  // Dropdown Menu component
  Alpine.data("dropdown", (config: DropdownConfig = {}) => ({
    open: config.open ?? false,

    toggle() {
      this.open = !this.open
    },

    close() {
      this.open = false
    },
  }))

  // Popover component
  Alpine.data("popover", (config: DropdownConfig = {}) => ({
    open: config.open ?? false,

    toggle() {
      this.open = !this.open
    },

    close() {
      this.open = false
    },
  }))

  // Tabs component
  Alpine.data("tabs", (config: TabsConfig = {}) => ({
    activeTab: config.defaultTab ?? "",

    setTab(tab: string) {
      this.activeTab = tab
    },

    isTab(tab: string) {
      return this.activeTab === tab
    },
  }))

  // Collapsible component
  Alpine.data("collapsible", (config: DialogConfig = {}) => ({
    open: config.open ?? false,

    toggle() {
      this.open = !this.open
    },
  }))

  // Sheet / Drawer component
  Alpine.data("sheet", (config: DialogConfig = {}) => ({
    open: config.open ?? false,

    show() {
      this.open = true
    },

    close() {
      this.open = false
    },
  }))

  // Switch component
  Alpine.data("switch", (config: SwitchConfig = {}) => ({
    checked: config.checked ?? false,

    toggle() {
      this.checked = !this.checked
    },
  }))

  // Tooltip component
  Alpine.data("tooltip", (config: DialogConfig = {}) => ({
    open: config.open ?? false,

    show() {
      this.open = true
    },

    hide() {
      this.open = false
    },
  }))

  // Alert dismissible component
  Alpine.data("alert", (config: DialogConfig = { open: true }) => ({
    visible: config.open ?? true,

    dismiss() {
      this.visible = false
    },
  }))

  // Text editor (Monaco) component
  Alpine.data("textEditor", textEditor)
}

export default alpineUI
