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
  status: 'showcase' | 'NS-Only' | 'Archive' | 'Draft';
  category: ProjectCategory;
  collaboration_status: CollaborationStatus;
  looking_for_collaboration: CollaborationType[];
  collaboration_description?: string;
  max_collaborators: number;
  current_collaborators: number;
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
  status: 'showcase' | 'NS-Only' | 'Archive' | 'Draft';
  category: ProjectCategory;
  collaboration_status: CollaborationStatus;
  looking_for_collaboration: CollaborationType[];
  collaboration_description?: string;
  max_collaborators: number;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {
  id: string;
}

export const EXPERTISE_OPTIONS = [
  'Software Architecture',
  'Blockchain Development',  
  'UI/UX Design',
  'Product Management',
  'Marketing',
  'Community Management',
  'Business Development',
  'AI/ML',
  'Cybersecurity',
  'Legal/Compliance',
  'Finance/Tokenomics',
  'Content Creation',
] as const;

export type Expertise = typeof EXPERTISE_OPTIONS[number];

// ========== NEW COLLABORATION SYSTEM TYPES ==========

// Project Categories
export const PROJECT_CATEGORIES = [
  // Core Development
  { id: 'web3-dapp', label: 'Web3 DApp', emoji: '🌐', description: 'Decentralized applications' },
  { id: 'defi', label: 'DeFi Protocol', emoji: '💰', description: 'Decentralized finance' },
  { id: 'nft', label: 'NFT Platform', emoji: '🖼️', description: 'Non-fungible tokens' },
  { id: 'gaming', label: 'GameFi', emoji: '🎮', description: 'Gaming & NFTs' },
  { id: 'dao', label: 'DAO Tooling', emoji: '🏛️', description: 'Governance tools' },
  
  // Infrastructure  
  { id: 'blockchain', label: 'Blockchain', emoji: '⛓️', description: 'L1/L2 solutions' },
  { id: 'developer-tools', label: 'Developer Tools', emoji: '🛠️', description: 'SDKs, APIs, frameworks' },
  { id: 'wallet', label: 'Wallet', emoji: '👛', description: 'Crypto wallets' },
  { id: 'bridge', label: 'Cross-chain', emoji: '🌉', description: 'Interoperability' },
  
  // Applications
  { id: 'social', label: 'Social Platform', emoji: '👥', description: 'Web3 social networks' },
  { id: 'marketplace', label: 'Marketplace', emoji: '🛒', description: 'Trading platforms' },
  { id: 'analytics', label: 'Analytics', emoji: '📊', description: 'Data & insights' },
  { id: 'education', label: 'Education', emoji: '🎓', description: 'Learning platforms' },
  { id: 'ai', label: 'AI Integration', emoji: '🤖', description: 'AI-powered tools' },
  
  // Business
  { id: 'saas', label: 'SaaS', emoji: '☁️', description: 'Software as a service' },
  { id: 'enterprise', label: 'Enterprise', emoji: '🏢', description: 'B2B solutions' },
  { id: 'mobile', label: 'Mobile App', emoji: '📱', description: 'Mobile applications' },
  { id: 'other', label: 'Other', emoji: '✨', description: 'Something unique' }
] as const;

export type ProjectCategory = typeof PROJECT_CATEGORIES[number]['id'];

// Collaboration Types
export const COLLABORATION_TYPES = [
  // Technical
  { id: 'frontend-dev', label: 'Frontend Development', emoji: '💻', skills: ['React', 'Vue', 'Angular'] },
  { id: 'backend-dev', label: 'Backend Development', emoji: '⚙️', skills: ['Node.js', 'Python', 'Rust'] },
  { id: 'blockchain-dev', label: 'Blockchain Development', emoji: '⛓️', skills: ['Solidity', 'Rust', 'Go'] },
  { id: 'mobile-dev', label: 'Mobile Development', emoji: '📱', skills: ['React Native', 'Flutter', 'Swift'] },
  { id: 'devops', label: 'DevOps & Infrastructure', emoji: '🚀', skills: ['AWS', 'Docker', 'K8s'] },
  
  // Design & UX
  { id: 'ui-design', label: 'UI/UX Design', emoji: '🎨', skills: ['Figma', 'Sketch', 'Adobe'] },
  { id: 'graphic-design', label: 'Graphic Design', emoji: '🖌️', skills: ['Branding', 'Logo', 'Visual'] },
  { id: 'product-design', label: 'Product Design', emoji: '📐', skills: ['User Research', 'Prototyping'] },
  
  // Business
  { id: 'product-mgmt', label: 'Product Management', emoji: '📋', skills: ['Strategy', 'Roadmap', 'Analytics'] },
  { id: 'marketing', label: 'Marketing', emoji: '📢', skills: ['Growth', 'Content', 'SEO'] },
  { id: 'business-dev', label: 'Business Development', emoji: '🤝', skills: ['Partnerships', 'Sales', 'Strategy'] },
  { id: 'community', label: 'Community Management', emoji: '👥', skills: ['Discord', 'Social', 'Events'] },
  
  // Specialized
  { id: 'tokenomics', label: 'Tokenomics', emoji: '💎', skills: ['Economics', 'Game Theory', 'DeFi'] },
  { id: 'security', label: 'Security Audit', emoji: '🔒', skills: ['Smart Contracts', 'Penetration Testing'] },
  { id: 'ai-ml', label: 'AI/ML', emoji: '🤖', skills: ['Machine Learning', 'Data Science'] },
  { id: 'content', label: 'Content Creation', emoji: '✍️', skills: ['Writing', 'Video', 'Tutorials'] },
  { id: 'power-user', label: 'Power User/Tester', emoji: '⚡', skills: ['Testing', 'Feedback', 'Bug Reports'] }
] as const;

export type CollaborationType = typeof COLLABORATION_TYPES[number]['id'];

// Collaboration Status
export const COLLABORATION_STATUS = [
  { id: 'not-looking', label: 'Not Looking', emoji: '🔒', color: 'gray' },
  { id: 'open', label: 'Open for Collaboration', emoji: '🤝', color: 'green' },
  { id: 'selective', label: 'Selective Collaboration', emoji: '👀', color: 'yellow' },
  { id: 'team-full', label: 'Team Complete', emoji: '✅', color: 'blue' }
] as const;

export type CollaborationStatus = typeof COLLABORATION_STATUS[number]['id'];

// Collaboration Request Interface
export interface CollaborationRequest {
  id: string;
  project_id: string;
  requester_id: string;
  collaboration_type: CollaborationType;
  intro_message: string; // max 140 characters
  status: 'pending' | 'accepted' | 'denied' | 'archived';
  created_at: string;
  updated_at: string;
  archived_at?: string;
  // Joined data
  requester?: {
    id: string;
    username: string;
    avatar_url?: string;
    discord_username?: string;
  };
  project?: {
    id: string;
    title: string;
    user_id: string;
  };
}

// Project Collaborator Interface
export interface ProjectCollaborator {
  id: string;
  project_id: string;
  collaborator_id: string;
  collaboration_type: CollaborationType;
  joined_at: string;
  is_active: boolean;
  // Joined data
  collaborator?: {
    id: string;
    username: string;
    avatar_url?: string;
    discord_username?: string;
  };
}

// Skill Suggestion Interface
export interface SkillSuggestion {
  id: string;
  user_id: string;
  skill_name: string;
  category: string;
  status: 'pending' | 'approved' | 'denied';
  created_at: string;
  reviewed_by?: string;
  reviewed_at?: string;
  // Joined data
  user?: {
    id: string;
    username: string;
  };
}

// Create Collaboration Request Data
export interface CreateCollaborationRequestData {
  project_id: string;
  collaboration_type: CollaborationType;
  intro_message: string;
}

// Quick Edit Modal Data
export interface QuickEditData {
  status: Project['status'];
  collaboration_status: CollaborationStatus;
  looking_for_collaboration: CollaborationType[];
  category: ProjectCategory;
}
