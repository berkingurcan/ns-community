
'use client';

import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/Button';

export default function Home() {
    const { session, login, logout } = useAuth();
    const { publicKey } = useWallet();

    return (
        <div className="flex items-center justify-center min-h-screen bg-secondary">
            <div className="w-full max-w-md p-8 space-y-8 bg-background rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-4xl font-bold tracking-tight">
                        NFT Gated App
                    </h1>
                    <p className="mt-2 text-secondary-foreground">
                        Connect your wallet and sign in to continue
                    </p>
                </div>

                <div className="flex flex-col space-y-4">
                    {!session ? (
                        <>
                            <WalletMultiButton />
                            {publicKey && (
                                <Button onClick={login}>
                                    Login with Wallet
                                </Button>
                            )}
                        </>
                    ) : (
                        <div className="text-center">
                            <p className="text-lg">You are logged in.</p>
                            <Button onClick={logout} variant="destructive" className="mt-4">
                                Logout
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
