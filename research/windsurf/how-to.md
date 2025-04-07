# 🛠 HOWTO: Build Modern Web Applications with Windsurf

This doc walks you through the principles Windsurf expects when building web apps. It’s equal parts style guide, safety rail, and secret decoder ring.

---

## 1. Start with the User

- Map user flows before writing code.
- Validate UI via wireframes or mockups.
- Document each feature's purpose and expected outcomes.

## 2. Structure Your Project

your-app/
├── src/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── utils/
├── cypress/
│   ├── e2e/
│   ├── fixtures/
│   └── support/
└── public/


## 3. CSS and Styling
Use SCSS with BEM structure.

Limit nesting, extract mixins and variables.

Normalize styles globally (normalize.css or CSS reset).

## 4. Build with Components
Use atomic design: Button → Form → Page.

Reuse and document each component.

Wrap accessibility into each component by default.

## 5. Test Everything
Write Cypress tests using [data-cy=...] attributes.

Abstract flows with custom commands and fixtures.

Run tests on each pull request and nightly.

## 6. Lock Down Security
Sanitize DOM input (XSS) and validate forms.

Enforce HTTPS, CSP, and secure headers.

Use session cookies with HttpOnly, Secure, and SameSite=Strict.

## 7. Performance & Accessibility
Optimize assets.

Follow accessibility best practices (ARIA, keyboard, labels).

Lighthouse audits should score 90+ in A11y & Performance.

## 8. Deploy Safely
CI runs tests, audits, and lints.

Use versioning and changelogs.

Set up alerting for downtime or slow responses.

## 9. 🚀 Pro Tips
Prefer readability over cleverness.

If you’re re-writing the same snippet in 3+ tests or files, extract it.

If you need !important, question the universe.