# NSphere Collaboration System - Product Requirements Document (PRD)

## 📋 Executive Summary
Implementing a comprehensive collaboration request system that allows project founders to receive, manage, and respond to collaboration requests through an intuitive sidebar interface.

## 🎯 Core Requirements

### **1. Collaboration Request Flow**
- **Requesters**: Can submit collaboration requests with 140-character intro
- **Founders**: Receive requests in right sidebar, can approve/deny/archive
- **Communication**: Discord usernames for external communication
- **Team Limit**: Maximum 5 collaborators per project

### **2. User Experience Flow**
```
1. User sees project → Clicks "Request Collaboration" 
2. Selects collaboration type + writes 140-char intro
3. Founder sees request in sidebar notification
4. Founder can: Accept → Done → Archive OR Deny → Archive
5. If accepted: Discord usernames exchanged for communication
```

---

## 🗄️ Database Schema Design

### **New Tables**

#### **collaboration_requests**
```sql
CREATE TABLE collaboration_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  requester_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  collaboration_type VARCHAR(50) NOT NULL,
  intro_message VARCHAR(140) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, accepted, denied, archived
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  archived_at TIMESTAMPTZ NULL
);
```

#### **project_collaborators** 
```sql
CREATE TABLE project_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  collaborator_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  collaboration_type VARCHAR(50) NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);
```

#### **skill_suggestions**
```sql
CREATE TABLE skill_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,
  skill_name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, approved, denied
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_by UUID REFERENCES user_profiles(id) NULL,
  reviewed_at TIMESTAMPTZ NULL
);
```

### **Updated Tables**

#### **projects** (Add columns)
```sql
ALTER TABLE projects ADD COLUMN category VARCHAR(50) DEFAULT 'other';
ALTER TABLE projects ADD COLUMN collaboration_status VARCHAR(20) DEFAULT 'not-looking';
ALTER TABLE projects ADD COLUMN looking_for_collaboration TEXT[] DEFAULT '{}';
ALTER TABLE projects ADD COLUMN collaboration_description TEXT;
ALTER TABLE projects ADD COLUMN max_collaborators INTEGER DEFAULT 5;
ALTER TABLE projects ADD COLUMN current_collaborators INTEGER DEFAULT 0;
```

#### **user_profiles** (Add Discord field)
```sql
ALTER TABLE user_profiles ADD COLUMN discord_username VARCHAR(100);
```

---

## 🎨 UI/UX Design Specifications

### **1. Project Card Enhancements**
```typescript
// Collaboration Badge on Project Cards
interface CollaborationBadge {
  status: 'open' | 'selective' | 'full' | 'closed';
  emoji: '🤝' | '👀' | '✅' | '🔒';
  spotsLeft: number; // "2/5 spots left"
  types: string[]; // ["Frontend", "Design"]
}
```

### **2. Right Sidebar - Collaboration Requests**
```typescript
interface CollaborationSidebar {
  // Floating notification badge
  unreadCount: number;
  
  // Request items
  requests: {
    id: string;
    requester: {
      username: string;
      avatar: string;
      discordUsername?: string;
    };
    project: {
      title: string;
      id: string;
    };
    collaborationType: string;
    introMessage: string; // max 140 chars
    timeAgo: string;
    status: 'pending' | 'accepted' | 'denied';
  }[];
  
  // Quick actions
  actions: {
    accept: () => void;
    deny: () => void;
    markDone: () => void;
    archive: () => void;
  };
}
```

### **3. Collaboration Request Modal**
```typescript
interface RequestCollaborationModal {
  projectTitle: string;
  availableTypes: CollaborationType[];
  selectedType: string;
  introMessage: string; // 140 char limit with counter
  requesterDiscord: string; // Optional, for easier communication
  submitButton: {
    disabled: boolean;
    text: "Send Collaboration Request";
  };
}
```

---

## 🚀 Technical Implementation Plan

### **Phase 1: Database & Backend (Week 1)**
- [ ] Create new database tables
- [ ] Add collaboration fields to existing tables  
- [ ] Create API endpoints for collaboration requests
- [ ] Implement team size validation (max 5)

### **Phase 2: Core Request System (Week 1-2)**
- [ ] Collaboration request modal
- [ ] Submit collaboration request functionality
- [ ] Basic request management for founders

### **Phase 3: Sidebar Interface (Week 2)**
- [ ] Right sidebar component
- [ ] Real-time notifications
- [ ] Request approval/denial system
- [ ] Archive functionality

### **Phase 4: Project Enhancements (Week 2-3)**
- [ ] Category selection system
- [ ] Collaboration status toggles
- [ ] Enhanced project cards with collaboration info
- [ ] Team size and spots remaining display

### **Phase 5: Skill Management (Week 3)**
- [ ] Skill suggestion system
- [ ] Admin approval interface
- [ ] Dynamic skill categories

### **Phase 6: Polish & Integration (Week 3-4)**
- [ ] Discord username integration
- [ ] Mobile responsive design
- [ ] Real-time updates
- [ ] Testing and bug fixes

---

## 📊 Success Metrics

### **Engagement Metrics**
- Number of collaboration requests sent per week
- Acceptance rate of collaboration requests
- Time from request to response
- Number of active collaborations

### **Quality Metrics**
- Average intro message length utilization
- Repeat collaboration rate
- Project completion rate with collaborators
- User satisfaction with collaboration process

---

## 🔧 Technical Specifications

### **API Endpoints**
```typescript
// Collaboration Requests
POST /api/collaboration/request
GET /api/collaboration/requests/:userId (for founders)
PATCH /api/collaboration/requests/:id/status
DELETE /api/collaboration/requests/:id

// Project Collaborators
GET /api/projects/:id/collaborators
POST /api/projects/:id/collaborators
DELETE /api/projects/:projectId/collaborators/:userId

// Skills Management
POST /api/skills/suggest
GET /api/admin/skills/pending
PATCH /api/admin/skills/:id/approve
```

### **Real-time Features**
- WebSocket connection for instant collaboration request notifications
- Live updates on collaboration status changes
- Real-time collaborator count updates

### **Validation Rules**
- Intro message: 1-140 characters
- Max 5 collaboration requests per user per day
- Max 5 collaborators per project
- Cannot request collaboration on own projects
- Must have Discord username to accept collaborations

---

## 🎯 User Stories

### **As a Project Founder:**
- I want to receive collaboration requests in a dedicated sidebar
- I want to see a 140-character intro from potential collaborators
- I want to quickly approve or deny requests
- I want to see how many collaboration spots I have left
- I want to archive completed collaboration discussions

### **As a Potential Collaborator:**
- I want to easily request collaboration on interesting projects
- I want to write a compelling intro message within 140 characters
- I want to specify what type of collaboration I can offer
- I want to share my Discord username for communication
- I want to see if a project is actively looking for collaborators

### **As an Admin:**
- I want to review and approve new skill suggestions
- I want to categorize skills appropriately
- I want to maintain quality of the skill database

---

## 🛡️ Security & Privacy

### **Privacy Considerations**
- Discord usernames only shared after collaboration acceptance
- Intro messages visible only to project founders
- Collaboration history private between parties
- Option to hide collaboration status

### **Security Measures**
- Rate limiting on collaboration requests
- Validation of all user inputs
- Prevention of spam/abuse
- Moderation tools for inappropriate requests

---

## 📱 Mobile Considerations

### **Mobile UX**
- Bottom sheet for collaboration sidebar on mobile
- Swipe gestures for quick approve/deny
- Optimized intro message input with character counter
- Touch-friendly collaboration type selection

---

This PRD provides the complete foundation for implementing the collaboration system. Ready to start coding?