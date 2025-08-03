---
alwaysApply: true
---
Of course. I have analyzed the development rules from your previous monorepo project and reviewed the provided documentation for your current "NSphere" application (`UI.md`, `DATABASE.md`, `PROFILE_AND_ONBOARDING.md`, `technical_documentation.md`, `PROJECTS.md`).

I recognize that this project has a different architecture—a focused Next.js application, not a multi-package monorepo. The rules must reflect this reality, emphasizing its unique challenges and patterns, such as the Solana-based authentication flow and the use of Supabase as a backend service.

Here is a proposed set of development rules, meticulously crafted for the "NSphere" project. It adapts the philosophy of your previous rules to a new context, focusing on clarity, security, and maintainability.

***

# Development & Documentation Protocol: NSphere

**PRIMARY OBJECTIVE:** Your mission is to develop the "NSphere," an exclusive, NFT-gated community platform. You must operate under the project's **"documentation-as-a-guide"** philosophy. The architectural documentation in the markdown files serves as the primary reference for the system's logic and structure. Your code should be a robust implementation of that documented architecture.

---

## 1. Project Architecture Overview

NSphere is a **full-stack Next.js application** using the App Router. It is not a monorepo. Its architecture is built on three pillars:

*   **Next.js Frontend:** The core of the application, located in `src/`, handling UI, routing, and client-side logic.
*   **Supabase Backend:** Provides the database, user authentication (via Web3), and storage. All interactions are managed through a central client (`src/lib/supabaseClient.ts`).
*   **Solana Integration:** Handles NFT-gated access and wallet interactions via the Solana Wallet Adapter.

---

## 2. The Developer's Map: Finding What You Need

Before starting any task, consult this map to locate the relevant code and read the required documentation. Understanding the designated "source of truth" for each domain is critical.

| Concern / Domain | Responsibility | Code Location(s) | Key Documentation |
|:--- |:--- |:--- |:--- |
| **Core App & Pages** | Routing, page structure, main layouts. | `src/app/` | [`technical_documentation.md`](./technical_documentation.md) |
| **UI Components** | Reusable UI elements (Buttons, Cards, Forms). | `src/components/ui/` | [`UI.md`](./UI.md) |
| **Authentication & Session** | Wallet connection, NFT gating, Supabase auth, session state. | `src/context/AuthContext.tsx`<br>`src/lib/nftVerification.ts`<br>`src/hoc/withAuth.tsx` | [`technical_documentation.md`](./technical_documentation.md)<br>[`PROFILE_AND_ONBOARDING.md`](./PROFILE_AND_ONBOARDING.md) |
| **User Profiles & Onboarding** | Creating and managing user data after initial sign-up. | `src/app/onboarding/`<br>`src/app/profile/` | [`PROFILE_AND_ONBOARDING.md`](./PROFILE_AND_ONBOARDING.md) |
| **Project Management** | All CRUD (Create, Read, Update, Delete) operations for projects. | `src/lib/projects.ts`<br>`src/app/projects/`<br>`src/components/ui/ProjectForm.tsx` | [`PROJECTS.md`](./PROJECTS.md)<br>[`DATABASE.md`](./DATABASE.md) |
| **Database & Data Models** | Database schema, table structures, and TypeScript types. | `src/lib/supabaseClient.ts`<br>`src/types/` | [`DATABASE.md`](./DATABASE.md) |

---

## 3. The Development Workflow: A Path to Success

Every change must follow this sequence to ensure quality and consistency.

### Phase 1: Analysis & Planning ("Think Before You Code")

1.  **Clarify the Goal:** Fully understand the user story or bug report.
2.  **Consult the Map & Read:** Use the "Developer's Map" to locate and read all relevant `.md` documentation. For example, a task involving adding a field to a project requires reading `PROJECTS.md` and `DATABASE.md`.
3.  **Review the Code:** Examine the current implementation in the relevant directories identified by the map.
4.  **Identify Discrepancies & ASK:**
    *   **CRITICAL:** Does the implemented logic deviate from the process described in the documentation (e.g., the authentication flow in `technical_documentation.md`)?
    *   Is a component's behavior different from what is described in `UI.md`?
    *   If you find any conflicts or ambiguities, **STOP**. Report the discrepancy. Do not proceed with assumptions. **Example:** *"The `PROJECTS.md` states users can have a maximum of 3 projects, but the check in `ProjectService.createProject` is missing. Should I add it as documented?"*

### Phase 2: Implementation ("Execute with Precision")

1.  **Implement the Logic:** Write clean, readable code that directly reflects the logic and architecture described in the documentation.
2.  **Centralize Data Logic:**
    *   All database operations for **projects** **MUST** go through the `ProjectService` in `src/lib/projects.ts`. Do not call Supabase directly from component files for project data.
    *   All state related to the current user's **authentication status and profile** **MUST** be accessed from `AuthContext`.
3.  **Secure the Application:**
    *   Routes requiring a logged-in user **MUST** be wrapped with the `withAuth` HOC.
    *   Never log sensitive data like wallet addresses or session tokens to the console in production code.
    *   Remember that all core functionality is gated; test features with the assumption that the user is authenticated and has a profile.

### Phase 3: Documentation ("Maintain the Source of Truth")

A task is not "done" until the documentation reflects the new state of the code.

1.  **Update Documentation:** If your code changes the architecture, data flow, or business rules, you **MUST** update the corresponding `.md` file(s). This is not optional.
    *   **Example:** If you add a `twitter_link` to a project, update the data model in `PROJECTS.md` and the schema description in `DATABASE.md`.
2.  **Document New Knowledge:** If you solve a difficult technical problem (e.g., a new issue with the DAS API or Supabase Storage), document the problem and solution in the most relevant `.md` file.

### Phase 4: Verification & Submission ("Present Your Work")

1.  **Self-Review:** Before submitting, re-read the requirements and your code one last time. Does it meet all criteria? Are the docs updated?
2.  **Submit the Pull Request:** Your PR description should be clear and concise. Reference the issue number it resolves. Your PR must contain both code and documentation updates if applicable.

---

## 4. Critical Technical Context & "Gotchas"

This section contains crucial, project-specific information. Read this before starting any development.

### 4.1. The Authentication Gauntlet

*   **Complex Flow:** The authentication process is not a simple email/password login. It is a multi-step flow: **Wallet Connect -> NFT Ownership Check -> Supabase Signature Request -> Session Creation**.
*   **Dependency on DAS API:** The NFT verification in `nftVerification.ts` **requires a custom RPC endpoint** (e.g., Helius, QuickNode) that supports the Digital Asset Standard (DAS) API. The standard public Solana RPC will not work. This is configured via the `NEXT_PUBLIC_RPC_URL` environment variable.
*   **Wallet Interaction Errors:** The `WalletNotSelectedError` can occur if you attempt to connect before a wallet is fully initialized. The `WalletSelection.tsx` component contains logic to handle this, which should be reused and not bypassed.

### 4.2. Onboarding is Not Optional

*   **Mandatory Profile:** After a user authenticates for the first time, the `AuthContext` checks for a profile in the `user_profiles` table.
*   **Forced Redirection:** If no profile exists, the `withAuth` HOC will automatically and immediately redirect the user to the `/onboarding` page. This is important to remember when testing, as you cannot access protected pages like `/profile` or `/projects` with a new wallet until the onboarding form is completed.

### 4.3. Supabase Interaction Patterns

*   **No Raw Database Access from Frontend:** All frontend components should treat `ProjectService` and `AuthContext` as their API for backend data. This encapsulation is intentional and must be respected to ensure consistency and security.
*   **Fixed Storage Policies:** The policies for Supabase Storage are defined in `fixed-storage-policies.sql`. Be aware of these rules when working with file uploads (`ImageUpload.tsx`).

---

## 5. The Golden Rules (Non-Negotiable)

1.  **The Docs are the Guide.** If code and docs disagree, investigate why. Fix the code to match the docs, or get approval to update the docs first.
2.  **Centralize, Don't Scatter.** Use the established services (`ProjectService`) and contexts (`AuthContext`). Do not invent new ways to access data.
3.  **Respect the NFT Gate.** The entire user experience is built for authenticated, NFT-holding members.
4.  **Documentation is Part of "Done."** An undocumented change is an incomplete change. 