# Security Policy

## Project Status

Cryptopayserver is currently in beta (v0.x). While we take security seriously, we are not yet ready for formal CVE assignments or coordinated disclosure programs.

## Reporting Security Issues

### For All Security Concerns:
Please report via **email only**: viper.aur123@gmail.com

**DO NOT open public GitHub issues for security vulnerabilities.**

Include in your report:
- Description of the issue
- Steps to reproduce
- Affected versions
- Your assessment of severity

### What to Expect:
- We will acknowledge your report as soon as we can
- Fixes will be included in regular releases without special security advisories
- No CVEs will be assigned during the beta phase
- Credit will be given in release notes if you wish

### For Non-Security Bugs:
Use GitHub issues for functionality bugs, feature requests, and general questions.

## Philosophy

As a beta project, we prioritize:
1. **Rapid iteration** over lengthy disclosure timelines
2. **Quick patches** over formal security processes
3. **Transparency** about our beta status

We plan to implement formal vulnerability disclosure and CVE handling after reaching v1.0 stable.

## Self-Hosting Security

Since Cryptopayserver is self-hosted software:
- Keep your instance updated to the latest release
- Put TLS and rate limiting on a reverse proxy (Caddy / nginx) in production
- Do not expose the app without HTTPS and a strong reverse-proxy ACL where possible
- Copy `.env.example` → `.env` / `.env.production` and set strong secrets before going live
- Prefer `DISABLE_PUBLIC_REGISTRATION=true` (and matching `NEXT_PUBLIC_DISABLE_PUBLIC_REGISTRATION=true` to hide signup UI) after the first admin account exists

### Required secrets (production)

| Variable | Notes |
| -------- | ----- |
| `SESSION_SECRET` | ≥ 32 chars; JWT / cookie signing |
| `ENCRYPTION_KEY` | ≥ 32 chars; at-rest AES-GCM for mnemonics, tokens, SMTP, etc. |
| `CRON_SECRET` | ≥ 16 chars; schedule worker auth via `x-cron-secret` header |
| `DATABASE_URL` | Prisma MySQL URL |
| `APP_BASE_URL` | Public https origin (CSRF allowlist + password-reset links) |

Optional but recommended for multi-instance deploys: `REDIS_URL`, `TRUST_PROXY=true` (only behind a trusted proxy).
Set `REQUIRE_REDIS=true` so production boot/`yarn validate:env` **errors** if `REDIS_URL` is missing (shared rate limits + cron locks).

Optional: `BLOCKSCAN_BASE_URL` for on-chain invoice settlement / faucet / address-scan / tx-history (unset = those helpers soft-skip; `/api/health` reports `checks.blockscan=skipped`; no silent SaaS fallback).

Optional hardening: `USE_HOST_PREFIX_COOKIES=true` renames session cookies to `__Host-cps_session` / `__Host-cps_pending_2fa` (HTTPS only; users must re-login).

Validate with:

```bash
yarn validate:env
NODE_ENV=production yarn validate:env
```

Production boot also runs the same checks via Next.js `instrumentation.ts` and fails fast on hard errors.

### Secret migration helpers

```bash
yarn secrets:reencrypt          # dry-run
yarn secrets:reencrypt:apply    # write encrypted/hashed values
yarn secrets:audit-api-keys     # fail if plaintext API keys remain
```

`ALLOW_LEGACY_PLAINTEXT_API_KEYS` is for non-production migration only and is ignored when `NODE_ENV=production`.

### Built-in controls (summary)

- Session cookies: `cps_session` / `cps_pending_2fa` (or `__Host-` variants), `HttpOnly`, `SameSite=Strict`, conditional `Secure`
- CSRF: same-origin checks on mutating browser/session routes
- Edge middleware: session / cron / API-key path gates; CSP script nonces; `style-src 'self'` + `style-src-attr 'unsafe-inline'` (React `style={}` only); API `Cache-Control: no-store`
- Schedule jobs: Redis/memory cron locks; webhook deliveries persisted with scheduled retries (`webhook_deliveries`)
- Public checkout share links: HMAC tokens (`exp.sig`, 90-day TTL); signed with `SESSION_SECRET` (fallback `ENCRYPTION_KEY`)
- Store RBAC + step-up account / wallet password for high-risk actions
- Webhook / outbound URL SSRF checks; hashed store API keys
- Per-IP (and Redis when configured) rate limits on auth and mutating APIs
- `/api/health`: DB (+ Redis / Blockscan when configured) liveness; no secrets in response

### Database migrations

After pulling updates that add indexes, run:

```bash
yarn db:migrate
```

Thank you for helping improve Cryptopayserver!
