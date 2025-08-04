'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { ProjectService } from '@/lib/projects';
import { CoinService } from '@/lib/coins';
import { Button } from '@/components/ui/Button';
import { ProjectCard } from '@/components/ui/ProjectCard';
import { ProjectForm } from '@/components/ui/ProjectForm';
import { ProfileEditModal } from '@/components/ui/ProfileEditModal';
import { Briefcase, Edit, Loader2, RefreshCw, User, ChevronLeft, ChevronRight, Plus, Coins, History, ArrowUpRight, ArrowDownLeft, Github, Twitter, Zap } from 'lucide-react';
import Image from 'next/image';
import { ProfileFormData, validateProfileForm } from '@/types/profile';
import { Project, UpdateProjectData } from '@/types/project';
import { CoinTransaction, COIN_TRANSACTION_LABELS } from '@/types/coin';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { session, userProfile, coinBalance, refreshProfile, loading } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  
  // Coin transactions state
  const [recentTransactions, setRecentTransactions] = useState<CoinTransaction[]>([]);

  // Projects carousel state
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [currentProjectPage, setCurrentProjectPage] = useState(0);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const projectsPerPage = 3;

  // Load user projects
  const loadUserProjects = useCallback(async () => {
    if (!userProfile?.id) return;
    
    setProjectsLoading(true);
    try {
      const projects = await ProjectService.getUserProjects(userProfile.id);
      setUserProjects(projects);
    } catch (error: unknown) {
      console.error('Error loading user projects:', error);
    } finally {
      setProjectsLoading(false);
    }
  }, [userProfile?.id]);

  // Load recent coin transactions
  const loadRecentTransactions = useCallback(async () => {
    if (!userProfile?.id) return;
    
    try {
      const transactions = await CoinService.getUserTransactions(userProfile.id);
      setRecentTransactions(transactions.slice(0, 5)); // Show last 5 transactions
    } catch (error: unknown) {
      console.error('Error loading recent transactions:', error);
    } finally {
    }
  }, [userProfile?.id]);

  // Load projects and transactions when userProfile is available
  useEffect(() => {
    if (userProfile) {
      loadUserProjects();
      loadRecentTransactions();
    }
  }, [userProfile, loadUserProjects, loadRecentTransactions]);

  useEffect(() => {
    if (!session) {
      router.push('/');
      return;
    }

    if (!userProfile && !loading && session) {
      router.push('/onboarding');
    }
  }, [session, userProfile, loading, router]);

  const handleQuickEdit = async (projectId: string, updates: Partial<Project>) => {
    if (!userProfile) return;
    
    try {
      await ProjectService.quickUpdateProject(projectId, updates, userProfile.id);
      toast.success('Project updated successfully! ✨');
      
      // Update the project in local state for immediate UI feedback
      setUserProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === projectId 
            ? { ...project, ...updates }
            : project
        )
      );
    } catch (error: unknown) {
      console.error('Quick edit error:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
                projectId: projectId
      });
      toast.error(
        error instanceof Error 
          ? `Failed to update project: ${error.message}` 
          : 'Failed to update project'
      );
    }
  };

  const handleEdit = (project: Project) => {
    setEditingProject(project);
  };

  const handleEditMore = (project: Project) => {
    setEditingProject(project);
  };

  const handleProjectUpdate = async (data: UpdateProjectData) => {
    if (!userProfile || !editingProject) return;
    
    try {
      setIsLoading(true);
      await ProjectService.updateProject(data, userProfile.id);
      toast.success('Project updated successfully! ✨');
      
      // Update the project in local state
      setUserProjects(prevProjects => 
        prevProjects.map(project => 
          project.id === editingProject.id 
            ? { ...project, ...data }
            : project
        )
      );
      
      setEditingProject(null);
    } catch (error: unknown) {
      console.error('Full edit error:', error);
      toast.error('Failed to update project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProjectDelete = async (projectId: string) => {
    if (!userProfile) return;
    
    try {
      setIsLoading(true);
      await ProjectService.deleteProject(projectId, userProfile.id);
      toast.success('Project deleted successfully');
      
      // Remove the project from local state
      setUserProjects(prevProjects => 
        prevProjects.filter(project => project.id !== projectId)
      );
      
      setEditingProject(null);
    } catch (error: unknown) {
      console.error('Delete error:', error);
      toast.error('Failed to delete project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSave = async (data: ProfileFormData) => {
    if (!userProfile || !session?.user?.id) {
      toast.error('Authentication required');
      return;
    }

    const validationError = validateProfileForm(data);
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          username: data.username,
          discord_id: data.discordId,
          shill_yourself: data.shillYourself,
          expertises: data.expertises,
          github: data.github || null,
          x_handle: data.xHandle || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', userProfile.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully! ✨');
      await refreshProfile();
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      toast.error(`Failed to update profile: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Carousel navigation
  const totalPages = Math.ceil(userProjects.length / projectsPerPage);
  const canGoNext = currentProjectPage < totalPages - 1;
  const canGoPrev = currentProjectPage > 0;

  const nextProjectPage = () => {
    if (canGoNext) {
      setCurrentProjectPage(prev => prev + 1);
    }
  };

  const prevProjectPage = () => {
    if (canGoPrev) {
      setCurrentProjectPage(prev => prev - 1);
    }
  };

  const getCurrentProjects = () => {
    const startIndex = currentProjectPage * projectsPerPage;
    return userProjects.slice(startIndex, startIndex + projectsPerPage);
  };

  const formatTransactionDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));

    if (diffDays > 0) return `${diffDays}d ago`;
    if (diffHours > 0) return `${diffHours}h ago`;
    return 'Just now';
  };

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Facebook-style Cover & Profile Header */}
      <div className="relative">
        {/* Cover Photo */}
        <div className="h-64 bg-gradient-to-br from-primary/10 via-primary/5 to-secondary/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(120,119,198,0.1),transparent_50%)]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        </div>

        {/* Profile Info Bar */}
        <div className="relative bg-card border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              {/* Avatar & User Info - Centered Layout */}
              <div className="flex items-center gap-6">
                <div className="relative -mt-16">
                  {session?.user ? (
                    <Image
                      src={session.user?.user_metadata?.avatar_url || '/placeholder-avatar.png'}
                      alt={`${userProfile.username}'s profile`}
                      width={128}
                      height={128}
                      className="w-32 h-32 rounded-full shadow-xl border-4 border-background object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-primary-foreground text-4xl font-bold shadow-xl border-4 border-background">
                      {userProfile.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  )}
                  <div className="absolute -bottom-1 -right-1 w-10 h-10 bg-green-500 rounded-full border-4 border-background flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-3">
                  <div>
                    <h1 className="text-3xl font-bold text-foreground">{userProfile.username}</h1>
                    <p className="text-muted-foreground">Builder in the NSphere Community</p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">{userProjects.length} projects</span>
                      {userProfile.expertises && userProfile.expertises.length > 0 && (
                        <>
                          <span className="text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{userProfile.expertises.length} expertises</span>
                        </>
                      )}
                    </div>
                    
                    {/* Social Links - Better positioned */}
                    <div className="flex items-center gap-2">
                      {userProfile.github && (
                        <a 
                          href={`https://github.com/${userProfile.github}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title={`@${userProfile.github}`}
                        >
                          <Github className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </a>
                      )}
                      {userProfile.x_handle && (
                        <a 
                          href={`https://twitter.com/${userProfile.x_handle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title={`@${userProfile.x_handle}`}
                        >
                          <Twitter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pb-2">
                <Button onClick={() => router.push('/projects')} className="shadow-lg">
                  <Plus className="w-4 h-4 mr-2" /> Create Project
                </Button>
                <Button onClick={() => setShowProfileEdit(true)} variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button onClick={refreshProfile} variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Facebook Style Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Sidebar - Profile Info */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              
              {/* About Me Card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="flex items-center gap-2 font-semibold text-foreground mb-4">
                  <User className="w-4 h-4" />
                  About Me
                </h3>
                <div className="space-y-3">
                  <p className="text-foreground leading-relaxed">
                    {userProfile.shill_yourself || (
                      <span className="text-muted-foreground italic">No bio yet...</span>
                    )}
                  </p>
                </div>
              </div>



              {/* Expertises Card */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="flex items-center gap-2 font-semibold text-foreground mb-4">
                  <Zap className="w-4 h-4" />
                  Expertises
                </h3>
                <div className="space-y-2">
                  {userProfile.expertises && userProfile.expertises.length > 0 ? (
                    userProfile.expertises.map((expertise) => (
                      <div
                        key={expertise}
                        className="flex items-center gap-2 p-2 bg-secondary/50 rounded-lg"
                      >
                        <Zap className="w-3 h-3 text-primary" />
                        <span className="text-sm font-medium">{expertise}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground italic text-sm">No expertises selected yet...</p>
                  )}
                </div>
              </div>

              {/* Coin Balance Card */}
              <div className="bg-card rounded-xl border border-amber-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="flex items-center gap-2 font-semibold text-foreground">
                    <Coins className="w-4 h-4 text-amber-600" />
                    Continental Coins
                  </h3>
                  <Button
                    onClick={() => router.push('/coins')}
                    variant="outline"
                    size="sm"
                    className="text-xs border-amber-200 text-amber-600 hover:bg-amber-50"
                  >
                    Continental Rules
                  </Button>
                </div>
                
                {coinBalance ? (
                  <div className="space-y-4">
                    {/* Balance Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                        <div className="text-lg font-bold text-amber-700 dark:text-amber-400">
                          {coinBalance.balance}
                        </div>
                        <div className="text-xs text-amber-600 dark:text-amber-500">Balance</div>
                      </div>
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <div className="text-lg font-bold text-emerald-700 dark:text-emerald-400">
                          {coinBalance.totalEarned}
                        </div>
                        <div className="text-xs text-emerald-600 dark:text-emerald-500">Earned</div>
                      </div>
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <div className="text-lg font-bold text-blue-700 dark:text-blue-400">
                          {coinBalance.totalSpent}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-500">Spent</div>
                      </div>
                    </div>

                    {/* Recent Transactions */}
                    {recentTransactions.length > 0 && (
                      <div>
                        <h4 className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
                          <History className="w-3 h-3" />
                          Recent Activity
                        </h4>
                        <div className="space-y-1">
                          {recentTransactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between p-2 bg-muted/30 rounded-lg text-xs"
                            >
                              <div className="flex items-center gap-2">
                                {transaction.amount > 0 ? (
                                  <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                                ) : (
                                  <ArrowDownLeft className="w-3 h-3 text-orange-600" />
                                )}
                                <span className="font-medium truncate max-w-20">
                                  {COIN_TRANSACTION_LABELS[transaction.type]}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span className={`font-bold ${
                                  transaction.amount > 0 ? 'text-emerald-600' : 'text-orange-600'
                                }`}>
                                  {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                                </span>
                                <span className="text-muted-foreground">
                                  {formatTransactionDate(transaction.createdAt)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Coins className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-xs text-muted-foreground">Loading coin balance...</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Side - Projects */}
          <div className="lg:col-span-2">

              {projectsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : userProjects.length === 0 ? (
                <div className="text-center py-16 bg-secondary/20 rounded-xl border-2 border-dashed border-border">
                  <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-foreground mb-2">No Projects Yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Start building your portfolio by creating your first project and showcase your work to the community!
                  </p>
                  <Button onClick={() => router.push('/projects')} className="flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Your First Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Projects Grid */}
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {getCurrentProjects().map((project) => (
                      <ProjectCard 
                        key={project.id} 
                        project={project}
                        canEdit={true}
                        currentUserId={userProfile?.id}
                        hasDiscordRole={true} // NS user is logged in, so they have Discord role
                        onEdit={handleEdit}
                        onQuickEdit={handleQuickEdit}
                        onEditMore={() => handleEditMore(project)}
                      />
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <Button
                        onClick={prevProjectPage}
                        disabled={!canGoPrev}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        Previous
                      </Button>

                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                          Page {currentProjectPage + 1} of {totalPages}
                        </span>
                        <div className="flex gap-1">
                          {Array.from({ length: totalPages }, (_, i) => (
                            <button
                              key={i}
                              onClick={() => setCurrentProjectPage(i)}
                              className={`w-2 h-2 rounded-full transition-colors ${
                                i === currentProjectPage ? 'bg-primary' : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      <Button
                        onClick={nextProjectPage}
                        disabled={!canGoNext}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Full Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ProjectForm
              project={editingProject}
              onUpdate={handleProjectUpdate}
              onDelete={handleProjectDelete}
              onCancel={() => setEditingProject(null)}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={showProfileEdit}
        onClose={() => setShowProfileEdit(false)}
        onSave={handleProfileSave}
        userProfile={userProfile}
        isLoading={isLoading}
      />
    </div>
  );
}