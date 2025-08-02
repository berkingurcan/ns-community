
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

const UnauthorizedPage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary">
            <div className="w-full max-w-md p-8 space-y-8 bg-background rounded-lg shadow-lg text-center">
                <h1 className="text-4xl font-bold tracking-tight text-destructive">
                    Unauthorized Access
                </h1>
                <p className="mt-2 text-secondary-foreground">
                    You do not have the required NFT to access this page.
                </p>
                <Button asChild>
                    <Link href="/">
                        Go to Login
                    </Link>
                </Button>
            </div>
        </div>
    );
};

export default UnauthorizedPage;
