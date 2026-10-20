//! # celestia-bridge
//!
//! HTTP bridge from Celestia Desktop (GPUI UI) to the Hono backend in
//! `apps/api`. Same boundary as the web app's `api-client.ts` — the desktop
//! process never imports the database; it only speaks HTTP.
//!
//! ```text
//! ┌─────────────────────┐         HTTP          ┌────────────────────┐
//! │  celestia-ui (GPUI) │  ──────────────────▶  │  apps/api (Hono)   │
//! │  + celestia-bridge  │   CELESTIA_API_URL    │  auth + data + DB  │
//! └─────────────────────┘                       └─────────┬──────────┘
//!                                                         │ Drizzle
//!                                               ┌─────────▼──────────┐
//!                                               │     PostgreSQL     │
//!                                               └────────────────────┘
//! ```
//!
//! ## Quick start
//!
//! ```ignore
//! use celestia_bridge::{BridgeClient, run};
//!
//! let bridge = BridgeClient::from_env();
//! run(cx, {
//!     let bridge = bridge.clone();
//!     move || bridge.health()
//! }, |this, result, cx| {
//!     this.health = Some(result);
//!     cx.notify();
//! })
//! .detach();
//! ```

mod client;
mod error;
mod run;
mod types;

pub use client::{BASE_URL_ENV, BridgeClient, DEFAULT_BASE_URL};
pub use error::{brief, BridgeError};
pub use run::run;
pub use types::{AuthUser, CreatePost, Health, Post, SessionPayload, SignInEmail};
