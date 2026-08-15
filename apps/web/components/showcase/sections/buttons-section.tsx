"use client"

import * as React from "react"
import {
  TextBolderIcon,
  TextItalicIcon,
  TextUnderlineIcon,
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  TextAlignJustifyIcon,
  HeartIcon,
  SparkleIcon,
  DownloadSimpleIcon,
  TrashIcon,
  PlusIcon,
  CaretDownIcon,
} from "@phosphor-icons/react"
import {
  Button,
  ButtonGroup,
  ButtonGroupSeparator,
  ButtonGroupText,
  Toggle,
  ToggleGroup,
  ToggleGroupItem,
  Spinner,
  useRipple,
  RippleContainer,
} from "@celestia-project/ui"
import { ShowcaseCard } from "../showcase-card"

const BUTTON_CODE = `import * as React from "react"
import { Button, Spinner } from "@celestia-project/ui"
import { TrashIcon, SparkleIcon, HeartIcon } from "@phosphor-icons/react"

export function ButtonDemo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Visual Variants */}
      <Button variant="default">Default</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">
        <TrashIcon className="size-4 mr-1.5" />
        Destructive
      </Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="link">Link</Button>

      {/* Sizes & States */}
      <Button size="xs" variant="outline">Size XS</Button>
      <Button size="sm" variant="outline">Size SM</Button>
      <Button size="default" variant="outline">Default</Button>
      <Button size="lg" variant="default" className="gap-2">
        <SparkleIcon className="size-4" weight="fill" />
        Size LG
      </Button>
      <Button variant="outline" size="icon-sm" aria-label="Favorite">
        <HeartIcon className="size-4 text-red-500" weight="fill" />
      </Button>
      <Button variant="secondary" disabled className="gap-2">
        <Spinner className="size-3.5" />
        Loading...
      </Button>
    </div>
  )
}`

const BUTTON_GROUP_CODE = `import * as React from "react"
import { Button, ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@celestia-project/ui"
import { PlusIcon, DownloadSimpleIcon, CaretDownIcon } from "@phosphor-icons/react"

export function ButtonGroupDemo() {
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Horizontal Action Group */}
      <ButtonGroup orientation="horizontal">
        <Button variant="outline" size="sm">
          <PlusIcon className="size-3.5 mr-1" />
          New File
        </Button>
        <ButtonGroupSeparator />
        <Button variant="outline" size="sm">
          <DownloadSimpleIcon className="size-3.5 mr-1" />
          Export
        </Button>
        <ButtonGroupSeparator />
        <Button variant="outline" size="icon-sm">
          <CaretDownIcon className="size-3.5" />
        </Button>
      </ButtonGroup>

      {/* Group with Label Text Addon */}
      <ButtonGroup orientation="horizontal">
        <ButtonGroupText>Status:</ButtonGroupText>
        <Button variant="outline" size="xs">Active</Button>
        <Button variant="secondary" size="xs">Pending</Button>
      </ButtonGroup>
    </div>
  )
}`

const TOGGLE_CODE = `import * as React from "react"
import { Toggle } from "@celestia-project/ui"
import { HeartIcon, TextBolderIcon, TextItalicIcon } from "@phosphor-icons/react"

export function ToggleDemo() {
  const [favorite, setFavorite] = React.useState(false)

  return (
    <div className="flex items-center gap-3">
      <Toggle
        pressed={favorite}
        onPressedChange={setFavorite}
        variant="outline"
        size="sm"
        className="gap-1.5"
      >
        <HeartIcon
          className={favorite ? "size-4 text-red-500 fill-red-500" : "size-4"}
          weight={favorite ? "fill" : "regular"}
        />
        <span>{favorite ? "Favorited" : "Favorite"}</span>
      </Toggle>

      <Toggle variant="default" size="sm" aria-label="Toggle bold">
        <TextBolderIcon className="size-4" />
      </Toggle>
      <Toggle variant="outline" size="sm" aria-label="Toggle italic">
        <TextItalicIcon className="size-4" />
      </Toggle>
    </div>
  )
}`

const TOGGLE_GROUP_CODE = `import * as React from "react"
import { ToggleGroup, ToggleGroupItem } from "@celestia-project/ui"
import {
  TextAlignLeftIcon,
  TextAlignCenterIcon,
  TextAlignRightIcon,
  TextAlignJustifyIcon,
  TextBolderIcon,
  TextItalicIcon,
  TextUnderlineIcon,
} from "@phosphor-icons/react"

export function ToggleGroupDemo() {
  const [alignment, setAlignment] = React.useState<string[]>(["center"])
  const [formatting, setFormatting] = React.useState<string[]>(["bold"])

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Single Alignment Selection */}
      <ToggleGroup
        value={alignment}
        onValueChange={(val) => setAlignment(Array.isArray(val) ? val : [val])}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="left"><TextAlignLeftIcon className="size-4" /></ToggleGroupItem>
        <ToggleGroupItem value="center"><TextAlignCenterIcon className="size-4" /></ToggleGroupItem>
        <ToggleGroupItem value="right"><TextAlignRightIcon className="size-4" /></ToggleGroupItem>
        <ToggleGroupItem value="justify"><TextAlignJustifyIcon className="size-4" /></ToggleGroupItem>
      </ToggleGroup>

      {/* Multiple Text Formatting Selection */}
      <ToggleGroup
        value={formatting}
        onValueChange={(val) => setFormatting(Array.isArray(val) ? val : [val])}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="bold"><TextBolderIcon className="size-4" /></ToggleGroupItem>
        <ToggleGroupItem value="italic"><TextItalicIcon className="size-4" /></ToggleGroupItem>
        <ToggleGroupItem value="underline"><TextUnderlineIcon className="size-4" /></ToggleGroupItem>
      </ToggleGroup>
    </div>
  )
}`

const RIPPLE_CODE = `import * as React from "react"
import { useRipple, RippleContainer } from "@celestia-project/ui"

export function RippleDemo() {
  const { ripples, addRipple } = useRipple({ duration: 600 })

  return (
    <button
      onClick={addRipple}
      className="relative overflow-hidden rounded-lg bg-primary px-6 py-2.5 text-xs text-primary-foreground shadow-sm transition-transform active:scale-95 cursor-pointer font-medium"
    >
      <RippleContainer ripples={ripples} color="rgba(255, 255, 255, 0.4)" />
      Click for Ripple Effect
    </button>
  )
}`

export function ButtonsSection() {
  const [toggleState, setToggleState] = React.useState(false)
  const [singleAlign, setSingleAlign] = React.useState<string[]>(["center"])
  const [multipleFormats, setMultipleFormats] = React.useState<string[]>(["bold"])

  // Ripple effect hook
  const { ripples, addRipple } = useRipple({ duration: 600 })

  return (
    <div id="buttons" className="flex flex-col gap-6 pt-6">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          Buttons & Actions
        </h2>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          5 components
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* 1. Button */}
        <ShowcaseCard
          id="button"
          title="Button"
          category="Buttons"
          description="Clickable button elements with 6 visual variants, 4 sizes, icon support, and loading states."
          docsSlug="button"
          importSnippet={`import { Button } from "@celestia-project/ui"`}
          codeExample={BUTTON_CODE}
          className="xl:col-span-2"
        >
          <div className="flex w-full flex-col gap-6">
            {/* Variants row */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Button variant="default">Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">
                <TrashIcon className="size-4" />
                Destructive
              </Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link Style</Button>
            </div>

            {/* Sizes & States row */}
            <div className="flex flex-wrap items-center justify-center gap-3 border-t border-border/40 pt-4">
              <Button size="xs" variant="outline">Size XS</Button>
              <Button size="sm" variant="outline">Size SM</Button>
              <Button size="default" variant="outline">Default Size</Button>
              <Button size="lg" variant="default" className="gap-2">
                <SparkleIcon className="size-4 text-amber-300" weight="fill" />
                Size LG
              </Button>
              <Button variant="outline" size="icon-sm" aria-label="Favorite">
                <HeartIcon className="size-4 text-red-500" weight="fill" />
              </Button>
              <Button variant="secondary" disabled className="gap-2">
                <Spinner className="size-3.5" />
                Loading...
              </Button>
            </div>
          </div>
        </ShowcaseCard>

        {/* 2. Button Group */}
        <ShowcaseCard
          id="button-group"
          title="Button Group"
          category="Buttons"
          description="Groups related buttons horizontally or vertically with joined borders and integrated separators."
          docsSlug="button-group"
          importSnippet={`import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "@celestia-project/ui"`}
          codeExample={BUTTON_GROUP_CODE}
        >
          <div className="flex flex-col items-center gap-4">
            <ButtonGroup orientation="horizontal">
              <Button variant="outline" size="sm">
                <PlusIcon className="size-3.5" />
                New File
              </Button>
              <ButtonGroupSeparator />
              <Button variant="outline" size="sm">
                <DownloadSimpleIcon className="size-3.5" />
                Export
              </Button>
              <ButtonGroupSeparator />
              <Button variant="outline" size="icon-sm">
                <CaretDownIcon className="size-3.5" />
              </Button>
            </ButtonGroup>

            <ButtonGroup orientation="horizontal">
              <ButtonGroupText>Status:</ButtonGroupText>
              <Button variant="outline" size="xs">Active</Button>
              <Button variant="secondary" size="xs">Pending</Button>
            </ButtonGroup>
          </div>
        </ShowcaseCard>

        {/* 3. Toggle */}
        <ShowcaseCard
          id="toggle"
          title="Toggle"
          category="Buttons"
          description="A two-state button that can be either on or off, perfect for binary formatting options."
          docsSlug="toggle"
          importSnippet={`import { Toggle } from "@celestia-project/ui"`}
          codeExample={TOGGLE_CODE}
        >
          <div className="flex flex-wrap items-center gap-3">
            <Toggle
              pressed={toggleState}
              onPressedChange={setToggleState}
              aria-label="Toggle Star"
              variant="outline"
              size="sm"
              className="gap-1.5"
            >
              <HeartIcon className={toggleState ? "size-4 text-red-500 fill-red-500" : "size-4"} weight={toggleState ? "fill" : "regular"} />
              <span>{toggleState ? "Favorited" : "Favorite"}</span>
            </Toggle>

            <Toggle variant="default" size="sm" aria-label="Toggle bold">
              <TextBolderIcon className="size-4" />
            </Toggle>
            <Toggle variant="outline" size="sm" aria-label="Toggle italic">
              <TextItalicIcon className="size-4" />
            </Toggle>
          </div>
        </ShowcaseCard>

        {/* 4. Toggle Group */}
        <ShowcaseCard
          id="toggle-group"
          title="Toggle Group"
          category="Buttons"
          description="A set of two-state buttons that can be toggled on or off, supporting single or multiple selections."
          docsSlug="toggle-group"
          importSnippet={`import { ToggleGroup, ToggleGroupItem } from "@celestia-project/ui"`}
          codeExample={TOGGLE_GROUP_CODE}
        >
          <div className="flex flex-col items-center gap-4">
            {/* Single Selection */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">Single selection (Alignment)</span>
              <ToggleGroup
                value={singleAlign}
                onValueChange={(val) => setSingleAlign(Array.isArray(val) ? val : [val])}
                variant="outline"
                size="sm"
              >
                <ToggleGroupItem value="left" aria-label="Align left">
                  <TextAlignLeftIcon className="size-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="center" aria-label="Align center">
                  <TextAlignCenterIcon className="size-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="right" aria-label="Align right">
                  <TextAlignRightIcon className="size-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="justify" aria-label="Align justify">
                  <TextAlignJustifyIcon className="size-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Multiple Selection */}
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[11px] text-muted-foreground">Multiple selection (Format)</span>
              <ToggleGroup
                value={multipleFormats}
                onValueChange={(val) => setMultipleFormats(Array.isArray(val) ? val : [val])}
                variant="outline"
                size="sm"
              >
                <ToggleGroupItem value="bold" aria-label="Bold text">
                  <TextBolderIcon className="size-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="italic" aria-label="Italic text">
                  <TextItalicIcon className="size-4" />
                </ToggleGroupItem>
                <ToggleGroupItem value="underline" aria-label="Underline text">
                  <TextUnderlineIcon className="size-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        </ShowcaseCard>

        {/* 5. Ripple Effect */}
        <ShowcaseCard
          id="ripple"
          title="Ripple Effect"
          category="Buttons"
          description="Interactive physical ripple feedback animation on click, configurable with custom color & duration."
          docsSlug="ripple"
          importSnippet={`import { useRipple, RippleContainer } from "@celestia-project/ui"`}
          codeExample={RIPPLE_CODE}
        >
          <div className="flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={addRipple}
              className="relative overflow-hidden rounded-lg bg-primary px-6 py-2.5 text-xs text-primary-foreground shadow-sm transition-transform active:scale-95 cursor-pointer font-medium"
            >
              <RippleContainer ripples={ripples} color="rgba(255, 255, 255, 0.4)" />
              Click Me for Ripple
            </button>
            <span className="text-xs text-muted-foreground">Click anywhere on the button</span>
          </div>
        </ShowcaseCard>
      </div>
    </div>
  )
}
