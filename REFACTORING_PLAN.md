# Plan: Refactoring to a Modern UI with Shadcn/ui

This document outlines the step-by-step process for refactoring the project's user interface to use Shadcn/ui, Lucide icons, and a new modern theme.

---

## Phase 1: Setup and Theming

This initial phase lays the foundation for the new design system.

### Step 1.1: Initialize Shadcn/ui

We'll start by integrating Shadcn/ui into the project.

1.  **Run the CLI command:** Open your terminal and run the following command. It will ask you a series of questions.
    ```bash
    npx shadcn-ui@latest init
    ```
2.  **Answer the prompts as follows:**
    *   Would you like to use TypeScript? **Yes**
    *   Which style would you like to use? **Default**
    *   Which color would you like to use as base color? **Slate**
    *   Where is your `global.css` file? **`src/app/globals.css`**
    *   Do you want to use CSS variables for colors? **Yes**
    *   Where is your `tailwind.config.ts` file? **`tailwind.config.ts`**
    *   Configure the import alias for components? **`@/components`**
    *   Configure the import alias for utils? **`@/lib/utils`**
    *   Are you using React Server Components? **Yes**
    *   Write configuration to `components.json`? **Yes**

This will create `components.json`, `lib/utils.ts`, and update your `tailwind.config.ts` and `globals.css` files.

### Step 1.2: Install Lucide Icons

Shadcn/ui components use `lucide-react` for icons.

1.  **Run the CLI command:**
    ```bash
    npm install lucide-react
    ```

### Step 1.3: Apply the New Theme

Now, we'll apply the custom modern theme you provided.

1.  **Open `src/app/globals.css`.**
2.  **Delete all the content** in the file.
3.  **Paste the following code** into `src/app/globals.css`:
    ```css
    @tailwind base;
    @tailwind components;
    @tailwind utilities;

    @layer base {
      :root {
        --radius: 0.65rem;
        --background: oklch(1 0 0);
        --foreground: oklch(0.141 0.005 285.823);
        --card: oklch(1 0 0);
        --card-foreground: oklch(0.141 0.005 285.823);
        --popover: oklch(1 0 0);
        --popover-foreground: oklch(0.141 0.005 285.823);
        --primary: oklch(0.723 0.219 149.579);
        --primary-foreground: oklch(0.982 0.018 155.826);
        --secondary: oklch(0.967 0.001 286.375);
        --secondary-foreground: oklch(0.21 0.006 285.885);
        --muted: oklch(0.967 0.001 286.375);
        --muted-foreground: oklch(0.552 0.016 285.938);
        --accent: oklch(0.967 0.001 286.375);
        --accent-foreground: oklch(0.21 0.006 285.885);
        --destructive: oklch(0.577 0.245 27.325);
        --border: oklch(0.92 0.004 286.32);
        --input: oklch(0.92 0.004 286.32);
        --ring: oklch(0.723 0.219 149.579);
        --chart-1: oklch(0.646 0.222 41.116);
        --chart-2: oklch(0.6 0.118 184.704);
        --chart-3: oklch(0.398 0.07 227.392);
        --chart-4: oklch(0.828 0.189 84.429);
        --chart-5: oklch(0.769 0.188 70.08);
        --sidebar: oklch(0.985 0 0);
        --sidebar-foreground: oklch(0.141 0.005 285.823);
        --sidebar-primary: oklch(0.723 0.219 149.579);
        --sidebar-primary-foreground: oklch(0.982 0.018 155.826);
        --sidebar-accent: oklch(0.967 0.001 286.375);
        --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
        --sidebar-border: oklch(0.92 0.004 286.32);
        --sidebar-ring: oklch(0.723 0.219 149.579);
      }

      .dark {
        --background: oklch(0.141 0.005 285.823);
        --foreground: oklch(0.985 0 0);
        --card: oklch(0.21 0.006 285.885);
        --card-foreground: oklch(0.985 0 0);
        --popover: oklch(0.21 0.006 285.885);
        --popover-foreground: oklch(0.985 0 0);
        --primary: oklch(0.696 0.17 162.48);
        --primary-foreground: oklch(0.393 0.095 152.535);
        --secondary: oklch(0.274 0.006 286.033);
        --secondary-foreground: oklch(0.985 0 0);
        --muted: oklch(0.274 0.006 286.033);
        --muted-foreground: oklch(0.705 0.015 286.067);
        --accent: oklch(0.274 0.006 286.033);
        --accent-foreground: oklch(0.985 0 0);
        --destructive: oklch(0.704 0.191 22.216);
        --border: oklch(1 0 0 / 10%);
        --input: oklch(1 0 0 / 15%);
        --ring: oklch(0.527 0.154 150.069);
        --chart-1: oklch(0.488 0.243 264.376);
        --chart-2: oklch(0.696 0.17 162.48);
        --chart-3: oklch(0.769 0.188 70.08);
        --chart-4: oklch(0.627 0.265 303.9);
        --chart-5: oklch(0.645 0.246 16.439);
        --sidebar: oklch(0.21 0.006 285.885);
        --sidebar-foreground: oklch(0.985 0 0);
        --sidebar-primary: oklch(0.696 0.17 162.48);
        --sidebar-primary-foreground: oklch(0.393 0.095 152.535);
        --sidebar-accent: oklch(0.274 0.006 286.033);
        --sidebar-accent-foreground: oklch(0.985 0 0);
        --sidebar-border: oklch(1 0 0 / 10%);
        --sidebar-ring: oklch(0.527 0.154 150.069);
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

---

## Phase 2: Refactor Core UI Components

In this phase, we will systematically replace our old UI components with new, themeable ones from Shadcn/ui.

### Step 2.1: Button

1.  **Add the Shadcn component:**
    ```bash
    npx shadcn-ui@latest add button
    ```
2.  **Delete the old button component:** Delete the file `src/components/ui/Button.tsx`.
3.  **Update all files** that previously used the old button. You will need to:
    *   Change the import from `@/components/ui/Button` to `@/components/ui/button`.
    *   Update the `variant` and `size` props to match the new component's API (e.g., `variant="outline"`).
    *   Replace all inline SVG icons with icons from `lucide-react` (e.g., `<Plus className="mr-2 h-4 w-4" />`).

    **Files to update:**
    *   `src/app/page.tsx`
    *   `src/app/projects/page.tsx`
    *   `src/components/ui/ProjectCard.tsx`
    *   `src/components/ui/ProjectForm.tsx`

### Step 2.2: Card

1.  **Add the Shadcn component:**
    ```bash
    npx shadcn-ui@latest add card
    ```
2.  **Refactor `ProjectCard.tsx`:**
    *   Open `src/components/ui/ProjectCard.tsx`.
    *   Rewrite the component to use the new `Card` components:
        ```jsx
        import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
        import { Button } from "@/components/ui/button";
        // ... other imports
        ```
    *   Structure the component logically with `CardHeader` for the title, `CardContent` for the main body, and `CardFooter` for action buttons.

### Step 2.3: Form Elements

1.  **Add the Shadcn components:**
    ```bash
    npx shadcn-ui@latest add input
    npx shadcn-ui@latest add textarea
    npx shadcn-ui@latest add select
    npx shadcn-ui@latest add label
    ```
2.  **Refactor `ProjectForm.tsx`:**
    *   Replace the native `<input>`, `<textarea>`, and `<label>` elements with the new imported components.
    *   This will give the form a modern, consistent look that matches the new theme.
3.  **Refactor `page.tsx` (Homepage):**
    *   Update the search input to use the new `<Input />` component.
    *   Update the expertise filter to use the new `<Select />` component, wrapping it with `<SelectTrigger>`, `<SelectContent>`, `<SelectItem>`, etc.

---

## Phase 3: Implement Modern UX Patterns

Now we'll replace jarring browser defaults with smooth, integrated UI patterns.

### Step 3.1: Toasts (Notifications)

This will replace all `alert()` calls.

1.  **Add the Sonner component (a superior toast library):**
    ```bash
    npx shadcn-ui@latest add sonner
    ```
2.  **Add the Toaster to your root layout:**
    *   Open `src/app/layout.tsx`.
    *   Import and add `<Toaster />` inside the `<body>` tag.
        ```jsx
        import { Toaster } from "@/components/ui/sonner";

        export default function RootLayout({ children }) {
          return (
            <html lang="en">
              <body>
                {children}
                <Toaster />
              </body>
            </html>
          );
        }
        ```
3.  **Replace `alert()` calls:**
    *   Go through the codebase (especially `src/app/projects/page.tsx`).
    *   Import `toast` from `sonner`.
    *   Replace calls like `alert("Project created!")` with `toast.success("Project created!")`.
    *   Replace error alerts like `alert("Failed to create project")` with `toast.error("Failed to create project")`.

### Step 3.2: Alert Dialog

This will replace the `window.confirm` for deletions.

1.  **Add the Shadcn component:**
    ```bash
    npx shadcn-ui@latest add alert-dialog
    ```
2.  **Refactor `ProjectCard.tsx` or `ProjectsPage.tsx`:**
    *   In the component that handles deletion, wrap the "Delete" button in an `<AlertDialog>`.
    *   Use `<AlertDialogTrigger>` to open the dialog.
    *   Use `<AlertDialogContent>`, `<AlertDialogTitle>`, `<AlertDialogDescription>`, `<AlertDialogCancel>`, and `<AlertDialogAction>` to build the confirmation prompt.
    *   Attach the `handleDeleteProject` function to the `onClick` of the `<AlertDialogAction>` button.

---

## Phase 4: Final Cleanup

The final step is to remove obsolete code.

1.  **Review `src/components/ui/`:** Delete any component files that are no longer being used (like the old `Button.tsx`).
2.  **Search for Inline SVGs:** Do a global search for `<svg`. If any of these have been replaced by a `lucide-react` icon, remove the old SVG code.
3.  **Code Review:** Do a final pass over the entire application to ensure styling is consistent and there are no visual regressions.

---

This plan provides a clear path to modernizing the application's UI. By following these steps, we will have a more beautiful, consistent, and maintainable user interface. Let's start with Phase 1.
