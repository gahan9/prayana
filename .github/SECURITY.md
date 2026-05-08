# Security Policy

## Supported versions

| Version | Supported |
|---------|-----------|
| `main`  | ✅         |
| Others  | ❌         |

## Reporting a vulnerability

**Please do not report security vulnerabilities through public GitHub Issues.**

Instead, use one of the following private channels:

1. **GitHub Private Security Advisory** (preferred):
   [https://github.com/gahan9/prayana/security/advisories/new](https://github.com/gahan9/prayana/security/advisories/new)

2. **Email**: If you are unable to use the advisory form, email the maintainer directly (see the GitHub profile).

### What to include

Please include as much of the following information as possible to help us triage and fix the issue quickly:

- Type of issue (e.g. CSRF, XSS, SQL injection, data exposure)
- Full path of the source file(s) related to the issue
- Location of the affected source code (tag/branch/commit or URL)
- Any special configuration required to reproduce
- Step-by-step instructions to reproduce
- Proof-of-concept or exploit code (if available)
- Impact of the issue, including how an attacker might exploit it

### Response timeline

| Step | Target |
|------|--------|
| Initial acknowledgement | ≤ 48 hours |
| Triage & severity assessment | ≤ 5 business days |
| Fix & release | ≤ 30 days (critical), ≤ 90 days (other) |

We follow responsible disclosure and will credit reporters in the release notes unless you prefer to remain anonymous.

## Security best practices for contributors

- Never commit secrets, API keys, `.env` files, or credentials.
- Use environment variables for all sensitive configuration (see `.env.example`).
- Follow the Firestore and Storage security rules when adding new collections.
- Run `npm audit` before raising a PR.
- Keep dependencies up to date via Dependabot (already configured).
