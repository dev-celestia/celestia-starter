use celestia_ui::components::Card;
use celestia_ui::components::primitive::aspect_ratio::AspectRatio;
use celestia_ui::components::primitive::button::{Button, ButtonVariant};
use celestia_ui::components::primitive::checkbox::Checkbox;
use celestia_ui::components::primitive::icon::{Phosphor, PhosphorIcon};
use celestia_ui::components::primitive::input::Input;
use celestia_ui::components::primitive::input_otp::OtpInput;
use celestia_ui::components::primitive::item::{
    Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemMedia, ItemTitle,
};
use celestia_ui::components::primitive::label::Label;
use celestia_ui::components::primitive::radio::Radio;
use celestia_ui::components::primitive::rating::Rating;
use celestia_ui::components::primitive::select::Select;
use celestia_ui::components::primitive::slider::Slider;
use celestia_ui::components::primitive::switch::Switch;
use celestia_ui::components::primitive::textarea::Textarea;
use celestia_ui::components::primitive::toggle::{Toggle, ToggleGroup};
use celestia_ui::theme::ActiveTheme as _;
use gpui::*;
use gpui_component::{h_flex, v_flex};

use crate::catalog::Demo;
use crate::showcase::Showcase;

impl Showcase {
    pub(crate) fn render_input_demo(&self, demo: Demo, cx: &mut Context<Self>) -> AnyElement {
        match demo {
            Demo::Input => Card::new()
                .title("Input")
                .description("Single-line text field.")
                .child(
                    v_flex()
                        .gap_1p5()
                        .child(Label::new("Single-line Text Input"))
                        .child(Input::new(&self.demo_input).cleanable(true)),
                )
                .into_any_element(),
            Demo::Textarea => Card::new()
                .title("Textarea")
                .description("Multi-line text field.")
                .child(
                    v_flex()
                        .gap_1p5()
                        .child(Label::new("Multi-line Textarea"))
                        .child(Textarea::new(&self.demo_textarea).h_24()),
                )
                .into_any_element(),
            Demo::InputOtp => Card::new()
                .title("InputOtp")
                .description("One-time-passcode digit input.")
                .child(
                    v_flex()
                        .gap_1p5()
                        .child(Label::new("One-Time Password (OTP)"))
                        .child(OtpInput::new(&self.demo_otp)),
                )
                .into_any_element(),
            Demo::Select => Card::new()
                .title("Select")
                .description("Dropdown select.")
                .child(
                    v_flex()
                        .gap_1p5()
                        .child(Label::new("Dropdown Select"))
                        .child(
                            div()
                                .w_48()
                                .flex_none()
                                .child(Select::new(&self.demo_select)),
                        ),
                )
                .into_any_element(),
            Demo::Slider => Card::new()
                .title("Slider")
                .description("Continuous range slider.")
                .child(
                    v_flex()
                        .gap_1p5()
                        .child(Label::new("Slider Range Control"))
                        .child(div().w_64().child(Slider::new(&self.demo_slider))),
                )
                .into_any_element(),
            Demo::Switch => Card::new()
                .title("Switch")
                .description("Track on/off switch.")
                .child(
                    Switch::new("sw-1")
                        .checked(self.demo_switch)
                        .label("Notifications")
                        .on_click(cx.listener(|this, &checked, _, cx| {
                            this.demo_switch = checked;
                            cx.notify();
                        })),
                )
                .into_any_element(),
            Demo::Checkbox => Card::new()
                .title("Checkbox")
                .description("Boolean checkbox.")
                .child(
                    Checkbox::new("cb-1")
                        .checked(self.demo_checkbox)
                        .label("Include archived")
                        .on_click(cx.listener(|this, &checked, _, cx| {
                            this.demo_checkbox = checked;
                            cx.notify();
                        })),
                )
                .into_any_element(),
            Demo::Radio => Card::new()
                .title("Radio")
                .description("Single-choice radio.")
                .child(
                    h_flex()
                        .gap_4()
                        .child(
                            Radio::new("rd-1")
                                .checked(self.demo_radio == 0)
                                .label("Weekly")
                                .on_click(cx.listener(|this, _, _, cx| {
                                    this.demo_radio = 0;
                                    cx.notify();
                                })),
                        )
                        .child(
                            Radio::new("rd-2")
                                .checked(self.demo_radio == 1)
                                .label("Daily")
                                .on_click(cx.listener(|this, _, _, cx| {
                                    this.demo_radio = 1;
                                    cx.notify();
                                })),
                        ),
                )
                .into_any_element(),
            Demo::Rating => Card::new()
                .title("Rating")
                .description("Star rating.")
                .child(
                    v_flex()
                        .gap_1p5()
                        .child(Label::new("Star Rating"))
                        .child(
                            Rating::new("rating-1")
                                .value(self.demo_rating)
                                .on_click(cx.listener(|this, &val, _, cx| {
                                    this.demo_rating = val;
                                    cx.notify();
                                })),
                        ),
                )
                .into_any_element(),
            Demo::Toggle => Card::new()
                .title("Toggle")
                .description("Pressed toggle and ToggleGroup.")
                .child(
                    v_flex()
                        .gap_4()
                        .child(
                            h_flex()
                                .gap_2()
                                .child(
                                    Toggle::new("tg-bold")
                                        .outline()
                                        .label("Bold")
                                        .checked(self.demo_toggle_bold)
                                        .on_click(cx.listener(|this, &on, _, cx| {
                                            this.demo_toggle_bold = on;
                                            cx.notify();
                                        })),
                                )
                                .child(
                                    Toggle::new("tg-italic")
                                        .outline()
                                        .label("Italic")
                                        .checked(self.demo_toggle_italic)
                                        .on_click(cx.listener(|this, &on, _, cx| {
                                            this.demo_toggle_italic = on;
                                            cx.notify();
                                        })),
                                ),
                        )
                        .child(
                            ToggleGroup::new("tg-align")
                                .outline()
                                .segmented()
                                .exclusive()
                                .child(
                                    Toggle::new("align-l")
                                        .checked(self.demo_toggle_align == 0)
                                        .child(
                                            Phosphor::new(PhosphorIcon::TextAlignLeft).size(px(14.0)),
                                        ),
                                )
                                .child(
                                    Toggle::new("align-c")
                                        .checked(self.demo_toggle_align == 1)
                                        .child(
                                            Phosphor::new(PhosphorIcon::TextAlignCenter)
                                                .size(px(14.0)),
                                        ),
                                )
                                .child(
                                    Toggle::new("align-r")
                                        .checked(self.demo_toggle_align == 2)
                                        .child(
                                            Phosphor::new(PhosphorIcon::TextAlignRight)
                                                .size(px(14.0)),
                                        ),
                                )
                                .on_click(cx.listener(|this, checks: &Vec<bool>, _, cx| {
                                    if let Some(ix) = checks.iter().position(|c| *c) {
                                        this.demo_toggle_align = ix;
                                        cx.notify();
                                    }
                                })),
                        ),
                )
                .into_any_element(),
            Demo::Item => Card::new()
                .title("Item")
                .description("List-row atom with media/content/actions.")
                .child(
                    ItemGroup::new()
                        .child(
                            Item::new()
                                .id("item-1")
                                .outline()
                                .child(
                                    ItemMedia::new().icon().child(
                                        Phosphor::new(PhosphorIcon::File).size(px(16.0)),
                                    ),
                                )
                                .child(
                                    ItemContent::new()
                                        .child(ItemTitle::new("README.md"))
                                        .child(ItemDescription::new(
                                            "Project overview and setup notes",
                                        )),
                                )
                                .child(
                                    ItemActions::new().child(
                                        Button::new("item-open")
                                            .variant(ButtonVariant::Ghost)
                                            .label("Open"),
                                    ),
                                ),
                        )
                        .child(
                            Item::new()
                                .id("item-2")
                                .muted()
                                .child(
                                    ItemMedia::new().icon().child(
                                        Phosphor::new(PhosphorIcon::Folder).size(px(16.0)),
                                    ),
                                )
                                .child(
                                    ItemContent::new()
                                        .child(ItemTitle::new("src/"))
                                        .child(ItemDescription::new("12 files")),
                                ),
                        ),
                )
                .into_any_element(),
            Demo::AspectRatio => Card::new()
                .title("AspectRatio")
                .description("Fixed width÷height box.")
                .child(
                    div().w(px(280.0)).child(
                        AspectRatio::widescreen().child(
                            div()
                                .size_full()
                                .flex()
                                .items_center()
                                .justify_center()
                                .rounded(cx.theme().radius)
                                .bg(cx.theme().muted)
                                .text_sm()
                                .text_color(cx.theme().muted_foreground)
                                .child("16∶9 aspect ratio"),
                        ),
                    ),
                )
                .into_any_element(),
            Demo::Label => Card::new()
                .title("Label")
                .description("Form label.")
                .child(
                    v_flex()
                        .gap_1p5()
                        .child(Label::new("Display name"))
                        .child(Label::new("Email").secondary("optional")),
                )
                .into_any_element(),
            _ => v_flex()
                .child(div().text_sm().child("Not an inputs demo."))
                .into_any_element(),
        }
    }
}
