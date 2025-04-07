Windsurf React Development Guide
Introduction
This guide provides a comprehensive reference for building React applications at Windsurf, focusing on SaaS dashboards and mobile web apps. It outlines best practices for code quality, project structure, accessibility, performance, and maintainability. We also recommend specific tools and patterns – such as a simple state management library, folder architecture, UI component frameworks, and testing strategies – to help intermediate developers create consistent, high-quality applications. Use this document as the canonical guide for starting new projects or onboarding into existing ones.
Guiding Principles
Clarity & Consistency: Write code that is easy to read and maintain. Use clear naming conventions, consistent formatting (we use Prettier/ESLint), and organize code logically so others (or future you) can quickly understand it​
MAYBE.WORKS
. Avoid large, monolithic files – instead, break functionality into focused modules or components.
Separation of Concerns: Keep different concerns of the app decoupled. UI components should focus on presentation, while business logic and side effects (data fetching, state management) live in hooks or utilities​
MAYBE.WORKS
. This makes components simpler, more reusable, and easier to test.
Reusability & DRY: Build reusable components and hooks to avoid duplicating code. If a piece of UI or logic is used in multiple places, abstract it into a shared component or utility. Follow the “single responsibility principle” for components – each should ideally do one thing​
MAYBE.WORKS
.
Accessibility (a11y): Follow Web Content Accessibility Guidelines (WCAG) in all UIs. Use semantic HTML elements (e.g. buttons, nav, headings) and proper ARIA attributes so that the app is usable by people with disabilities​
DEV.TO
. Ensure keyboard navigation works (e.g. tab order, focus management) and provide sufficient color contrast. Accessible code is also easier to test.
Performance: Strive for efficient rendering and loading. Avoid unnecessary re-renders (utilize React.memo, useMemo, etc. appropriately) and split code for lazy loading of heavy pages or features​
MAYBE.WORKS
​
MAYBE.WORKS
. Clean up side effects (e.g. unsubscribe from listeners in useEffect cleanup) and use virtualization for large lists to keep the app responsive.
Maintainability: Organize the project structure so it can scale as the application grows. Group related files together and keep the directory hierarchy logical. We prefer a structure that starts simple but can evolve with the project size. Write self-documenting code and add comments where necessary, especially for complex logic. Regularly update dependencies and refactor any “code smells” to reduce technical debt.
With these principles in mind, let’s dive into specific guidelines for our React projects.
Project Structure and Organization
A well-defined folder structure makes the codebase predictable and easy to navigate​
MAYBE.WORKS
. We organize projects by separating reusable components from feature-specific code, and by isolating different types of modules (components, hooks, context, etc.). For small to medium applications, start with a simple structure and evolve it as needed:
text
Copy
Edit
src/
├── components/        # Reusable UI components (shared across features)
│   ├── Button/
│   │   ├── Button.jsx
│   │   ├── Button.module.scss
│   │   └── Button.test.jsx
│   └── ... other shared components ...
├── pages/             # Page-level components (routing targets)
│   ├── DashboardPage.jsx
│   ├── SettingsPage.jsx
│   └── ... other pages ...
├── features/          # (Optional) Feature-specific modules
│   ├── reports/       # e.g. feature domain "reports"
│   │   ├── ReportsPage.jsx
│   │   ├── ReportList.jsx
│   │   └── hooks/
│   │       └── useReportData.js
│   └── ... other feature folders ...
├── hooks/             # Shared custom hooks (used by multiple components)
├── context/           # Context providers (global state)
├── services/          # Utility modules (API clients, helpers, etc.)
├── App.jsx            # Application root component (routes, providers)
└── index.jsx          # Entry point
Grouping by Feature vs. Reusable Components: We keep truly reusable, presentational components in src/components (often these are low-level UI elements like buttons, form inputs, charts, etc.). Feature-specific components or pages that are not meant to be reused in other contexts should live closer to where they are used – e.g. in a features/<feature> folder or alongside the page that uses them. In other words, use the components/ folder only for reusable UI components, and place each domain-specific component in a feature folder named after its domain​
ROBINWIERUCH.DE
. For example, a UserProfileCard used only on the user settings page could reside in features/user/UserProfileCard.jsx rather than in the global components directory. File Co-location: Within a component or feature folder, keep related files together (component logic, styles, tests). For example, each component can have its own folder with the .jsx file, a .scss (or .module.scss) file for styling, and a test file. This localizes changes and makes it clear which styles/tests belong to which component. Avoid deeply nesting components more than 2 levels to keep structure manageable (if you find components nested too deep, consider flattening by feature or simplifying the hierarchy). Hooks and Context Organization: We separate cross-cutting hooks and context into their own directories for clarity. For instance, a useAuth() hook or a theme context that is used by many parts of the app would go in src/hooks or src/context respectively. However, if a custom hook is only used by one component or one feature, you can keep it near that usage (even in the same file or folder) instead of the global hooks folder. “Hooks which are still only used by one component should remain in that component’s file or a hooks.js file next to the component. Only reusable hooks end up in the shared hooks/ folder.”​
ROBINWIERUCH.DE
. The same logic applies to context providers – if a context is specific to a single feature, you might define it inside that feature module; if it's global (e.g. an authentication context), place it in src/context for app-wide access​
ROBINWIERUCH.DE
. Utilities and Services: Use src/services/ (or utils/) for helper functions and API service modules. These are non-React pure logic pieces (e.g. functions for formatting dates, making API calls, etc.). Keeping them in a separate folder makes it easy to share logic across components, hooks, and contexts without duplication​
ROBINWIERUCH.DE
. For example, an API client module services/api.js could export functions like fetchReports() or updateProfile() which any component or hook can import. If a utility becomes tightly coupled to a specific feature, you can move it into that feature’s folder structure for clarity​
ROBINWIERUCH.DE
. The structure is flexible: we aim to make common logic easily accessible, while keeping feature-specific code encapsulated. By following these structure guidelines, the codebase will remain scalable and maintainable. New developers can quickly find where certain functionality lives, and as the app grows, we can transition from a simple structure to a more feature-oriented architecture without major refactoring​
ROBINWIERUCH.DE
. Next, we'll discuss how we manage state in such a project.
State Management
For global state management in small to medium React apps, we favor simplicity and minimal overhead. We recommend using Zustand (a lightweight state management library) for app-wide state, instead of more complex solutions like Redux. Zustand allows you to create a central store with minimal boilerplate and it avoids the performance pitfalls of React’s Context API (Context tends to trigger re-renders of consumers on every update)​
DEV.TO
​
DEV.TO
. In fact, “while useContext is powerful for simple state sharing in React, Zustand offers a more efficient and scalable solution for managing global state, especially as applications grow”​
DEV.TO
. Why Zustand? Zustand is very lightweight (small bundle) and has an intuitive hook-based API. You can create a store and use it in components without the need for context providers or reducers. It also only causes components to re-render when the specific slice of state they use changes, which is great for performance. This means smoother UI updates compared to a naive Context implementation where many components might re-run on each change. If the app’s global state needs are truly trivial (just a few values), React’s built-in Context API can be used. But in most cases, to keep things consistent, we stick to a single global state pattern with Zustand. It provides a nice middle ground between Context and heavier state libraries. Zustand also supports middleware (like persistence, logging, etc.) if needed, but you can opt into those features gradually. Usage Example: To create a global store with Zustand, define the store in a separate file (e.g. src/state/useStore.js):
jsx
Copy
Edit
// src/state/useStore.js
import { create } from 'zustand';

export const useStore = create((set) => ({
  // define your global state shape and actions
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),
  theme: 'light',
  toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' }))
}));
In a component, you use the hook to access or update state:
jsx
Copy
Edit
import { useStore } from '../state/useStore';

function Profile() {
  const { currentUser, theme, toggleTheme } = useStore((state) => ({
    currentUser: state.currentUser,
    theme: state.theme,
    toggleTheme: state.toggleTheme
  }));

  return (
    <div className={`profile-page theme-${theme}`}>
      <h1>Welcome {currentUser?.name}!</h1>
      <button onClick={toggleTheme}>Switch Theme</button>
    </div>
  );
}
Here, only changes to currentUser or theme will cause the Profile component to re-render. Other state changes in the store won’t unnecessarily trigger this component. This selective subscribing keeps the app snappy. Local State and Contexts: Not all state needs to be global. For state that is confined to a specific component or small part of the UI (e.g. form input states, open/closed toggles for a dropdown), use React’s local state (useState or useReducer). Likewise, for state that is shared only by a specific section of the app, you can use a React Context Provider for just that section. For example, a context to handle the state of a multi-step form wizard can be defined within the feature module for that wizard and used only by the steps. Rule of thumb: use the simplest state solution for the scope you need – local state for one component, context for a small subtree, Zustand for global app state. This keeps state management straightforward and avoids over-engineering. In summary, use Zustand for global state to keep the app state centralized without heavy boilerplate. This aligns with React best practices to choose the right tool for the scope of state​
MAYBE.WORKS
​
MAYBE.WORKS
. By managing state carefully and locally when possible, we also minimize re-renders and ensure better performance.
Routing
For client-side routing, we use React Router (v6 or above) to define pages and handle navigation within our single-page applications. All top-level page components (e.g. Dashboard, Settings, Analytics pages, etc.) live in the src/pages directory (or within feature folders as needed) and are wired up in a central route configuration. Route Configuration: In the App.jsx (or a dedicated Routes.jsx module), we set up the routes using <BrowserRouter> and <Routes>:
jsx
Copy
Edit
// App.jsx (simplified example)
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      {/* You can include context providers or layout components here */}
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />  {/* 404 page */}
      </Routes>
    </BrowserRouter>
  );
}
Each route path corresponds to a page component. We typically include a redirect from / to a main page, and a wildcard route for a 404 Not Found page. For authenticated apps, you might also wrap protected routes in a component that checks for a logged-in user (redirecting to login if not present). Creating a New Page: To add a new page (for example, a Reports page):
Create a React component for the page under src/pages or in a relevant feature folder (e.g. src/pages/ReportsPage.jsx or src/features/reports/ReportsPage.jsx). This component should render the page layout and content. Use a descriptive name ending with “Page” to distinguish it from smaller components.
Import that component into the central route configuration (as shown above) and add a <Route> for it, e.g. <Route path="/reports" element={<ReportsPage />} />.
Now the new page is accessible via its route. Update navigation menus or links in the app to include a link to the new route if appropriate.
We prefer to code-split at the page level for performance. This means using React's lazy loading for page components so that not all pages are bundled on initial load. For example:
jsx
Copy
Edit
import { lazy, Suspense } from 'react';
const ReportsPage = lazy(() => import('./pages/ReportsPage'));

<Route path="/reports" element={
  <Suspense fallback={<div>Loading...</div>}>
    <ReportsPage />
  </Suspense>
} />
By doing this, the Reports page code will only load when the user navigates to /reports, improving initial load time. This is especially beneficial for dashboard apps with many sections – users might not visit all pages every session. Routing Best Practices:
Use meaningful URLs for routes (all lowercase, hyphen-separated if multi-word). This helps with browser history and readability.
Keep route definitions in one place to see the app’s structure at a glance. As the app grows, you can split routes by module (e.g. have a separate ReportsRoutes component) and compose them in the main router.
Manage scroll and focus on navigation. By default, React Router doesn’t scroll to top on route change – consider adding a component that scrolls the window to top when pages switch. Also, for accessibility, set focus to the new page’s main heading or wrapper after navigation. When navigating to a new page in a SPA, it's best practice to set focus to the start of the new page's content—such as an <h1>​
STACKOVERFLOW.COM
. You can achieve this by using a useEffect in page components to focus an h1 or by using React Router’s <Outlet> context to manage focus.
If using modal routes or other advanced patterns, ensure that the URL always reflects the current UI state so that refreshes or direct links work consistently.
For mobile web apps, ensure the routing works with the browser’s back/forward buttons and consider using a library for deep linking if needed.
In summary, routing is handled via React Router, with page components representing each route. We encourage lazy loading pages and taking extra care to handle page transitions accessibly (focus management, announcements). This ensures that navigation in our app is both user-friendly and accessible.
Handling Async Data Fetching
Fetching data from APIs is a common requirement in our SaaS dashboards. We follow patterns that keep data-fetching logic separate from UI components, handle loading/error states gracefully, and ensure our app remains responsive during calls. Here are our best practices and how-to guidelines for async data: Use Services for API Calls: Define all actual HTTP requests in dedicated service modules (for example, in src/services/api.js or divided by feature: services/reportService.js, services/userService.js, etc.). These services use fetch or a library like Axios to call backend endpoints and return promises or processed data. By centralizing API calls, we avoid scattering fetch logic throughout components, making it easier to handle concerns like authentication headers or response shape in one place. For instance:
js
Copy
Edit
// services/reportService.js
export async function fetchReports() {
  const res = await fetch('/api/reports');
  if (!res.ok) throw new Error('Failed to fetch reports');
  return await res.json();
}
Use Custom Hooks for Data Fetching: In components, rather than calling services directly inside useEffect, we often create a custom hook to encapsulate the data fetching logic. For example, a hook useReports might call fetchReports() and manage loading and error state internally:
jsx
Copy
Edit
// hooks/useReports.js
import { useState, useEffect } from 'react';
import { fetchReports } from '../services/reportService';

export function useReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchReports().then(response => {
      if (isMounted) {
        setData(response);
        setError(null);
      }
    }).catch(err => {
      if (isMounted) setError(err);
    }).finally(() => {
      if (isMounted) setLoading(false);
    });
    return () => { isMounted = false };  // cleanup in case component unmounts mid-request
  }, []);  // (dependencies array empty if fetching static list, include deps if dynamic)

  return { data, loading, error };
}
This hook can then be used in a component:
jsx
Copy
Edit
function ReportsPage() {
  const { data: reports, loading, error } = useReports();

  if (loading) return <p>Loading reports...</p>;
  if (error) return <p className="error">Error loading reports: {error.message}</p>;

  return (
    <div>
      <h1>Reports</h1>
      {reports.map(r => <ReportCard key={r.id} report={r} />)}
    </div>
  );
}
By using a hook, we cleanly separate what data we need from how we retrieve it. The component simply consumes the hook’s result (data, loading, error) and renders accordingly. This pattern improves testability (we can unit test the hook’s logic separately) and reuse (the same hook could be used in multiple components or pages that need reports data). State Management for Server Data: We generally treat server-fetched data as remote state that isn't stored in our global Zustand store (unless it’s small and truly global like user profile info). Instead, it's handled via hooks or libraries designed for data fetching. For caching and advanced features, you may integrate a library like React Query or SWR in our projects. These libraries manage caching, stale data, and updates seamlessly. For example, React Query’s useQuery can replace our custom hooks with less code and more features:
jsx
Copy
Edit
import { useQuery } from '@tanstack/react-query';
function ReportsPage() {
  const { data: reports, isLoading, error } = useQuery(['reports'], fetchReports);
  // ... (render logic similar to above)
}
Both React Query and SWR are excellent – React Query offers a richer feature set suitable for complex scenarios (multiple mutations, cache manipulation, pagination), while SWR is lightweight and great for simpler needs. Use SWR for simple use cases like fetching and caching data with minimal configuration. Use React Query for complex use cases requiring advanced cache control, mutations, or pagination.​
DEV.TO
. We can choose one of them based on project complexity; if not needed initially, a custom hook with fetch as shown works fine and we can adopt a library later if patterns repeat. Error Handling and Loading States: Every data fetch should account for three states – loading, success, error. The UI should reflect these (e.g., a spinner or skeleton while loading, an error message if failed, and the content when succeeded). By handling this consistently (our hooks or queries return loading and error flags), we ensure a good user experience and debuggability. Also, handle errors gracefully – log them (and perhaps report to an error tracking service) and show user-friendly messages. Optimizing Data Fetches: Avoid fetching the same data in multiple places independently. If two sibling components need the same data, fetch in a parent component or context and pass it down, or use a shared hook that caches it. If using React Query/SWR, leverage their caching so that a second component requesting the same key will use cached data. Also, clean up or cancel requests when components unmount or parameters change (in our custom hook above, we used an isMounted flag; libraries like React Query handle cancellation automatically). By following these patterns, our data fetching remains predictable and efficient. UI components remain mostly declarative (just rendering data), while the imperative data-fetch logic is contained in hooks/services. This separation also means we could swap the data layer (say, move from REST fetches to WebSockets or gRPC) by only changing the service and hook implementation, without touching most of the UI code.
Styling and UI Components
Our projects use Tailwind CSS (a utility-first CSS framework) alongside SCSS for styling. We also recommend using headless UI component libraries to speed up development of common interactive components while keeping our design consistent. This section covers how to combine Tailwind and SCSS effectively, and how to leverage UI frameworks (like Radix UI or Headless UI) in our React apps.
Using Tailwind CSS with SCSS
Tailwind CSS provides low-level utility classes that we can apply directly in JSX to style elements (e.g. className="p-4 bg-blue-500"). This makes it quick to build UIs without writing a lot of custom CSS. However, we also include SCSS support for cases where structured styles or complex customizations are needed. Here are guidelines for using them together:
When to use SCSS: Use SCSS for global styles (like overriding default body styles, CSS resets, or theming), and for cases that Tailwind doesn’t handle easily (such as very complex responsive layouts, or third-party widget styling). SCSS is also useful if you want to group multiple styles under a semantic class name. For example, you might have a .card class that applies a set of Tailwind utilities via @apply (see below) instead of writing all those classes on every card element.
Avoid Conflicts: Be mindful that a class defined in SCSS might overlap with Tailwind utilities on the same element. For instance, if you have <div class="container bg-blue-500"> and also a .container { background-color: red; } in your CSS, you’ve introduced conflicting styles (blue vs red background)​
MEDIUM.COM
. To avoid such conflicts, prefer using Tailwind’s @apply within your SCSS classes to compose utility classes. For example:
scss
Copy
Edit
/* styles.scss */
.container {
  @apply bg-blue-500 text-white;
  /* now .container class includes Tailwind’s blue background and white text */
}
By doing this, you ensure that the .container class isn’t fighting with a separate Tailwind class – it actually is using the Tailwind style. Using the @apply directive within an SCSS class helps avoid specificity conflicts and allows you to control styling within specific components​
MEDIUM.COM
. Essentially, think of SCSS as a way to bundle Tailwind utilities under meaningful names or to extend them with custom CSS (like focus states, media queries via mixins, etc.).
Structure CSS by Component: We typically use CSS Modules for component-specific styles or scoped SCSS. For example, Button.module.scss can define styles that apply only to the Button component (imported as a module in the component). This prevents any leakage of styles into other parts of the app. If not using CSS modules, follow BEM naming conventions or prefix your custom classes to avoid collisions with Tailwind class names. (Tailwind’s utilities have distinct names, but if you define something generic like .btn in SCSS, ensure it doesn’t clash with a Tailwind class or another library).
Tailwind Configuration: Tailwind is configured via tailwind.config.js. Use it to define any custom colors, spacing, breakpoints, etc. that match our design system. This way, both your JSX classes and SCSS @apply can use the same tokens (for example, if you add a color brandBlue in the config, you can use text-brandBlue in JSX and @apply text-brandBlue in SCSS). Keep the config in sync with SCSS variables if you have any; often, we rely mostly on Tailwind's theme and reduce usage of SCSS variables.
Example – Combining Tailwind with SCSS: Suppose we have a card component that needs a shadow, padding, and some hover effect. We can do this purely with Tailwind classes, but to avoid repeating those classes on multiple elements and to keep JSX cleaner, we create a CSS module:
scss
Copy
Edit
/* Card.module.scss */
.card {
  @apply bg-white shadow-lg rounded-lg p-6;
  transition: transform 0.2s ease-in-out;
}
.card:hover {
  @apply shadow-xl;
  transform: translateY(-2px);
}
Then in Card.jsx:
jsx
Copy
Edit
import styles from './Card.module.scss';
function Card({ children }) {
  return <div className={styles.card}>{children}</div>;
}
Here, .card class is composed of Tailwind utilities (white background, large shadow, rounded corners, padding). We added a custom CSS transition and a hover effect that uses another Tailwind utility. This approach yields a clean component that encapsulates its styling. We didn’t have to come up with new class names for every utility; we just grouped them under a semantic name.
Remember, Tailwind CSS already includes resets and sensible defaults, so you might not need as much global CSS as in a traditional setup. But SCSS is there for structure and advanced styling when needed. Keep most styling decisions in the JSX with Tailwind for speed, and use SCSS to supplement or organize styles logically. (Tailwind’s docs note that using a preprocessor isn’t usually necessary for typical usage​
TAILWINDCSS.COM
, but we maintain SCSS support for flexibility).
UI Component Libraries and Frameworks
To accelerate development and ensure accessibility, we use headless UI libraries for common components like modals, dropdowns, tooltips, and others that have complex behavior. Two recommended libraries are Radix UI and Headless UI:
Radix UI (Primitives): An open-source library of unstyled, accessible React components. “Radix UI provides a set of unstyled, accessible components for building high-quality React applications.”​
SHAXADD.MEDIUM.COM
 These primitives include elements like dialogs, popovers, sliders, etc., which are rigorously tested for accessibility (keyboard navigation, screen reader support) but come without any default styling. Because they are unstyled, we can use Tailwind CSS (or our own SCSS) to style them to match our design system. Using Radix can save a ton of time on functionality while allowing full creative control on appearance. Radix components are designed to be composable and extensible.
Headless UI: A library of completely unstyled components from the makers of Tailwind CSS. As they put it, Headless UI offers “completely unstyled, fully accessible UI components, designed to integrate beautifully with Tailwind CSS.”​
HEADLESSUI.COM
 Headless UI provides primitives like menus, listboxes (selects), modals, etc., specifically tailored to work with React (or Vue) and be styled with Tailwind. For example, Headless UI’s <Menu> component gives you ARIA-compliant keyboard controls and state management for a dropdown, and you add Tailwind classes to render the look you want.
When to use these: Whenever you need a common interactive component that has non-trivial logic (like a dialog with focus trapping, or a combobox with keyboard selection), prefer using Radix UI or Headless UI primitives instead of writing one from scratch. They ensure accessibility out-of-the-box and save development time on edge cases. For instance, a modal built with Radix <Dialog> will automatically handle focus return to the trigger on close, and enforce focus staying within the dialog when open – things that are easy to get wrong if implementing manually. We then apply our styles via Tailwind classes or import a SCSS file to style the modal’s overlay, content, etc. Styling headless components: Since these libraries are unstyled, you will use Tailwind in the JSX of those components. For example, using Headless UI’s Menu might look like:
jsx
Copy
Edit
<Menu as="div" className="relative">
  <Menu.Button className="px-4 py-2 bg-gray-200 rounded">Options</Menu.Button>
  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded">
    <Menu.Item>
      {({ active }) => (
        <a href="/edit" className={`${active ? 'bg-blue-500 text-white' : ''} block px-4 py-2`}>
          Edit
        </a>
      )}
    </Menu.Item>
    ...other items...
  </Menu.Items>
</Menu>
Here, Tailwind classes define the look (background, padding, etc.), while Headless UI handles the behavior (opening/closing, keyboard nav). This pairing works exceptionally well. In fact, Tailwind CSS pairs exceptionally well with Radix/Headless libraries — the unstyled nature of Radix Primitives means you can style your components exactly how you want using Tailwind’s utility classes​
SHAXADD.MEDIUM.COM
. Other UI Frameworks: In some cases, we might consider using pre-built component libraries like Material UI (MUI) or Chakra UI for speed. However, those come with their own styling solutions and can bloat the bundle if we only need a few components. Our preference is to use headless libraries (Radix/Headless) plus Tailwind, which gives us a consistent look and lean code. Another notable project is Shadcn UI, which is essentially a collection of pre-styled components built on Radix Primitives and Tailwind – it can be seen as “Radix with default Tailwind styling.” We can refer to Shadcn’s implementations as examples or even use it if we need a quick start on a component, but generally we maintain control over styling in our SCSS/Tailwind. Building Accessible Components: Even with these tools, always ensure that any custom components we build follow accessibility practices. For example, if we build a custom dropdown without a library, it should use a <button> for the trigger (not a plain div) and an ARIA role of menu for the list, etc. The advantage of Radix and Headless UI is that they handle these details for us. They are “headless” (no styles) but have all the ARIA roles, keyboard handlers, and focus management built-in. Thus, using them means our app’s components will by default adhere to a11y patterns. This saves us from potential bugs and improves user experience. In summary, use Tailwind CSS for the bulk of our styling, adding SCSS where necessary for organization or advanced scenarios. For UI components, leverage headless libraries like Radix UI and Headless UI to build accessible, interactive elements faster. This approach keeps our front-end implementation efficient: we focus on how it should look (Tailwind/SCSS) and let these libraries handle how it should behave. The result is a consistent, accessible design system without re-inventing the wheel each time we need a common component.
Creating New Pages and Components
This section serves as a quick how-to guide for adding new pages or components to the project, following our conventions.
Creating a New Page
When you need to add a new page (a top-level route in the app, for example a new section in the dashboard):
Create the Page Component: In the src/pages directory (or appropriate feature folder), create a new file for the page. Name it clearly, e.g. AnalyticsPage.jsx for an analytics dashboard page. Start with a basic functional component structure:
jsx
Copy
Edit
import React from 'react';

export default function AnalyticsPage() {
  return (
    <main className="analytics-page">
      <h1>Analytics</h1>
      {/* page content goes here */}
    </main>
  );
}
Use a <main> container and a top-level heading (<h1>) inside – this helps with accessibility and document outline. The className on <main> is optional, but you might use it to hook up page-specific styles or just as a selector for tests.
Add Routing: Open the central routing setup (usually in App.jsx or Routes.jsx). Import your new page component and add a <Route> entry for it. For example:
jsx
Copy
Edit
import AnalyticsPage from './pages/AnalyticsPage';
// ...
<Route path="/analytics" element={<AnalyticsPage />} />
Decide the path URL according to our routing guidelines (all lowercase, probably plural if it represents a section). Now the page is part of the app’s navigation. If this page should be protected (requiring login), wrap it with auth logic or place the route under a conditional that checks auth state.
Navigation & Menu: If the app has a sidebar or menu, add a link to this new page so users can find it. For example, in a nav component:
jsx
Copy
Edit
<NavLink to="/analytics">Analytics</NavLink>
Ensure the link text is clear and consider adding an icon if consistent with other menu items.
Load Data (if needed): Does this page need to fetch data on load? If yes, use the patterns in Handling Async Data Fetching: perhaps create a custom hook useAnalyticsData in src/hooks or inside a feature folder, and call it at the top of your page component. Manage loading and error UI states as discussed. If the page needs some context (e.g. it’s part of a Provider), wrap the page component or include the Provider at a higher level.
Style the Page: For page-specific styles, you could use a SCSS file (e.g. AnalyticsPage.module.scss) or simply rely on Tailwind utility classes within the JSX. We usually avoid heavy page-specific CSS; instead compose the page out of components that have their own styles. If needed, define a few Tailwind classes for layout (like using Flexbox or grid utilities for the page layout). Since pages are often composed of many sub-components, ensure you structure it with appropriate containers, e.g., have a section for filters, a section for results, etc., each potentially a sub-component.
Testing the Page: After implementing, navigate to the new route in the browser to verify it renders correctly and integrates with the rest of the app (check that the nav highlight works, etc.). Write a basic Cypress test (see Testing section) to cover that the page loads successfully and important elements appear (like the <h1>).
By following these steps, adding a new page becomes a routine task. The key is to keep the page component itself relatively slim – it should primarily assemble layout and sub-components, call hooks for data, and handle user interactions, while the heavy lifting is done by lower-level components or utilities.
Creating a New Component
When adding a new component (for reuse across the app or as part of a specific feature), follow these guidelines:
Determine the Scope: First, decide if this component is presentational (dumb) or stateful, and whether it will be reused in multiple places.
If it’s a generic UI component (like a button, card, input field, loader, etc.), add it under src/components/ so it can be shared. Possibly create a new folder under components if it’s complex. For example, src/components/StatCard/StatCard.jsx for a dashboard statistic card.
If it’s closely tied to a specific feature or page (e.g. InvoiceTable used only in Billing page), consider placing it in that feature’s folder or alongside the page. This prevents cluttering the global components space with very specific components.
If it’s a very small sub-component used only by one parent, you might even define it inside the parent’s file to start with, and extract later if it grows. But generally, if it's more than a few lines of JSX or used in multiple parents, give it its own file.
Component Implementation: Create the component as a functional component (we use function components exclusively, with React hooks for any state or lifecycle). Define clear props for it. If using TypeScript, define a Props interface/type; if using plain JS, consider PropTypes for runtime checks (optional but good for enforce prop types in JS).
jsx
Copy
Edit
// src/components/StatCard/StatCard.jsx
import React from 'react';
import PropTypes from 'prop-types';
import './StatCard.scss';  // or import styles from './StatCard.module.scss';

export function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="stat-card">
      {Icon && <Icon className="stat-card__icon" aria-hidden="true" />}
      <div className="stat-card__info">
        <span className="stat-card__label">{label}</span>
        <span className="stat-card__value">{value}</span>
      </div>
    </div>
  );
}
StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.elementType // a React component for an icon
};
This example shows a component that displays a label/value pair with an optional icon. We use BEM-like class names in SCSS (or Tailwind utilities) to style it. The PropTypes define the expected props for clarity.
Styles for the Component: If using SCSS, create a corresponding .scss file in the same folder. Name classes with a prefix to avoid conflicts (in BEM style as above, using .stat-card block). Alternatively, use a CSS module to scope the styles. If using Tailwind for all styling, you might not need a CSS file at all – just add classes in the JSX. Choose what makes sense; sometimes a mix is fine (Tailwind for spacing and layout, SCSS for a complex hover effect or media query).
Unit Test (optional but encouraged): If the component contains logic or should behave in a certain way (e.g., a toggle, a form input), write a unit test for it using Jest and React Testing Library. This ensures it works in isolation. For a pure presentational component like StatCard, you might skip detailed tests beyond rendering with props (since it has no internal state or actions). But do test any important conditional rendering (like icon shows only if passed).
Use the Component: Replace any hardcoded markup in pages with your new component. For example, if previously a page had its own stat card markup, use <StatCard label="Users" value={userCount} icon={UserIcon}/> instead. Ensure it integrates well (props are correct, styling matches).
Documentation: If this component is part of a library of components for the project, consider documenting it (could be as simple as a comment at the top, or a Storybook story if we use Storybook). Document any nuances, like “icon prop expects a React component”.
Best Practices for Components:
Keep components focused. Don't cram multiple unrelated functionalities. If a component is more than ~200 lines or hard to describe in one sentence, it might need to be split.
Make components pure whenever possible – i.e., output is determined solely by props. This makes them predictable and testable. Use hooks for local state or effects sparingly and only for component-specific concerns (e.g. toggling a dropdown open state).
Ensure components handle accessibility: if your component is a custom form control, link labels to inputs, add aria-* as needed, etc. (We cover more in the accessibility section).
Reuse existing components inside new ones instead of duplicating logic. For example, if you already have a Button component, use it inside your new component instead of raw <button> to maintain consistency (unless customization is needed).
Name components and their files clearly and consistently. Use PascalCase for component names (e.g. StatCard.jsx exports StatCard). File name should match the component for easy lookup.
Following these steps and tips, adding components becomes a structured process. Over time, we accumulate a library of reusable components that makes building new pages faster (you assemble existing pieces like Lego blocks). And for very feature-specific bits, encapsulating them in their own components still helps keep the larger page or feature code cleaner.
Organizing Hooks, Contexts, and Utilities
As our codebase grows, we will create custom hooks, context providers, and utility functions to abstract reusable logic. Organizing these properly is important for discoverability and maintainability. Here are guidelines and scenarios for organizing these parts: Custom Hooks:
Local vs Shared Hooks: If you write a hook that’s only used by one component or within one feature, you can keep it in the same file or same folder as that component/feature. For example, a useDropdownToggle hook used only inside DropdownMenu.jsx can live in DropdownMenu.jsx or DropdownMenuHooks.js in the same folder. This keeps it local and easy to change along with the component. Once a hook is generic or needed in multiple places, move it to the shared src/hooks/ directory so others can find and use it. Only reusable hooks end up in the hooks/ folder​
ROBINWIERUCH.DE
.
Naming and Structure: Use the useSomething naming convention. In the src/hooks directory, you might group hooks by category if there are many (e.g., useAuth.js, useForm.js, useFeatureX.js). Each file usually exports a single default hook or related hooks. Include a comment explaining what the hook does and how to use it, especially if it’s not obvious.
Examples: A shared hook could be useWindowSize (to get window dimensions and react to resize) or usePrevious (to get previous prop/state value). Those would live in src/hooks/. On the other hand, a useInvoiceForm that’s only relevant in the invoice creation page would live in src/features/invoice/ next to other invoice stuff.
Testing Hooks: Hooks can be tested using React Testing Library’s renderHook or by testing the components that use them. Keep hook logic free of side effects except useEffect internals; that makes them easier to test. If a hook becomes complex, consider if it’s doing too much – maybe split it into smaller hooks or utils.
Context Providers:
Global Contexts: Context is great for providing global-ish data like the current user, theme, or a global socket connection. Those contexts should be defined in src/context/. For each context, we typically have:
A context creation (using React.createContext) with a default value.
A context provider component that wraps children and provides the value.
Optionally, custom hooks to use the context (e.g., useAuth() that returns useContext(AuthContext)). For example, an Auth context: AuthContext.js exports AuthProvider and useAuth. This file resides in src/context/AuthContext.js. We then use <AuthProvider> in App.jsx (at a high level) to wrap our app.
Feature-Specific Context: If only one part of the app needs a context (for instance, a Wizard context that holds state across steps of a multi-step form), you can define that context within the feature folder. Perhaps src/features/checkout/CheckoutContext.js providing cart and checkout info to various checkout step components. It doesn’t need to live in global context directory since it’s not used elsewhere.
Organization and Naming: Keep one context per file to avoid confusion. Name the file and context clearly (e.g., ThemeContext, AuthContext). In src/context/index.js you might re-export all providers for convenience if needed. Also, consider context value shape carefully: avoid putting huge objects or lots of unrelated state in one context, as it will cause re-renders of all consumers when anything changes. It can be better to have multiple contexts (for instance, separate contexts for AuthUser and for AuthPermissions maybe) to fine-tune update spreading.
Instantiation and Usage: “Context needs to get instantiated somewhere, so a dedicated file for it is a best practice, because it needs to be accessible by many components eventually”​
ROBINWIERUCH.DE
. We follow that by centralizing creation in one place. Always use the corresponding useX() hook or Context.Consumer to use context values in components; never directly import the context object to use .Provider outside of its module – that couples components to the context implementation.
Example: In AuthContext.js:
jsx
Copy
Edit
import { createContext, useState, useContext } from 'react';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const login = (userData) => { setUser(userData); };
  const logout = () => { setUser(null); };
  const value = { user, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  return useContext(AuthContext);
}
This gives the rest of the app a simple useAuth() hook to get user or call login/logout. We put the provider in App.jsx so it wraps the component tree (ensuring all children can access it).
Utility Functions:
What goes in Services/Utils: Any pure functions or classes that do not directly involve React and could conceivably be in a separate library. Examples: formatting functions (formatDate()), calculation helpers, adapters to external APIs, or even a simple client for localStorage caching. By isolating them in src/services (or utils), you emphasize that they have no UI and can be tested independently.
Structure: You can categorize utilities by purpose. As seen earlier​
ROBINWIERUCH.DE
​
ROBINWIERUCH.DE
, you might create subfolders like services/format/ for format utilities, services/api/ for API calls, etc. For a small app, a flat services.js file exporting multiple functions might suffice, but as it grows, group them. Ensure to write tests for critical utility functions since they often contain core logic.
Reuse and Coupling: If a utility is tightly coupled to a feature (say a helper that calculates something only relevant in one feature), it can live in that feature’s folder instead to signal its limited use​
ROBINWIERUCH.DE
. We don't want to pollute global utils with one-off logic. However, if there's a chance it could be reused or it's generally useful, put it in services/. Always aim to write them in a generic way so they can be reused.
By following these organization strategies, our hooks, contexts, and utilities will remain neat and discoverable. Developers should be able to guess: “I need to format a date – likely there’s a util in services/format” or “I need to share state between these components – maybe there’s a context or I should create one in src/context”. Consistency is key: place things where we all agree they'll go. And remember to update documentation or the README if you introduce a new significant hook or context so others know it exists.
Writing Accessible and Testable Components
Building components with accessibility and testability in mind from the start will save time and ensure our app can be used by all users and verified with automated tests. Here we outline how to create components that are both a11y-compliant and easy to test. Accessible Component Guidelines:
Semantic HTML First: Use the appropriate HTML elements for the job. This is the foundation of accessibility. For example, use <button> for clickable buttons, <a> for links, <form> for form containers, <label> for form labels, and headings (<h1>.. <h6>) for titles. Avoid using non-semantic elements like <div> or <span> for interactive content. A simple rule: “use semantic elements instead of generic tags – e.g., use <button> for clickable actions instead of a <div> with an onClick handler”​
DEV.TO
. This ensures that browsers and assistive technologies (like screen readers) know how to interpret your component. In React, this also means adding proper props like type="button" on buttons (to avoid form submit behavior when not desired).
ARIA and Roles: When semantics alone aren’t enough, use ARIA attributes to fill the gaps. For instance, if you build a custom component that acts like a checkbox, you might need role="checkbox" and handle aria-checked attributes to convey state to screen readers. Use ARIA attributes judiciously – they should enhance semantic HTML, not replace it​
DEV.TO
​
DEV.TO
. Some common patterns:
aria-label or aria-labelledby to label an element when a visible label is not present.
aria-describedby to point to helper text or error messages for inputs​
DEV.TO
.
aria-live="polite" for regions that update dynamically to announce updates (e.g., form validation errors, or content loaded message) without stealing focus​
DEV.TO
.
role attributes for custom composite components (menus, dialogs, tabs, etc.) if not using a headless library that provides them. E.g., a modal might need role="dialog" and aria-modal="true".
Always ensure that interactive elements have an accessible name (either inner text or an aria-label).
Keyboard Navigation: Every interactive component must be operable via keyboard (typically Tab/Shift+Tab to focus and Enter/Space to activate buttons, arrow keys for menus, etc.). If you use native elements, this is usually automatic (e.g., <button> handles Enter/Space, links handle Enter). If you create something custom (like a clickable card that isn’t a standard link), you should add tabIndex="0" to make it focusable and add key event handlers (e.g., onKeyDown) to respond to Enter or Space as clicks. Our modal dialogs should trap focus inside them when open (Radix/Headless UI do this by default). Ensure focus moves in a logical order – use CSS order or React order appropriately.
Color and Contrast: When styling, use sufficient color contrast for text/background (WCAG AA guidelines – roughly 4.5:1 for normal text). Avoid using color alone to convey meaning (e.g., don’t just highlight an error field in red, also provide an icon or text). Tailwind’s default palette has accessible colors, but if we customize, keep contrast in mind. Also, test dark mode if applicable.
Testing Accessibility: Incorporate accessibility checks into development and testing. Use tools like eslint-plugin-jsx-a11y in development to catch common issues (it will warn if you, say, put an onClick on a div without role, or forget an alt on an image). Additionally, during testing or QA, use Axe (there’s an axe-core integration for Jest or Cypress) to scan pages for issues. Also manually test keyboard navigation and screen reader output for critical flows.
Testable Component Guidelines:
Deterministic Output: For a component to be testable, it should produce predictable output given a state or props. Avoid relying on global variables or timers that make results unpredictable. If your component does use time (like showing current time), consider injecting a clock or using a prop for easier testing.
Isolate Side-Effects: If a component triggers some side effect (like an API call on mount or a navigation on click), try to isolate those in custom hooks or callback props. This way in a unit test you can mock the hook or pass a dummy prop. For instance, a LoginForm component might accept an onSubmit prop. In the app this prop performs a real login call; in tests you can pass a dummy function and just assert it was called with correct arguments when form is submitted.
Use of Data Attributes for E2E: For end-to-end tests (Cypress), include data-cy (or data-test) attributes on important elements so tests can reliably select them. This does not affect users, but it hugely simplifies testing. For example, <button data-cy="login-btn">Login</button>. As the Cypress best practices note: Use data-* attributes to provide context to your selectors and isolate them from CSS or JS changes​
DOCS.CYPRESS.IO
. This means even if the text or styling of the button changes, the test can still find data-cy="login-btn". Use meaningful names for these attributes (matching what the element is or does).
Leverage Testing Library (for Unit/Integration tests): If we write unit tests with React Testing Library, it encourages querying elements by their accessible roles/text (which ties into accessibility). For instance, you use screen.getByRole('button', { name: /login/i }) to find the login button. For this to work, your component needs proper semantics (role=button with accessible name "Login"). This is a virtuous cycle: writing tests with Testing Library will naturally push you towards writing accessible components, since those are easier to select in tests. It’s a good practice to favor getByRole or getByLabelText in tests over querying by test IDs, for unit tests – it’s like an automatic accessibility check.
Avoid Randomness in UI: If your component uses random IDs or generates unique keys (perhaps for accessibility linking, or list keys), try to make them stable or overridable in tests, because randomness can flakify tests. Many libraries allow seeding randomness or you can set explicit id props for consistent behavior.
Logging and Errors: Make sure components handle errors gracefully rather than throwing uncaught exceptions (which would fail tests/crash the app). For example, guard against undefined props or unexpected values with defaultProps or default state. In tests, you can simulate error conditions (like API returning error, etc.) and assert the component shows an error message instead of breaking.
Example – Accessible & Testable Form Input: Suppose we have a custom Input component wrapping a label and input:
jsx
Copy
Edit
// InputField.jsx
export function InputField({ label, id, ...inputProps }) {
  return (
    <div className="input-field">
      <label htmlFor={id} className="input-field__label">{label}</label>
      <input id={id} className="input-field__control" {...inputProps} />
    </div>
  );
}
Usage: <InputField id="email" label="Email" type="email" required />. This ensures the label is tied to the input via id/for, which is accessible. For testability, we can select this field in Testing Library with getByLabelText('Email') and then fire events to type into it. The component is simple and deterministic. If we needed to add an error message, we could do:
jsx
Copy
Edit
{error && <p role="alert" className="input-field__error">{error}</p>}
Using role="alert" on error messages tells assistive tech this is important, and it can be found in tests via getByRole('alert'). In summary: Build components as if someone will use only a keyboard and screen reader – because some will. And build them as if someone will write an automated test for it – because you (or a teammate) will. By adhering to semantic HTML, ARIA guidelines, and by structuring code to be injectable and predictable, we get components that are robust in real-world usage and in our test suite. Accessibility and testability go hand in hand: an accessible component typically exposes the hooks (roles, labels) that tests can latch onto, and a testable component usually has to be well-structured (which tends to improve accessibility). Following these practices ensures our app is inclusive and reliable.
Testing and Cypress E2E
We use Cypress for end-to-end (E2E) testing of our applications. Cypress allows us to simulate real user interactions in a browser and verify the entire app (frontend together with backend or a stubbed backend) works correctly. In addition to Cypress, we use Jest and React Testing Library for unit and integration tests of components and hooks (though this section will focus on E2E structure with Cypress). Test Organization:
Cypress tests live in the cypress/ directory at the root. We organize tests by feature or user flow. Under cypress/e2e/, create subfolders or file prefixes for each major area. For example:
cypress/e2e/auth/login.cy.js – tests for login functionality.
cypress/e2e/dashboard/dashboard.cy.js – tests for the dashboard page.
cypress/e2e/reports/reports.cy.js – tests for reports features. You can also group tests by user story. The goal is to keep test files focused and not too large. Each test file can have multiple it() blocks to cover different scenarios.
Use meaningful names for test cases (it blocks). E.g., it('allows a user to log in and see the dashboard', ...). This acts as documentation of what the app is supposed to do.
Selecting Elements: As mentioned in the previous section, use data attributes for selecting elements in Cypress. Cypress can select by text or CSS selectors, but those are brittle if text changes or styles change. Instead:
Add data-cy (our preferred convention) to critical interactive elements and unique sections. For instance, on important buttons, forms, etc., as <button data-cy="submit-login">Login</button>.
In tests, use cy.get('[data-cy="submit-login"]') to get that element​
DOCS.CYPRESS.IO
. This is resilient to UI changes. Cypress best practices recommend data-* attributes for this purpose​
DOCS.CYPRESS.IO
. Other variations are data-test or data-testid – our team uses data-cy consistently.
For less critical or numerous items (like a list of dynamic items), you can embed an identifier in the data attribute, or select by role/text if stable. But as a rule, prefer data-cy selectors to avoid brittle tests.
We maintain a cheat-sheet of common data-cy names in our tests to ensure consistency (e.g., always use "submit-login" for the login button, not sometimes "login-btn" etc.).
Test Writing Guidelines:
Reset State Between Tests: Each test (it block) should ideally start from a clean state (either the app in initial load or a known state). Do not rely on state (like logged in user or created records) from a previous test, because tests might run isolated or in different order. Use beforeEach() hooks in Cypress to perform common setup, like visiting a certain page or logging in.
Use Cypress Commands for Reusability: Cypress allows defining custom commands in cypress/support/commands.js. We often create commands for repeated actions. For example, a cy.login(email, password) command that fills out the login form and submits. This encapsulates the steps and makes tests more readable. Similarly, cy.createReport() could call an API or UI steps to set up a report.
Stubbing/Fixtures: Decide whether to run tests against a real backend or stub network calls. For critical flows, hitting a real (staging) backend can catch integration issues. However, it makes tests slower and reliant on backend state. Alternatively, use cy.intercept() to stub network responses for faster, deterministic tests. We often use fixture JSON files (in cypress/fixtures) to simulate API responses. For example, stub the reports API to return a known list and then test the UI renders those. This isolates frontend logic. Use stubbing for most tests and reserve a few full integration tests for sanity if needed.
Assertions: Make clear assertions about what should happen. After an action, assert that the expected UI change occurred:
URL changed (use cy.url().should('include', '/dashboard') after login).
An element appears or disappears (cy.get('[data-cy="error-message"]').should('be.visible')).
For form submissions, assert the new data is shown.
Use cy.contains() for text if appropriate, but remember the Cypress guidance: if the text is not critical to the test outcome, prefer data attributes. Use cy.contains for things like "Logout" link (which likely always says "Logout").
Speed and Reliability: E2E tests can be flaky due to timing. Cypress automatically retries commands until a timeout, which helps. Still, be mindful of using proper selectors that only appear when ready. Avoid unnecessary cy.wait() fixed delays; instead wait for UI conditions (like an element visible or network call to finish via cy.intercept().as('call') and cy.wait('@call')). This ensures tests don't race with loading states.
Coverage of Critical Flows: At minimum, write Cypress tests for:
Authentication flow (login, logout, sign-up if applicable).
Core pages loading (dashboard main view).
Each primary user journey (e.g., creating an item, editing it, deleting it – verifying each step).
Navigation (e.g., can navigate via menu to all sections).
Permission or role-based access (if an admin vs normal user sees different things).
Regression tests for bugs fixed in the past (to ensure they stay fixed).
Headless CI: Our CI pipeline should run Cypress tests in headless mode on every pull request or at least on main branch merges. Ensure tests can run headlessly (no .only left in code, no reliance on cy.pause()). Use the Cypress GitHub Action or similar to integrate.
Example Test: A basic login test might look like:
js
Copy
Edit
// cypress/e2e/auth/login.cy.js
describe('Login Flow', () => {
  beforeEach(() => {
    cy.visit('/login');
  });
  it('allows a user to log in with valid credentials', () => {
    cy.get('[data-cy="login-email"]').type('user@example.com');
    cy.get('[data-cy="login-password"]').type('correcthorsebatterystaple');
    cy.get('[data-cy="submit-login"]').click();
    cy.url().should('include', '/dashboard');
    cy.contains('Welcome,').should('be.visible');  // checks dashboard greeting
  });
  it('shows an error message on invalid credentials', () => {
    cy.get('[data-cy="login-email"]').type('user@example.com');
    cy.get('[data-cy="login-password"]').type('wrongpassword');
    cy.get('[data-cy="submit-login"]').click();
    cy.get('[data-cy="login-error"]').should('be.visible')
      .and('contain', 'Invalid credentials');
    cy.url().should('include', '/login');  // still on login page
  });
});
In this test, we used data-cy selectors for inputs and button, and verified outcomes via URL and an error message element. This covers both success and failure scenarios. By structuring tests well and following best practices, our E2E test suite will be maintainable and effective. They act as a safety net as we develop and refactor – if something breaks a core flow, a Cypress test will catch it. Combined with our unit tests for components and hooks, and maybe integration tests for some services, we achieve full confidence in our code. Finally, keep tests updated as features change. It's normal for tests to need adjustment when UI text or behavior changes intentionally – treat test code with similar care as production code. A passing test suite should give us high assurance that the app works as expected for users.
By adhering to the practices in this guide – from project structure and state management to accessibility and testing – we ensure that Windsurf’s React applications are robust, maintainable, and scalable. This README is a living document: as our tools and conventions evolve, update it to reflect the current best practices. All team members should follow these guidelines for a consistent development workflow. Happy coding! 🎉