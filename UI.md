# UI Components and Design System

The project uses a set of reusable React components located in `src/components/ui`. The styling is handled by Tailwind CSS, with a focus on creating a consistent and modern design.

### `Button.tsx`

A versatile button component with customizable variants and sizes.

-   **Props:**
    -   `variant`: `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`
    -   `size`: `default`, `sm`, `lg`, `icon`
    -   `asChild`: Allows rendering the button as a child component (e.g., for use with `next/link`).
-   **Usage:**
    ```tsx
    <Button variant="primary" size="lg">Click me</Button>
    ```

### `ProjectCard.tsx`

Displays a summary of a project in a card format.

-   **Props:**
    -   `project`: The project object to display.
    -   `onEdit`: A function to call when the edit button is clicked.
    -   `onDelete`: A function to call when the delete button is clicked.
    -   `canEdit`: A boolean to show/hide the edit and delete buttons.
-   **Usage:**
    ```tsx
    <ProjectCard project={project} onEdit={handleEdit} />
    ```

### `StepIndicator.tsx`

A component to visualize the steps in a multi-step process (e.g., the authentication flow).

-   **Props:**
    -   `steps`: An array of step objects, each with a `label`, `completed`, and `active` status.
-   **Usage:**
    ```tsx
    <StepIndicator steps={[{ label: 'Step 1', completed: true, active: false }]} />
    ```

### `ImageUpload.tsx`

Handles image uploads with drag-and-drop support, previews, and compression.

-   **Props:**
    -   `currentImageUrl`: The URL of the currently saved image.
    -   `onImageUploaded`: A callback function that receives the URL of the uploaded image.
    -   `onImageRemoved`: A callback function for when the image is removed.
    -   `walletAddress`: The user's wallet address (used for creating unique filenames).
-   **Usage:**
    ```tsx
    <ImageUpload onImageUploaded={handleUpload} walletAddress={address} />
    ```

### `ProjectForm.tsx`

A comprehensive form for creating and editing projects.

-   **Props:**
    -   `project`: The project object to edit (if in edit mode).
    -   `onSubmit`: A function to call when the form is submitted.
    -   `onCancel`: A function to call when the cancel button is clicked.
    -   `isLoading`: A boolean to show a loading state.
-   **Usage:**
    ```tsx
    <ProjectForm onSubmit={handleSubmit} onCancel={handleCancel} />
    ```

### `WalletSelection.tsx`

A comprehensive UI for selecting and connecting to Solana wallets. Supports multiple popular wallets with visual indicators and connection status.

-   **Props:**
    -   `onWalletSelect`: A callback function for when a wallet is selected.
    -   `connected`: A boolean to indicate if a wallet is currently connected.
    -   `className`: Optional additional CSS classes for styling.
-   **Supported Wallets:**
    -   **Popular**: Phantom, Solflare
    -   **Additional**: Backpack, Brave, Coin98, Torus, TokenPocket, MathWallet, SafePal, BitKeep, Ledger
-   **Features:**
    -   Visual wallet icons and descriptions
    -   Connection status indicators
    -   Loading states during connection
    -   Error handling for failed connections
    -   Popular wallet badges
-   **Usage:**
    ```tsx
    <WalletSelection connected={isConnected} onWalletSelect={handleSelect} />
    ```
