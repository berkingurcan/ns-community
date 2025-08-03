# UI Refactor Plan: NSphere

**Objective:** To refactor the UI of the "NSphere" application by upgrading to `shadcn/ui`, adopting a modern and clean design with a minimalist color palette, using `lucide-react` for icons, and implementing the "new" font.

This plan is designed to be comprehensive enough for a junior developer to follow.

---

## Phase 1: Setup and Configuration (The Foundation)

This phase focuses on setting up the necessary tools and configurations for the UI refactor.

### 1.1. Install `shadcn/ui` and Dependencies

*   **Action:** Use the `shadcn/ui` CLI to initialize it in the project.
*   **Command:** `npx shadcn@latest init`
*   **Configuration:**
    *   **Style:** New York
    *   **Base Color:** Zinc
    *   **CSS file:** `src/app/globals.css`
    *   **CSS Variables:** Yes
    *   **`tailwind.config.js`:** `tailwind.config.ts` (or the correct config file)
    *   **Components:** `~/components`
    *   **Utils:** `~/lib/utils`
    *   **React Server Components:** Yes
*   **Verification:** Ensure that `components.json` is created and that `tailwind.config.ts` and `src/app/globals.css` are updated.

### 1.2. Install Icon Library

*   **Action:** Install `lucide-react`.
*   **Command:** `npm install lucide-react`
*   **Verification:** Check that `lucide-react` is added to `package.json`.

### 1.3. Integrate Google Fonts (Maven Pro)

*   **Action:** Update `src/app/layout.tsx` to import and apply the "Maven Pro" font from Google Fonts.
*   **File to Modify:** `src/app/layout.tsx`
*   **Implementation:**
    ```tsx
    import { Maven_Pro } from "next/font/google";

    const mavenPro = Maven_Pro({
      subsets: ["latin"],
      variable: "--font-sans", // Use --font-sans for shadcn/ui
    });

    // In the RootLayout component:
    <html lang="en" className={mavenPro.variable}>
    ```
*   **Verification:** Inspect the application in the browser to confirm that the "Maven Pro" font is being applied.

### 1.4. Configure Tailwind CSS for `shadcn/ui`

*   **Action:** The `shadcn/ui` CLI should automatically update the `tailwind.config.ts` file. Review these changes.
*   **File to Modify:** `tailwind.config.ts` (or the project's tailwind config file)
*   **Implementation:** Ensure the config file includes the following:
    ```typescript
    const config = {
      // ...
      theme: {
        container: {
          center: true,
          padding: "2rem",
          screens: {
            "2xl": "1400px",
          },
        },
        extend: {
          fontFamily: {
            sans: ["var(--font-sans)", ...fontFamily.sans],
          },
          colors: {
            // ... shadcn/ui colors
          },
          // ... other extensions
        },
      },
      plugins: [require("tailwindcss-animate")],
      // ...
    }
    ```
*   **Verification:** The application should run without any Tailwind CSS errors, and `shadcn/ui` components should be styled correctly.

### 1.5. Update `globals.css`

*   **Action:** Clean up the existing `src/app/globals.css` file to remove any styles that will be replaced by `shadcn/ui`'s base styles.
*   **File to Modify:** `src/app/globals.css`
*   **Implementation:** Remove any custom styles for buttons, inputs, cards, etc., that will be handled by `shadcn/ui`. Keep any essential base styles.
*   **Verification:** The application's base styles should be consistent with the new design system.

---

## Phase 2: Component Refactoring (The Core Work)

This phase involves replacing the existing UI components with their `shadcn/ui` equivalents.

### 2.1. Button (`src/components/ui/Button.tsx`)

*   **Action:** Replace the custom `Button.tsx` with the `shadcn/ui` Button component.
*   **`shadcn/ui` Component:** `Button`
*   **Steps:**
    1.  Add the `Button` component using the CLI: `npx shadcn@latest add button`
    2.  Globally search for all instances of the old `<Button>` component.
    3.  Replace them with the new `<Button>` from `~/components/ui/button`.
    4.  Update props: `variant`, `size`, etc., to match `shadcn/ui`'s API.
    5.  Add `lucide-react` icons where appropriate (e.g., `<Button><Plus className="mr-2 h-4 w-4" /> Add Project</Button>`).
*   **Verification:** All buttons in the application should be updated to the new style and function correctly.

### 2.2. Navigation (`src/components/ui/Navigation.tsx`)

*   **Action:** Refactor the navigation bar using `shadcn/ui`'s Navigation Menu or a custom component built with `shadcn/ui` primitives.
*   **`shadcn/ui` Component:** `NavigationMenu` (or custom layout with `Button` and other primitives)
*   **Steps:**
    1.  Add the `NavigationMenu` component: `npx shadcn@latest add navigation-menu`
    2.  Rebuild the navigation bar to be responsive and clean.
    3.  Use `lucide-react` icons for navigation links.
*   **Verification:** The navigation bar should be fully responsive and consistent with the new design.

### 2.3. WalletSelection (`src/components/ui/WalletSelection.tsx`)

*   **Action:** Redesign the wallet selection dialog using `shadcn/ui`'s Dialog or Drawer component.
*   **`shadcn/ui` Component:** `Dialog` or `Drawer`
*   **Steps:**
    1.  Add the `Dialog` component: `npx shadcn@latest add dialog`
    2.  Rebuild the wallet selection UI as a modal.
    3.  Use `lucide-react` icons for each wallet provider.
*   **Verification:** The wallet selection should open in a modal and function correctly.

### 2.4. ProjectCard (`src/components/ui/ProjectCard.tsx`)

*   **Action:** Rebuild the project card using `shadcn/ui`'s Card component.
*   **`shadcn/ui` Component:** `Card`
*   **Steps:**
    1.  Add the `Card` component: `npx shadcn@latest add card`
    2.  Redesign the card layout with `<Card>`, `<CardHeader>`, `<CardContent>`, and `<CardFooter>`.
    3.  Use `lucide-react` icons for actions and links.
*   **Verification:** Project cards should have a clean, modern look.

### 2.5. ProjectForm (`src/components/ui/ProjectForm.tsx`)

*   **Action:** Reconstruct the project form using `shadcn/ui` form components.
*   **`shadcn/ui` Components:** `Input`, `Textarea`, `Label`, `Form`
*   **Steps:**
    1.  Add the necessary form components: `npx shadcn@latest add form input textarea label`
    2.  Rebuild the form using the `Form` component (which uses `react-hook-form`).
    3.  Ensure proper validation and error message display.
*   **Verification:** The form should be visually appealing and fully functional.

### 2.6. ImageUpload (`src/components/ui/ImageUpload.tsx`)

*   **Action:** Replace the custom image upload component with a new one built with `shadcn/ui` components.
*   **`shadcn/ui` Components:** `Input` (type="file"), `Card`, etc.
*   **Steps:**
    1.  Design a user-friendly image upload interface with drag-and-drop support and a preview.
    2.  Use `lucide-react` icons for different states (upload, success, error).
*   **Verification:** Image upload should be intuitive and functional.

### 2.7. StepIndicator (`src/components/ui/StepIndicator.tsx`)

*   **Action:** Re-implement the step indicator using custom components styled with Tailwind CSS, following the `shadcn/ui` design philosophy.
*   **Steps:**
    1.  Create a clean and clear step indicator that fits the new design system.
    2.  Use simple divs and spans, styled with Tailwind CSS.
*   **Verification:** The step indicator should be visually consistent with the rest of the UI.

---

## Phase 3: Final Touches and Cleanup

### 3.1. Review and Refine

*   **Action:** Perform a full review of the application.
*   **Steps:**
    1.  Check for consistency in spacing, typography, and colors.
    2.  Test responsiveness on different screen sizes.
    3.  Make any necessary adjustments.
*   **Verification:** The application should have a polished and professional look and feel.

### 3.2. Remove Old Code

*   **Action:** Once the refactor is complete and verified, remove the old, unused UI component files.
*   **Verification:** The project should not contain any dead code.

### 3.3. Update Documentation

*   **Action:** Update the `UI.md` file.
*   **Steps:**
    1.  Document the new component library and design system.
    2.  Include examples of how to use the new `shadcn/ui` components.
*   **Verification:** The documentation should be up-to-date and helpful for future development.
