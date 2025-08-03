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
