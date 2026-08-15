"use client"

import * as React from "react"
import {
  MagnifyingGlassIcon,
  LockKeyIcon,
  EyeIcon,
  EyeSlashIcon,
  AtIcon,
  CurrencyDollarIcon,
} from "@phosphor-icons/react"
import {
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  Textarea,
  Checkbox,
  RadioGroup,
  RadioGroupItem,
  Switch,
  Slider,
  NativeSelect,
  NativeSelectOption,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
  ColorizedUrlInput,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldSet,
  FieldLegend,
  FieldGroup,
  Label,
} from "@celestia-project/ui"
import { ShowcaseCard } from "../showcase-card"

const FRAMEWORKS = [
  { value: "next", label: "Next.js 16" },
  { value: "react", label: "React 19" },
  { value: "hono", label: "Hono API" },
  { value: "drizzle", label: "Drizzle ORM" },
  { value: "better-auth", label: "Better Auth" },
  { value: "tailwind", label: "Tailwind CSS v4" },
]

const INPUT_CODE = `import * as React from "react"
import { Input, Label } from "@celestia-project/ui"

export function InputDemo() {
  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name">Full Name</Label>
        <Input id="name" placeholder="Enter your full name" />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">Disabled Input</Label>
        <Input id="email" disabled value="celestia-user@example.com" />
      </div>
    </div>
  )
}`

const INPUT_GROUP_CODE = `import * as React from "react"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@celestia-project/ui"
import { MagnifyingGlassIcon, LockKeyIcon, EyeIcon, EyeSlashIcon, CurrencyDollarIcon } from "@phosphor-icons/react"

export function InputGroupDemo() {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="flex flex-col gap-3 max-w-sm">
      {/* Search with Leading Icon Addon */}
      <InputGroup>
        <InputGroupAddon>
          <MagnifyingGlassIcon className="size-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput placeholder="Search database..." />
      </InputGroup>

      {/* Password Input with Action Toggle Button */}
      <InputGroup>
        <InputGroupAddon>
          <LockKeyIcon className="size-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          type={showPassword ? "text" : "password"}
          defaultValue="secret123"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            variant="ghost"
            size="icon-xs"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {/* Currency with Prefix and Suffix */}
      <InputGroup>
        <InputGroupAddon><CurrencyDollarIcon className="size-4" /></InputGroupAddon>
        <InputGroupInput type="number" defaultValue="49.00" />
        <InputGroupAddon align="inline-end">USD</InputGroupAddon>
      </InputGroup>
    </div>
  )
}`

const TEXTAREA_CODE = `import * as React from "react"
import { Textarea, Label } from "@celestia-project/ui"

export function TextareaDemo() {
  return (
    <div className="flex flex-col gap-1.5 max-w-sm">
      <Label htmlFor="desc">Project Description</Label>
      <Textarea
        id="desc"
        rows={3}
        placeholder="Describe your stack..."
        defaultValue="Building full-stack app with Celestia Starter."
      />
    </div>
  )
}`

const CHECKBOX_CODE = `import * as React from "react"
import { Checkbox, Label } from "@celestia-project/ui"

export function CheckboxDemo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-start gap-2.5">
        <Checkbox id="terms" defaultChecked />
        <div className="flex flex-col">
          <Label htmlFor="terms" className="cursor-pointer">Accept terms & conditions</Label>
          <p className="text-xs text-muted-foreground">Agree to our enterprise Terms of Service.</p>
        </div>
      </div>
    </div>
  )
}`

const RADIO_GROUP_CODE = `import * as React from "react"
import { RadioGroup, RadioGroupItem, Label } from "@celestia-project/ui"

export function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="pro" className="flex flex-col gap-2.5 max-w-sm">
      <div className="flex items-center gap-3 rounded-lg border p-2.5">
        <RadioGroupItem value="free" id="free" />
        <Label htmlFor="free" className="cursor-pointer">Starter Plan ($0/mo)</Label>
      </div>
      <div className="flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/5 p-2.5">
        <RadioGroupItem value="pro" id="pro" />
        <Label htmlFor="pro" className="cursor-pointer font-bold text-primary">Pro Cloud ($29/mo)</Label>
      </div>
    </RadioGroup>
  )
}`

const SWITCH_CODE = `import * as React from "react"
import { Switch, Label } from "@celestia-project/ui"

export function SwitchDemo() {
  const [fastRefresh, setFastRefresh] = React.useState(true)

  return (
    <div className="flex items-center justify-between max-w-sm">
      <div className="flex flex-col">
        <Label htmlFor="turbopack">Turbopack Fast Refresh</Label>
        <span className="text-xs text-muted-foreground">Instant HMR compilation for Next.js 16</span>
      </div>
      <Switch id="turbopack" checked={fastRefresh} onCheckedChange={setFastRefresh} />
    </div>
  )
}`

const SLIDER_CODE = `import * as React from "react"
import { Slider, Label } from "@celestia-project/ui"

export function SliderDemo() {
  const [poolSize, setPoolSize] = React.useState([65])

  return (
    <div className="flex flex-col gap-3 max-w-sm">
      <div className="flex justify-between text-xs">
        <Label>Database Pool Size</Label>
        <span className="font-mono font-bold text-primary">{poolSize[0]} Max</span>
      </div>
      <Slider
        value={poolSize}
        onValueChange={(val) => setPoolSize(Array.isArray(val) ? [...val] : [Number(val)])}
        min={5}
        max={100}
        step={1}
      />
    </div>
  )
}`

const SELECT_CODE = `import * as React from "react"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectGroup,
  SelectLabel,
  SelectSeparator,
} from "@celestia-project/ui"

export function SelectDemo() {
  return (
    <Select defaultValue="iad">
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select deployment region" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>North America</SelectLabel>
          <SelectItem value="iad">US East (N. Virginia)</SelectItem>
          <SelectItem value="sfo">US West (San Francisco)</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Europe</SelectLabel>
          <SelectItem value="fra">EU Central (Frankfurt)</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  )
}`

const NATIVE_SELECT_CODE = `import * as React from "react"
import { NativeSelect, NativeSelectOption } from "@celestia-project/ui"

export function NativeSelectDemo() {
  return (
    <NativeSelect defaultValue="production">
      <NativeSelectOption value="development">Development (localhost:3000)</NativeSelectOption>
      <NativeSelectOption value="staging">Staging (preview.celestia.dev)</NativeSelectOption>
      <NativeSelectOption value="production">Production (app.celestia.io)</NativeSelectOption>
    </NativeSelect>
  )
}`

const COMBOBOX_CODE = `import * as React from "react"
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@celestia-project/ui"

const FRAMEWORKS = [
  { value: "next", label: "Next.js 16" },
  { value: "react", label: "React 19" },
  { value: "hono", label: "Hono API" },
  { value: "drizzle", label: "Drizzle ORM" },
]

export function ComboboxDemo() {
  const [selected, setSelected] = React.useState<string | null>("next")

  return (
    <Combobox value={selected} onValueChange={(val) => setSelected(val as string)}>
      <ComboboxInput placeholder="Search framework..." />
      <ComboboxContent>
        <ComboboxList>
          {FRAMEWORKS.map((fw) => (
            <ComboboxItem key={fw.value} value={fw.value}>
              {fw.label}
            </ComboboxItem>
          ))}
          <ComboboxEmpty>No technology found.</ComboboxEmpty>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  )
}`

const OTP_CODE = `import * as React from "react"
import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@celestia-project/ui"

export function OTPDemo() {
  const [otp, setOtp] = React.useState("4290")

  return (
    <InputOTP maxLength={6} value={otp} onChange={setOtp}>
      <InputOTPGroup>
        <InputOTPSlot index={0} />
        <InputOTPSlot index={1} />
        <InputOTPSlot index={2} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <InputOTPSlot index={3} />
        <InputOTPSlot index={4} />
        <InputOTPSlot index={5} />
      </InputOTPGroup>
    </InputOTP>
  )
}`

const COLORIZED_URL_CODE = `import * as React from "react"
import { ColorizedUrlInput } from "@celestia-project/ui"

export function ColorizedUrlDemo() {
  const [url, setUrl] = React.useState("https://api.celestia.io/v1/{{tenantId}}/users/{{userId}}")

  return (
    <ColorizedUrlInput
      value={url}
      onChange={setUrl}
      envVarKeys={["tenantId", "userId", "apiVersion", "apiKey"]}
      placeholder="https://api.example.com/{{endpoint}}"
      className="rounded-md border bg-background p-2 text-xs font-mono"
    />
  )
}`

const FIELD_FORM_CODE = `import * as React from "react"
import {
  FieldSet,
  FieldLegend,
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  Input,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@celestia-project/ui"
import { AtIcon } from "@phosphor-icons/react"

export function FieldFormDemo() {
  return (
    <FieldSet className="w-full max-w-lg rounded-lg border p-4">
      <FieldLegend variant="legend">Organization Settings</FieldLegend>
      <FieldGroup className="gap-3">
        <Field>
          <FieldLabel htmlFor="org-slug">Organization Handle</FieldLabel>
          <InputGroup>
            <InputGroupAddon><AtIcon className="size-3.5" /></InputGroupAddon>
            <InputGroupInput id="org-slug" defaultValue="celestia-labs" />
          </InputGroup>
          <FieldDescription>Your unique public workspace identifier on Celestia.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="org-domain">Custom Domain</FieldLabel>
          <Input id="org-domain" defaultValue="cloud.invalid" />
          <FieldError>Domain does not have valid SSL DNS records configured.</FieldError>
        </Field>
      </FieldGroup>
    </FieldSet>
  )
}`

export function InputsSection() {
  const [showPassword, setShowPassword] = React.useState(false)
  const [switchActive, setSwitchActive] = React.useState(true)
  const [sliderValue, setSliderValue] = React.useState([65])
  const [otpValue, setOtpValue] = React.useState("4290")
  const [selectedFramework, setSelectedFramework] = React.useState<string | null>("next")
  const [colorizedUrl, setColorizedUrl] = React.useState("https://api.celestia.io/v1/{{tenantId}}/users/{{userId}}")

  return (
    <div id="inputs" className="flex flex-col gap-6 pt-6">
      <div className="flex items-center gap-2 border-b border-border pb-2">
        <h2 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
          Inputs & Form Controls
        </h2>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
          13 components
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* 1. Input */}
        <ShowcaseCard
          id="input"
          title="Input"
          category="Inputs"
          description="Displays a form input field or a component that looks like an input field."
          docsSlug="input"
          importSnippet={`import { Input } from "@celestia-project/ui"`}
          codeExample={INPUT_CODE}
        >
          <div className="flex w-full max-w-sm flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="default-input" className="text-xs">Standard Input</Label>
              <Input id="default-input" placeholder="Enter your full name" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="disabled-input" className="text-xs text-muted-foreground">Disabled Input</Label>
              <Input id="disabled-input" disabled value="celestia-user@example.com" />
            </div>
          </div>
        </ShowcaseCard>

        {/* 2. Input Group */}
        <ShowcaseCard
          id="input-group"
          title="Input Group"
          category="Inputs"
          description="Compound input component attaching leading/trailing addons, icons, and action buttons seamlessly."
          docsSlug="input-group"
          importSnippet={`import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@celestia-project/ui"`}
          codeExample={INPUT_GROUP_CODE}
        >
          <div className="flex w-full max-w-sm flex-col gap-3">
            {/* Search with Addon */}
            <InputGroup>
              <InputGroupAddon>
                <MagnifyingGlassIcon className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput placeholder="Search database records..." />
            </InputGroup>

            {/* Password toggle button */}
            <InputGroup>
              <InputGroupAddon>
                <LockKeyIcon className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                defaultValue="supersecret123"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="size-3.5" />
                  ) : (
                    <EyeIcon className="size-3.5" />
                  )}
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>

            {/* Currency with Prefix & Suffix */}
            <InputGroup>
              <InputGroupAddon>
                <CurrencyDollarIcon className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput type="number" placeholder="0.00" defaultValue="49.00" />
              <InputGroupAddon align="inline-end" className="text-xs text-muted-foreground">
                USD
              </InputGroupAddon>
            </InputGroup>
          </div>
        </ShowcaseCard>

        {/* 3. Textarea */}
        <ShowcaseCard
          id="textarea"
          title="Textarea"
          category="Inputs"
          description="Displays a multi-line text input field, useful for longer comments, bios, and descriptions."
          docsSlug="textarea"
          importSnippet={`import { Textarea } from "@celestia-project/ui"`}
          codeExample={TEXTAREA_CODE}
        >
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <Label htmlFor="bio" className="text-xs">Project Description</Label>
            <Textarea
              id="bio"
              rows={3}
              placeholder="Tell us a little bit about your application and stack requirements..."
              defaultValue="Building a modern full-stack web application with Celestia Starter and Hono backend."
            />
            <span className="text-[11px] text-muted-foreground">Markdown formatting is supported.</span>
          </div>
        </ShowcaseCard>

        {/* 4. Checkbox */}
        <ShowcaseCard
          id="checkbox"
          title="Checkbox"
          category="Inputs"
          description="A control that allows the user to toggle between checked and not checked."
          docsSlug="checkbox"
          importSnippet={`import { Checkbox } from "@celestia-project/ui"`}
          codeExample={CHECKBOX_CODE}
        >
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-2.5">
              <Checkbox id="terms" defaultChecked />
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="terms" className="text-xs font-medium leading-none cursor-pointer">
                  Accept terms & conditions
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  You agree to our enterprise Terms of Service and Privacy Policy.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Checkbox id="marketing" />
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="marketing" className="text-xs font-medium leading-none cursor-pointer">
                  Email updates & release notes
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Receive notifications whenever new UI primitives are shipped.
                </p>
              </div>
            </div>
          </div>
        </ShowcaseCard>

        {/* 5. Radio Group */}
        <ShowcaseCard
          id="radio-group"
          title="Radio Group"
          category="Inputs"
          description="A set of checkable buttons—known as radio buttons—where no more than one can be checked at once."
          docsSlug="radio-group"
          importSnippet={`import { RadioGroup, RadioGroupItem } from "@celestia-project/ui"`}
          codeExample={RADIO_GROUP_CODE}
        >
          <RadioGroup defaultValue="pro" className="flex flex-col gap-2.5 w-full max-w-sm">
            <div className="flex items-center gap-3 rounded-lg border border-border/70 p-2.5 transition-colors hover:bg-muted/40 cursor-pointer">
              <RadioGroupItem value="free" id="r-free" />
              <div className="flex flex-1 items-center justify-between">
                <Label htmlFor="r-free" className="text-xs font-medium cursor-pointer">Starter Plan</Label>
                <span className="font-mono text-xs font-semibold text-muted-foreground">$0/mo</span>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-primary/40 bg-primary/5 p-2.5 transition-colors cursor-pointer">
              <RadioGroupItem value="pro" id="r-pro" />
              <div className="flex flex-1 items-center justify-between">
                <div className="flex flex-col">
                  <Label htmlFor="r-pro" className="text-xs font-medium text-foreground cursor-pointer">Pro Cloud</Label>
                  <span className="text-[10px] text-muted-foreground">Unlimited edge requests</span>
                </div>
                <span className="font-mono text-xs font-bold text-primary">$29/mo</span>
              </div>
            </div>
          </RadioGroup>
        </ShowcaseCard>

        {/* 6. Switch */}
        <ShowcaseCard
          id="switch"
          title="Switch"
          category="Inputs"
          description="A toggle control allowing users to switch between checked and unchecked states."
          docsSlug="switch"
          importSnippet={`import { Switch } from "@celestia-project/ui"`}
          codeExample={SWITCH_CODE}
        >
          <div className="flex w-full max-w-sm flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="s-airplane" className="text-xs font-medium cursor-pointer">
                  Turbopack Fast Refresh
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Instant HMR compilation for Next.js 16
                </span>
              </div>
              <Switch id="s-airplane" checked={switchActive} onCheckedChange={setSwitchActive} />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <Label htmlFor="s-auth" className="text-xs font-medium cursor-pointer">
                  Two-Factor Authentication
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Require TOTP token upon sign-in
                </span>
              </div>
              <Switch id="s-auth" defaultChecked />
            </div>
          </div>
        </ShowcaseCard>

        {/* 7. Slider */}
        <ShowcaseCard
          id="slider"
          title="Slider"
          category="Inputs"
          description="An interactive bar allowing users to select a single value or a range along a horizontal axis."
          docsSlug="slider"
          importSnippet={`import { Slider } from "@celestia-project/ui"`}
          codeExample={SLIDER_CODE}
        >
          <div className="flex w-full max-w-sm flex-col gap-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Database Connection Pool</Label>
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                {sliderValue[0]} Max Connections
              </span>
            </div>
            <Slider
              value={sliderValue}
              onValueChange={(val) => setSliderValue(Array.isArray(val) ? [...val] : [Number(val)])}
              max={100}
              min={5}
              step={1}
              className="py-2"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>5 min</span>
              <span>50 default</span>
              <span>100 max</span>
            </div>
          </div>
        </ShowcaseCard>

        {/* 8. Select */}
        <ShowcaseCard
          id="select"
          title="Select"
          category="Inputs"
          description="Displays a customized dropdown menu of options triggered by a styled button."
          docsSlug="select"
          importSnippet={`import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@celestia-project/ui"`}
          codeExample={SELECT_CODE}
        >
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <Label className="text-xs">Deployment Region</Label>
            <Select defaultValue="iad">
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder="Select region" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>North America</SelectLabel>
                  <SelectItem value="iad">US East (N. Virginia)</SelectItem>
                  <SelectItem value="sfo">US West (San Francisco)</SelectItem>
                  <SelectItem value="ord">US Central (Chicago)</SelectItem>
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                  <SelectLabel>Europe & Asia</SelectLabel>
                  <SelectItem value="fra">EU Central (Frankfurt)</SelectItem>
                  <SelectItem value="sin">Asia (Singapore)</SelectItem>
                  <SelectItem value="tyo">Asia (Tokyo)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </ShowcaseCard>

        {/* 9. Native Select */}
        <ShowcaseCard
          id="native-select"
          title="Native Select"
          category="Inputs"
          description="A standard HTML select component styled with Celestia design system tokens."
          docsSlug="native-select"
          importSnippet={`import { NativeSelect, NativeSelectOption } from "@celestia-project/ui"`}
          codeExample={NATIVE_SELECT_CODE}
        >
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <Label htmlFor="native-env" className="text-xs">Environment Stage</Label>
            <NativeSelect id="native-env" defaultValue="production" className="text-xs">
              <NativeSelectOption value="development">Development (localhost:3000)</NativeSelectOption>
              <NativeSelectOption value="staging">Staging (preview.celestia.dev)</NativeSelectOption>
              <NativeSelectOption value="production">Production (app.celestia.io)</NativeSelectOption>
            </NativeSelect>
          </div>
        </ShowcaseCard>

        {/* 10. Combobox */}
        <ShowcaseCard
          id="combobox"
          title="Combobox"
          category="Inputs"
          description="Autocomplete input and dropdown combo box, allowing users to filter large option lists."
          docsSlug="combobox"
          importSnippet={`import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem } from "@celestia-project/ui"`}
          codeExample={COMBOBOX_CODE}
        >
          <div className="flex w-full max-w-sm flex-col gap-1.5">
            <Label className="text-xs">Select Primary Tech Stack</Label>
            <Combobox
              value={selectedFramework}
              onValueChange={(val) => setSelectedFramework(val as string)}
            >
              <ComboboxInput
                placeholder="Search stack..."
                className="w-full text-xs"
              />
              <ComboboxContent>
                <ComboboxList>
                  {FRAMEWORKS.map((fw) => (
                    <ComboboxItem key={fw.value} value={fw.value}>
                      {fw.label}
                    </ComboboxItem>
                  ))}
                  <ComboboxEmpty>No technology found.</ComboboxEmpty>
                </ComboboxList>
              </ComboboxContent>
            </Combobox>
          </div>
        </ShowcaseCard>

        {/* 11. Input OTP */}
        <ShowcaseCard
          id="input-otp"
          title="Input OTP"
          category="Inputs"
          description="Accessible one-time password component with copy-paste and split-group support."
          docsSlug="input-otp"
          importSnippet={`import { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator } from "@celestia-project/ui"`}
          codeExample={OTP_CODE}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="flex flex-col items-center gap-1 text-center">
              <Label className="text-xs font-semibold">Verification Code</Label>
              <span className="text-[11px] text-muted-foreground">Enter the 6-digit code sent to your email</span>
            </div>
            <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup>
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </div>
        </ShowcaseCard>

        {/* 12. Colorized URL Input */}
        <ShowcaseCard
          id="colorized-url-input"
          title="Colorized URL Input"
          category="Inputs"
          description="Interactive URL input with syntax-highlighted environment variable tokens like {{var}}."
          docsSlug="select-env-input"
          importSnippet={`import { ColorizedUrlInput } from "@celestia-project/ui"`}
          codeExample={COLORIZED_URL_CODE}
        >
          <div className="flex w-full max-w-sm flex-col gap-2">
            <Label className="text-xs">API Request URL</Label>
            <ColorizedUrlInput
              value={colorizedUrl}
              onChange={setColorizedUrl}
              envVarKeys={["tenantId", "userId", "apiVersion", "apiKey"]}
              placeholder="https://api.example.com/{{endpoint}}"
              className="rounded-md border border-input bg-background p-2 text-xs font-mono"
            />
            <span className="text-[10px] text-muted-foreground">
              Tokens in <code className="text-sky-400 font-semibold">{`{{...}}`}</code> are highlighted.
            </span>
          </div>
        </ShowcaseCard>

        {/* 13. Field & Form */}
        <ShowcaseCard
          id="field"
          title="Field & Form"
          category="Inputs"
          description="Compound accessible form container handling field labels, legends, validation errors, and descriptions."
          docsSlug="field"
          importSnippet={`import { Field, FieldLabel, FieldDescription, FieldError, FieldSet, FieldLegend } from "@celestia-project/ui"`}
          codeExample={FIELD_FORM_CODE}
          className="md:col-span-2"
        >
          <FieldSet className="w-full max-w-lg rounded-lg border border-border/70 p-4">
            <FieldLegend variant="legend">Organization Settings</FieldLegend>
            <FieldGroup className="gap-3">
              <Field>
                <FieldLabel htmlFor="org-slug">Organization Handle</FieldLabel>
                <InputGroup>
                  <InputGroupAddon>
                    <AtIcon className="size-3.5 text-muted-foreground" />
                  </InputGroupAddon>
                  <InputGroupInput id="org-slug" defaultValue="celestia-labs" />
                </InputGroup>
                <FieldDescription>Your unique public workspace identifier on Celestia.</FieldDescription>
              </Field>

              <Field>
                <FieldLabel htmlFor="org-domain">Custom Domain</FieldLabel>
                <Input id="org-domain" defaultValue="cloud.invalid" />
                <FieldError>Domain 'cloud.invalid' does not have valid SSL DNS records configured.</FieldError>
              </Field>
            </FieldGroup>
          </FieldSet>
        </ShowcaseCard>
      </div>
    </div>
  )
}
