'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, LogIn } from 'lucide-react';

const UnauthorizedPage = () => {
    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary p-4">
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 mb-4">
                        <ShieldAlert className="h-12 w-12 text-destructive" />
                    </div>
                    <CardTitle className="text-3xl text-destructive">
                        Unauthorized Access
                    </CardTitle>
                    <CardDescription>
                        You do not have the required NFT to access this application.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild size="lg">
                        <Link href="/">
                            <LogIn className="mr-2 h-4 w-4" />
                            Return to Login
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default UnauthorizedPage;
