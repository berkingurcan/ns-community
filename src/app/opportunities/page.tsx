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
      
      setOpportunities(openOpportunities);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/60 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Opportunities</h1>
              <p className="text-muted-foreground">Discover projects looking for collaborators</p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Active Opportunities</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{opportunities.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400 font-medium">Projects Seeking Help</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">{filteredOpportunities.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">New This Week</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
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
                        className="w-full justify-start"
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
                        className="cursor-pointer text-xs"
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
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading opportunities...</span>
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No opportunities found</h3>
                  <p className="text-muted-foreground">Try adjusting your filters or check back later for new opportunities.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {filteredOpportunities.map(opportunity => (
                  <OpportunityCard
                    key={opportunity.id}
                    project={opportunity}
                    currentUserId={userProfile?.id}
                    timeAgo={getTimeAgo(opportunity.created_at)}
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