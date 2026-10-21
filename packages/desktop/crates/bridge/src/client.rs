//! Blocking HTTP client for `apps/api`.
//!
//! Call sites must not run these methods on the GPUI UI thread — use
//! [`crate::run`] (background executor) from a view.

use std::sync::{Arc, Mutex};
use std::time::Duration;

use serde::de::DeserializeOwned;
use serde::Serialize;
use ureq::Agent;

use crate::error::BridgeError;
use crate::types::{CreatePost, Health, Post, SessionPayload, SignInEmail};

/// Default backend URL — same port as `apps/api` (`PORT=4000`).
pub const DEFAULT_BASE_URL: &str = "http://127.0.0.1:4000";

/// Environment variable overriding [`DEFAULT_BASE_URL`].
pub const BASE_URL_ENV: &str = "CELESTIA_API_URL";

/// Cloneable handle to the Hono backend. Cookie jar is shared across clones so
/// a successful sign-in is visible to later `list_posts` calls.
#[derive(Clone)]
pub struct BridgeClient {
    inner: Arc<Inner>,
}

struct Inner {
    base_url: String,
    agent: Agent,
    /// Extra Cookie header (in addition to the agent cookie jar), for hosts
    /// that inject a session from secure storage.
    session_cookie: Mutex<Option<String>>,
}

impl BridgeClient {
    /// Build a client for `base_url` (no trailing slash).
    pub fn new(base_url: impl Into<String>) -> Self {
        let base_url = base_url.into().trim_end_matches('/').to_string();
        let agent = ureq::AgentBuilder::new()
            .timeout_connect(Duration::from_secs(5))
            .timeout_read(Duration::from_secs(30))
            .build();
        Self {
            inner: Arc::new(Inner {
                base_url,
                agent,
                session_cookie: Mutex::new(None),
            }),
        }
    }

    /// `CELESTIA_API_URL` or [`DEFAULT_BASE_URL`].
    pub fn from_env() -> Self {
        let url = std::env::var(BASE_URL_ENV).unwrap_or_else(|_| DEFAULT_BASE_URL.to_string());
        Self::new(url)
    }

    pub fn base_url(&self) -> &str {
        &self.inner.base_url
    }

    /// Attach a raw `Cookie` header value (e.g. `better-auth.session_token=…`).
    pub fn set_session_cookie(&self, cookie: Option<String>) {
        *self.inner.session_cookie.lock().expect("cookie lock") = cookie;
    }

    /// `GET /api/health` — no auth required. Use this to prove the bridge.
    pub fn health(&self) -> Result<Health, BridgeError> {
        self.get_json("/api/health")
    }

    /// Better Auth email/password sign-in. Stores Set-Cookie values in the
    /// agent jar for subsequent authenticated calls.
    pub fn sign_in_email(&self, email: &str, password: &str) -> Result<SessionPayload, BridgeError> {
        let body = SignInEmail {
            email: email.to_string(),
            password: password.to_string(),
        };
        self.post_json("/api/auth/sign-in/email", &body)
    }

    /// `GET /api/posts` — requires a session (blog feature).
    pub fn list_posts(&self) -> Result<Vec<Post>, BridgeError> {
        self.get_json("/api/posts")
    }

    /// `POST /api/posts` — requires a session (blog feature).
    pub fn create_post(&self, input: &CreatePost) -> Result<Post, BridgeError> {
        self.post_json("/api/posts", input)
    }

    /// `DELETE /api/posts/:id` — requires a session (blog feature).
    pub fn delete_post(&self, id: &str) -> Result<(), BridgeError> {
        let path = format!("/api/posts/{id}");
        self.request("DELETE", &path, None::<&()>)?;
        Ok(())
    }

    fn get_json<T: DeserializeOwned>(&self, path: &str) -> Result<T, BridgeError> {
        let response = self.request("GET", path, None::<&()>)?;
        response.into_json().map_err(|e| BridgeError::Decode(e.to_string()))
    }

    fn post_json<B: Serialize, T: DeserializeOwned>(
        &self,
        path: &str,
        body: &B,
    ) -> Result<T, BridgeError> {
        let response = self.request("POST", path, Some(body))?;
        response.into_json().map_err(|e| BridgeError::Decode(e.to_string()))
    }

    fn request<B: Serialize>(
        &self,
        method: &str,
        path: &str,
        body: Option<&B>,
    ) -> Result<ureq::Response, BridgeError> {
        let url = format!("{}{path}", self.inner.base_url);
        let mut req = match method {
            "GET" => self.inner.agent.get(&url),
            "POST" => self.inner.agent.post(&url),
            "PATCH" => self.inner.agent.request("PATCH", &url),
            "DELETE" => self.inner.agent.request("DELETE", &url),
            other => {
                return Err(BridgeError::Transport(format!("unsupported method {other}")));
            }
        };
        req = req.set("Accept", "application/json");
        if let Some(cookie) = self.inner.session_cookie.lock().expect("cookie lock").as_ref() {
            req = req.set("Cookie", cookie);
        }

        let result = match body {
            Some(body) => req.send_json(body),
            None => req.call(),
        };

        result.map_err(BridgeError::from_ureq)
    }
}
