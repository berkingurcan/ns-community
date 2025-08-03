# Technical Documentation: Project Hub

## Overview

Project Hub is a Next.js 14 application using the App Router, built with TypeScript and integrated with Supabase for backend services and Solana for NFT-gated authentication.

## Architecture

### Core Technologies
- **Frontend**: Next.js 14 with App Router
- **Backend**: Supabase (Database, Auth, Storage)
- **Blockchain**: Solana (NFT verification, wallet integration)
- **Styling**: Tailwind CSS
- **State Management**: React Context (AuthContext)

### Directory Structure
```
src/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Landing page
│   ├── onboarding/        # User onboarding flow
│   ├── profile/           # User profile management
│   ├── projects/          # Project management
│   └── unauthorized/      # Access denied page
├── components/
│   └── ui/               # Reusable UI components
├── context/
│   └── AuthContext.tsx   # Authentication state management
├── hoc/
│   └── withAuth.tsx      # Higher-order component for auth protection
├── lib/
│   ├── supabaseClient.ts # Supabase client configuration
│   ├── nftVerification.ts # Solana NFT verification logic
│   ├── projects.ts       # Project service layer
│   ├── imageUpload.ts    # Image upload utilities
│   └── utils.ts          # General utilities
└── types/
    └── project.ts        # TypeScript type definitions
```

## Authentication Flow

### Multi-Step Authentication Process

1. **Wallet Connection**
   - User selects and connects their Solana wallet
   - Handled by `WalletSelection.tsx` component
   - Uses Solana Wallet Adapter

2. **NFT Ownership Verification**
   - System checks if the connected wallet owns required NFTs
   - Implemented in `src/lib/nftVerification.ts`
   - Requires custom RPC endpoint with DAS API support

3. **Supabase Authentication**
   - Wallet signature is used to authenticate with Supabase
   - Creates or retrieves user session
   - Handled by `AuthContext.tsx`

4. **Profile Verification**
   - Checks if user has completed onboarding
   - Redirects to onboarding if profile is missing
   - Managed by `withAuth.tsx` HOC

### Environment Variables Required
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `NEXT_PUBLIC_RPC_URL`: Custom Solana RPC endpoint (must support DAS API)

## Routing and Page Protection

### Public Routes
- `/` - Landing page
- `/unauthorized` - Access denied page

### Protected Routes
- `/onboarding` - User profile creation
- `/profile` - User profile management
- `/projects` - Project listing and management

All protected routes are wrapped with the `withAuth` HOC, which:
- Verifies user authentication
- Checks for user profile existence
- Redirects to onboarding if profile is missing
- Redirects to unauthorized if not authenticated

## State Management

### AuthContext
The `AuthContext` manages all authentication-related state:
- User authentication status
- Wallet connection state
- User profile data
- Loading states

### Data Flow
1. Components access auth state via `useAuth()` hook
2. Database operations go through service layers (`ProjectService`)
3. UI components remain decoupled from direct database access

## Error Handling

### Common Error Scenarios
- `WalletNotSelectedError`: Wallet not properly initialized
- NFT verification failures: Invalid RPC endpoint or network issues
- Supabase connection errors: Network or configuration issues
- Profile missing: User needs to complete onboarding

### Error Recovery
- Wallet errors: Retry connection with proper initialization
- NFT verification: Ensure custom RPC endpoint is configured
- Profile issues: Redirect to onboarding flow

## Performance Considerations

### Optimization Strategies
- Lazy loading of wallet adapters
- Efficient NFT verification caching
- Optimistic UI updates for better UX
- Image optimization for project uploads

### Security Measures
- No sensitive data in client-side logs
- Proper environment variable usage
- Supabase RLS policies enforcement
- Wallet signature verification

## Development Guidelines

### Code Organization
- Keep components focused and single-purpose
- Use TypeScript for type safety
- Follow Next.js 14 best practices
- Maintain separation between UI and business logic

### Testing Considerations
- Test with authenticated user context
- Mock Solana wallet interactions
- Verify NFT gating functionality
- Test onboarding flow completion

### Deployment Notes
- Ensure all environment variables are set
- Verify custom RPC endpoint availability
- Test NFT verification in production environment
- Monitor Supabase connection health 