//! DTOs mirroring `apps/api` JSON responses.
//!
//! Keep field names in sync with the Hono routes / Drizzle schema. There is no
//! shared codegen yet — the web app gets types from `AppType`; desktop mirrors
//! the wire shape here.

use serde::{Deserialize, Serialize};

/// `GET /api/health`
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Health {
    pub status: String,
}

impl Health {
    pub fn is_ok(&self) -> bool {
        self.status.eq_ignore_ascii_case("ok")
    }
}

/// Row from `GET /api/posts` (blog feature).
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Post {
    pub id: String,
    pub title: String,
    pub content: String,
    pub published: bool,
    pub author_id: String,
    /// ISO-8601 string from the API JSON encoder.
    pub created_at: String,
    pub updated_at: String,
}

/// Body for `POST /api/posts`.
#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CreatePost {
    pub title: String,
    pub content: String,
    pub published: bool,
}

/// Body for Better Auth email/password sign-in.
#[derive(Debug, Clone, Serialize)]
pub struct SignInEmail {
    pub email: String,
    pub password: String,
}

/// Minimal user payload returned by Better Auth session endpoints.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AuthUser {
    pub id: String,
    pub name: String,
    pub email: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SessionPayload {
    pub user: AuthUser,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn health_roundtrip() {
        let raw = r#"{"status":"ok"}"#;
        let health: Health = serde_json::from_str(raw).unwrap();
        assert!(health.is_ok());
    }

    #[test]
    fn post_camel_case() {
        let raw = r#"{
            "id":"p1",
            "title":"Hello",
            "content":"world",
            "published":true,
            "authorId":"u1",
            "createdAt":"2026-01-01T00:00:00.000Z",
            "updatedAt":"2026-01-01T00:00:00.000Z"
        }"#;
        let post: Post = serde_json::from_str(raw).unwrap();
        assert_eq!(post.author_id, "u1");
    }
}
