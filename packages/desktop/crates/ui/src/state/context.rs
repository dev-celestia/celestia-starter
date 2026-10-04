//! React-Context-style ambient state, layered on the zustand-style store.
//!
//! React contexts scope a value to a component subtree so deep children can
//! consume it without prop drilling. GPUI has no render-time context stack,
//! but its [`Global`] registry gives the same ergonomics at app scope — which
//! is what a desktop application effectively is (one tree, one root):
//!
//! - `<Session.Provider value>` → [`StoreContext::provide`], once at bootstrap
//! - `useContext(Session)` → [`StoreContext::consume`] / [`StoreContext::require`]
//!
//! The provided value is store-backed, so consumers can also write it back.
//! One ambient value per state type per app; providing again replaces it.
//! For multiple live instances of the same type (split panes, per-tab state),
//! skip the ambient layer and hand out [`StoreHandle`]s explicitly — the
//! zustand provider-free style.

use std::any::type_name;

use gpui_kit::{App, Global};

use super::store::StoreHandle;

/// The GPUI global slot making a `StoreContext<T>` ambient.
///
/// Public only because `Global` requires it; use [`StoreContext`] methods
/// instead of touching this type.
pub struct ContextSlot<T>(StoreHandle<T>);

impl<T: 'static> Global for ContextSlot<T> {}

/// A store-backed ambient value for state type `T`.
///
/// [`Deref`](std::ops::Deref)s to [`StoreHandle`], so consumers get the full
/// read/write/observe API; [`provide`](StoreContext::provide) is the provider
/// side. Cloning the context clones the handle — the same store.
pub struct StoreContext<T> {
    store: StoreHandle<T>,
}

// Manual impl: the derived one would require `T: Clone`.
impl<T> Clone for StoreContext<T> {
    fn clone(&self) -> Self {
        Self {
            store: self.store.clone(),
        }
    }
}

impl<T: 'static> StoreContext<T> {
    /// Register `state` as the ambient value for `T` (React's
    /// `<Provider value>`), creating its backing store. Call once from the app
    /// bootstrap; a later provide replaces the previous value and its store
    /// (existing handles keep pointing at the old store).
    pub fn provide(state: T, cx: &mut App) -> Self {
        let store = StoreHandle::new(state, cx);
        cx.set_global(ContextSlot(store.clone()));
        Self { store }
    }

    /// The provided value for `T`, if any (`useContext` returning null).
    pub fn consume(cx: &App) -> Option<Self> {
        cx.try_global::<ContextSlot<T>>().map(|slot| Self {
            store: slot.0.clone(),
        })
    }

    /// The provided value for `T`, panicking with a helpful message when no
    /// provider ran — use when a missing provider is a programmer error.
    pub fn require(cx: &App) -> Self {
        Self::consume(cx).unwrap_or_else(|| {
            panic!(
                "no StoreContext<{}> provided — call StoreContext::provide during app bootstrap before consuming",
                type_name::<T>()
            )
        })
    }

    /// The backing store handle (for `observe_slice` bindings and raw GPUI
    /// interop).
    pub fn store(&self) -> &StoreHandle<T> {
        &self.store
    }
}

impl<T> std::ops::Deref for StoreContext<T> {
    type Target = StoreHandle<T>;

    fn deref(&self) -> &Self::Target {
        &self.store
    }
}

#[cfg(test)]
mod tests {
    use gpui_kit::TestAppContext;

    use super::*;

    #[derive(Clone, Debug, PartialEq, Default)]
    struct Session {
        count: u32,
        user: String,
    }

    #[gpui_kit::test]
    fn provide_then_consume_shares_one_store(cx: &mut TestAppContext) {
        cx.update(|cx| {
            StoreContext::provide(
                Session {
                    count: 3,
                    user: "arham".into(),
                },
                cx,
            );

            let ctx = StoreContext::<Session>::require(cx);
            assert_eq!(ctx.read(cx).count, 3);

            // Consumers write back through the same store.
            ctx.set(cx, |s| s.count += 1);
            let again = StoreContext::<Session>::consume(cx).expect("provided");
            assert_eq!(again.read(cx).count, 4);
            assert_eq!(again.entity(), ctx.entity());
        });
    }

    #[gpui_kit::test]
    fn consume_before_provide_is_none(cx: &mut TestAppContext) {
        cx.update(|cx| {
            assert!(StoreContext::<Session>::consume(cx).is_none());
        });
    }

    #[gpui_kit::test]
    fn providing_again_replaces_the_value(cx: &mut TestAppContext) {
        cx.update(|cx| {
            StoreContext::provide(
                Session {
                    count: 1,
                    user: "first".into(),
                },
                cx,
            );
            let first = StoreContext::<Session>::require(cx);

            StoreContext::provide(Session::default(), cx);
            let second = StoreContext::<Session>::require(cx);
            assert_eq!(second.read(cx).count, 0);
            assert_ne!(second.entity(), first.entity());
        });
    }
}
