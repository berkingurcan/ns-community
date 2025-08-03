# Database and Frontend Integrations

This section provides a detailed breakdown of the database schema and how the frontend interacts with it through the `ProjectService` class.

### Data Models (`src/types/project.ts`)

-   **`Project`**: The core data structure for a project, including all fields stored in the database.
-   **`CreateProjectData`**: A subset of the `Project` type used for creating new projects.
-   **`UpdateProjectData`**: A partial `Project` type used for updating existing projects.

### Database Schema

#### `user_profiles` Table
-   **Purpose:** Stores profile information for authenticated users.
-   **Key Columns:**
    -   `id` (PK, FK to `auth.users.id`)
    -   `wallet_address` (unique)
    -   `discord_id`
    -   `expertises` (array of text)

#### `projects` Table
-   **Purpose:** Stores information about user-created projects.
-   **Key Columns:**
    -   `id` (PK)
    -   `user_id` (FK to `user_profiles.id`)
    -   `wallet_address`
    -   `project_name`
    -   `elevator_pitch`
    -   `looking_for` (array of text)

### Frontend-Backend Integration (`src/lib/projects.ts`)

The `ProjectService` class encapsulates all database operations for projects. This class uses the Supabase client to interact with the `projects` table.

#### `ProjectService` Methods

-   **`getUserProjects(walletAddress)`**: Fetches all projects owned by a specific wallet address.
-   **`getAllProjects()`**: Fetches all projects for browsing.
-   **`getPaginatedProjects(page, limit)`**: Fetches a paginated list of projects, used for the main project feed.
-   **`createProject(projectData, walletAddress, userId)`**: Creates a new project. Includes a check to ensure a user does not have more than 3 projects.
-   **`updateProject(projectData, walletAddress)`**: Updates an existing project.
-   **`deleteProject(id, walletAddress)`**: Deletes a project.
-   **`searchProjects(query)`**: Searches for projects by name or description.

### Data Flow Example: Creating a Project

1.  **`ProjectForm.tsx`**: The user fills out the project creation form and clicks "submit".
2.  **`projects/page.tsx`**: The `handleCreateProject` function is called, which then calls `ProjectService.createProject()`.
3.  **`ProjectService.createProject()`**:
    -   First, it calls `getUserProjects()` to check if the user is allowed to create a new project.
    -   If allowed, it inserts the new project data into the `projects` table using `supabase.from('projects').insert(...)`.
4.  **UI Update:**
    -   After the project is created, the `loadUserProjects` function is called to refresh the list of projects, and the UI is updated to show the newly created project.
