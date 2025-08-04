export interface Project {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url?: string;
  github_url?: string;
  live_url?: string;
  twitter_url?: string;
  website_url?: string;
  tags: string[];
  status: 'showcase' | 'NS-Only' | 'Archive' | 'Draft';
  categories: ProjectCategory[];
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
  website_url?: string;
  tags: string[];
  status: 'showcase' | 'NS-Only' | 'Archive' | 'Draft';
  categories: ProjectCategory[];
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
  { id: 'web3-dapp', label: 'Web3 DApp', icon: 'Globe', description: 'Decentralized applications' },
  { id: 'defi', label: 'DeFi Protocol', icon: 'DollarSign', description: 'Decentralized finance' },
  { id: 'nft', label: 'NFT Platform', icon: 'Image', description: 'Non-fungible tokens' },
  { id: 'gaming', label: 'GameFi', icon: 'Gamepad2', description: 'Gaming & NFTs' },
  { id: 'dao', label: 'DAO Tooling', icon: 'Archive', description: 'Governance tools' },
  
  // Infrastructure  
  { id: 'blockchain', label: 'Blockchain', icon: 'Link', description: 'L1/L2 solutions' },
  { id: 'developer-tools', label: 'Developer Tools', icon: 'Hammer', description: 'SDKs, APIs, frameworks' },
  { id: 'wallet', label: 'Wallet', icon: 'Wallet', description: 'Crypto wallets' },
  { id: 'bridge', label: 'Cross-chain', icon: 'Split', description: 'Interoperability' },
  
  // Applications
  { id: 'social', label: 'Social Platform', icon: 'Users', description: 'Web3 social networks' },
  { id: 'marketplace', label: 'Marketplace', icon: 'ShoppingCart', description: 'Trading platforms' },
  { id: 'analytics', label: 'Analytics', icon: 'BarChart', description: 'Data & insights' },
  { id: 'education', label: 'Education', icon: 'GraduationCap', description: 'Learning platforms' },
  { id: 'ai', label: 'AI Integration', icon: 'Bot', description: 'AI-powered tools' },
  
  // Business
  { id: 'saas', label: 'SaaS', icon: 'Cloud', description: 'Software as a service' },
  { id: 'enterprise', label: 'Enterprise', icon: 'Building', description: 'B2B solutions' },
  { id: 'mobile', label: 'Mobile App', icon: 'Smartphone', description: 'Mobile applications' },
  { id: 'other', label: 'Other', icon: 'Sparkles', description: 'Something unique' }
] as const;

export type ProjectCategory = typeof PROJECT_CATEGORIES[number]['id'];

// Collaboration Types
export const COLLABORATION_TYPES = [
  // Technical
  { id: 'frontend-dev', label: 'Frontend Development', icon: 'Laptop', skills: ['React', 'Vue', 'Angular'] },
  { id: 'backend-dev', label: 'Backend Development', icon: 'Settings', skills: ['Node.js', 'Python', 'Rust'] },
  { id: 'blockchain-dev', label: 'Blockchain Development', icon: 'Link', skills: ['Solidity', 'Rust', 'Go'] },
  { id: 'mobile-dev', label: 'Mobile Development', icon: 'Smartphone', skills: ['React Native', 'Flutter', 'Swift'] },
  { id: 'devops', label: 'DevOps & Infrastructure', icon: 'Rocket', skills: ['AWS', 'Docker', 'K8s'] },
  
  // Design & UX
  { id: 'ui-design', label: 'UI/UX Design', icon: 'Palette', skills: ['Figma', 'Sketch', 'Adobe'] },
  { id: 'graphic-design', label: 'Graphic Design', icon: 'Paintbrush', skills: ['Branding', 'Logo', 'Visual'] },
  { id: 'product-design', label: 'Product Design', icon: 'Ruler', skills: ['User Research', 'Prototyping'] },
  
  // Business
  { id: 'product-mgmt', label: 'Product Management', icon: 'ClipboardList', skills: ['Strategy', 'Roadmap', 'Analytics'] },
  { id: 'marketing', label: 'Marketing', icon: 'Megaphone', skills: ['Growth', 'Content', 'SEO'] },
  { id: 'business-dev', label: 'Business Development', icon: 'Handshake', skills: ['Partnerships', 'Sales', 'Strategy'] },
  { id: 'community', label: 'Community Management', icon: 'Users', skills: ['Discord', 'Social', 'Events'] },
  
  // Specialized
  { id: 'tokenomics', label: 'Tokenomics', icon: 'Gem', skills: ['Economics', 'Game Theory', 'DeFi'] },
  { id: 'security', label: 'Security Audit', icon: 'Lock', skills: ['Smart Contracts', 'Penetration Testing'] },
  { id: 'ai-ml', label: 'AI/ML', icon: 'Bot', skills: ['Machine Learning', 'Data Science'] },
  { id: 'content', label: 'Content Creation', icon: 'Feather', skills: ['Writing', 'Video', 'Tutorials'] },
  { id: 'power-user', label: 'Power User/Tester', icon: 'Zap', skills: ['Testing', 'Feedback', 'Bug Reports'] }
] as const;

export type CollaborationType = typeof COLLABORATION_TYPES[number]['id'];

// Collaboration Status
export const COLLABORATION_STATUS = [
  { id: 'not-open', label: 'Not Open for Collaboration', emoji: '🔒', color: 'gray' },
  { id: 'open', label: 'Open for Collaboration', emoji: '🤝', color: 'green' }
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
  categories: ProjectCategory[];
}

// Popular Categories for Quick Edit
export const POPULAR_CATEGORIES = [
  'web3-dapp', 'defi', 'nft', 'gaming', 'dao', 'blockchain', 
  'developer-tools', 'wallet', 'bridge', 'social', 'marketplace',
  'analytics', 'education', 'ai', 'saas', 'enterprise', 'mobile', 'other'
] as const;
