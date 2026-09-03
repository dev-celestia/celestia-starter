export interface ComponentItem {
  id: string
  name: string
  group: string
  description: string
  demo: string
  showCode: boolean
}

export interface ComponentGroup {
  id: string
  label: string
  items: ComponentItem[]
}

export const pillars = [
  {
    title: "Zero Lock-in",
    description: "Plain Alpine.js — works anywhere HTML runs",
  },
  {
    title: "Same Tokens",
    description: "OKLCH palette & motion from Celestia UI",
  },
  {
    title: "WAI-ARIA Ready",
    description: "Accessible-by-default primitives",
  },
  {
    title: "TypeScript First",
    description: "Typed stores & variant helpers",
  },
]

export const groups: ComponentGroup[] = [
  {
    id: "actions",
    label: "Actions",
    items: [
      {
        id: "button",
        name: "Button",
        group: "Actions",
        description:
          "Pressable control with variants and sizes, driven by the buttonVariants helper.",
        showCode: false,
        demo: `<div class="flex flex-wrap items-center gap-3">
  <button class="group/button inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-sm border border-primary bg-background px-3 text-xs/relaxed font-medium text-primary shadow-[0_2px_0_0_var(--primary)] transition-all hover:bg-primary/10 active:translate-y-[2px] active:shadow-none">Default</button>
  <button class="group/button inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-sm border border-destructive bg-destructive px-3 text-xs/relaxed font-medium text-white shadow-destructive-3d transition-all hover:bg-destructive/90 active:translate-y-[2px] active:shadow-none">Destructive</button>
  <button class="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-sm border border-border bg-background px-3 text-xs/relaxed font-medium shadow-[0_2px_0_0_rgba(0,0,0,0.15)] transition-all hover:bg-accent hover:text-accent-foreground active:translate-y-[2px] active:shadow-none dark:bg-input/30 dark:border-input dark:hover:bg-input/50 dark:shadow-[0_2px_0_0_rgba(0,0,0,0.5)]">Outline</button>
  <button class="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-sm border border-secondary bg-secondary px-3 text-xs/relaxed font-medium text-secondary-foreground shadow-[0_2px_0_0_rgba(0,0,0,0.15)] transition-all hover:bg-secondary/80 active:translate-y-[2px] active:shadow-none dark:shadow-[0_2px_0_0_rgba(0,0,0,0.5)]">Secondary</button>
  <button class="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-sm border border-transparent px-3 text-xs/relaxed font-medium transition-all hover:bg-accent hover:text-accent-foreground">Ghost</button>
  <button class="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-sm border border-transparent px-3 text-xs/relaxed font-medium text-primary underline-offset-4 transition-all hover:underline">Link</button>
</div>`,
      },
      {
        id: "badge",
        name: "Badge",
        group: "Actions",
        description:
          "Compact status pill with outline, secondary, and destructive variants.",
        showCode: false,
        demo: `<div class="flex flex-wrap items-center gap-2">
  <span class="group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent bg-primary px-2 py-0.5 text-[0.625rem] font-medium whitespace-nowrap text-primary-foreground">Default</span>
  <span class="group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent bg-secondary px-2 py-0.5 text-[0.625rem] font-medium whitespace-nowrap text-secondary-foreground">Secondary</span>
  <span class="group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent bg-destructive/10 px-2 py-0.5 text-[0.625rem] font-medium whitespace-nowrap text-destructive">Destructive</span>
  <span class="group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-border bg-input/20 px-2 py-0.5 text-[0.625rem] font-medium whitespace-nowrap text-foreground dark:bg-input/30">Outline</span>
  <span class="group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2 py-0.5 text-[0.625rem] font-medium whitespace-nowrap text-primary underline-offset-4">Link</span>
</div>`,
      },
    ],
  },
  {
    id: "data",
    label: "Data Display",
    items: [
      {
        id: "card",
        name: "Card",
        group: "Data Display",
        description:
          "Contained surface with header, title, description, content, and footer slots.",
        showCode: false,
        demo: `<div class="group/card flex w-72 flex-col gap-4 overflow-hidden rounded-lg bg-card py-4 text-xs/relaxed text-card-foreground ring-1 ring-foreground/10">
  <div class="group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-lg px-4">
    <div class="font-heading text-sm font-medium">Card title</div>
    <div class="text-xs/relaxed text-muted-foreground">A short description of the card contents.</div>
  </div>
  <div class="px-4">Main card body content goes here.</div>
  <div class="flex items-center rounded-b-lg px-4 pt-2">
    <button class="inline-flex h-7 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-sm border border-primary bg-background px-2.5 text-xs/relaxed font-medium text-primary shadow-[0_2px_0_0_var(--primary)] transition-all hover:bg-primary/10 active:translate-y-[2px] active:shadow-none">Action</button>
  </div>
</div>`,
      },
      {
        id: "avatar",
        name: "Avatar",
        group: "Data Display",
        description:
          "Circular user avatar with image fallback and status badge.",
        showCode: false,
        demo: `<div class="flex items-center gap-3">
  <div class="relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border">
    <span class="flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground">AK</span>
  </div>
  <div class="relative flex size-8 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border">
    <span class="flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground">JD</span>
    <span class="absolute end-0 bottom-0 z-10 inline-flex size-2.5 items-center justify-center rounded-full bg-primary text-primary-foreground ring-2 ring-background"></span>
  </div>
  <div class="relative flex size-10 shrink-0 rounded-full select-none after:absolute after:inset-0 after:rounded-full after:border after:border-border">
    <span class="flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground">LG</span>
  </div>
</div>`,
      },
      {
        id: "kbd",
        name: "Kbd",
        group: "Data Display",
        description:
          "Inline keyboard key styling for shortcuts and hints.",
        showCode: false,
        demo: `<div class="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
  <span>Press</span>
  <kbd class="pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-xs bg-muted px-1 font-sans text-[0.625rem] font-medium text-muted-foreground select-none">⌘</kbd>
  <kbd class="pointer-events-none inline-flex h-5 w-fit min-w-5 items-center justify-center gap-1 rounded-xs bg-muted px-1 font-sans text-[0.625rem] font-medium text-muted-foreground select-none">K</kbd>
  <span>to search</span>
</div>`,
      },
      {
        id: "skeleton",
        name: "Skeleton",
        group: "Data Display",
        description:
          "Pulsing placeholder for content that is still loading.",
        showCode: false,
        demo: `<div class="flex w-72 flex-col gap-3">
  <div class="flex items-center gap-3">
    <span class="animate-pulse size-8 rounded-full bg-muted"></span>
    <div class="flex flex-col gap-1.5">
      <span class="animate-pulse h-3 w-32 rounded-md bg-muted"></span>
      <span class="animate-pulse h-2.5 w-24 rounded-md bg-muted"></span>
    </div>
  </div>
  <span class="animate-pulse h-20 w-full rounded-md bg-muted"></span>
</div>`,
      },
      {
        id: "separator",
        name: "Separator",
        group: "Data Display",
        description:
          "Horizontal or vertical divider between content blocks.",
        showCode: false,
        demo: `<div class="flex w-72 flex-col items-center gap-3">
  <span class="text-xs text-muted-foreground">Above</span>
  <span class="h-px w-full bg-border"></span>
  <span class="text-xs text-muted-foreground">Below</span>
  <div class="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
    <span>Left</span>
    <span class="w-px self-stretch h-4 bg-border"></span>
    <span>Right</span>
  </div>
</div>`,
      },
      {
        id: "breadcrumb",
        name: "Breadcrumb",
        group: "Data Display",
        description:
          "Trail of navigation links showing the current page location.",
        showCode: false,
        demo: `<nav aria-label="Breadcrumb" class="text-xs/relaxed">
  <ol class="flex flex-wrap items-center gap-1.5 text-muted-foreground">
    <li class="inline-flex items-center gap-1"><a href="#" class="transition-colors hover:text-foreground">Home</a></li>
    <li class="inline-flex items-center gap-1"><span aria-hidden="true" class="text-muted-foreground/60">/</span></li>
    <li class="inline-flex items-center gap-1"><a href="#" class="transition-colors hover:text-foreground">Components</a></li>
    <li class="inline-flex items-center gap-1"><span aria-hidden="true" class="text-muted-foreground/60">/</span></li>
    <li class="inline-flex items-center gap-1"><span class="font-normal text-foreground">Breadcrumb</span></li>
  </ol>
</nav>`,
      },
      {
        id: "progress",
        name: "Progress",
        group: "Data Display",
        description:
          "Determinate progress bar showing completion percentage.",
        showCode: false,
        demo: `<div class="w-72">
  <div class="mb-1.5 flex w-full items-center text-xs/relaxed">
    <span class="text-xs/relaxed font-medium">Uploading</span>
    <span class="ms-auto text-xs/relaxed text-muted-foreground tabular-nums">60%</span>
  </div>
  <div class="relative flex h-1 w-full items-center overflow-x-hidden rounded-md bg-muted">
    <div class="h-full w-3/5 bg-primary transition-all duration-200"></div>
  </div>
</div>`,
      },
    ],
  },
  {
    id: "inputs",
    label: "Inputs",
    items: [
      {
        id: "input",
        name: "Input",
        group: "Inputs",
        description:
          "Text field with focus ring and validation states.",
        showCode: false,
        demo: `<div class="flex w-72 flex-col gap-4">
  <div class="flex flex-col gap-1.5">
    <label class="flex items-center gap-2 text-xs/relaxed leading-none font-medium select-none">Email</label>
    <input type="email" placeholder="you@example.com" class="h-7 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 md:text-xs/relaxed dark:bg-input/30" />
  </div>
  <div class="flex flex-col gap-1.5">
    <label class="flex items-center gap-2 text-xs/relaxed leading-none font-medium select-none">Invalid</label>
    <input aria-invalid="true" value="bad value" class="h-7 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none placeholder:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 md:text-xs/relaxed dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40" />
  </div>
</div>`,
      },
      {
        id: "textarea",
        name: "Textarea",
        group: "Inputs",
        description:
          "Multi-line text input for longer form content.",
        showCode: false,
        demo: `<div class="flex w-72 flex-col gap-1.5">
  <label class="flex items-center gap-2 text-xs/relaxed leading-none font-medium select-none">Message</label>
  <textarea placeholder="Type your message…" class="min-h-16 w-full rounded-md border border-input bg-input/20 px-2 py-1.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 md:text-xs/relaxed dark:bg-input/30"></textarea>
</div>`,
      },
      {
        id: "checkbox",
        name: "Checkbox",
        group: "Inputs",
        description:
          "Toggleable selection box with checked state styling.",
        showCode: false,
        demo: `<div x-data="{ checked: false }" class="flex items-center gap-2">
  <button
    type="button"
    role="checkbox"
    :aria-checked="checked"
    @click="checked = !checked"
    class="peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input transition-[background-color,border-color,box-shadow,transform] duration-120 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] active:scale-[0.92] motion-reduce:active:scale-100 outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
    :class="checked ? 'border-primary bg-primary text-primary-foreground' : 'dark:bg-input/30'"
  >
    <span x-show="checked" class="grid place-content-center text-current transition-[transform,opacity] duration-120">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
    </span>
  </button>
  <label @click="checked = !checked" class="flex items-center gap-2 text-xs/relaxed leading-none font-medium select-none cursor-pointer">Accept terms</label>
</div>`,
      },
      {
        id: "switch",
        name: "Switch",
        group: "Inputs",
        description:
          "Toggle control for binary settings, powered by the switch store.",
        showCode: false,
        demo: `<div x-data="switch({ checked: false })" class="flex items-center gap-2">
  <button
    type="button"
    role="switch"
    :aria-checked="checked"
    @click="toggle()"
    class="peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent transition-[background-color,border-color,box-shadow] duration-160 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 h-[16.6px] w-[28px]"
    :class="checked ? 'bg-primary' : 'bg-input'"
  >
    <span
      class="pointer-events-none block rounded-full bg-background ring-0 transition-[transform,width] duration-160 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] size-3.5 motion-reduce:transition-none"
      :class="checked ? 'translate-x-[calc(100%-2px)]' : 'translate-x-0'"
    ></span>
  </button>
  <span class="text-xs font-medium">Notifications</span>
</div>`,
      },
    ],
  },
  {
    id: "feedback",
    label: "Feedback",
    items: [
      {
        id: "alert",
        name: "Alert",
        group: "Feedback",
        description:
          "Dismissible inline notice with title and description slots.",
        showCode: false,
        demo: `<div x-data="alert()" x-show="visible" x-cloak class="relative grid w-full max-w-sm gap-0.5 rounded-lg border px-2 py-1.5 text-start text-xs/relaxed bg-card text-card-foreground">
  <div class="flex items-center gap-1.5 pr-8 font-medium">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="size-3.5 shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
    <span>Heads up</span>
  </div>
  <p class="text-xs/relaxed text-balance text-muted-foreground pl-5">You can add a short note about this message here.</p>
  <button @click="dismiss()" class="absolute top-1.5 end-2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground" aria-label="Dismiss">
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
  </button>
</div>`,
      },
      {
        id: "dialog",
        name: "Dialog",
        group: "Feedback",
        description:
          "Modal overlay with backdrop, teleported to body via x-teleport.",
        showCode: false,
        demo: `<div x-data="dialog" class="flex items-center">
  <button @click="show()" class="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-sm border border-primary bg-background px-3 text-xs/relaxed font-medium text-primary shadow-[0_2px_0_0_var(--primary)] transition-all hover:bg-primary/10 active:translate-y-[2px] active:shadow-none">Open dialog</button>
  <template x-teleport="body">
    <div x-show="open" x-cloak x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" x-transition:leave="transition ease-in duration-150" x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0" class="fixed inset-0 isolate z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" @keydown.escape.window="close()">
      <div class="fixed top-1/2 start-1/2 z-50 grid w-full max-w-sm -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl bg-popover p-4 text-xs/relaxed text-popover-foreground ring-1 ring-foreground/10" @click.outside="close()">
        <div class="flex flex-col gap-1">
          <h3 class="font-heading text-sm font-medium">Modal title</h3>
          <p class="text-xs/relaxed text-muted-foreground">This is a modal dialog. Press escape or click outside to close it.</p>
        </div>
        <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button @click="close()" class="inline-flex h-7 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-sm border border-border bg-background px-2.5 text-xs/relaxed font-medium transition-all hover:bg-accent hover:text-accent-foreground">Cancel</button>
          <button @click="close()" class="inline-flex h-7 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-sm border border-primary bg-background px-2.5 text-xs/relaxed font-medium text-primary shadow-[0_2px_0_0_var(--primary)] transition-all hover:bg-primary/10 active:translate-y-[2px] active:shadow-none">Confirm</button>
        </div>
      </div>
    </div>
  </template>
</div>`,
      },
      {
        id: "sheet",
        name: "Sheet",
        group: "Feedback",
        description:
          "Slide-in panel from the edge of the viewport.",
        showCode: false,
        demo: `<div x-data="sheet" class="flex items-center">
  <button @click="show()" class="inline-flex h-8 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-sm border border-primary bg-background px-3 text-xs/relaxed font-medium text-primary shadow-[0_2px_0_0_var(--primary)] transition-all hover:bg-primary/10 active:translate-y-[2px] active:shadow-none">Open sheet</button>
  <template x-teleport="body">
    <div x-show="open" x-cloak x-transition:enter="transition ease-out duration-200" x-transition:enter-start="opacity-0" x-transition:enter-end="opacity-100" x-transition:leave="transition ease-in duration-150" x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0" class="fixed inset-0 isolate z-50 bg-black/70 backdrop-blur-sm" @keydown.escape.window="close()">
      <div x-show="open" x-transition:enter="transition ease-out duration-280" x-transition:enter-start="translate-x-full" x-transition:enter-end="translate-x-0" x-transition:leave="transition ease-in duration-280" x-transition:leave-start="translate-x-0" x-transition:leave-end="translate-x-full" class="fixed inset-y-0 right-0 z-50 flex h-full w-3/4 flex-col bg-popover bg-clip-padding text-xs/relaxed text-popover-foreground shadow-2xl sm:max-w-sm border-s">
        <div class="flex flex-col gap-1.5 p-6">
          <h3 class="font-heading text-sm font-medium text-foreground">Sheet title</h3>
          <p class="text-xs/relaxed text-muted-foreground">A sliding panel from the right edge.</p>
        </div>
        <div class="flex flex-col gap-2 p-6 mt-auto">
          <button @click="close()" class="inline-flex h-7 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-sm border border-border bg-background px-2.5 text-xs/relaxed font-medium transition-all hover:bg-accent hover:text-accent-foreground">Close</button>
        </div>
      </div>
    </div>
  </template>
</div>`,
      },
      {
        id: "tooltip",
        name: "Tooltip",
        group: "Feedback",
        description:
          "Small contextual label revealed on hover or focus.",
        showCode: false,
        demo: `<div x-data="tooltip" class="relative inline-flex">
  <button @mouseenter="show()" @mouseleave="hide()" @focus="show()" @blur="hide()" class="inline-flex h-7 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-sm border border-border bg-background px-2.5 text-xs/relaxed font-medium transition-all hover:bg-accent hover:text-accent-foreground">Hover me</button>
  <div x-show="open" x-cloak x-transition:enter="transition ease-out duration-140" x-transition:enter-start="opacity-0 -translate-y-0.5" x-transition:enter-end="opacity-100 translate-y-0" x-transition:leave="transition ease-in duration-100" x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0" class="absolute bottom-full left-1/2 z-50 mb-2 inline-flex w-fit max-w-xs -translate-x-1/2 items-center gap-1.5 rounded-md bg-foreground px-3 py-1.5 text-xs text-background shadow-md">
    <span>This is a tooltip</span>
    <span class="absolute left-1/2 top-full size-2.5 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-[2px] bg-foreground"></span>
  </div>
</div>`,
      },
    ],
  },
  {
    id: "navigation",
    label: "Navigation",
    items: [
      {
        id: "tabs",
        name: "Tabs",
        group: "Navigation",
        description:
          "Tabbed interface switching content panels via the tabs store.",
        showCode: false,
        demo: `<div x-data="tabs({ defaultTab: 'overview' })" class="flex w-80 flex-col gap-2">
  <div class="relative inline-flex w-fit items-center justify-center rounded-lg bg-muted p-[3px] text-muted-foreground h-8">
    <button type="button" @click="setTab('overview')" class="relative z-10 inline-flex h-[calc(100%-1px)] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent px-2.5 py-1 text-xs font-medium whitespace-nowrap select-none outline-none transition-colors duration-150 hover:text-foreground active:scale-[0.97]" :class="isTab('overview') ? 'bg-background text-foreground shadow-xs dark:bg-input/30 dark:border-input/40' : ''">Overview</button>
    <button type="button" @click="setTab('details')" class="relative z-10 inline-flex h-[calc(100%-1px)] flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-transparent px-2.5 py-1 text-xs font-medium whitespace-nowrap select-none outline-none transition-colors duration-150 hover:text-foreground active:scale-[0.97]" :class="isTab('details') ? 'bg-background text-foreground shadow-xs dark:bg-input/30 dark:border-input/40' : ''">Details</button>
  </div>
  <div x-show="isTab('overview')" class="text-xs/relaxed text-muted-foreground">The overview panel content.</div>
  <div x-show="isTab('details')" x-cloak class="text-xs/relaxed text-muted-foreground">The details panel content.</div>
</div>`,
      },
      {
        id: "accordion",
        name: "Accordion",
        group: "Navigation",
        description:
          "Expandable stacked items revealing content one at a time.",
        showCode: false,
        demo: `<div x-data="accordion" class="flex w-80 flex-col overflow-hidden rounded-md border">
  <div class="not-last:border-b" :class="{ 'bg-muted/50': isOpen('item-1') }">
    <button type="button" @click="toggle('item-1')" class="group/accordion-trigger relative flex flex-1 w-full items-start justify-between gap-6 border border-transparent p-2 text-start text-xs/relaxed font-medium transition-all outline-none hover:underline">
      <span>Is it accessible?</span>
      <span x-text="isOpen('item-1') ? '−' : '+'" class="text-muted-foreground text-xs"></span>
    </button>
    <div x-show="isOpen('item-1')" x-collapse class="px-2 pb-4 text-xs/relaxed text-muted-foreground">Yes, it adheres to WAI-ARIA standards.</div>
  </div>
  <div class="not-last:border-b" :class="{ 'bg-muted/50': isOpen('item-2') }">
    <button type="button" @click="toggle('item-2')" class="group/accordion-trigger relative flex flex-1 w-full items-start justify-between gap-6 border border-transparent p-2 text-start text-xs/relaxed font-medium transition-all outline-none hover:underline">
      <span>Is it fast?</span>
      <span x-text="isOpen('item-2') ? '−' : '+'" class="text-muted-foreground text-xs"></span>
    </button>
    <div x-show="isOpen('item-2')" x-collapse class="px-2 pb-4 text-xs/relaxed text-muted-foreground">Yes, it is built for performance.</div>
  </div>
</div>`,
      },
      {
        id: "dropdown",
        name: "Dropdown",
        group: "Navigation",
        description:
          "Menu that opens below a trigger, closing on outside click.",
        showCode: false,
        demo: `<div x-data="dropdown" class="relative inline-block text-left">
  <button @click="toggle()" class="inline-flex h-7 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-sm border border-border bg-background px-2.5 text-xs/relaxed font-medium transition-all hover:bg-accent hover:text-accent-foreground">Options</button>
  <div x-show="open" x-cloak @click.outside="close()" x-transition:enter="transition ease-out duration-150" x-transition:enter-start="opacity-0 scale-95" x-transition:enter-end="opacity-100 scale-100" x-transition:leave="transition ease-in duration-100" x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0" class="absolute left-0 z-50 mt-1 min-w-32 rounded-lg bg-popover/85 p-1 text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none backdrop-blur-xl">
    <button @click="close()" class="relative flex min-h-7 w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed outline-none select-none hover:bg-accent hover:text-accent-foreground">Profile</button>
    <button @click="close()" class="relative flex min-h-7 w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed outline-none select-none hover:bg-accent hover:text-accent-foreground">Settings</button>
    <div class="-mx-1 my-1 h-px bg-border"></div>
    <button @click="close()" class="relative flex min-h-7 w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs/relaxed outline-none select-none text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20">Log out</button>
  </div>
</div>`,
      },
      {
        id: "popover",
        name: "Popover",
        group: "Navigation",
        description:
          "Rich floating content panel triggered by a button.",
        showCode: false,
        demo: `<div x-data="popover" class="relative inline-block">
  <button @click="toggle()" class="inline-flex h-7 shrink-0 cursor-pointer items-center justify-center gap-1 rounded-sm border border-border bg-background px-2.5 text-xs/relaxed font-medium transition-all hover:bg-accent hover:text-accent-foreground">Open popover</button>
  <div x-show="open" x-cloak @click.outside="close()" x-transition:enter="transition ease-out duration-150" x-transition:enter-start="opacity-0 scale-95" x-transition:enter-end="opacity-100 scale-100" x-transition:leave="transition ease-in duration-100" x-transition:leave-start="opacity-100" x-transition:leave-end="opacity-0" class="absolute left-0 z-50 mt-1 flex w-72 flex-col gap-4 rounded-lg bg-popover/90 p-2.5 text-xs text-popover-foreground shadow-lg ring-1 ring-foreground/10 outline-none backdrop-blur-xl">
    <div class="flex flex-col gap-1 text-xs">
      <div class="text-sm font-medium">Dimensions</div>
      <div class="text-muted-foreground">Set the width and height of the element.</div>
    </div>
    <div class="flex flex-col gap-2">
      <input placeholder="Width" class="h-7 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 md:text-xs/relaxed dark:bg-input/30" />
      <input placeholder="Height" class="h-7 w-full min-w-0 rounded-md border border-input bg-input/20 px-2 py-0.5 text-sm transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 md:text-xs/relaxed dark:bg-input/30" />
    </div>
  </div>
</div>`,
      },
      {
        id: "collapsible",
        name: "Collapsible",
        group: "Navigation",
        description:
          "Simple expand/collapse region controlled by a trigger.",
        showCode: false,
        demo: `<div x-data="collapsible" class="w-80 rounded-md border border-border">
  <button @click="toggle()" class="flex w-full cursor-pointer select-none items-center justify-between p-2 text-start text-xs/relaxed font-medium hover:underline">
    <span>Show / hide content</span>
    <span x-text="open ? '−' : '+'" class="text-muted-foreground"></span>
  </button>
  <div x-show="open" x-collapse class="px-2 pb-3 text-xs/relaxed text-muted-foreground">This content can be collapsed and expanded.</div>
</div>`,
      },
    ],
  },
  {
    id: "editor",
    label: "Editor",
    items: [
      {
        id: "text-editor",
        name: "Text Editor",
        group: "Editor",
        description:
          "Monaco-powered code editor with a custom theme, language support, and full editing capabilities. Loads lazily from CDN.",
        showCode: false,
        demo: `<div x-data="textEditor({
  value: '// Welcome to Alpine UI\\n\\nfunction greet(name: string): string {\\n  return \\\`Hello, \\${name}!\\\`\\n}\\n\\nconst editor = monaco.editor.create(el, options)\\nconsole.log(greet(\\"World\\"))\\n',
  language: 'typescript',
  theme: 'dark',
  height: 260,
  readOnly: false,
  options: { fontSize: 13 }
})" class="w-full">
  <div x-show="loading" x-cloak class="flex h-[260px] w-full items-center justify-center gap-2 p-4 font-mono text-xs text-muted-foreground">
    <div class="size-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
    <span>Loading editor...</span>
  </div>
  <div x-ref="editor" :style="containerStyle" class="w-full overflow-hidden rounded-md ring-1 ring-border/50"></div>
</div>`,
      },
    ],
  },
]

export const components: ComponentItem[] = groups.flatMap((g) => g.items)
