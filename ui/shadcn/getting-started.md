---
title: "Integrating shadcn/ui: The Sane Developer's Guide"
tags: ["shadcn", "ui", "tailwind", "integration"]
---

# Integrating shadcn/ui Into Your Existing Project

Let's face it—most UI libraries are either bloated monstrosities that take over your codebase or fragile component collections that break with every minor version bump. Enter **shadcn/ui**: not a component library, but a collection of accessible, customizable components you *own*.

## Prerequisites

Before we liberate your UI from dependency hell, make sure you have:

- A React project using either Next.js or Vite
- Tailwind CSS installed and configured (the one trendy tool that's actually worth it)

If you're missing either of these, take a moment to set them up first. Your future self will thank you.

## Initializing shadcn/ui

Let's start with a clean slate. Open your terminal and run:

```bash
npx shadcn-ui@latest init
```

This will launch an interactive setup that asks a few questions. Here's how to navigate the prompts:

### Setup Prompts

1. **Which style would you like to use?** → The default (`Default`) is clean and minimal.

2. **Which color would you like to use as base?** → `zinc` is a solid neutral choice, but `slate` or `neutral` work well too. Choose what matches your brand.

3. **Where is your tailwind.config.js located?** → Usually at the root (`tailwind.config.js` or `tailwind.config.ts`).

4. **What directory should the UI components be generated in?** → The default (`components/ui`) keeps things organized.

5. **Configure the import alias for components?** → For Next.js, `@/components/ui` is standard. For Vite, you might need to set up path aliases first.

6. **Are you using React Server Components?** → Answer according to your project setup (Yes for Next.js App Router, No for most other setups).

After answering these questions, shadcn will update your configuration files and set up the component infrastructure.

## Adding Components

Now for the fun part—adding components. Unlike traditional libraries where you import from a package, with shadcn/ui you generate the components directly in your project:

```bash
npx shadcn-ui@latest add button
```

This command adds the button component to your project. You can add as many or as few components as you need:

```bash
npx shadcn-ui@latest add dialog dropdown-menu toast
```

Each component comes with its own documentation in the form of comments, making it easy to understand and customize.

## Pro Tips for the Discerning Developer

### You Own These Components

Unlike traditional UI libraries, shadcn/ui components live in your codebase. This means:

- No version lock-in or dependency nightmares
- Full freedom to modify components without forking a library
- No bloat from unused components—add only what you need

### Dark Mode? No Problem

All components are designed with dark mode in mind. Just follow the [dark mode setup](https://ui.shadcn.com/docs/dark-mode) in your project, and everything works seamlessly.

### Accessibility Included

Each component is built on top of [Radix UI primitives](https://www.radix-ui.com/), giving you robust accessibility features without the extra work. Keyboard navigation, focus management, and screen reader support come standard.

### Import Paths

Use the configured import alias for clean imports:

```javascript
import { Button } from "@/components/ui/button"
```

## Cleanup and Migration Strategy

If you're integrating shadcn/ui into an existing project, consider these steps:

1. **Check for class conflicts**: shadcn/ui uses Tailwind, which might conflict with existing CSS. Use Tailwind's prefixing or more specific selectors if needed.

2. **Gradual migration**: Don't replace everything at once. Start with less complex UI elements and work your way up.

3. **Consistent theming**: Update your design tokens in `tailwind.config.js` to ensure consistency between new and existing components.

4. **Purge unused styles**: After migration, run Tailwind's purge to remove any unused CSS.

## See It In Action

Here's a simple example to get you started:

```jsx
import { Button } from "@/components/ui/button"

export function HeroSection() {
  return (
    <div className="py-10 space-y-4">
      <h1 className="text-3xl font-bold">Welcome to Our Platform</h1>
      <p className="text-muted-foreground">Beautiful UI without the hassle.</p>
      <Button variant="outline">Get Started</Button>
    </div>
  )
}
```

## The Verdict

Give your UI that clean startup aesthetic without selling your soul to Tailwind config hell. shadcn/ui strikes the perfect balance between customization and convenience—you get beautiful, accessible components without the baggage of traditional UI libraries.

No more fighting with opinionated frameworks or drowning in a sea of props documentation. Just clean, functional UI that you control.

Go ahead, add that first component and watch your design system level up instantly.
