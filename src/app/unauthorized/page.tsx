
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { LogOut, Home } from 'lucide-react';

const UnauthorizedPage = () => {
    const { logout, session } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary">
            <div className="w-full max-w-md p-8 space-y-8 bg-background rounded-lg shadow-lg text-center">
                <h1 className="text-4xl font-bold tracking-tight text-destructive">
                    Access Restricted
                </h1>
                <p className="mt-2 text-secondary-foreground">
                    Your Discord account doesn&apos;t have the required permissions to access NSphere. 
                    Please contact an administrator or try logging in with a different account.
                </p>
                <div className="flex flex-col gap-3">
                    {session && (
                        <Button onClick={handleLogout} variant="outline" className="flex items-center gap-2">
                            <LogOut className="h-4 w-4" />
                            Logout
                        </Button>
                    )}
                    <Button asChild>
                        <Link href="/" className="flex items-center gap-2">
                            <Home className="h-4 w-4" />
                            Go to Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
