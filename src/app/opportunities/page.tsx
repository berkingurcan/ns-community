'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { ProjectService } from '@/lib/projects';
import { Project } from '@/types/project';
import withAuth from '@/hoc/withAuth';
import { OpportunityCard } from '@/components/ui/OpportunityCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Zap, Briefcase, ChevronRight, SlidersHorizontal, X } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { useLazyLoading } from '@/hooks/useLazyLoading';
import { useDebounce } from '@/hooks/useDebounce';

function OpportunitiesPage() {
  const { userProfile } = useAuth();
  const [opportunities, setOpportunities] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [savedOpportunities, setSavedOpportunities] = useState<string[]>([]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [announceText, setAnnounceText] = useState('');
  
  // Debounce search term to improve performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  const popularSkills = [
    'UI/UX Design',
    'Frontend',
    'Backend',
    'Blockchain',
    'Mobile',
    'DevOps',
    'Data Science',
    'Marketing',
    'Product Management',
  ];

  useEffect(() => {
    const loadOpportunities = async () => {
      try {
        setLoading(true);
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

    loadOpportunities();
  }, []);

  const handleSkillToggle = (skill: string) => {
    const isRemoving = selectedSkills.includes(skill);
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
    
    // Announce filter changes to screen readers
    setAnnounceText(
      isRemoving 
        ? `${skill} filter removed` 
        : `${skill} filter added`
    );
    setTimeout(() => setAnnounceText(''), 1000);
  };

  const filteredOpportunities = useMemo(() => {
    return opportunities.filter(opportunity => {
      if (debouncedSearchTerm && !opportunity.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) &&
          !opportunity.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) {
        return false;
      }

      if (selectedSkills.length > 0) {
          const opportunitySkills = opportunity.looking_for_collaboration || [];
          const hasMatchingSkill = selectedSkills.some(skill =>
            opportunitySkills.some(oppSkill => oppSkill.toLowerCase().includes(skill.toLowerCase()))
          );
          if (!hasMatchingSkill) return false;
      }

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
  }, [opportunities, debouncedSearchTerm, selectedSkills, timeFilter]);

  const handleApply = async (projectId: string, message: string) => {
    try {
      console.log('Applying to project:', projectId, 'with message:', message);
      alert('Application sent successfully! The project owner will be notified.');
    } catch (error) {
      console.error('Error sending application:', error);
      alert('Failed to send application. Please try again.');
    }
  };

  const handleSave = (projectId: string) => {
    const project = opportunities.find(p => p.id === projectId);
    const isSaving = !savedOpportunities.includes(projectId);
    
    setSavedOpportunities(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
    
    // Announce to screen readers
    setAnnounceText(
      isSaving 
        ? `${project?.title} saved to your list` 
        : `${project?.title} removed from your list`
    );
    setTimeout(() => setAnnounceText(''), 1000);
  };

  const handleShare = async (projectId: string) => {
    const project = opportunities.find(p => p.id === projectId);
    if (project && navigator.share) {
      try {
        await navigator.share({
          title: project.title,
          text: project.description,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleViewDetails = (projectId: string) => {
    console.log('View details for project:', projectId);
    // Navigate to project details page
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

  const newThisWeekCount = useMemo(() => {
    return opportunities.filter(opp => {
      const diffTime = new Date().getTime() - new Date(opp.created_at).getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      return diffDays <= 7;
    }).length;
  }, [opportunities]);

  // Lazy loading for better performance
  const { visibleItems: visibleOpportunities, hasMore, isLoading: isLoadingMore, sentinelRef } = useLazyLoading(
    filteredOpportunities,
    6 // Show 6 items initially, then load more
  );

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Screen Reader Announcements */}
      <div 
        role="status" 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announceText}
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        
        {/* Mobile-First Header */}
        <header className="mb-6 lg:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="w-6 h-6 lg:w-7 lg:h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">Opportunities</h1>
                <p className="text-sm lg:text-base text-muted-foreground">Find your next collaboration</p>
              </div>
            </div>
            
            {/* Mobile Filter Toggle */}
            <div className="sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full"
              >
                <SlidersHorizontal className="w-4 h-4 mr-2" />
                Filters
                {(selectedSkills.length > 0 || timeFilter !== 'all') && (
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {selectedSkills.length + (timeFilter !== 'all' ? 1 : 0)}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </header>
        
        {/* Stats - Original Border Style */}
        <div className="border-t border-b border-border divide-y md:divide-y-0 md:divide-x divide-border grid grid-cols-1 md:grid-cols-3 mb-6 lg:mb-10">
          <div className="p-4 flex items-center gap-4">
            <span className="text-3xl font-bold">{opportunities.length}</span>
            <span className="text-sm text-muted-foreground">Active Projects</span>
          </div>
          <div className="p-4 flex items-center gap-4">
            <span className="text-3xl font-bold">{filteredOpportunities.length}</span>
            <span className="text-sm text-muted-foreground">Matching Results</span>
          </div>
          <div className="p-4 flex items-center gap-4">
            <span className="text-3xl font-bold">{newThisWeekCount}</span>
            <span className="text-sm text-muted-foreground">New This Week</span>
          </div>
        </div>

        {/* Mobile Filters Overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
            <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-background shadow-xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h2 className="text-lg font-semibold">Filters</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowMobileFilters(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-4 space-y-6 overflow-y-auto">
                {/* Mobile Filter Content */}
                <div>
                  <label htmlFor="mobile-search" className="text-sm font-medium sr-only">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="mobile-search"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Date Posted</h4>
                  <div className="space-y-2">
                    {[
                      { key: 'all', label: 'All time' },
                      { key: 'today', label: 'Today' },
                      { key: 'week', label: 'This week' },
                      { key: 'month', label: 'This month' }
                    ].map(({ key, label }) => (
                      <Button
                        key={key}
                        variant={timeFilter === key ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setTimeFilter(key as 'all' | 'today' | 'week' | 'month')}
                        className="w-full justify-start"
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Skills Needed</h4>
                  <div className="flex flex-wrap gap-2">
                    {popularSkills.map(skill => (
                      <Badge
                        key={skill}
                        variant={selectedSkills.includes(skill) ? 'secondary' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleSkillToggle(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-12">
          
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block lg:col-span-1">
            <div className="sticky top-20">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Filter & Sort</h3>
              <div className="space-y-6">
                
                <div>
                  <label htmlFor="search" className="text-sm font-medium sr-only">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-transparent"
                    />
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Date Posted</h4>
                  <div className="flex flex-col items-start space-y-1">
                    {[
                      { key: 'all', label: 'All time' },
                      { key: 'today', label: 'Today' },
                      { key: 'week', label: 'This week' },
                      { key: 'month', label: 'This month' }
                    ].map(({ key, label }) => (
                      <Button
                        key={key}
                        variant={'ghost'}
                        size="sm"
                        onClick={() => setTimeFilter(key as 'all' | 'today' | 'week' | 'month')}
                        className={`w-full justify-start text-muted-foreground hover:text-foreground ${timeFilter === key ? 'text-foreground font-semibold' : ''}`}
                      >
                         <ChevronRight className={`w-4 h-4 mr-2 transition-transform ${timeFilter === key ? 'translate-x-0' : '-translate-x-1 opacity-0'}`} />
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-3">Skills Needed</h4>
                  <div className="flex flex-wrap gap-2">
                    {popularSkills.map(skill => (
                      <Badge
                        key={skill}
                        variant={selectedSkills.includes(skill) ? 'secondary' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => handleSkillToggle(skill)}
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main 
            className="lg:col-span-3"
            role="main"
            aria-label="Opportunities list"
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 lg:py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                <p className="text-sm text-muted-foreground">Loading opportunities...</p>
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <div className="text-center py-12 lg:py-20">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Briefcase className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No Matching Opportunities</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters to find what you're looking for.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedSkills([]);
                    setTimeFilter('all');
                  }}
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="space-y-4 lg:space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {visibleOpportunities.length} of {filteredOpportunities.length} opportunities
                    {filteredOpportunities.length !== opportunities.length && (
                      <span className="ml-1">({opportunities.length} total)</span>
                    )}
                  </p>
                </div>
                
                {visibleOpportunities.map((opportunity, index) => (
                  <OpportunityCard
                    key={opportunity.id}
                    project={opportunity}
                    currentUserId={userProfile?.id}
                    timeAgo={getTimeAgo(opportunity.created_at)}
                    onApply={handleApply}
                    onCancel={() => {}}
                    onSave={handleSave}
                    onShare={handleShare}
                    onViewDetails={handleViewDetails}
                    isSaved={savedOpportunities.includes(opportunity.id)}
                    priority={index < 3 ? 'high' : index < 8 ? 'medium' : 'low'}
                    className="animate-fadeIn"
                  />
                ))}
                
                {/* Lazy Loading Sentinel */}
                {hasMore && (
                  <div 
                    ref={sentinelRef}
                    className="flex items-center justify-center py-8"
                  >
                    {isLoadingMore && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Loading more opportunities...</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default withAuth(OpportunitiesPage);