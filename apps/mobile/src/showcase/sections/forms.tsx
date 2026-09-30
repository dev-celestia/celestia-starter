import * as React from "react"
import { View } from "react-native"
import {
  MobileButton,
  MobileCheckbox,
  MobileCountdownTimer,
  MobileFormField,
  MobileNumberInput,
  MobileOtpInput,
  MobileOtpTimer,
  MobilePasswordInput,
  MobilePhoneInput,
  MobilePinPad,
  MobileSelectField,
  MobileSheetPicker,
  MobileSocialAuthButtons,
  MobileText,
  MobileTextInput,
  MobileTextarea,
  type MobileSocialProvider,
} from "@celestia-project/mobile"
import type { ShowcaseContext } from "../types"
import { ShowcaseIcon, type ShowcaseIconName } from "../icons"
import { DemoLabel, Readout, Row, SPACE, Spacer, Specimen, Stack } from "../ui"
import { ADA } from "../sample-data"

/**
 * Forms — the modules that collect input.
 *
 * `input`, `otp-input`, `form-field`, `social-auth-buttons`, plus the newer
 * field family (`number-input`, `password-input`, `textarea`, `phone-input`,
 * `select-field`, `sheet-picker`, `pin-pad`) and the timing pair
 * (`otp-timer`, `countdown-timer`).
 *
 * Two rules run through all of them:
 *
 * 1. **16px font floor.** Anything smaller and iOS zooms the viewport on focus,
 *    which shifts the whole layout out from under the user.
 * 2. **A form never disables its submit button for empty fields.** A greyed-out
 *    button gives no reason, so the user cannot tell whether the form is broken
 *    or they are. These screens validate on submit and *name* the missing field.
 */

/**
 * Federated sign-in providers, without their marks.
 *
 * `MobileSocialProvider.icon` is optional, and the four brand rows are exactly
 * why that matters: **Heroicons ships no brand logos** — Tailwind excludes them
 * deliberately — so there is no Apple, Google, GitHub or WeChat glyph to draw.
 * The SSO row carries a mark instead, which keeps the `icon` slot exercised
 * without inventing a logo the set does not contain.
 */
type ProviderDefinition = Omit<MobileSocialProvider, "icon"> & {
  icon?: ShowcaseIconName
}

const SOCIAL_PROVIDERS: ProviderDefinition[] = [
  { id: "apple", label: "Apple" },
  { id: "google", label: "Google" },
  { id: "github", label: "GitHub" },
  { id: "wechat", label: "WeChat" },
  { id: "sso", label: "Company SSO", icon: "sso" },
]

const ROLE_OPTIONS = [
  { value: "designer", label: "Designer" },
  { value: "engineer", label: "Engineer" },
  { value: "pm", label: "Product manager" },
  { value: "other", label: "Something else" },
]

const TIMEZONE_OPTIONS = [
  { value: "utc", label: "UTC" },
  { value: "cet", label: "Central European (CET)" },
  { value: "est", label: "US Eastern (EST)" },
  { value: "jst", label: "Japan (JST)" },
]

const PIN_LENGTH = 4

export function FormsSection({ ctx }: { ctx: ShowcaseContext }) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("correct horse")
  const [search, setSearch] = React.useState("")
  const [code, setCode] = React.useState("")
  const [pin, setPin] = React.useState("")
  // Handle field takes the bare slug, so strip the "@" from the shared fixture.
  const [handle, setHandle] = React.useState(ADA.handle.slice(1))
  const [handleError, setHandleError] = React.useState<string | boolean>(false)
  const [terms, setTerms] = React.useState(false)
  const [lastEvent, setLastEvent] = React.useState("—")
  const [amount, setAmount] = React.useState("25")
  const [newPassword, setNewPassword] = React.useState("")
  const [bio, setBio] = React.useState("")
  const [role, setRole] = React.useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [timezone, setTimezone] = React.useState("cet")
  const [phone, setPhone] = React.useState("5550101234")
  const [padPin, setPadPin] = React.useState("")
  // Bumping the key remounts the OTP timer, which is how a resend restarts
  // its countdown — the component deliberately owns no reset API.
  const [otpKey, setOtpKey] = React.useState(0)

  // The icon node has to be built during render: `ShowcaseIcon` reads the theme,
  // which only exists inside a component.
  const providers: MobileSocialProvider[] = SOCIAL_PROVIDERS.map(
    ({ icon, ...provider }) => ({
      ...provider,
      icon: icon ? <ShowcaseIcon name={icon} size="sm" /> : undefined,
    })
  )

  return (
    <View>
      <Specimen
        title="Text inputs"
        description="A 16px floor keeps iOS from zooming the viewport on focus. The reveal toggle and the clear affordance share one trailing slot — clearable is suppressed on secure fields so there is never a second, ambiguous control."
        modulePath="primitive/input"
      >
        <Stack gap={SPACE.row}>
          <MobileTextInput
            placeholder="Plain text"
            value={search}
            onChangeText={setSearch}
            clearable
            onClear={() => setLastEvent("cleared")}
          />
          <MobileTextInput
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            returnKeyType="next"
          />
          <MobileTextInput
            placeholder="Password — tap Show to reveal"
            value={password}
            onChangeText={setPassword}
            secure
            autoCapitalize="none"
          />
          <MobileTextInput
            placeholder="With leading and trailing slots"
            leading={<ShowcaseIcon name="at" size="sm" />}
            trailing={<ShowcaseIcon name="check" size="sm" />}
          />
          <MobileTextInput
            placeholder="Error state"
            value="not-an-email"
            onChangeText={() => {}}
            error
          />
          <MobileTextInput
            placeholder="Disabled"
            editable={false}
            value="Read only"
          />
        </Stack>
        <Readout label="Search value" value={search === "" ? "—" : search} />
      </Specimen>

      <Specimen
        title="One-time codes"
        description="Digits are stripped to numbers and clamped to length. onComplete fires once when the code fills — that is the seam for auto-submitting, so the caller does not have to poll."
        modulePath="primitive/otp-input"
      >
        <DemoLabel>6 digits</DemoLabel>
        <MobileOtpInput
          value={code}
          onValueChange={setCode}
          onComplete={(value) => setLastEvent(`code complete · ${value}`)}
        />
        <Spacer size={SPACE.block} />
        <DemoLabel>4 digits, masked</DemoLabel>
        <MobileOtpInput
          length={4}
          secure
          value={pin}
          onValueChange={setPin}
          error={pin.length === 4 && pin !== "1234" ? "Incorrect PIN." : false}
        />
        <Spacer size={SPACE.block} />
        <DemoLabel>Disabled</DemoLabel>
        <MobileOtpInput value="12" onValueChange={() => {}} disabled />
        <Readout label="code / pin" value={`${code || "—"} / ${pin || "—"}`} />
      </Specimen>

      <Specimen
        title="Field wrappers"
        description="MobileFormField owns the label, the required marker, the description and the error slot. A bare input or checkbox has nowhere to put helper text, so that is why this composite exists."
        modulePath="composite/form-field"
      >
        <Stack gap={SPACE.block}>
          <MobileFormField
            label="Workspace handle"
            required
            description="Lower-case letters, numbers and dashes."
            error={handleError}
          >
            <MobileTextInput
              value={handle}
              onChangeText={setHandle}
              autoCapitalize="none"
              error={Boolean(handleError)}
            />
          </MobileFormField>

          <MobileFormField
            label="Terms"
            required
            error={
              terms ? false : "You must accept the terms before continuing."
            }
          >
            <MobileCheckbox
              checked={terms}
              onCheckedChange={setTerms}
              label="I accept the terms of service"
              error={!terms}
            />
          </MobileFormField>

          <MobileFormField
            label="Disabled field"
            disabled
            description="Unavailable on this plan."
          >
            <MobileTextInput editable={false} value="Not editable" />
          </MobileFormField>
        </Stack>

        <Spacer size={SPACE.block} />
        <Row wrap={false} gap={10}>
          <MobileButton
            variant="outline"
            containerStyle={{ flex: 1 }}
            onPress={() => setHandleError("That handle is already taken.")}
          >
            Force error
          </MobileButton>
          <MobileButton
            variant="ghost"
            containerStyle={{ flex: 1 }}
            onPress={() => setHandleError(false)}
          >
            Clear
          </MobileButton>
        </Row>
      </Specimen>

      <Specimen
        title="Social sign-in"
        description="Providers arrive as data, so the package keeps its no-icon-dependency rule. icon is optional — Heroicons has no brand logos, so only the SSO row carries a mark. One column is the default; two is for short labels."
        modulePath="composite/social-auth-buttons"
      >
        <DemoLabel>One column</DemoLabel>
        <MobileSocialAuthButtons
          providers={providers.slice(0, 2)}
          onProviderPress={(provider) => setLastEvent(`oauth · ${provider.id}`)}
        />
        <Spacer size={SPACE.block} />
        <DemoLabel>Two columns, and a disabled set</DemoLabel>
        <MobileSocialAuthButtons
          providers={providers}
          columns={2}
          onProviderPress={(provider) => setLastEvent(`oauth · ${provider.id}`)}
        />
        <Spacer size={SPACE.row} />
        <MobileSocialAuthButtons providers={providers} disabled />
        <Readout label="Last event" value={lastEvent} />
        <Readout label="Scheme in context" value={ctx.scheme} />
      </Specimen>

      <Specimen
        title="Number inputs"
        description="Digits-only on every keystroke, so a paste cannot smuggle in letters or separators. min/max clamp on blur rather than per keystroke — typing “1” en route to “150” must not be snapped to the minimum mid-word."
        modulePath="primitive/number-input"
      >
        <MobileNumberInput
          label="Transfer amount"
          placeholder="0"
          value={amount}
          onChangeText={setAmount}
          min={1}
          max={500}
        />
        <Spacer size={SPACE.row} />
        <MobileNumberInput
          label="Seats"
          value="12"
          onChangeText={() => {}}
          error="Only 8 seats remain on this plan."
        />
        <Readout
          label="amount (clamps to 1–500 on blur)"
          value={amount || "—"}
        />
      </Specimen>

      <Specimen
        title="Password inputs"
        description="Secure entry with a reveal toggle drawn as simple shapes — an outlined almond with a pupil, crossed out while masked. A glyph reads instantly at thumb distance where “Show”/“Hide” needs parsing."
        modulePath="primitive/password-input"
      >
        <MobilePasswordInput
          label="New password"
          placeholder="At least 8 characters"
          value={newPassword}
          onChangeText={setNewPassword}
          error={
            newPassword.length > 0 && newPassword.length < 8
              ? "Use at least 8 characters."
              : undefined
          }
        />
        <Spacer size={SPACE.row} />
        <MobilePasswordInput
          label="Recovery key"
          value="hunter2-hunter2"
          onChangeText={() => {}}
          disabled
        />
      </Specimen>

      <Specimen
        title="Textareas"
        description="The multiline sibling of the text input — same chrome, same focus ring, same error colour, so forms read as one family. The field grows past minHeight with content."
        modulePath="primitive/textarea"
      >
        <MobileTextarea
          label="Bio"
          placeholder="A few lines about you"
          value={bio}
          onChangeText={setBio}
          minHeight={88}
        />
        <Readout label="bio length" value={`${bio.length} chars`} />
      </Specimen>

      <Specimen
        title="Select fields"
        description="A button-styled trigger that opens a MobileSheetPicker. No native picker wheel: the sheet keeps option rows at the 44pt touch floor and stays themeable in light and dark, which the platform pickers do not."
        modulePath="composite/select-field"
      >
        <MobileSelectField
          label="Role"
          placeholder="Pick your role"
          options={ROLE_OPTIONS}
          value={role}
          onChange={(next) => {
            setRole(next)
            setLastEvent(`role · ${next}`)
          }}
        />
        <Spacer size={SPACE.row} />
        <MobileSelectField
          label="Team"
          options={ROLE_OPTIONS}
          value={null}
          onChange={() => {}}
          disabled
        />
        <Readout label="role" value={role ?? "—"} />
      </Specimen>

      <Specimen
        title="Sheet pickers"
        description="The option list on its own: full-width rows inside a MobileBottomSheet with a ✓ on the selected one. Picking commits with a selection haptic and closes in the same gesture — one decision, one sheet."
        modulePath="composite/sheet-picker"
      >
        <MobileButton variant="outline" onPress={() => setPickerOpen(true)}>
          {`Timezone — ${
            TIMEZONE_OPTIONS.find((option) => option.value === timezone)
              ?.label ?? "none"
          }`}
        </MobileButton>
        <Readout label="timezone" value={timezone} />
        <MobileSheetPicker
          visible={pickerOpen}
          onClose={() => setPickerOpen(false)}
          title="Timezone"
          options={TIMEZONE_OPTIONS}
          value={timezone}
          onChange={(next) => {
            setTimezone(next)
            setLastEvent(`timezone · ${next}`)
          }}
        />
      </Specimen>

      <Specimen
        title="Phone inputs"
        description="Dialling-code chip plus a numeric field. The chip is deliberately static — a country picker with flags and dialling tables is a data problem, and this package takes no data dependencies. onChangeText never emits non-digits."
        modulePath="composite/phone-input"
      >
        <MobilePhoneInput
          label="Mobile number"
          value={phone}
          onChangeText={setPhone}
          defaultCountryCode="+1"
        />
        <Readout label="digits" value={phone || "—"} />
      </Specimen>

      <Specimen
        title="PIN pads"
        description="A telephone-layout keypad (0 under 8, not shifted like a calculator) that emits one key at a time. The pad owns no state — the caller collects digits, caps the length and drives whatever display they like."
        modulePath="composite/pin-pad"
      >
        <MobileText variant="title" tabular align="center">
          {Array.from({ length: PIN_LENGTH }, (_, index) =>
            index < padPin.length ? "●" : "○"
          ).join("   ")}
        </MobileText>
        <Spacer size={SPACE.row} />
        <MobilePinPad
          onKeyPress={(key) =>
            setPadPin((current) =>
              current.length >= PIN_LENGTH ? current : current + key
            )
          }
          onDelete={() => setPadPin((current) => current.slice(0, -1))}
        />
        <Readout label="pad pin" value={padPin || "—"} />
      </Specimen>

      <Specimen
        title="OTP timers"
        description="Counts down, then swaps itself for a resend button — the affordance cannot appear before the cooldown ends. Resending here bumps the React key: remounting restarts the countdown, because the component owns no reset API."
        modulePath="composite/otp-timer"
      >
        <MobileOtpTimer
          key={otpKey}
          seconds={30}
          onResend={() => {
            setOtpKey((current) => current + 1)
            setLastEvent("otp · resent")
          }}
        />
      </Specimen>

      <Specimen
        title="Countdown timers"
        description="HH:MM:SS in tabular numerals, so the readout does not jiggle every second. The labels variant swaps the colons for h/m/s captions when the timer is a hero element rather than an inline detail."
        modulePath="composite/countdown-timer"
      >
        <MobileCountdownTimer
          seconds={90}
          onComplete={() => setLastEvent("countdown · done")}
        />
        <Spacer size={SPACE.row} />
        <DemoLabel>Labels variant</DemoLabel>
        <MobileCountdownTimer
          seconds={90}
          labels
          onComplete={() => setLastEvent("countdown · done (labels)")}
        />
      </Specimen>
    </View>
  )
}
