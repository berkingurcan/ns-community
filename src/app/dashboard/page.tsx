
'use client';

import withAuth from '@/hoc/withAuth';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';


const DashboardPage = () => {
    const { logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/');
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary">
            <div className="w-full max-w-md p-8 space-y-8 bg-background rounded-lg shadow-lg text-center">
                <h1 className="text-4xl font-bold tracking-tight">
                    Welcome to the Dashboard
                </h1>
                <p className="mt-2 text-secondary-foreground">
                    You have access because you own the required NFT.
                p>
                <Button onClick={handleLogout} variant="destructive" className="mt-4">
                    Logout
                </Button>
            </div>
        </div>
    );
};

export default withAuth(DashboardPage);
