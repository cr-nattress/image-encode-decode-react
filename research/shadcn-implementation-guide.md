# Implementing shadcn/ui in React Applications

This guide documents the correct steps to implement shadcn/ui in various React application setups, with special focus on Create React App (CRA) projects.

## Table of Contents

1. [Introduction to shadcn/ui](#introduction-to-shadcnui)
2. [Prerequisites](#prerequisites)
3. [Implementation in Next.js or Vite](#implementation-in-nextjs-or-vite)
4. [Implementation in Create React App](#implementation-in-create-react-app)
5. [Adding and Customizing Components](#adding-and-customizing-components)
6. [Troubleshooting](#troubleshooting)

## Introduction to shadcn/ui

shadcn/ui is not a traditional component library but a collection of reusable components that you add directly to your project. This approach gives you complete ownership of the components, allowing for unlimited customization without dependency lock-in.

Key benefits:
- Full ownership of component code
- No dependency versioning issues
- Highly customizable
- Built on Radix UI primitives for accessibility
- Styled with Tailwind CSS

## Prerequisites

Before implementing shadcn/ui, ensure you have:

- A React project (Next.js, Vite, or Create React App)
- Tailwind CSS installed and configured
- Node.js 14.0 or higher

## Implementation in Next.js or Vite

For Next.js or Vite projects, the implementation is straightforward:

1. **Initialize shadcn/ui**:

   ```bash
   npx shadcn-ui@latest init
   ```

2. **Follow the prompts**:
   - Style: Default
   - Base color: Choose according to your brand (e.g., zinc, slate)
   - Tailwind config path: Usually at root (tailwind.config.js or tailwind.config.ts)
   - Components directory: Default is components/ui
   - Import alias: For Next.js, @/components/ui is standard
   - React Server Components: Yes for Next.js App Router, No for others

3. **Add components**:

   ```bash
   npx shadcn-ui@latest add button
   ```

## Implementation in Create React App

Implementing shadcn/ui in Create React App requires additional configuration since CRA doesn't allow direct PostCSS customization. Here's the step-by-step process:

1. **Install required dependencies**:

   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npm install @craco/craco
   npm install class-variance-authority clsx tailwind-merge tailwindcss-animate
   ```

2. **Create CRACO configuration file** (craco.config.js at the root):

   ```javascript
   module.exports = {
     style: {
       postcss: {
         plugins: [
           require('tailwindcss'),
           require('autoprefixer'),
         ],
       },
     },
   };
   ```

3. **Update package.json scripts** to use CRACO:

   ```json
   "scripts": {
     "start": "craco start",
     "build": "craco build",
     "test": "craco test",
     "eject": "react-scripts eject"
   }
   ```

4. **Create Tailwind configuration file** (tailwind.config.js at the root):

   ```javascript
   /** @type {import('tailwindcss').Config} */
   module.exports = {
     darkMode: ["class"],
     content: [
       "./src/**/*.{js,jsx,ts,tsx}",
     ],
     theme: {
       container: {
         center: true,
         padding: "2rem",
         screens: {
           "2xl": "1400px",
         },
       },
       extend: {
         colors: {
           border: "hsl(var(--border))",
           input: "hsl(var(--input))",
           ring: "hsl(var(--ring))",
           background: "hsl(var(--background))",
           foreground: "hsl(var(--foreground))",
           primary: {
             DEFAULT: "hsl(var(--primary))",
             foreground: "hsl(var(--primary-foreground))",
           },
           secondary: {
             DEFAULT: "hsl(var(--secondary))",
             foreground: "hsl(var(--secondary-foreground))",
           },
           destructive: {
             DEFAULT: "hsl(var(--destructive))",
             foreground: "hsl(var(--destructive-foreground))",
           },
           muted: {
             DEFAULT: "hsl(var(--muted))",
             foreground: "hsl(var(--muted-foreground))",
           },
           accent: {
             DEFAULT: "hsl(var(--accent))",
             foreground: "hsl(var(--accent-foreground))",
           },
           popover: {
             DEFAULT: "hsl(var(--popover))",
             foreground: "hsl(var(--popover-foreground))",
           },
           card: {
             DEFAULT: "hsl(var(--card))",
             foreground: "hsl(var(--card-foreground))",
           },
         },
         borderRadius: {
           lg: "var(--radius)",
           md: "calc(var(--radius) - 2px)",
           sm: "calc(var(--radius) - 4px)",
         },
         keyframes: {
           "accordion-down": {
             from: { height: 0 },
             to: { height: "var(--radix-accordion-content-height)" },
           },
           "accordion-up": {
             from: { height: "var(--radix-accordion-content-height)" },
             to: { height: 0 },
           },
         },
         animation: {
           "accordion-down": "accordion-down 0.2s ease-out",
           "accordion-up": "accordion-up 0.2s ease-out",
         },
       },
     },
     plugins: [require("tailwindcss-animate")],
   }
   ```

5. **Create a CSS file for Tailwind directives** (src/tailwind.css):

   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   
   @layer base {
     :root {
       --background: 0 0% 100%;
       --foreground: 240 10% 3.9%;
       --card: 0 0% 100%;
       --card-foreground: 240 10% 3.9%;
       --popover: 0 0% 100%;
       --popover-foreground: 240 10% 3.9%;
       --primary: 196 100% 50%;
       --primary-foreground: 0 0% 98%;
       --secondary: 240 4.8% 95.9%;
       --secondary-foreground: 240 5.9% 10%;
       --muted: 240 4.8% 95.9%;
       --muted-foreground: 240 3.8% 46.1%;
       --accent: 240 4.8% 95.9%;
       --accent-foreground: 240 5.9% 10%;
       --destructive: 0 84.2% 60.2%;
       --destructive-foreground: 0 0% 98%;
       --border: 240 5.9% 90%;
       --input: 240 5.9% 90%;
       --ring: 196 100% 50%;
       --radius: 0.5rem;
     }
   
     .dark {
       --background: 240 10% 3.9%;
       --foreground: 0 0% 98%;
       --card: 240 10% 3.9%;
       --card-foreground: 0 0% 98%;
       --popover: 240 10% 3.9%;
       --popover-foreground: 0 0% 98%;
       --primary: 196 100% 50%;
       --primary-foreground: 240 5.9% 10%;
       --secondary: 240 3.7% 15.9%;
       --secondary-foreground: 0 0% 98%;
       --muted: 240 3.7% 15.9%;
       --muted-foreground: 240 5% 64.9%;
       --accent: 240 3.7% 15.9%;
       --accent-foreground: 0 0% 98%;
       --destructive: 0 62.8% 30.6%;
       --destructive-foreground: 0 0% 98%;
       --border: 240 3.7% 15.9%;
       --input: 240 3.7% 15.9%;
       --ring: 196 100% 50%;
     }
   }
   
   @layer base {
     * {
       @apply border-border;
     }
     body {
       @apply bg-background text-foreground;
     }
   }
   ```

6. **Import the Tailwind CSS file** in your index.js:

   ```javascript
   import './tailwind.css';
   // Other imports...
   ```

7. **Create a utils.js file** for component utilities (src/lib/utils.js):

   ```javascript
   import { clsx } from "clsx";
   import { twMerge } from "tailwind-merge";
   
   export function cn(...inputs) {
     return twMerge(clsx(inputs));
   }
   ```

8. **Create component directories**:

   ```bash
   mkdir -p src/components/ui
   ```

9. **Manually add shadcn/ui components** to the components/ui directory. Here are examples for basic components:

   **Button Component** (src/components/ui/button.jsx):
   ```jsx
   import * as React from "react";
   import { cva } from "class-variance-authority";
   import { cn } from "../../lib/utils";
   
   const buttonVariants = cva(
     "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
     {
       variants: {
         variant: {
           default:
             "bg-primary text-primary-foreground shadow hover:bg-primary/90",
           destructive:
             "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
           outline:
             "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
           secondary:
             "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
           ghost: "hover:bg-accent hover:text-accent-foreground",
           link: "text-primary underline-offset-4 hover:underline",
         },
         size: {
           default: "h-9 px-4 py-2",
           sm: "h-8 rounded-md px-3 text-xs",
           lg: "h-10 rounded-md px-8",
           icon: "h-9 w-9",
         },
       },
       defaultVariants: {
         variant: "default",
         size: "default",
       },
     }
   );
   
   const Button = React.forwardRef(
     ({ className, variant, size, asChild = false, ...props }, ref) => {
       const Comp = asChild ? React.Fragment : "button";
       return (
         <Comp
           className={cn(buttonVariants({ variant, size, className }))}
           ref={ref}
           {...props}
         />
       );
     }
   );
   
   Button.displayName = "Button";
   
   export { Button, buttonVariants };
   ```

## Adding and Customizing Components

Once the basic setup is complete, you can add more components as needed:

1. **For Next.js/Vite projects**, use the CLI:

   ```bash
   npx shadcn-ui@latest add [component-name]
   ```

2. **For CRA projects**, manually copy the component code from the [shadcn/ui website](https://ui.shadcn.com/docs/components) or the [GitHub repository](https://github.com/shadcn/ui).

3. **Customize components** by modifying their code directly. Since you own the components, you can change anything from styling to functionality.

## Troubleshooting

### Common Issues in Create React App

1. **PostCSS Processing Errors**:
   - Make sure CRACO is properly configured
   - Ensure the tailwind.config.js file is correctly set up
   - Check that the Tailwind CSS directives are in a separate CSS file

2. **Component Styling Issues**:
   - Verify that Tailwind CSS classes are being processed correctly
   - Check for conflicts with existing CSS/SCSS
   - Ensure the CSS variables in the Tailwind CSS file are properly defined

3. **Import Path Issues**:
   - If using path aliases, make sure they're properly configured in jsconfig.json or tsconfig.json
   - For standard imports, use relative paths (e.g., "../../lib/utils")

### Tips for Coexisting with SCSS

If your project uses SCSS alongside Tailwind CSS (like our project):

1. Keep Tailwind CSS directives in a separate file
2. Import both the Tailwind CSS file and your main SCSS file in index.js
3. Use Tailwind classes for shadcn/ui components
4. Use SCSS for existing components
5. Gradually migrate from SCSS to Tailwind CSS as needed

## Conclusion

shadcn/ui provides a flexible approach to UI components that gives developers full control. By following the steps in this guide, you can successfully integrate shadcn/ui into any React project, including Create React App projects that require additional configuration.

Remember that the key advantage of shadcn/ui is ownership—you can customize the components to fit your exact needs without worrying about dependency updates breaking your UI.

---

*Last updated: April 6, 2025*
