'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProjectService } from '@/lib/projects';
import { Project } from '@/types/project';
import withAuth from '@/hoc/withAuth';
import { OpportunityCard } from '@/components/ui/OpportunityCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Filter, Zap, Clock, Users, TrendingUp } from 'lucide-react';
import { Loader2 } from 'lucide-react';

function OpportunitiesPage() {
  const { userProfile, isAuthorized } = useAuth();
  const [opportunities, setOpportunities] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Popular skills for filtering
  const popularSkills = [
    'UI/UX Design',
    'Frontend Development', 
    'Backend Development',
    'Blockchain Development',
    'Mobile Development',
    'DevOps & Infrastructure',
    'Data Science',
    'Marketing',
    'Product Management'
  ];

  useEffect(() => {
    loadOpportunities();
  }, []);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      // Get all projects where collaboration_status = 'open'
      const allProjects = await ProjectService.getAllProjects();
      const openOpportunities = allProjects
        .filter(project => project.collaboration_status === 'open')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      // Add mock test projects for demonstration
      const mockProjects: Project[] = [
        {
          id: 'mock-1',
          title: 'DeFi Portfolio Tracker',
          description: 'A comprehensive DeFi portfolio management tool with real-time analytics, yield farming tracking, and automated rebalancing. Built with React, Node.js, and Web3 integration. Looking for blockchain developers and UI/UX designers to join the team.',
          user_id: 'user-alex-crypto',
          categories: ['defi', 'web3', 'analytics'],
          category: 'defi',
          tags: ['React', 'Node.js', 'Web3.js', 'Solidity', 'PostgreSQL'],
          collaboration_status: 'open',
          looking_for_help: ['frontend-developer', 'blockchain-developer', 'ui-designer'],
          notes_for_requests: 'We need experienced React developers and someone with DeFi protocol knowledge. Bonus points if you have experience with Uniswap V3 or Aave integration.',
          status: 'in-development',
          github_url: 'https://github.com/alexcrypto/defi-tracker',
          twitter_url: 'https://twitter.com/defitracker',
          website_url: 'https://defitracker.xyz',
          live_url: 'https://app.defitracker.xyz',
          image_url: null,
          created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
          updated_at: new Date().toISOString(),
        },
        {
          id: 'mock-2', 
          title: 'AI-Powered Recipe Generator',
          description: 'Smart recipe generator using machine learning to create personalized recipes based on dietary preferences, available ingredients, and nutritional goals. Features include meal planning, grocery list generation, and cooking tutorials.',
          user_id: 'user-sarah-foodtech',
          categories: ['ai', 'health', 'mobile'],
          category: 'ai',
          tags: ['Python', 'TensorFlow', 'React Native', 'FastAPI', 'Redis'],
          collaboration_status: 'open',
          looking_for_help: ['ai-developer', 'mobile-developer', 'content-creator'],
          notes_for_requests: 'Looking for ML engineers with NLP experience and React Native developers. We also need food photography and content creation help.',
          status: 'active',
          github_url: 'https://github.com/sarahfood/recipe-ai',
          twitter_url: 'https://twitter.com/recipeai',
          website_url: null,
          live_url: 'https://recipeai.app',
          image_url: null,
          created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          updated_at: new Date().toISOString(),
        },
        {
          id: 'mock-3',
          title: 'Open Source Learning Platform',
          description: 'Building a comprehensive learning management system for coding bootcamps and online education. Features include interactive coding exercises, progress tracking, peer-to-peer learning, and instructor dashboards.',
          user_id: 'user-mike-edutech',
          categories: ['education', 'web-development', 'saas'],
          category: 'education',
          tags: ['Next.js', 'TypeScript', 'Prisma', 'Tailwind', 'Docker'],
          collaboration_status: 'open',
          looking_for_help: ['fullstack-developer', 'devops', 'product-manager'],
          notes_for_requests: 'We are building this as a non-profit initiative. Looking for passionate developers who believe in accessible education. Experience with LMS or educational platforms is a plus.',
          status: 'active',
          github_url: 'https://github.com/mikeedu/open-lms',
          twitter_url: null,
          website_url: 'https://openlearning.org',
          live_url: 'https://beta.openlearning.org',
          image_url: null,
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
          updated_at: new Date().toISOString(),
        },
        {
          id: 'mock-4',
          title: 'Sustainable Fashion Marketplace',
          description: 'A marketplace connecting sustainable fashion brands with conscious consumers. Features include carbon footprint tracking, brand authenticity verification, and a clothing swap community.',
          user_id: 'user-jenny-sustainability',
          categories: ['ecommerce', 'sustainability', 'web-development'],
          category: 'ecommerce',
          tags: ['React', 'Express', 'MongoDB', 'Stripe', 'AWS'],
          collaboration_status: 'open',
          looking_for_help: ['backend-developer', 'product-designer', 'marketing'],
          notes_for_requests: 'Passionate about sustainability? Join us! We need developers who care about environmental impact and have experience with payment processing and marketplace dynamics.',
          status: 'in-development',
          github_url: 'https://github.com/jenny/sustainable-fashion',
          twitter_url: 'https://twitter.com/sustainablefashion',
          website_url: 'https://sustainablefashion.co',
          live_url: null,
          image_url: null,
          created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
          updated_at: new Date().toISOString(),
        }
      ];

      // Combine real data with mock data
      const allOpportunities = [...mockProjects, ...openOpportunities];
      setOpportunities(allOpportunities);
    } catch (error) {
      console.error('Error loading opportunities:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkillToggle = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const filteredOpportunities = opportunities.filter(opportunity => {
    // Search filter
    if (searchTerm && !opportunity.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !opportunity.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Skills filter
    if (selectedSkills.length > 0) {
      const opportunitySkills = opportunity.looking_for_help || [];
      const hasMatchingSkill = selectedSkills.some(skill => 
        opportunitySkills.some(oppSkill => oppSkill.toLowerCase().includes(skill.toLowerCase()))
      );
      if (!hasMatchingSkill) return false;
    }

    // Time filter
    if (timeFilter !== 'all') {
      const createdDate = new Date(opportunity.created_at);
      const now = new Date();
      const diffTime = now.getTime() - createdDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      switch (timeFilter) {
        case 'today':
          if (diffDays > 1) return false;
          break;
        case 'week':
          if (diffDays > 7) return false;
          break;
        case 'month':
          if (diffDays > 30) return false;
          break;
      }
    }

    return true;
  });

  const handleApply = async (projectId: string, message: string) => {
    try {
      // TODO: Send collaboration request to backend
      console.log('Applying to project:', projectId, 'with message:', message);
      // For now, just show success message
      alert('Application sent successfully! The project owner will be notified.');
    } catch (error) {
      console.error('Error sending application:', error);
      alert('Failed to send application. Please try again.');
    }
  };

  const handleCancel = async (projectId: string) => {
    if (!confirm('Are you sure you want to cancel this opportunity? This action cannot be undone.')) {
      return;
    }
    
    try {
      // TODO: Update project collaboration_status to 'not-looking'
      console.log('Canceling opportunity:', projectId);
      
      // For now, just remove from local state
      setOpportunities(prev => prev.filter(p => p.id !== projectId));
      alert('Opportunity canceled successfully!');
    } catch (error) {
      console.error('Error canceling opportunity:', error);
      alert('Failed to cancel opportunity. Please try again.');
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const createdDate = new Date(dateString);
    const diffTime = now.getTime() - createdDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    if (diffMinutes > 0) return `${diffMinutes}m ago`;
    return 'Just now';
  };

  if (!isAuthorized) {
    return <div className="p-8 text-center">You need to be authorized to view opportunities.</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-black dark:bg-white rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white dark:text-black" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Opportunities</h1>
              <p className="text-sm text-muted-foreground">Discover projects looking for collaborators</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border border-border bg-background">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black dark:bg-white rounded-md flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white dark:text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Active Opportunities</p>
                    <p className="text-xl font-bold text-foreground">{opportunities.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-border bg-background">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black dark:bg-white rounded-md flex items-center justify-center">
                    <Users className="w-5 h-5 text-white dark:text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Projects Seeking Help</p>
                    <p className="text-xl font-bold text-foreground">{filteredOpportunities.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border border-border bg-background">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-black dark:bg-white rounded-md flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white dark:text-black" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">New This Week</p>
                    <p className="text-xl font-bold text-foreground">
                      {opportunities.filter(opp => {
                        const diffTime = new Date().getTime() - new Date(opp.created_at).getTime();
                        const diffDays = diffTime / (1000 * 60 * 60 * 24);
                        return diffDays <= 7;
                      }).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20 border border-border bg-background">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Filter className="w-4 h-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                
                {/* Search */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search opportunities..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Time Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Posted</label>
                  <div className="space-y-2">
                                        {[  
                      { key: 'all', label: 'All time' },
                      { key: 'today', label: 'Today' },
                      { key: 'week', label: 'This week' },
                      { key: 'month', label: 'This month' }
                    ].map(({ key, label }) => (
                      <Button
                        key={key}
                        variant={timeFilter === key ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setTimeFilter(key as any)}
                        className={`w-full justify-start text-xs ${
                          timeFilter === key 
                            ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90' 
                            : 'hover:bg-muted'
                        }`}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Skills Filter */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Skills Needed</label>
                  <div className="flex flex-wrap gap-2">
                    {popularSkills.map(skill => (
                      <Badge
                        key={skill}
                        variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                        className={`cursor-pointer text-xs transition-colors ${
                          selectedSkills.includes(skill)
                            ? 'bg-black dark:bg-white text-white dark:text-black hover:bg-black/90 dark:hover:bg-white/90 border-black dark:border-white'
                            : 'border-border hover:bg-muted'
                        }`}
                        onClick={() => handleSkillToggle(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Opportunities Feed */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Loading opportunities...</span>
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <Card className="text-center py-12 border border-border bg-background">
                <CardContent>
                  <div className="w-12 h-12 bg-black dark:bg-white rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-6 h-6 text-white dark:text-black" />
                  </div>
                  <h3 className="text-base font-semibold mb-2">No opportunities found</h3>
                  <p className="text-sm text-muted-foreground">Try adjusting your filters or check back later for new opportunities.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOpportunities.map(opportunity => (
                  <OpportunityCard
                    key={opportunity.id}
                    project={opportunity}
                    currentUserId={userProfile?.id}
                    timeAgo={getTimeAgo(opportunity.created_at)}
                    onApply={handleApply}
                    onCancel={handleCancel}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(OpportunitiesPage);