export interface Project {
  id: string;
  user_id: string;
  wallet_address: string;
  project_name: string;
  elevator_pitch: string;
  links: string[];
  founders: string[];
  looking_for: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  project_name: string;
  elevator_pitch: string;
  links: string[];
  founders: string[];
  looking_for: string[];
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