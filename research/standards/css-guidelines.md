# CSS & SCSS Best Practices (For AI Agents)

This README provides a structured overview of CSS and SCSS best practices optimized for AI agents working on frontend design, code generation, or style auditing.

---

## 1. Code Organization
- Use architecture patterns like BEM or SMACSS.
- Separate styles by concern: base, layout, components, utilities.
- Use SCSS partials and central `main.scss` entry point.

## 2. Naming Conventions
- Follow BEM:
  - Block: `.button`
  - Element: `.button__icon`
  - Modifier: `.button--primary`
- Avoid unclear abbreviations: prefer `.header` over `.hd`.

## 3. SCSS-Specific Techniques
- Limit nesting to 2–3 levels to avoid high specificity.
- Centralize variables for colors, fonts, spacing.
- Use mixins for media queries and reusable patterns.
- Prefer `%placeholder` selectors over `@extend`.
- Use functions for calculated values (e.g., `lighten($color, 10%)`).

## 4. Performance
- Keep selectors shallow; prefer classes over tags or IDs.
- Avoid `!important` unless justified.
- Reduce reflows by avoiding layout-affecting animations.

## 5. Responsive Design
- Use mobile-first breakpoints.
- Apply media query mixins (e.g., `@include respond('tablet')`).
- Prefer Grid or Flexbox with fluid widths.

## 6. Maintainability
- Comment on hacks or non-obvious logic.
- Replace magic numbers with variables or meaningful values.
- Routinely clean up unused styles.

## 7. Tooling
- Use linters like `stylelint` or `scss-lint` for consistency.
- Integrate with build tools (e.g., Webpack, Vite) and source maps.

## 8. Utility & Reset
- Use utility classes sparingly unless using utility-first CSS (e.g., Tailwind).
- Start with Normalize.css or a CSS reset.

---

## Purpose
This file is optimized for machine parsing and guidance for:
- Generating semantic, scalable stylesheets.
- Auditing style architecture and naming.
- Detecting anti-patterns in SCSS/CSS.

Maintain your CSS like it's code, not an afterthought. Structure breeds clarity. 🧠🎨
