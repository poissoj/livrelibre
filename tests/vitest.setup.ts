// Tests must be self-sufficient: never rely on a developer's local
// `apps/server/.env.local`. `env.ts` requires SESSION_SECRET (min 32 chars).
process.env.SESSION_SECRET ??= "test-session-secret-test-session-secret";
process.env.NODE_ENV ??= "test";

// Never hit the real (rate-limited) book-lookup API from tests. The value must
// stay a valid URL for env.ts validation, but points to an unbound local port.
process.env.ISBN_SEARCH_URL = "http://127.0.0.1:9/";
