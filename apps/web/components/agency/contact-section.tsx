"use client"

import * as React from "react"
import { ArrowRightIcon, CheckCircleIcon, WarningIcon } from "@phosphor-icons/react"
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  Input,
  NativeSelect,
  NativeSelectOption,
  Textarea,
} from "@celestia-project/ui"

import { Reveal } from "@/components/feature-installer/reveal"

const PERSONAL_DOMAINS = [
  "gmail.com", "yahoo.com", "hotmail.com", "outlook.com",
  "icloud.com", "me.com", "aol.com", "proton.me",
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
    setTimeout(() => setState("success"), 1200)
  }

  if (state === "success") {
    return (
      <section id="contact" className="mx-auto w-full max-w-4xl px-5 py-28 sm:px-8 sm:py-36">
        <Card className="text-center p-8 sm:p-12 items-center">
          <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
            <CheckCircleIcon className="size-7" weight="fill" />
          </div>
          <CardHeader className="text-center items-center mt-3">
            <CardTitle className="text-xl font-semibold text-foreground">
              We&apos;ll be in touch shortly
            </CardTitle>
            <CardDescription className="max-w-md text-sm leading-relaxed mt-2">
              A senior engineer from our team will reach out within one business
              day to schedule your free strategy call.
            </CardDescription>
          </CardHeader>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setState("idle")}
            className="mt-4 cursor-pointer"
          >
            Submit another enquiry
          </Button>
        </Card>
      </section>
    )
  }

  return (
    <section id="contact" className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        {/* Left: copy */}
        <Reveal>
          <div className="flex flex-col gap-6">
            <div>
              <Badge variant="outline" mono className="mb-3 uppercase tracking-wider text-xs">
                Get in Touch
              </Badge>
              <h2 className="text-3xl font-semibold tracking-[-0.02em] text-balance text-foreground sm:text-4xl">
                Start your project with a free strategy call
              </h2>
              <p className="mt-4 text-muted-foreground leading-relaxed text-pretty">
                Tell us about your project and we&apos;ll match you with the right
                engineer for a no-pressure technical conversation. No pitch decks,
                no commitment.
              </p>
            </div>
            <ul className="flex flex-col gap-3">
              {[
                "Response within 1 business day",
                "Matched with a senior engineer",
                "Free NDA available on request",
                "No commitment required",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                  <CheckCircleIcon className="size-4 shrink-0 text-primary" weight="fill" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* Right: form in Card */}
        <Reveal>
          <Card className="p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                {/* Full Name */}
                <Field>
                  <FieldLabel htmlFor="name">
                    Full Name <span className="text-primary">*</span>
                  </FieldLabel>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    required
                    placeholder="Jane Smith"
                  />
                </Field>

                {/* Business Email */}
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
                  {personalEmailWarn && (
                    <FieldError className="flex items-center gap-1.5 text-xs text-warning">
                      <WarningIcon className="size-3.5 shrink-0" weight="fill" />
                      Please use your business email address
                    </FieldError>
                  )}
                </Field>
              </FieldGroup>

              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                {/* Phone */}
                <Field>
                  <FieldLabel htmlFor="phone">
                    Phone Number <span className="text-muted-foreground font-normal">(optional)</span>
                  </FieldLabel>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                  />
                </Field>

                {/* Project Type */}
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

              {/* Budget */}
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

              {/* Message */}
              <Field>
                <FieldLabel htmlFor="message">
                  Project Details
                </FieldLabel>
                <Textarea
                  id="message"
                  name="message"
                  rows={4}
                  placeholder="Briefly describe your project, goals, or questions…"
                />
              </Field>

              {/* NDA Checkbox */}
              <div className="flex items-center gap-2.5 py-1">
                <Checkbox
                  id="nda"
                  checked={ndaChecked}
                  onCheckedChange={(checked) => setNdaChecked(!!checked)}
                />
                <label
                  htmlFor="nda"
                  className="text-xs text-muted-foreground leading-normal cursor-pointer select-none"
                >
                  Please send a standard NDA before I share project details
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                size="lg"
                disabled={state === "submitting"}
                className="w-full gap-2 cursor-pointer mt-2"
              >
                {state === "submitting" ? (
                  "Sending enquiry…"
                ) : (
                  <>
                    Send Enquiry
                    <ArrowRightIcon className="size-4" />
                  </>
                )}
              </Button>

              <p className="text-center text-[11px] text-muted-foreground">
                By submitting, you agree to our privacy policy. We never share your data.
              </p>
            </form>
          </Card>
        </Reveal>
      </div>
    </section>
  )
}
