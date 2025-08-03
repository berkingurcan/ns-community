# UI Documentation: Project Hub

## Overview

The UI system for Project Hub is built with React components using Tailwind CSS for styling. All components are located in `src/components/ui/` and follow a consistent design pattern focused on the NFT-gated community experience.

## Component Library

### Core Components

#### Button.tsx
**Purpose**: Primary action component used throughout the application
**Props**:
- `children`: Button content
- `onClick`: Click handler
- `disabled`: Disabled state
- `variant`: 'primary' | 'secondary' | 'outline'
- `size`: 'sm' | 'md' | 'lg'

**Usage**:
```tsx
<Button onClick={handleClick} variant="primary">
  Connect Wallet
</Button>
```

#### Navigation.tsx
**Purpose**: Main navigation component with wallet connection
**Features**:
- Wallet connection status display
- Navigation links to protected routes
- Responsive design for mobile/desktop
- Integration with AuthContext

#### WalletSelection.tsx
**Purpose**: Wallet connection interface
**Features**:
- Multiple wallet provider support (Phantom, Solflare, etc.)
- Error handling for connection failures
- Loading states during connection
- Integration with Solana Wallet Adapter

#### ProjectCard.tsx
**Purpose**: Display individual project information
**Props**:
- `project`: Project data object
- `onEdit`: Edit handler
- `onDelete`: Delete handler
- `isOwner`: Whether current user owns the project

**Features**:
- Project image display
- Title and description
- Owner controls (edit/delete)
- Responsive layout

#### ProjectForm.tsx
**Purpose**: Create and edit project form
**Props**:
- `project`: Existing project data (for editing)
- `onSubmit`: Form submission handler
- `onCancel`: Cancel handler

**Features**:
- Image upload integration
- Form validation
- Loading states
- Error handling

#### ImageUpload.tsx
**Purpose**: Image upload component with preview
**Props**:
- `onImageSelect`: Image selection handler
- `currentImage`: Currently selected image
- `accept`: Accepted file types

**Features**:
- Drag and drop support
- Image preview
- File type validation
- Upload progress indication

#### StepIndicator.tsx
**Purpose**: Progress indicator for multi-step processes
**Props**:
- `currentStep`: Current step number
- `totalSteps`: Total number of steps
- `steps`: Array of step labels

**Usage**:
```tsx
<StepIndicator 
  currentStep={2} 
  totalSteps={3} 
  steps={['Connect', 'Verify', 'Complete']} 
/>
```

## Design System

### Color Palette
- **Primary**: Blue tones for main actions and branding
- **Secondary**: Gray tones for secondary elements
- **Success**: Green for positive actions
- **Error**: Red for errors and warnings
- **Background**: Light gray/white for clean appearance

### Typography
- **Headings**: Bold, clear hierarchy
- **Body**: Readable, medium weight
- **Buttons**: Bold, uppercase for primary actions

### Spacing
- Consistent 4px base unit
- Responsive spacing using Tailwind classes
- Proper padding for touch targets (minimum 44px)

### Layout Patterns

#### Card Layout
- Consistent border radius (8px)
- Subtle shadows for depth
- Proper spacing between elements
- Responsive padding

#### Form Layout
- Clear labels and inputs
- Validation error display
- Loading states for submissions
- Proper focus states

#### Navigation Layout
- Fixed header with wallet status
- Responsive mobile menu
- Clear active state indicators

## Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Considerations
- Touch-friendly button sizes
- Simplified navigation
- Optimized form layouts
- Proper keyboard handling

## Accessibility

### Standards
- WCAG 2.1 AA compliance
- Proper ARIA labels
- Keyboard navigation support
- Screen reader compatibility

### Implementation
- Semantic HTML elements
- Proper focus management
- Color contrast compliance
- Alt text for images

## State Management

### Loading States
- Skeleton loaders for content
- Spinner indicators for actions
- Disabled states during operations

### Error States
- Clear error messages
- Retry mechanisms
- Graceful degradation

### Success States
- Confirmation messages
- Visual feedback
- Smooth transitions

## Animation Guidelines

### Transitions
- Smooth 200ms transitions
- Ease-in-out timing
- Consistent across components

### Micro-interactions
- Hover effects on buttons
- Focus states on inputs
- Loading animations

## Component Guidelines

### Naming Conventions
- PascalCase for component names
- Descriptive prop names
- Consistent file naming

### Props Interface
- TypeScript interfaces for all props
- Optional props with defaults
- Proper prop validation

### Styling Approach
- Tailwind CSS classes
- Component-specific styles when needed
- Consistent design tokens

## Integration Patterns

### With Authentication
- Components check auth state via `useAuth()`
- Conditional rendering based on auth status
- Proper loading states during auth checks

### With Data
- Components receive data as props
- Loading states while fetching
- Error handling for failed requests

### With Forms
- Controlled components
- Proper validation
- Error message display
- Success feedback

## Testing Considerations

### Component Testing
- Render without errors
- Props validation
- Event handling
- State changes

### Integration Testing
- Authentication flow
- Form submissions
- Navigation behavior
- Error scenarios

## Performance

### Optimization
- Lazy loading for heavy components
- Memoization for expensive operations
- Efficient re-renders
- Image optimization

### Bundle Size
- Tree shaking for unused components
- Code splitting for routes
- Optimized imports

## Future Considerations

### Scalability
- Component composition patterns
- Theme system for customization
- Design token management
- Component documentation

### Maintenance
- Consistent code style
- Regular dependency updates
- Performance monitoring
- Accessibility audits 