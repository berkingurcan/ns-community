'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import withAuth from '@/hoc/withAuth';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { CollaborationRequestModal } from '@/components/ui/CollaborationRequestModal';
import { CollaborationSidebar } from '@/components/ui/CollaborationSidebar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Project, 
  CollaborationRequest, 
  CreateCollaborationRequestData,
  PROJECT_CATEGORIES,
  COLLABORATION_TYPES,
  ProjectCategory,
  CollaborationType
} from '@/types/project';

import { toast } from 'sonner';
import { 
  Users, 
  Sparkles, 
  Target, 
  MessageSquare, 
  Settings,
  RefreshCw
} from 'lucide-react';

// Mock project data for demo
const createMockProjects = (userId: string): Project[] => [
  {
    id: '1',
    user_id: userId,
    title: 'DeFi Dashboard Analytics',
    description: 'A comprehensive dashboard for tracking DeFi protocols, yield farming opportunities, and portfolio analytics. Built with React, TypeScript, and integrated with multiple DeFi APIs.',
    image_url: '',
    github_url: 'https://github.com/example/defi-dashboard',
    live_url: 'https://defi-dashboard.example.com',
    twitter_url: 'https://twitter.com/defidashboard',
    tags: ['DeFi', 'Analytics', 'React', 'TypeScript', 'Web3'],
    status: 'showcase',
    categories: ['defi'] as ProjectCategory[],
    collaboration_status: 'open',
    looking_for_collaboration: ['frontend-dev', 'ui-design', 'marketing'] as CollaborationType[],
    max_collaborators: 5,
    current_collaborators: 2,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    user_id: 'other-user-1',
    title: 'NFT Marketplace',
    description: 'A decentralized NFT marketplace with advanced filtering, bidding system, and creator royalties. Features include lazy minting, IPFS storage, and multi-chain support.',
    image_url: '',
    github_url: 'https://github.com/example/nft-marketplace',
    live_url: 'https://nft-marketplace.example.com',
    twitter_url: '',
    tags: ['NFT', 'Marketplace', 'Solidity', 'Next.js', 'IPFS'],
    status: 'showcase',
    categories: ['nft'] as ProjectCategory[],
    collaboration_status: 'open',
    looking_for_collaboration: ['blockchain-dev', 'security', 'ui-design'],
    // collaboration_description: 'Seeking experienced Solidity developers and security auditors.',
    max_collaborators: 3,
    current_collaborators: 1,
    created_at: '2024-01-10T14:30:00Z',
    updated_at: '2024-01-10T14:30:00Z'
  },
  {
    id: '3',
    user_id: 'other-user-2',
    title: 'DAO Governance Tool',
    description: 'A comprehensive governance platform for DAOs with proposal creation, voting mechanisms, treasury management, and member onboarding flows.',
    image_url: '',
    github_url: 'https://github.com/example/dao-governance',
    live_url: '',
    twitter_url: 'https://twitter.com/daogovernance',
    tags: ['DAO', 'Governance', 'Voting', 'Treasury', 'Web3'],
    status: 'Draft',
    categories: ['dao'] as ProjectCategory[],
    collaboration_status: 'open',
    looking_for_collaboration: ['product-mgmt', 'frontend-dev', 'community', 'tokenomics'],
    // collaboration_description: 'Building the future of DAO governance! Join our mission.',
    max_collaborators: 5,
    current_collaborators: 0,
    created_at: '2024-01-12T09:15:00Z',
    updated_at: '2024-01-12T09:15:00Z'
  },
  {
    id: '4',
    user_id: 'other-user-3',
    title: 'Cross-Chain Bridge',
    description: 'A secure and efficient cross-chain bridge supporting multiple networks including Ethereum, Polygon, BSC, and Arbitrum. Features instant swaps and LP rewards.',
    image_url: '',
    github_url: '',
    live_url: 'https://bridge.example.com',
    twitter_url: '',
    tags: ['Bridge', 'Cross-chain', 'DeFi', 'Security', 'Ethereum'],
    status: 'showcase',
    categories: ['bridge'] as ProjectCategory[],
    collaboration_status: 'not-open',
    looking_for_collaboration: [],
    max_collaborators: 4,
    current_collaborators: 4,
    created_at: '2024-01-08T16:45:00Z',
    updated_at: '2024-01-08T16:45:00Z'
  },
  {
    id: '5',
    user_id: 'other-user-4',
    title: 'AI-Powered Trading Bot',
    description: 'Machine learning-based trading bot for cryptocurrency markets with real-time analysis, risk management, and portfolio optimization features.',
    image_url: '',
    github_url: 'https://github.com/example/ai-trading-bot',
    live_url: '',
    twitter_url: '',
    tags: ['AI/ML', 'Trading', 'Python', 'Data Analysis', 'Crypto'],
    status: 'NS-Only',
    categories: ['ai'] as ProjectCategory[],
    collaboration_status: 'open',
    looking_for_collaboration: ['ai-ml', 'backend-dev', 'devops'],
    max_collaborators: 3,
    current_collaborators: 1,
    created_at: '2024-01-05T11:20:00Z',
    updated_at: '2024-01-05T11:20:00Z'
  }
];

const CollaborationDemoPage = () => {
  const { userProfile } = useAuth();
  const [mockProjects, setMockProjects] = useState<Project[]>([]);
  const [collaborationRequests, setCollaborationRequests] = useState<CollaborationRequest[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);



  useEffect(() => {
    if (userProfile) {
      setMockProjects(createMockProjects(userProfile.id));
    }
  }, [userProfile]);

  const handleRequestCollaboration = async (data: CreateCollaborationRequestData) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real app, this would call CollaborationService.createCollaborationRequest(data)
      const mockRequest: CollaborationRequest = {
        id: `req-${Date.now()}`,
        project_id: data.project_id,
        requester_id: userProfile?.id || '',
        collaboration_type: data.collaboration_type,
        intro_message: data.intro_message,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        requester: {
          id: userProfile?.id || '',
          username: userProfile?.username || 'You',
          avatar_url: userProfile?.avatar_url,
          discord_username: userProfile?.discord_id
        },
        project: mockProjects.find(p => p.id === data.project_id) ? {
          id: data.project_id,
          title: mockProjects.find(p => p.id === data.project_id)?.title || '',
          user_id: mockProjects.find(p => p.id === data.project_id)?.user_id || ''
        } : undefined
      };

      setCollaborationRequests(prev => [mockRequest, ...prev]);
      toast.success('Collaboration request sent! 🎉');
      
    } catch (error: unknown) {
      toast.error('Failed to send collaboration request');
      console.error('Request error:', error);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCollaborationRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'accepted' as const, updated_at: new Date().toISOString() }
            : req
        )
      );
      
      toast.success('Collaboration request accepted! 🤝');
    } catch (error: unknown) {
      toast.error('Failed to accept request');
      console.error('Accept request error:', error);
    }
  };

  const handleDenyRequest = async (requestId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCollaborationRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status: 'denied' as const, updated_at: new Date().toISOString() }
            : req
        )
      );
      
      toast.success('Request declined');
    } catch (error: unknown) {
      toast.error('Failed to decline request');
      console.error('Deny request error:', error);
    }
  };

  const handleArchiveRequest = async (requestId: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setCollaborationRequests(prev => 
        prev.filter(req => req.id !== requestId)
      );
      
      toast.success('Request archived');
    } catch (error: unknown) {
      toast.error('Failed to archive request');
      console.error('Archive request error:', error);
    }
  };

  const handleQuickEdit = async (projectId: string, updates: Partial<Project>) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the project in the mock data
      setMockProjects(prev => 
        prev.map(project => 
          project.id === projectId 
            ? { ...project, ...updates }
            : project
        )
      );
      
      toast.success('Project updated successfully! ✨');
    } catch (error: unknown) {
      toast.error('Failed to update project');
      console.error('Quick edit error:', error);
    }
  };



  const getCollaborationStats = () => {
    const totalProjects = mockProjects.length;
    const openForCollab = mockProjects.filter(p => 
              p.collaboration_status === 'open'
    ).length;
    const totalSpots = mockProjects.reduce((sum, p) => sum + (p.max_collaborators - p.current_collaborators), 0);
    
    return { totalProjects, openForCollab, totalSpots };
  };

  const stats = getCollaborationStats();

  if (!userProfile) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p>Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Collaboration System Demo</h1>
            <p className="text-muted-foreground">
              Experience the complete collaboration request flow in action
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalProjects}</p>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.openForCollab}</p>
                  <p className="text-sm text-muted-foreground">Open for Collaboration</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalSpots}</p>
                  <p className="text-sm text-muted-foreground">Available Spots</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Demo Instructions */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
              <Settings className="w-5 h-5" />
              How to Test the Collaboration System
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>1.</strong> <span className="text-purple-600 font-medium">Hover over your own projects</span> to see the &#34;Quick Edit&#34; button appear</p>
            <p><strong>2.</strong> <span className="text-purple-600 font-medium">Quick Edit</span> your collaboration status, categories, and team settings instantly</p>
            <p><strong>3.</strong> Click &#34;Request to Join&#34; on other projects to send collaboration requests</p>
            <p><strong>4.</strong> Fill out the collaboration request modal with a 140-character intro</p>
            <p><strong>5.</strong> Click the notification bell (right side) to manage incoming requests</p>
            <p><strong>6.</strong> Accept, decline, or archive requests and watch real-time updates</p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Project Showcase</h2>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset Demo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              canEdit={project.user_id === userProfile.id}
              canRequestCollaboration={project.user_id !== userProfile.id}
              currentUserId={userProfile.id}
              hasDiscordRole={true} // Demo page - assume user has Discord role
              onRequestCollaboration={handleRequestCollaboration}
              onQuickEdit={handleQuickEdit}
            />
          ))}
        </div>
      </div>

      {/* Collaboration Categories Reference */}
      <div className="mt-12 space-y-6">
        <h2 className="text-2xl font-semibold">System Components</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Project Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {PROJECT_CATEGORIES.slice(0, 8).map((category) => (
                  <Badge key={category.id} variant="outline" className="justify-start">
                    {category.emoji} {category.label}
                  </Badge>
                ))}
                <Badge variant="secondary" className="justify-start">
                  +{PROJECT_CATEGORIES.length - 8} more...
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Collaboration Types */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Collaboration Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {COLLABORATION_TYPES.slice(0, 6).map((type) => (
                  <Badge key={type.id} variant="outline" className="justify-start">
                    {type.emoji} {type.label}
                  </Badge>
                ))}
                <Badge variant="secondary" className="justify-start">
                  +{COLLABORATION_TYPES.length - 6} more types...
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Collaboration Request Modal */}
      {selectedProject && (
        <CollaborationRequestModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
          onSubmit={handleRequestCollaboration}
        />
      )}

      {/* Collaboration Sidebar */}
      <CollaborationSidebar
        requests={collaborationRequests}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onAcceptRequest={handleAcceptRequest}
        onDenyRequest={handleDenyRequest}
        onArchiveRequest={handleArchiveRequest}
        onRefresh={() => {
          // In real app, this would refetch from API
          toast.success('Requests refreshed');
        }}
      />

      {/* Button Interactions Demo */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Enhanced Button Interactions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Basic Variants */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Basic Variants</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="default">Default Button</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link Button</Button>
            </div>
          </div>

          {/* Size Variants */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Size Variants</h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Interactive Demo */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Interactive Test</h3>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="default"
                onClick={() => toast.success('Fast minimal animation!')}
              >
                Click Me!
              </Button>
              <Button 
                variant="secondary"
                onClick={() => toast.info('Quick response!')}
              >
                Secondary Button
              </Button>
              <Button 
                variant="outline"
                onClick={() => toast.success('Minimal hover effect!')}
              >
                Outline Button
              </Button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted rounded-lg">
            <h4 className="font-semibold mb-2">Balanced Animation Features:</h4>
            <ul className="text-sm space-y-1 list-disc list-inside">
              <li><strong>Duration:</strong> Smooth 150ms transitions (not too fast, not too slow)</li>
              <li><strong>Hover:</strong> Noticeable color darkening (90% opacity) + shadow increase</li>
              <li><strong>Click:</strong> Strong feedback with deeper color (85% opacity) + shadow decrease</li>
              <li><strong>Shadow:</strong> Hover shadow-md → Active shadow-sm for tactile feel</li>
              <li><strong>Link:</strong> Clear opacity changes (75% hover, 60% active)</li>
              <li><strong>Response:</strong> Immediate visual feedback on all interactions</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default withAuth(CollaborationDemoPage);