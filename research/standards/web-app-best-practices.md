# 🌊 Windsurf Web Application Best Practices

This document outlines universal best practices for designing, building, testing, and securing modern web applications. It consolidates UI, CSS, testing, and security strategies for teams building scalable, accessible, and resilient web software.

---

## 1. UI & UX Principles

- **User-Centered Design**: Solve user problems first.
- **Simplicity**: Avoid cognitive overload. Remove, then refine.
- **Consistency**: Standardize layouts, colors, and behaviors.
- **Accessibility**: WCAG 2.1 AA compliance; keyboard navigation, semantic HTML.
- **Feedback**: Every action should yield a visible response.

## 2. CSS & SCSS Conventions

- Architecture: BEM or SMACSS structure.
- Modularization: Use SCSS partials and a single entrypoint (`main.scss`).
- Nesting: Keep under 3 levels deep.
- Variables: Centralize spacing, colors, breakpoints.
- Responsiveness: Mobile-first, with mixins for breakpoints.

## 3. Component & Design System Hygiene

- Design systems: Centralize tokens (colors, fonts, etc.).
- Componentization: Favor atomic design (Button > Form > Page).
- Reusability: Components should be decoupled and isolated.
- Docs: Each component should include documentation and change history.

## 4. End-to-End Testing (Cypress)

- **File structure**: Group by feature (`e2e/login.cy.js`).
- **Selectors**: Prefer `[data-cy=...]` for stability.
- **Hooks**: Use `beforeEach` to reset state.
- **Custom commands**: Abstract repetitive tasks with `Cypress.Commands.add(...)`.
- **Page Object Model (POM)**: Optional for larger projects.

## 5. Performance Optimization

- Lazy-load heavy assets.
- Use modern formats (`webp`, `avif`).
- Bundle/minify CSS/JS.
- Ensure no layout thrashing or unthrottled scroll handlers.

## 6. Security

- **XSS**: Use DOMPurify, never `innerHTML` without sanitization.
- **CSRF**: Use anti-CSRF tokens or `SameSite` cookies.
- **CSP**: Enforce strict `Content-Security-Policy`.
- **Authentication**: Use HTTPS, MFA, and never store sensitive data in localStorage.
- **Security Headers**: Implement `helmet` or similar.

## 7. CI/CD & Tooling

- Run security scans in CI (`npm audit`, `snyk`, etc.).
- Integrate Cypress E2E and visual regression tests.
- Use linters (`eslint`, `stylelint`) and pre-commit hooks.

---

## 🤖 Purpose

This guide helps devs and AI agents generate, analyze, and validate modern web application architectures. Structure and consistency lead to scale. Let Windsurf steer you true. 🏄‍♂️
