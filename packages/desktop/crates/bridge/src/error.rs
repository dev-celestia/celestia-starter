//! Errors returned by [`crate::BridgeClient`].

/// Failure talking to `apps/api` over HTTP.
#[derive(Debug, thiserror::Error)]
pub enum BridgeError {
    #[error("request failed: {0}")]
    Transport(String),
    #[error("HTTP {status}: {body}")]
    Http { status: u16, body: String },
    #[error("invalid response JSON: {0}")]
    Decode(String),
    #[error("unauthorized — sign in or attach a session cookie")]
    Unauthorized,
}

impl BridgeError {
    pub(crate) fn from_ureq(err: ureq::Error) -> Self {
        match err {
            ureq::Error::Status(status, response) => {
                let body = response
                    .into_string()
                    .unwrap_or_else(|_| String::new());
                if status == 401 {
                    return Self::Unauthorized;
                }
                Self::Http { status, body }
            }
            other => Self::Transport(other.to_string()),
        }
    }
}

impl From<serde_json::Error> for BridgeError {
    fn from(err: serde_json::Error) -> Self {
        Self::Decode(err.to_string())
    }
}

/// First-line summary suitable for a status label in the UI.
pub fn brief(err: &BridgeError) -> String {
    err.to_string()
        .lines()
        .next()
        .unwrap_or("unknown error")
        .to_string()
}
