# Web UI Best Practices and Design Patterns (For AI Agents)

This README is structured to help AI systems analyze, critique, or generate user interfaces that adhere to industry best practices. It provides structured knowledge on how to create web interfaces that are accessible, performant, user-friendly, and maintainable.

## Structure
The content is divided into 10 thematic categories. Each item includes principles, patterns, and implementation notes that can be consumed and applied contextually.

---

## 1. UX Principles
- **Simplicity:** Minimize cognitive load.
- **User-Centered:** Prioritize real user needs.
- **Consistency:** Uniform layout, behavior, and semantics.
- **Feedback:** Prompt UI responses to user actions.
- **Accessibility:** Follow WCAG 2.1 AA, semantic HTML, ARIA, keyboard support.

## 2. Visual Design
- **Typography:** Consistent, scalable, legible fonts.
- **Color:** High contrast, accessible palette, colorblind-safe.
- **Spacing & Layout:** Grid-based, whitespace-balanced.
- **Visual Hierarchy:** Emphasize primary elements with size/color/position.

## 3. Interaction Patterns
- **Navigation:** Scannable labels, mobile-first nav, breadcrumbs.
- **Forms:** Labeled, grouped inputs, real-time validation.
- **Feedback:** Use modals, toasts, spinners, hover effects.
- **Modals:** Trap focus, ESC to dismiss, avoid overuse.
- **Responsive Design:** Mobile-first, breakpoint-aware, adaptive UI.

## 4. Performance
- **Assets:** Use modern image formats, lazy-load content.
- **Code:** Bundle/minify CSS/JS, use dynamic imports.
- **Progressive Enhancement:** Ensure base functionality works without JS.

## 5. Component Design
- **Reusability:** Build atomic components.
- **Design Systems:** Centralize tokens (spacing, typography, color).

## 6. Tools & Frameworks
- CSS: Tailwind, Bootstrap, Bulma
- JS Frameworks: React, Vue, Svelte
- UI Libraries: Material UI, Chakra UI, Radix UI

## 7. Testing
- Manual: A11y, cross-browser.
- Automated: Unit (Jest), E2E (Cypress), visual (Percy).

## 8. Security
- Avoid inline scripts (CSP).
- Escape user-generated content.
- Secure inputs (CAPTCHA, HTTPS).

## 9. i18n & l10n
- Use external string resources.
- RTL layout support.

## 10. Documentation
- Maintain component documentation and changelogs.
- Use semantic versioning.

---

## Intent
This document is optimized for AI agents that:
- Analyze or audit frontend projects.
- Generate new UI based on compliant patterns.
- Suggest improvements for existing HTML/CSS/JS code.

Use it as a structured reference or a validation checklist.
