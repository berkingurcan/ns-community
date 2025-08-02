
'use client';

import withAuth from '@/hoc/withAuth';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';


const DashboardPage = () => {
    const { logout, userProfile } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/');
    }

    const navigateToProjects = () => {
        router.push('/projects');
    }

    const navigateToProfile = () => {
        router.push('/profile');
    }

    return (
        <div className="min-h-screen bg-secondary p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold tracking-tight text-foreground">
                    Welcome to the Dashboard
                </h1>
                <p className="mt-2 text-secondary-foreground">
                    You have access because you own the required NFT.
                </p>
                </div>

                {/* Navigation Cards */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
                    {/* Projects Card */}
                    <div className="bg-background rounded-lg border border-border p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Projects</h3>
                                <p className="text-sm text-secondary-foreground">Create up to 3 projects</p>
                            </div>
                        </div>
                        <p className="text-secondary-foreground mb-4">
                            Showcase your innovative projects, find co-founders, and connect with the community.
                        </p>
                        <Button onClick={navigateToProjects} className="w-full">
                            Manage Projects
                        </Button>
                    </div>

                    {/* Profile Card */}
                    <div className="bg-background rounded-lg border border-border p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Profile</h3>
                                <p className="text-sm text-secondary-foreground">
                                    {userProfile ? 'Update your info' : 'Complete setup'}
                                </p>
                            </div>
                        </div>
                        <p className="text-secondary-foreground mb-4">
                            {userProfile 
                                ? 'Manage your profile information and expertise.'
                                : 'Complete your profile to get started.'
                            }
                        </p>
                        <Button onClick={navigateToProfile} variant="outline" className="w-full">
                            {userProfile ? 'Edit Profile' : 'Complete Profile'}
                        </Button>
                    </div>

                    {/* Community Card */}
                    <div className="bg-background rounded-lg border border-border p-6 hover:shadow-lg transition-shadow">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-foreground">Community</h3>
                                <p className="text-sm text-secondary-foreground">Connect & collaborate</p>
                            </div>
                        </div>
                        <p className="text-secondary-foreground mb-4">
                            Browse other projects and find opportunities to collaborate.
                        </p>
                        <Button onClick={() => router.push('/projects?tab=browse')} variant="outline" className="w-full">
                            Browse Projects
                        </Button>
                    </div>
                </div>

                {/* Quick Stats */}
                {userProfile && (
                    <div className="bg-background rounded-lg border border-border p-6 mb-8">
                        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Overview</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-primary">0/3</div>
                                <div className="text-sm text-secondary-foreground">Projects Created</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{userProfile.expertises?.length || 0}</div>
                                <div className="text-sm text-secondary-foreground">Expertise Areas</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">New</div>
                                <div className="text-sm text-secondary-foreground">Member Status</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-purple-600">🎯</div>
                                <div className="text-sm text-secondary-foreground">Ready to Build</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex justify-center">
                    <Button onClick={handleLogout} variant="destructive">
                    Logout
                </Button>
                </div>
            </div>
        </div>
    );
};

export default withAuth(DashboardPage);
