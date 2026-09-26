import * as React from "react"
import { View } from "react-native"
import {
  MobileButton,
  MobileCheckbox,
  MobileFormField,
  MobileOtpInput,
  MobileSocialAuthButtons,
  MobileText,
  MobileTextInput,
  type MobileSocialProvider,
} from "@celestia-project/mobile"
import type { ShowcaseContext } from "../types"
import { ShowcaseIcon, type ShowcaseIconName } from "../icons"
import { Readout, Row, Spacer, Specimen, Stack } from "../ui"

/**
 * Forms — the four modules that collect input.
 *
 * `input`, `otp-input`, `form-field`, `social-auth-buttons`.
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

export function FormsSection({ ctx }: { ctx: ShowcaseContext }) {
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("correct horse")
  const [search, setSearch] = React.useState("")
  const [code, setCode] = React.useState("")
  const [pin, setPin] = React.useState("")
  const [handle, setHandle] = React.useState("ada")
  const [handleError, setHandleError] = React.useState<string | boolean>(false)
  const [terms, setTerms] = React.useState(false)
  const [lastEvent, setLastEvent] = React.useState("—")

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
        <Stack gap={14}>
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
          <MobileTextInput placeholder="Disabled" editable={false} value="Read only" />
        </Stack>
        <Readout label="Search value" value={search === "" ? "—" : search} />
      </Specimen>

      <Specimen
        title="One-time codes"
        description="Digits are stripped to numbers and clamped to length. onComplete fires once when the code fills — that is the seam for auto-submitting, so the caller does not have to poll."
        modulePath="primitive/otp-input"
      >
        <MobileText variant="caption" color="muted">
          6 digits
        </MobileText>
        <Spacer size={8} />
        <MobileOtpInput
          value={code}
          onValueChange={setCode}
          onComplete={(value) => setLastEvent(`code complete · ${value}`)}
        />
        <Spacer size={16} />
        <MobileText variant="caption" color="muted">
          4 digits, masked
        </MobileText>
        <Spacer size={8} />
        <MobileOtpInput
          length={4}
          secure
          value={pin}
          onValueChange={setPin}
          error={pin.length === 4 && pin !== "1234" ? "Incorrect PIN." : false}
        />
        <Spacer size={16} />
        <MobileText variant="caption" color="muted">
          Disabled
        </MobileText>
        <Spacer size={8} />
        <MobileOtpInput value="12" onValueChange={() => {}} disabled />
        <Readout label="code / pin" value={`${code || "—"} / ${pin || "—"}`} />
      </Specimen>

      <Specimen
        title="Field wrappers"
        description="MobileFormField owns the label, the required marker, the description and the error slot. A bare input or checkbox has nowhere to put helper text, so that is why this composite exists."
        modulePath="composite/form-field"
      >
        <Stack gap={20}>
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

          <MobileFormField label="Disabled field" disabled description="Unavailable on this plan.">
            <MobileTextInput editable={false} value="Not editable" />
          </MobileFormField>
        </Stack>

        <Spacer size={16} />
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
        <MobileText variant="caption" color="muted">
          One column
        </MobileText>
        <Spacer size={10} />
        <MobileSocialAuthButtons
          providers={providers.slice(0, 2)}
          onProviderPress={(provider) => setLastEvent(`oauth · ${provider.id}`)}
        />
        <Spacer size={18} />
        <MobileText variant="caption" color="muted">
          Two columns, and a disabled set
        </MobileText>
        <Spacer size={10} />
        <MobileSocialAuthButtons
          providers={providers}
          columns={2}
          onProviderPress={(provider) => setLastEvent(`oauth · ${provider.id}`)}
        />
        <Spacer size={10} />
        <MobileSocialAuthButtons providers={providers} disabled />
        <Readout label="Last event" value={lastEvent} />
        <Readout label="Scheme in context" value={ctx.scheme} />
      </Specimen>
    </View>
  )
}
