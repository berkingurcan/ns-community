# Projects

This document provides a detailed breakdown of the project management and discovery features of the application.

## 1. Project Data Model (`src/types/project.ts`)

The `Project` interface is the core data structure for projects in the application.

-   **`id` (string):** The unique identifier for the project.
-   **`user_id` (string):** The ID of the user who created the project.
-   **`wallet_address` (string):** The wallet address of the project creator.
-   **`project_name` (string):** The name of the project.
-   **`elevator_pitch` (string):** A short description of the project.
-   **`links` (string[]):** An array of URLs related to the project.
-   **`founders` (string[]):** An array of the project's founders.
-   **`looking_for` (string[]):** An array of expertise areas the project is looking for.
-   **`logo_url` (string, optional):** A URL for the project's logo.
-   **`created_at` (string):** The timestamp of when the project was created.

## 2. Project Management (`/projects`)

The `/projects` page is the central hub for users to manage their own projects.

### Project Creation
-   Users can create a new project using the `ProjectForm.tsx` component.
-   **Validation:** The form requires a project name, elevator pitch, and at least one founder.
-   **Limit:** Users are limited to creating a maximum of 3 projects.

### Project Editing
-   Users can edit their existing projects. The `ProjectForm.tsx` component is pre-filled with the existing project data.
-   All fields, including the project logo, can be updated.

### Project Deletion
-   Users can delete their projects. A confirmation dialog is shown to prevent accidental deletions.

## 3. Project Discovery (Homepage)

The homepage serves as the main discovery feed for all projects in the community.

### Paginated View
-   Projects are displayed in a paginated grid, showing 9 projects per page.
-   Users can navigate between pages using "Next" and "Previous" buttons.

### Search and Filtering
-   **Search:** A search bar allows users to find projects by name, description, or founder.
-   **Filter:** Users can filter projects by expertise areas to find projects that are looking for specific skills.

## 4. Data Flow: Creating and Displaying a Project

1.  **Creation:**
    -   The user fills out the `ProjectForm.tsx` and submits it.
    -   The `handleCreateProject` function in `src/app/projects/page.tsx` calls `ProjectService.createProject()`.
    -   `ProjectService` inserts the new project data into the `projects` table in the database.

2.  **Display:**
    -   On the homepage, the `loadProjects` function calls `ProjectService.getPaginatedProjects()`.
    -   This function fetches a paginated list of projects from the database.
    -   The projects are then displayed in a grid of `ProjectCard.tsx` components.
