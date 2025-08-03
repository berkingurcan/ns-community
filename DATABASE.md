# Database Documentation: NSphere

## Overview

NSphere uses Supabase as its backend service, providing database, authentication, and storage capabilities. The database schema is designed to support NFT-gated community features with user profiles and project management.

## Database Schema

### Tables

#### users (Supabase Auth)
**Purpose**: Core user authentication table managed by Supabase Auth
**Fields**:
- `id`: UUID (primary key)
- `email`: String (optional, for email notifications)
- `created_at`: Timestamp
- `updated_at`: Timestamp

**Notes**: This table is automatically managed by Supabase Auth system.

#### user_profiles
**Purpose**: Extended user profile information
**Fields**:
- `id`: UUID (primary key, references users.id)
- `wallet_address`: String (Solana wallet address)
- `username`: String (unique display name)
- `shill_yourself`: Text (user biography/self-promotion)
- `avatar_url`: String (profile image URL)
- `discord_id`: String (Discord username)
- `expertises`: String[] (user's areas of expertise)
- `x_handle`: String (X/Twitter handle)
- `github`: String (GitHub username)
- `website_url`: String (personal website URL)
- `created_at`: Timestamp
- `updated_at`: Timestamp

**Constraints**:
- `id` references `users.id` (foreign key)
- `username` must be unique
- `wallet_address` must be unique

#### projects
**Purpose**: User-created projects in the community
**Fields**:
- `id`: UUID (primary key)
- `user_id`: UUID (references user_profiles.id)
- `title`: String (project title)
- `description`: Text (project description)
- `image_url`: String (optional, project image URL)
- `github_url`: String (optional, GitHub repository)
- `live_url`: String (optional, live demo URL)
- `twitter_url`: String (optional, project Twitter)
- `tags`: String[] (project tags/categories)
- `status`: String (enum: 'active', 'archived', 'draft', default: 'draft')
- `created_at`: Timestamp
- `updated_at`: Timestamp

**Constraints**:
- `user_id` references `user_profiles.id` (foreign key)
- `title` is required
- `description` is required

### Storage Buckets

#### project-images
**Purpose**: Store project images
**Configuration**:
- Public access for viewing
- Authenticated users can upload
- Image optimization enabled
- File size limit: 5MB
- Allowed formats: jpg, jpeg, png, webp

#### profile-avatars
**Purpose**: Store user profile avatars
**Configuration**:
- Public access for viewing
- Authenticated users can upload their own avatar
- Image optimization enabled
- File size limit: 2MB
- Allowed formats: jpg, jpeg, png, webp

## Row Level Security (RLS) Policies

### user_profiles
```sql
-- Authenticated users can read all profiles
CREATE POLICY "Authenticated users can view all profiles" ON user_profiles
FOR SELECT TO authenticated USING (true);

-- Authenticated users can only update their own profile
CREATE POLICY "Authenticated users can update own profile" ON user_profiles
FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Authenticated users can only insert their own profile
CREATE POLICY "Authenticated users can insert own profile" ON user_profiles
FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
```

### projects
```sql
-- Authenticated users can read all projects
CREATE POLICY "Authenticated users can view all projects" ON projects
FOR SELECT TO authenticated USING (true);

-- Authenticated users can only create projects for themselves
CREATE POLICY "Authenticated users can insert own projects" ON projects
FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Authenticated users can only update their own projects
CREATE POLICY "Authenticated users can update own projects" ON projects
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Authenticated users can only delete their own projects
CREATE POLICY "Authenticated users can delete own projects" ON projects
FOR DELETE TO authenticated USING (auth.uid() = user_id);
```

## Data Access Patterns

### Service Layer Architecture

All database operations should go through service layers, not direct Supabase calls from components:

#### ProjectService (`src/lib/projects.ts`)
**Methods**:
- `getProjects()`: Fetch all projects
- `getProjectById(id)`: Fetch single project
- `getUserProjects(userId)`: Fetch user's projects
- `createProject(data)`: Create new project
- `updateProject(id, data)`: Update existing project
- `deleteProject(id)`: Delete project

#### AuthContext (`src/context/AuthContext.tsx`)
**Methods**:
- `getUserProfile()`: Fetch current user's profile
- `updateUserProfile(data)`: Update user profile
- `createUserProfile(data)`: Create new user profile

### TypeScript Types

#### Project Type (`src/types/project.ts`)
```typescript
export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url?: string;
  github_url?: string;
  live_url?: string;
  twitter_url?: string;
  tags: string[];
  status: 'active' | 'archived' | 'draft';
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  title: string;
  description: string;
  image_url?: string;
  github_url?: string;
  live_url?: string;
  twitter_url?: string;
  tags: string[];
  status?: 'active' | 'archived' | 'draft';
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}
```

#### User Profile Type
```typescript
export interface UserProfile {
  id: string;
  wallet_address: string;
  username: string;
  shill_yourself?: string;
  avatar_url?: string;
  discord_id?: string;
  expertises?: string[];
  x_handle?: string;
  github?: string;
  website_url?: string;
  created_at: string;
  updated_at: string;
}
```

## Database Operations

### Connection Setup

#### Supabase Client (`src/lib/supabaseClient.ts`)
```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Error Handling

#### Common Error Scenarios
- **Authentication errors**: User not logged in
- **Permission errors**: RLS policy violations
- **Validation errors**: Required fields missing
- **Network errors**: Connection issues

#### Error Recovery
- Retry logic for transient failures
- Graceful degradation for non-critical operations
- User-friendly error messages

### Performance Considerations

#### Query Optimization
- Use indexes on frequently queried fields
- Limit result sets with pagination
- Cache frequently accessed data
- Optimize image storage and delivery

#### Monitoring
- Track query performance
- Monitor storage usage
- Alert on error rates
- Monitor authentication success rates

## Migration Strategy

### Schema Changes
1. Create migration files for schema changes
2. Test migrations in development environment
3. Update TypeScript types to match schema
4. Update service layer methods if needed
5. Deploy with zero-downtime strategy

### Data Migration
- Backup existing data before major changes
- Use Supabase's built-in migration tools
- Test data integrity after migrations
- Update application code to match new schema

## Security Considerations

### Authentication
- All sensitive operations require authentication
- Wallet signature verification for user identity
- Session management through Supabase Auth

### Data Protection
- RLS policies prevent unauthorized access
- Input validation on all user inputs
- SQL injection prevention through parameterized queries
- XSS prevention through proper escaping

### Storage Security
- File type validation for uploads
- File size limits to prevent abuse
- Public read access for images
- Authenticated write access only

## Backup and Recovery

### Backup Strategy
- Automated daily backups
- Point-in-time recovery capability
- Cross-region backup storage
- Regular backup testing

### Recovery Procedures
- Document recovery steps
- Test recovery procedures regularly
- Maintain backup retention policies
- Monitor backup success rates

## Development Guidelines

### Local Development
- Use Supabase CLI for local development
- Set up local database with seed data
- Use environment variables for configuration
- Test with realistic data volumes

### Testing
- Unit tests for service layer methods
- Integration tests for database operations
- Mock Supabase client for component tests
- Test RLS policies thoroughly

### Code Quality
- Use TypeScript for type safety
- Follow consistent naming conventions
- Document complex queries
- Use transactions for multi-step operations 