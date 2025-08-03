# Profile and Onboarding

This document provides a detailed breakdown of the user profile and onboarding flow, explaining how new users are registered and how they can manage their profile information.

## 1. User Profile

### Data Model (`user_profiles` Table)

The `user_profiles` table stores all information related to a user's profile.

-   **`id` (PK, FK to `auth.users.id`):** The primary key, which is a foreign key to the `id` in the `auth.users` table.
-   **`wallet_address` (unique):** The user's Solana wallet address, used as a unique identifier.
-   **`discord_id`:** The user's Discord username.
-   **`shill_yourself`:** A short bio or self-introduction.
-   **`expertises` (array of text):** A list of the user's selected areas of expertise.
-   **`github`:** The user's GitHub username (optional).
-   **`x_handle`:** The user's X (Twitter) handle (optional).

### Frontend Data Management (`AuthContext.tsx`)

-   The `AuthContext` is responsible for fetching and managing the user's profile data.
-   The `userProfile` state in the context holds the profile data for the currently logged-in user.
-   The `hasProfile` state is a boolean that indicates whether a profile exists for the user, which is crucial for the onboarding flow.

## 2. Onboarding Flow

The onboarding process is designed to be seamless for new users, guiding them from their first visit to a complete profile.

1.  **Wallet Connection & Authentication:**
    -   A new user first connects their Solana wallet and authenticates, as described in the main `technical_documentation.md`.

2.  **Profile Check:**
    -   After a successful authentication, the `AuthContext` calls the `checkUserProfile` function.
    -   This function queries the `user_profiles` table to see if a record exists for the user's `wallet_address`.

3.  **Redirection to Onboarding:**
    -   If no profile is found (`hasProfile` is `false`), the `withAuth` HOC (Higher-Order Component) automatically redirects the user to the `/onboarding` page.

4.  **Profile Creation (`/onboarding`):**
    -   The onboarding page contains a form where the user must provide their Discord ID, a short bio ("Shill yourself"), and select their areas of expertise.
    -   Upon submission, a new record is inserted into the `user_profiles` table.

5.  **Completion and Redirection:**
    -   After the profile is successfully created, the `checkUserProfile` function is called again to update the `AuthContext` state.
    -   The user is then redirected to their newly created profile page (`/profile`).

## 3. Profile Management

### Viewing and Editing (`/profile`)

-   The `/profile` page is the central hub for users to view and manage their profile information.
-   **View Mode:** By default, the page displays the user's profile information in a read-only format.
-   **Edit Mode:** Users can click the "Edit Profile" button to switch to an editing mode, where they can update their profile fields.

### `withAuth` HOC (`src/hoc/withAuth.tsx`)

-   The `withAuth` HOC is a critical component for protecting routes and ensuring that only authenticated users with a complete profile can access certain pages.
-   It wraps protected pages (like `/profile` and `/projects`) and performs the following checks:
    -   Is there a valid session?
    -   Does the user have a profile (`hasProfile` is `true`)?
-   If either of these checks fails, the user is redirected to the appropriate page (either the homepage or the onboarding page).
