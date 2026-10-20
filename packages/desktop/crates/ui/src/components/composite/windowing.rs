//! Windowing: sub-windows, chrome actions, and the app menu.
//!
//! Mac-first today — [`open_mac_window`] opens an OS window whose root chrome
//! is [`super::window::MacWindow`] with [`super::window::MacWindowChrome::Window`].
//! On macOS, AppKit draws the traffic lights and resizes from the edges.
//! Windows / Linux open helpers join this module later.
//!
//! [`MacAppMenu`] is the menu bar `cx.set_menus` installs. In fullscreen, macOS
//! hides that bar and reveals it when the pointer hits the top of the screen.
//!
//! [`MacMenuBarPreview`] paints the same titles inside a view, for the gallery.

use gpui::{
    App, Entity, FontWeight, IntoElement, Menu, MenuItem, OsAction, ParentElement as _, Pixels,
    Refineable as _, Render, RenderOnce, SharedString, StyleRefinement, Styled, Window,
    WindowBounds, WindowHandle, WindowOptions, actions, div, px, size,
};

use super::window::MacWindow;

actions!(
    celestia_ui,
    [
        NewWindow,
        CloseWindow,
        MinimizeWindow,
        ZoomWindow,
        ToggleFullScreen,
        ShowHelp,
        EditUndo,
        EditRedo,
        EditCut,
        EditCopy,
        EditPaste,
        EditSelectAll,
    ]
);

/// Default size of a window opened with [`open_mac_window`].
pub const MAC_WINDOW_SIZE: gpui::Size<Pixels> = size(px(960.), px(640.));

/// Smallest size AppKit will allow. Keeps a resize from collapsing the frame.
pub const MAC_WINDOW_MIN_SIZE: gpui::Size<Pixels> = size(px(640.), px(420.));

/// [`WindowOptions`] for a Mac window: transparent title bar, traffic-light
/// inset, a centered size, and a minimum size. Pair with a root
/// [`MacWindow`] using [`super::window::MacWindowChrome::Window`]. Resize
/// stays with AppKit.
pub fn mac_window_options(cx: &mut App) -> WindowOptions {
    WindowOptions {
        window_bounds: Some(WindowBounds::centered(MAC_WINDOW_SIZE, cx)),
        window_min_size: Some(MAC_WINDOW_MIN_SIZE),
        #[cfg(target_os = "linux")]
        window_background: gpui::WindowBackgroundAppearance::Transparent,
        #[cfg(target_os = "linux")]
        window_decorations: Some(gpui::WindowDecorations::Client),
        ..MacWindow::window_options()
    }
}

/// Open a new OS window. `build` returns the root view, usually
/// `Root::new(...)`. The title is applied with `set_window_title`.
pub fn open_mac_window<V: 'static + Render>(
    title: impl Into<SharedString>,
    cx: &mut App,
    build: impl FnOnce(&mut Window, &mut App) -> Entity<V> + 'static,
) -> gpui::Result<WindowHandle<V>> {
    let title = title.into();
    let options = mac_window_options(cx);
    cx.open_window(options, move |window, cx| {
        window.set_window_title(&title);
        build(window, cx)
    })
}

/// Bind New, Close, Minimize, and Enter Full Screen.
///
/// macOS uses ⌘N, ⌘W, ⌘M, and ⌃⌘F. Other platforms use Ctrl+N, Ctrl+W,
/// Ctrl+M, and F11. Zoom stays on the green traffic light and on any Window
/// menu the host adds — macOS has no single zoom shortcut.
pub fn bind_mac_window_keys(cx: &mut App) {
    #[cfg(target_os = "macos")]
    cx.bind_keys([
        gpui::KeyBinding::new("cmd-n", NewWindow, None),
        gpui::KeyBinding::new("cmd-w", CloseWindow, None),
        gpui::KeyBinding::new("cmd-m", MinimizeWindow, None),
        gpui::KeyBinding::new("cmd-ctrl-f", ToggleFullScreen, None),
    ]);
    #[cfg(not(target_os = "macos"))]
    cx.bind_keys([
        gpui::KeyBinding::new("ctrl-n", NewWindow, None),
        gpui::KeyBinding::new("ctrl-w", CloseWindow, None),
        gpui::KeyBinding::new("ctrl-m", MinimizeWindow, None),
        gpui::KeyBinding::new("f11", ToggleFullScreen, None),
    ]);
}

/// The application menu bar. `install` replaces the bar via `cx.set_menus`.
///
/// The first menu is the application menu. macOS draws its title bold and
/// keeps it when the pointer reveals the bar in fullscreen. [`Self::without`]
/// will not remove it.
pub struct MacAppMenu {
    menus: Vec<Menu>,
}

impl MacAppMenu {
    /// Only the application menu. File, Edit, View, and Help are left out.
    pub fn new(app_name: impl Into<SharedString>) -> Self {
        Self {
            menus: vec![Menu::new(app_name)],
        }
    }

    /// Application menu plus File, Edit, View, and Help.
    ///
    /// File has New Window and Close. Edit has the standard editing actions
    /// wired to [`OsAction`]. View has Enter Full Screen. Help has one
    /// placeholder item. Add, replace, or drop menus before [`Self::install`].
    pub fn standard(app_name: impl Into<SharedString>) -> Self {
        Self::new(app_name)
            .menu(file_menu())
            .menu(edit_menu())
            .menu(view_menu())
            .menu(help_menu())
    }

    /// Change the application menu's title. It stays at index 0.
    pub fn rename_app(mut self, name: impl Into<SharedString>) -> Self {
        if let Some(app) = self.menus.first_mut() {
            app.name = name.into();
        }
        self
    }

    /// Append `menu`, or replace the existing menu with the same name.
    pub fn menu(mut self, menu: Menu) -> Self {
        if let Some(existing) = self
            .menus
            .iter_mut()
            .find(|existing| existing.name == menu.name)
        {
            *existing = menu;
        } else {
            self.menus.push(menu);
        }
        self
    }

    /// Append an item to the named menu. Creates that menu at the end when missing.
    pub fn item(mut self, menu_name: impl Into<SharedString>, item: MenuItem) -> Self {
        let menu_name = menu_name.into();
        if let Some(menu) = self.menus.iter_mut().find(|menu| menu.name == menu_name) {
            menu.items.push(item);
        } else {
            self.menus.push(Menu::new(menu_name).items(vec![item]));
        }
        self
    }

    /// Drop the named menu. Unknown names are ignored. The application menu stays.
    pub fn without(mut self, name: &str) -> Self {
        let Some(app) = self.menus.first().map(|menu| menu.name.clone()) else {
            return self;
        };
        if app.as_ref() == name {
            return self;
        }
        self.menus.retain(|menu| menu.name.as_ref() != name);
        self
    }

    /// Menu titles, in order. The gallery preview paints these.
    pub fn titles(&self) -> Vec<SharedString> {
        self.menus.iter().map(|menu| menu.name.clone()).collect()
    }

    /// The menus that [`Self::install`] will send.
    pub fn menus(&self) -> &[Menu] {
        &self.menus
    }

    /// Replace the process menu bar. Fullscreen reveals this list on top-edge hover.
    pub fn install(self, cx: &App) {
        cx.set_menus(self.menus);
    }
}

fn file_menu() -> Menu {
    Menu::new("File").items(vec![
        MenuItem::action("New Window", NewWindow),
        MenuItem::action("Close", CloseWindow),
    ])
}

fn edit_menu() -> Menu {
    Menu::new("Edit").items(vec![
        MenuItem::os_action("Undo", EditUndo, OsAction::Undo),
        MenuItem::os_action("Redo", EditRedo, OsAction::Redo),
        MenuItem::separator(),
        MenuItem::os_action("Cut", EditCut, OsAction::Cut),
        MenuItem::os_action("Copy", EditCopy, OsAction::Copy),
        MenuItem::os_action("Paste", EditPaste, OsAction::Paste),
        MenuItem::os_action("Select All", EditSelectAll, OsAction::SelectAll),
    ])
}

fn view_menu() -> Menu {
    Menu::new("View").items(vec![MenuItem::action(
        "Enter Full Screen",
        ToggleFullScreen,
    )])
}

fn help_menu() -> Menu {
    Menu::new("Help").items(vec![MenuItem::action("Help", ShowHelp)])
}

/// In-view preview of a [`MacAppMenu`]'s titles. The live fullscreen reveal is
/// the system bar installed with [`MacAppMenu::install`], not this element.
#[derive(IntoElement)]
pub struct MacMenuBarPreview {
    titles: Vec<SharedString>,
    style: StyleRefinement,
}

impl MacMenuBarPreview {
    /// Paint `menu`'s titles in menu-bar order.
    pub fn new(menu: &MacAppMenu) -> Self {
        Self {
            titles: menu.titles(),
            style: StyleRefinement::default(),
        }
    }
}

impl Styled for MacMenuBarPreview {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for MacMenuBarPreview {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        use crate::theme::ActiveTheme as _;

        let theme = cx.theme();
        let mut root = div()
            .h(px(24.))
            .w_full()
            .flex()
            .flex_row()
            .items_center()
            .gap(px(14.))
            .px(px(12.))
            .bg(theme.title_bar)
            .border_b_1()
            .border_color(theme.title_bar_border)
            .text_size(px(13.));
        root.style().refine(&self.style);

        let mut titles = self.titles.into_iter();
        if let Some(app) = titles.next() {
            root = root.child(
                div()
                    .font_weight(FontWeight::BOLD)
                    .text_color(theme.foreground)
                    .child(app),
            );
        }
        root.children(titles.map(|title| div().text_color(theme.foreground).child(title)))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use gpui::TestAppContext;

    fn action_names(menu: &Menu) -> Vec<&str> {
        menu.items
            .iter()
            .filter_map(|item| match item {
                MenuItem::Action { name, .. } => Some(name.as_ref()),
                MenuItem::Separator => None,
                MenuItem::Submenu(_) | MenuItem::SystemMenu(_) => None,
            })
            .collect()
    }

    #[test]
    fn standard_menu_is_the_mac_starting_point() {
        let menu = MacAppMenu::standard("Celestia");
        let owned = menu.titles();
        let titles: Vec<&str> = owned.iter().map(|title| title.as_ref()).collect();
        assert_eq!(titles, ["Celestia", "File", "Edit", "View", "Help"]);
        assert_eq!(action_names(&menu.menus()[1]), ["New Window", "Close"]);
        assert_eq!(
            action_names(&menu.menus()[2]),
            ["Undo", "Redo", "Cut", "Copy", "Paste", "Select All"]
        );
        assert_eq!(action_names(&menu.menus()[3]), ["Enter Full Screen"]);
        assert_eq!(action_names(&menu.menus()[4]), ["Help"]);
    }

    #[test]
    fn menu_item_and_without_customize_the_bar() {
        let replaced = MacAppMenu::standard("Celestia")
            .menu(Menu::new("File").items(vec![MenuItem::action("Open", ShowHelp)]));
        assert_eq!(action_names(&replaced.menus()[1]), ["Open"]);

        let appended =
            MacAppMenu::standard("Celestia").item("File", MenuItem::action("Open", ShowHelp));
        assert_eq!(
            action_names(&appended.menus()[1]),
            ["New Window", "Close", "Open"]
        );

        let created = MacAppMenu::new("Celestia")
            .item("Window", MenuItem::action("Minimize", MinimizeWindow));
        let created_titles = created.titles();
        let titles: Vec<&str> = created_titles.iter().map(|title| title.as_ref()).collect();
        assert_eq!(titles, ["Celestia", "Window"]);

        let trimmed = MacAppMenu::standard("Celestia")
            .without("Help")
            .without("Celestia");
        let trimmed_titles = trimmed.titles();
        let titles: Vec<&str> = trimmed_titles.iter().map(|title| title.as_ref()).collect();
        assert_eq!(titles, ["Celestia", "File", "Edit", "View"]);

        let only = MacAppMenu::new("Only");
        assert_eq!(
            only.titles()
                .iter()
                .map(|title| title.as_ref())
                .collect::<Vec<_>>(),
            ["Only"]
        );
        assert_eq!(
            MacAppMenu::new("A")
                .rename_app("B")
                .titles()
                .iter()
                .map(|title| title.as_ref())
                .collect::<Vec<_>>(),
            ["B"]
        );
    }

    #[gpui::test]
    fn mac_window_options_include_the_title_bar(cx: &mut TestAppContext) {
        cx.update(|cx| {
            let options = mac_window_options(cx);
            let titlebar = options
                .titlebar
                .expect("mac_window_options sets a titlebar");
            let direct = MacWindow::title_bar_options();
            assert!(titlebar.appears_transparent);
            assert!(options.app_owns_titlebar_drag);
            assert_eq!(
                titlebar.traffic_light_position,
                direct.traffic_light_position
            );
            assert!(options.window_min_size.is_some());
            assert!(options.window_bounds.is_some());
        });
    }
}
