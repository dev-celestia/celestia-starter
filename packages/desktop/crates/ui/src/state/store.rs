//! A zustand-style external store on top of GPUI's entity model.
//!
//! GPUI ships no state container: an entity re-renders when it calls
//! `cx.notify()`, and shared state is "whatever entities you pass around".
//! That works for widget state (`Entity<InputState>`) but an application state
//! tree — one plain value with many readers and writers — needs conventions.
//! This module is those conventions, mapped 1:1 from zustand:
//!
//! | zustand                         | here                                    |
//! |---------------------------------|-----------------------------------------|
//! | `create(initial)`               | [`StoreHandle::new`]                    |
//! | `store.getState()`              | [`StoreHandle::read`]                   |
//! | `store.setState(fn)`            | [`StoreHandle::set`] / [`StoreHandle::update`] |
//! | `store.setState(next, true)`    | [`StoreHandle::replace`]                |
//! | actions `create((set) => …)`    | `&mut self` methods on the state type   |
//! | `useStore(selector)`            | [`StoreHandle::observe_slice`]          |
//! | `store.subscribe(listener)`     | [`StoreHandle::subscribe`]              |
//!
//! See [`super`] for the ambient [`StoreContext`](super::StoreContext) layer
//! and a worked example.

use gpui::{App, AppContext, Entity, Subscription};

/// The entity payload backing a [`StoreHandle`] — a plain state value.
///
/// Never construct this directly; [`StoreHandle::new`] wraps it in an entity.
/// State is deliberately inert (no version counters, no subscriber lists):
/// change notification is GPUI's `cx.notify()`, and selector gating lives on
/// the observer side in [`StoreHandle::observe_slice`].
pub struct Store<T> {
    state: T,
}

impl<T: 'static> Store<T> {
    /// Read-only access to the state, e.g. from a raw `cx.observe(&handle, …)`
    /// callback: `store_entity.read(cx).state()`.
    pub fn state(&self) -> &T {
        &self.state
    }
}

/// A cloneable handle to a [`Store`] entity — the zustand store object.
///
/// Cloning is cheap (a GPUI entity handle); pass handles anywhere state is
/// needed. Mutations flow through [`set`](StoreHandle::set) /
/// [`update`](StoreHandle::update), which notify all observing entities.
pub struct StoreHandle<T>(Entity<Store<T>>);

// Manual impl: the derived one would require `T: Clone`, and non-`Clone`
// state must stay shareable (the handle never touches `T` directly).
impl<T> Clone for StoreHandle<T> {
    fn clone(&self) -> Self {
        Self(self.0.clone())
    }
}

impl<T> std::ops::Deref for StoreHandle<T> {
    type Target = Entity<Store<T>>;

    fn deref(&self) -> &Self::Target {
        &self.0
    }
}

impl<T> PartialEq for StoreHandle<T> {
    fn eq(&self, other: &Self) -> bool {
        self.0 == other.0
    }
}

impl<T> Eq for StoreHandle<T> {}

impl<T: 'static> std::fmt::Debug for StoreHandle<T> {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_tuple("StoreHandle")
            .field(&self.0.entity_id())
            .finish()
    }
}

impl<T: 'static> StoreHandle<T> {
    /// Create a store entity holding `state` (zustand's `create`).
    ///
    /// Works with any app context, so it can be called from the bootstrap
    /// (`&mut App`), an entity constructor (`&mut Context<Self>`) or an async
    /// context.
    pub fn new<C: AppContext>(state: T, cx: &mut C) -> Self {
        Self(cx.new(|_| Store { state }))
    }

    /// The backing entity, for raw GPUI interop (`cx.observe(&handle, …)`).
    pub fn entity(&self) -> &Entity<Store<T>> {
        &self.0
    }

    /// The current state (zustand's `getState()`).
    pub fn read<'a>(&self, cx: &'a App) -> &'a T {
        self.0.read(cx).state()
    }

    /// Derive a value from the state in one step.
    pub fn select<S>(&self, cx: &App, select: impl FnOnce(&T) -> S) -> S {
        select(self.read(cx))
    }

    /// Mutate the state and notify observers, returning the closure's result.
    ///
    /// The zustand actions pattern maps to `&mut self` methods on the state
    /// type, passed as the closure: `store.update(cx, AppState::close_tab)`.
    pub fn update<R, C: AppContext>(&self, cx: &mut C, f: impl FnOnce(&mut T) -> R) -> R {
        self.0.update(cx, |store, cx| {
            let result = f(&mut store.state);
            cx.notify();
            result
        })
    }

    /// Mutate the state and notify observers (zustand's `setState(fn)`).
    pub fn set<C: AppContext>(&self, cx: &mut C, f: impl FnOnce(&mut T)) {
        self.update(cx, f)
    }

    /// Replace the whole state value (zustand's `setState(next, true)`).
    pub fn replace<C: AppContext>(&self, cx: &mut C, state: T) {
        self.update(cx, |s| *s = state)
    }

    /// [`set`](StoreHandle::set) that skips notification when the state
    /// compares equal afterwards. Opt-in (a full snapshot is taken); prefer
    /// [`observe_slice`](StoreHandle::observe_slice) gating for renders, and
    /// reach for this when a write is usually a no-op.
    pub fn set_if_changed<C: AppContext>(&self, cx: &mut C, f: impl FnOnce(&mut T))
    where
        T: Clone + PartialEq,
    {
        self.0.update(cx, |store, cx| {
            let before = store.state.clone();
            f(&mut store.state);
            if store.state != before {
                cx.notify();
            }
        })
    }

    /// Bind a state slice to the observing entity `O` (the
    /// `useStore(selector)` equivalent).
    ///
    /// `select` maps the state to a comparable slice, cached against the
    /// current state when this is called. When the store changes, the slice is
    /// recomputed and compared: `on_change` runs — and only then may it call
    /// `cx.notify()` — when the slice actually changed, so untouched slices
    /// never re-render `O`. The subscription lives as long as the returned
    /// [`Subscription`] (keep it in a field, or `.detach()` for the observer's
    /// lifetime).
    ///
    /// There is no initial callback: GPUI constructs entities eagerly, so
    /// apply the current slice yourself when building the observer —
    /// `save_visible: store.read(cx).dirty`. Like GPUI's own observers, the
    /// callback runs once per update batch with the store's final value in
    /// that batch, not once per `set` call.
    pub fn observe_slice<O, S>(
        &self,
        cx: &mut gpui::Context<O>,
        select: impl Fn(&T) -> S + 'static,
        mut on_change: impl FnMut(&mut O, S, &mut gpui::Context<O>) + 'static,
    ) -> Subscription
    where
        O: 'static,
        S: PartialEq + Clone + 'static,
    {
        let mut last = Some(select(self.read(cx)));
        cx.observe(self, move |this, store, cx| {
            let next = select(store.read(cx).state());
            if last.as_ref() != Some(&next) {
                last = Some(next.clone());
                on_change(this, next, cx);
            }
        })
    }

    /// Observe every state change with a full snapshot — zustand's
    /// `store.subscribe(listener)` for side effects (logging, persistence,
    /// driving other entities). The callback receives a clone of the state, so
    /// it may freely use the app context. For render bindings prefer
    /// [`observe_slice`](StoreHandle::observe_slice), which can gate on
    /// equality before notifying.
    ///
    /// The callback runs once per update batch with that batch's final state,
    /// not once per `set` call — GPUI coalesces notifications the same way for
    /// its own observers.
    pub fn subscribe(
        &self,
        cx: &mut App,
        mut on_change: impl FnMut(&T, &mut App) + 'static,
    ) -> Subscription
    where
        T: Clone,
    {
        let entity = self.0.clone();
        cx.observe(&entity, move |store, cx| {
            let snapshot = store.read(cx).state().clone();
            on_change(&snapshot, cx);
        })
    }
}

#[cfg(test)]
mod tests {
    use std::{cell::Cell, rc::Rc};

    use gpui::TestAppContext;

    use super::*;

    #[derive(Clone, Debug, PartialEq, Default)]
    struct Sample {
        count: u32,
        label: String,
    }

    impl Sample {
        fn increment(&mut self) {
            self.count += 1;
        }
    }

    #[gpui::test]
    fn set_updates_state_and_notifies_observers(cx: &mut TestAppContext) {
        let fired = Rc::new(Cell::new(0usize));
        let store = cx.update(|cx| {
            let store = StoreHandle::new(Sample::default(), cx);
            let fired = fired.clone();
            cx.observe(&store, move |_, _| fired.set(fired.get() + 1))
                .detach();
            store
        });

        cx.update(|cx| store.set(cx, Sample::increment));
        cx.update(|cx| {
            let count = store.update(cx, |s| {
                s.label = "hello".into();
                s.count * 10
            });
            assert_eq!(count, 10);
        });
        cx.run_until_parked();

        assert_eq!(fired.get(), 2);
        cx.update(|cx| {
            assert_eq!(store.read(cx).count, 1);
            assert_eq!(store.read(cx).label, "hello");
            assert_eq!(store.select(cx, |s| s.count), 1);
        });
    }

    #[gpui::test]
    fn replace_swaps_the_whole_state(cx: &mut TestAppContext) {
        let store = cx.update(|cx| StoreHandle::new(Sample::default(), cx));
        cx.update(|cx| {
            store.replace(
                cx,
                Sample {
                    count: 9,
                    label: "replaced".into(),
                },
            )
        });
        cx.update(|cx| assert_eq!(store.read(cx).count, 9));
    }

    #[gpui::test]
    fn set_if_changed_skips_equal_writes(cx: &mut TestAppContext) {
        let fired = Rc::new(Cell::new(0usize));
        let store = cx.update(|cx| {
            let store = StoreHandle::new(Sample::default(), cx);
            let fired = fired.clone();
            cx.observe(&store, move |_, _| fired.set(fired.get() + 1))
                .detach();
            store
        });

        cx.update(|cx| store.set_if_changed(cx, |s| s.label = String::new()));
        cx.run_until_parked();
        assert_eq!(fired.get(), 0, "no-op write must not notify");

        cx.update(|cx| store.set_if_changed(cx, |s| s.count = 1));
        cx.run_until_parked();
        assert_eq!(fired.get(), 1, "a real change must notify");
    }

    #[gpui::test]
    fn observe_slice_fires_only_when_its_slice_changes(cx: &mut TestAppContext) {
        struct Probe {
            counts: Vec<u32>,
            labels: Vec<String>,
        }

        let (store, probe) = cx.update(|cx| {
            let store = StoreHandle::new(
                Sample {
                    count: 0,
                    label: "a".into(),
                },
                cx,
            );
            let probe = cx.new(|cx| {
                let this = Probe {
                    // The initial slice is applied by the observer's constructor.
                    counts: vec![store.read(cx).count],
                    labels: vec![],
                };
                store
                    .observe_slice(
                        cx,
                        |s| s.count,
                        |this: &mut Probe, count, cx| {
                            this.counts.push(count);
                            cx.notify();
                        },
                    )
                    .detach();
                store
                    .observe_slice(
                        cx,
                        |s| s.label.clone(),
                        |this: &mut Probe, label, cx| {
                            this.labels.push(label);
                            cx.notify();
                        },
                    )
                    .detach();
                this
            });
            (store, probe)
        });

        // Touch the label only: the count slice stays silent.
        cx.update(|cx| store.set(cx, |s| s.label = "b".into()));
        cx.run_until_parked();

        // Touch the count: only the count slice fires.
        cx.update(|cx| store.set(cx, |s| s.count = 5));
        cx.run_until_parked();

        // Rewriting the same value is a no-op for the slice.
        cx.update(|cx| store.set_if_changed(cx, |s| s.count = 5));
        cx.run_until_parked();

        cx.update(|cx| {
            let probe = probe.read(cx);
            assert_eq!(probe.counts, vec![0, 5]);
            assert_eq!(probe.labels, vec!["b"]);
        });
    }

    #[gpui::test]
    fn notifications_coalesce_within_one_update_batch(cx: &mut TestAppContext) {
        let fired = Rc::new(Cell::new(0usize));
        let store = cx.update(|cx| {
            let store = StoreHandle::new(Sample::default(), cx);
            let fired = fired.clone();
            cx.observe(&store, move |_, _| fired.set(fired.get() + 1))
                .detach();
            store
        });

        cx.update(|cx| {
            store.set(cx, |s| s.count = 1);
            store.set(cx, |s| s.count = 2);
        });
        cx.update(|cx| store.set(cx, |s| s.count = 3));
        cx.run_until_parked();

        // The batched pair fires once (with the final value), the lone set once.
        assert_eq!(fired.get(), 2);
        cx.update(|cx| assert_eq!(store.read(cx).count, 3));
    }

    #[gpui::test]
    fn subscribe_reports_the_final_state_of_each_batch(cx: &mut TestAppContext) {
        let seen = Rc::new(std::cell::RefCell::new(Vec::new()));
        let store = cx.update(|cx| {
            let store = StoreHandle::new(Sample::default(), cx);
            let seen = seen.clone();
            store
                .subscribe(cx, move |state, _| seen.borrow_mut().push(state.count))
                .detach();
            store
        });

        cx.update(|cx| store.set(cx, |s| s.count = 1));
        cx.update(|cx| {
            store.set(cx, |s| s.count = 3);
            store.set(cx, |s| s.count = 4);
        });
        cx.run_until_parked();

        assert_eq!(*seen.borrow(), vec![1, 4]);
    }
}
