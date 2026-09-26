"use client"

import * as React from "react"
import { ArrowRightIcon, CheckCircleIcon, WarningIcon } from "@phosphor-icons/react"
import {
  Button,
  Card,
  Checkbox,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  Item,
  ItemContent,
  ItemGroup,
  ItemMedia,
  ItemTitle,
  NativeSelect,
  NativeSelectOption,
  Spinner,
  Textarea,
} from "@celestia-project/ui"

import { Reveal } from "@/components/feature-installer/reveal"

import { SectionHeading } from "./section-heading"

const PERSONAL_DOMAINS = [
  "gmail.com",
  "yahoo.com",
  "hotmail.com",
  "outlook.com",
  "icloud.com",
  "me.com",
  "aol.com",
  "proton.me",
]

const BENEFITS = [
  "Response within 1 business day",
  "Matched with a senior engineer",
  "Free NDA available on request",
  "No commitment required",
]

function isPersonalEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase() ?? ""
  return PERSONAL_DOMAINS.includes(domain)
}

type FormState = "idle" | "submitting" | "success"

export function ContactSection() {
  const [state, setState] = React.useState<FormState>("idle")
  const [personalEmailWarn, setPersonalEmailWarn] = React.useState(false)
  const [ndaChecked, setNdaChecked] = React.useState(false)

  const handleEmailBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (val.includes("@")) setPersonalEmailWarn(isPersonalEmail(val))
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setState("submitting")
    // Template stand-in: swap for a POST to apps/api when the endpoint exists.
    window.setTimeout(() => setState("success"), 1200)
  }

  if (state === "success") {
    return (
      <section id="contact" className="py-16 sm:py-20">
        <Empty
          role="status"
          aria-live="polite"
          className="mx-auto max-w-2xl border border-border bg-card py-14"
        >
          <EmptyMedia
            variant="icon"
            className="size-12 rounded-2xl border border-primary/20 bg-primary/10 text-primary"
          >
            <CheckCircleIcon className="size-6" weight="fill" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle className="text-xl">We&apos;ll be in touch shortly</EmptyTitle>
            <EmptyDescription className="text-sm leading-relaxed">
              A senior engineer from our team will reach out within one business
              day to schedule your free strategy call.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button variant="outline" size="sm" onClick={() => setState("idle")}>
              Submit another enquiry
            </Button>
          </EmptyContent>
        </Empty>
      </section>
    )
  }

  return (
    <section id="contact" className="py-16 sm:py-20">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <Reveal>
          <div className="flex flex-col gap-8">
            <SectionHeading
              align="start"
              eyebrow="Get in touch"
              title="Start your project with a free strategy call"
              description="Tell us about your project and we'll match you with the right engineer for a no-pressure technical conversation. No pitch decks, no commitment."
            />

            <ItemGroup className="gap-2">
              {BENEFITS.map((benefit) => (
                <Item key={benefit} size="xs" className="p-0">
                  <ItemMedia variant="icon" className="text-primary">
                    <CheckCircleIcon className="size-4" weight="fill" />
                  </ItemMedia>
                  <ItemContent>
                    <ItemTitle className="line-clamp-none text-sm font-normal text-muted-foreground">
                      {benefit}
                    </ItemTitle>
                  </ItemContent>
                </Item>
              ))}
            </ItemGroup>
          </div>
        </Reveal>

        <Reveal>
          <Card className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="name">
                    Full Name <span className="text-primary">*</span>
                  </FieldLabel>
                  <Input id="name" name="name" type="text" required placeholder="Jane Smith" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email">
                    Business Email <span className="text-primary">*</span>
                  </FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="jane@company.com"
                    onBlur={handleEmailBlur}
                  />
                  {personalEmailWarn ? (
                    <FieldError className="flex items-center gap-1.5 text-warning">
                      <WarningIcon className="size-3.5 shrink-0" weight="fill" />
                      Please use your business email address
                    </FieldError>
                  ) : null}
                </Field>
              </FieldGroup>

              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor="phone">
                    Phone Number{" "}
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </FieldLabel>
                  <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" />
                </Field>

                <Field>
                  <FieldLabel htmlFor="project-type">
                    Project Type <span className="text-primary">*</span>
                  </FieldLabel>
                  <NativeSelect
                    id="project-type"
                    name="project_type"
                    required
                    defaultValue=""
                    className="w-full"
                  >
                    <NativeSelectOption value="" disabled>
                      Select type…
                    </NativeSelectOption>
                    <NativeSelectOption value="web">Web Application</NativeSelectOption>
                    <NativeSelectOption value="mobile">Mobile App</NativeSelectOption>
                    <NativeSelectOption value="dedicated">Dedicated Team</NativeSelectOption>
                    <NativeSelectOption value="cloud">Cloud / DevOps</NativeSelectOption>
                    <NativeSelectOption value="other">Other</NativeSelectOption>
                  </NativeSelect>
                </Field>
              </FieldGroup>

              <Field>
                <FieldLabel htmlFor="budget">
                  Estimated Budget Range <span className="text-primary">*</span>
                </FieldLabel>
                <NativeSelect
                  id="budget"
                  name="budget"
                  required
                  defaultValue=""
                  className="w-full"
                >
                  <NativeSelectOption value="" disabled>
                    Select range…
                  </NativeSelectOption>
                  <NativeSelectOption value="lt25k">Under $25,000</NativeSelectOption>
                  <NativeSelectOption value="25k-50k">$25,000 – $50,000</NativeSelectOption>
                  <NativeSelectOption value="50k-100k">$50,000 – $100,000</NativeSelectOption>
                  <NativeSelectOption value="100k+">$100,000+</NativeSelectOption>
                </NativeSelect>
              </Field>

              <Field>
                <FieldLabel htmlFor="message">Project Details</FieldLabel>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Briefly describe your project, goals, or questions…"
                />
              </Field>

              <Item size="xs" className="gap-2.5 py-1">
                <Checkbox
                  id="nda"
                  checked={ndaChecked}
                  onCheckedChange={(checked) => setNdaChecked(!!checked)}
                />
                <ItemContent>
                  <label
                    htmlFor="nda"
                    className="cursor-pointer text-xs leading-normal text-muted-foreground select-none"
                  >
                    Please send a standard NDA before I share project details
                  </label>
                </ItemContent>
              </Item>

              <Button
                type="submit"
                size="lg"
                disabled={state === "submitting"}
                aria-busy={state === "submitting"}
                className="mt-2 w-full gap-2"
              >
                {state === "submitting" ? (
                  <>
                    <Spinner className="size-4" />
                    Sending enquiry…
                  </>
                ) : (
                  <>
                    Send Enquiry
                    <ArrowRightIcon className="size-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-2xs text-muted-foreground">
                By submitting, you agree to our privacy policy. We never share your data.
              </p>
            </form>
          </Card>
        </Reveal>
      </div>
    </section>
  )
}
