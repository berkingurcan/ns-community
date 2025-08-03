# Profile & Onboarding Documentation: Project Hub

## Overview

The profile and onboarding system manages user identity after successful NFT-gated authentication. Users must complete onboarding to access the full application features.

## User Profile System

### Profile Data Model

#### UserProfile Interface
```typescript
interface UserProfile {
  id: string;                    // UUID, references users.id
  wallet_address: string;        // Solana wallet address
  username: string;              // Unique display name
  bio?: string;                  // User biography
  avatar_url?: string;           // Profile image URL
  twitter_handle?: string;       // Twitter username
  github_handle?: string;        // GitHub username
  website_url?: string;          // Personal website
  created_at: string;            // Profile creation timestamp
  updated_at: string;            // Last update timestamp
}
```

### Profile Creation Flow

1. **Authentication Success**: User successfully connects wallet and passes NFT verification
2. **Profile Check**: `AuthContext` checks if profile exists in `user_profiles` table
3. **Redirect Logic**: If no profile exists, user is redirected to `/onboarding`
4. **Profile Creation**: User completes onboarding form to create profile
5. **Access Granted**: User can now access protected routes

### Profile Validation Rules

#### Username Requirements
- Must be unique across all users
- 3-20 characters in length
- Alphanumeric characters, hyphens, and underscores only
- Cannot start or end with hyphen/underscore
- Case-insensitive uniqueness check

#### Wallet Address
- Must be valid Solana wallet address format
- Must match the connected wallet address
- Cannot be changed after profile creation

#### Optional Fields
- `bio`: Maximum 500 characters
- `twitter_handle`: Valid Twitter username format (without @)
- `github_handle`: Valid GitHub username format
- `website_url`: Valid URL format

## Onboarding Flow

### Onboarding Page (`/onboarding`)

#### Purpose
- Collect essential user information
- Create user profile in database
- Set up initial user preferences
- Guide user through community guidelines

#### Form Structure
1. **Username Selection**
   - Real-time availability checking
   - Validation feedback
   - Suggestion for unavailable usernames

2. **Profile Information**
   - Bio (optional)
   - Social media handles (optional)
   - Website URL (optional)

3. **Avatar Upload**
   - Image upload with preview
   - File type and size validation
   - Automatic image optimization

4. **Community Guidelines**
   - Display community rules
   - User agreement acceptance
   - Code of conduct acknowledgment

#### Form Validation
- Client-side validation for immediate feedback
- Server-side validation for security
- Real-time username availability check
- Image upload validation

#### Error Handling
- Username already taken
- Invalid image format/size
- Network connection issues
- Database operation failures

### Onboarding Components

#### StepIndicator
- Shows progress through onboarding steps
- Visual feedback for completion status
- Responsive design for mobile/desktop

#### ImageUpload
- Drag and drop functionality
- Image preview with crop options
- File type validation (jpg, png, webp)
- Size limit enforcement (2MB max)

#### Form Validation
- Real-time field validation
- Error message display
- Success state indicators
- Loading states during submission

## Profile Management

### Profile Page (`/profile`)

#### Purpose
- Display current user profile
- Allow profile editing
- Show user's projects
- Manage account settings

#### Features
1. **Profile Display**
   - Avatar and basic information
   - Social media links
   - Member since date
   - Project count

2. **Edit Functionality**
   - Inline editing for bio
   - Avatar update capability
   - Social media handle updates
   - Website URL management

3. **Account Information**
   - Wallet address display
   - Username (read-only)
   - Account creation date
   - Last login information

### Profile Update Flow

#### Edit Mode
- Toggle between view and edit modes
- Form validation for changes
- Real-time save functionality
- Cancel changes option

#### Image Management
- Upload new avatar
- Remove current avatar
- Image cropping interface
- Preview before saving

#### Data Persistence
- Optimistic updates for better UX
- Error handling for failed updates
- Rollback on validation errors
- Success confirmation messages

## Authentication Integration

### AuthContext Integration

#### Profile State Management
```typescript
interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  createProfile: (data: CreateProfileData) => Promise<void>;
  updateProfile: (data: UpdateProfileData) => Promise<void>;
  refreshProfile: () => Promise<void>;
}
```

#### Profile Loading States
- `loading`: Initial profile fetch
- `profile`: Current user profile data
- `error`: Profile loading errors

### Route Protection

#### withAuth HOC
- Checks authentication status
- Verifies profile existence
- Redirects to onboarding if needed
- Handles loading states

#### Protected Route Behavior
1. **Authenticated with Profile**: Allow access
2. **Authenticated without Profile**: Redirect to `/onboarding`
3. **Not Authenticated**: Redirect to `/unauthorized`

## Data Flow

### Profile Creation
1. User completes onboarding form
2. Form data validated client-side
3. Username availability checked
4. Image uploaded to Supabase Storage
5. Profile created in database
6. AuthContext updated with new profile
7. User redirected to main application

### Profile Updates
1. User initiates profile edit
2. Changes validated in real-time
3. Image uploads processed (if applicable)
4. Database updated with new data
5. AuthContext refreshed
6. UI updated with new information

### Error Scenarios
1. **Username Conflict**: Suggest alternatives
2. **Image Upload Failure**: Retry mechanism
3. **Network Issues**: Offline state handling
4. **Validation Errors**: Clear error messages

## Security Considerations

### Data Validation
- Server-side validation for all inputs
- XSS prevention through proper escaping
- SQL injection prevention
- File upload security

### Access Control
- Users can only edit their own profile
- RLS policies enforce data access rules
- Profile data protected by authentication
- Sensitive information not logged

### Privacy Protection
- Wallet addresses displayed securely
- Optional social media handles
- User control over profile visibility
- Data retention policies

## Performance Optimization

### Profile Loading
- Efficient database queries
- Caching of profile data
- Optimistic UI updates
- Lazy loading of profile images

### Image Handling
- Automatic image optimization
- Responsive image sizes
- CDN delivery for fast loading
- Progressive image loading

### Form Performance
- Debounced validation
- Efficient re-renders
- Optimized form state management
- Minimal API calls

## Testing Considerations

### Unit Testing
- Profile validation functions
- Image upload utilities
- Form handling logic
- Error handling scenarios

### Integration Testing
- Complete onboarding flow
- Profile update functionality
- Authentication integration
- Route protection behavior

### User Testing
- Usability testing for onboarding
- Accessibility compliance
- Mobile responsiveness
- Error recovery scenarios

## Future Enhancements

### Planned Features
- Profile verification badges
- Social media integration
- Profile analytics
- Advanced privacy settings

### Scalability Considerations
- Profile data caching
- Image optimization improvements
- Real-time collaboration features
- Advanced search capabilities

## Troubleshooting

### Common Issues
1. **Profile Not Loading**: Check authentication status
2. **Image Upload Fails**: Verify file format and size
3. **Username Unavailable**: Check for exact matches
4. **Onboarding Loop**: Verify profile creation success

### Debug Information
- Authentication state logging
- Profile loading errors
- Form validation failures
- Network request status

### Support Procedures
- Clear error messages for users
- Admin tools for profile management
- Data recovery procedures
- User support documentation 