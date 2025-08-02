
'use client';

import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Button } from '@/components/ui/Button';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { useState, useEffect } from 'react';

export default function Home() {
    const { session, login, logout } = useAuth();
    const { publicKey, connected } = useWallet();
    const [isLoading, setIsLoading] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogin = async () => {
        setIsLoading(true);
        try {
            await login();
        } finally {
            setIsLoading(false);
        }
    };

    if (!mounted) {
        return null; // Prevent hydration mismatch
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center p-4">
            {/* Background decorative elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-purple-200 dark:bg-purple-800 rounded-full opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blue-200 dark:bg-blue-800 rounded-full opacity-20 animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-pink-200 dark:bg-pink-800 rounded-full opacity-30 animate-bounce delay-500"></div>
            </div>

            <div className="relative w-full max-w-md">
                {/* Main card */}
                <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-gray-700/50 p-8 space-y-8 transform transition-all duration-500 hover:shadow-3xl hover:scale-[1.02]">
                    
                    {/* Header section */}
                    <div className="text-center space-y-4">
                        {/* Logo/Icon area */}
                        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                                NFT Gated App
                            </h1>
                            <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                                Secure access through wallet authentication
                            </p>
                        </div>
                    </div>

                    {/* Authentication section */}
                    <div className="space-y-6">
                        {!session ? (
                            <div className="space-y-4">
                                {/* Step indicators */}
                                <StepIndicator 
                                    steps={[
                                        {
                                            label: "Connect",
                                            completed: connected,
                                            active: !connected
                                        },
                                        {
                                            label: "Sign In", 
                                            completed: !!session,
                                            active: connected && !session
                                        }
                                    ]}
                                />

                                {/* Wallet connection */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                                        Choose your wallet
                                    </label>
                                    <div className="wallet-adapter-button-trigger-wrapper">
                                        <WalletMultiButton className="!w-full !justify-center !bg-gradient-to-r !from-purple-500 !to-blue-600 hover:!from-purple-600 hover:!to-blue-700 !text-white !font-semibold !py-3 !px-6 !rounded-xl !border-0 !shadow-lg hover:!shadow-xl !transition-all !duration-300 transform hover:!scale-[1.02]" />
                                    </div>
                                </div>

                                {/* Login button */}
                                {publicKey && (
                                    <div className="space-y-3 animate-fadeIn">
                                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                                                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">Wallet Connected</p>
                                                    <p className="text-xs text-green-600 dark:text-green-400 font-mono">
                                                        {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <Button 
                                            onClick={handleLogin}
                                            disabled={isLoading}
                                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {isLoading ? (
                                                <div className="flex items-center space-x-2">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    <span>Signing in...</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center space-x-2">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                    </svg>
                                                    <span>Sign In Securely</span>
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                )}

                                {/* Help text */}
                                <div className="text-center space-y-2">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Your wallet will be used to verify NFT ownership
                                    </p>
                                    {!connected && (
                                        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                                            ← Start by connecting your wallet
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Logged in state */
                            <div className="text-center space-y-6 animate-fadeIn">
                                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                
                                <div className="space-y-2">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back!</h2>
                                    <p className="text-gray-600 dark:text-gray-300">You are successfully authenticated</p>
                                    
                                    {publicKey && (
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mt-4">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Connected Wallet</p>
                                            <p className="text-sm font-mono text-gray-700 dark:text-gray-300">
                                                {publicKey.toBase58().slice(0, 12)}...{publicKey.toBase58().slice(-12)}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <Button 
                                    onClick={logout} 
                                    variant="outline"
                                    className="w-full bg-white dark:bg-gray-800 border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02]"
                                >
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Sign Out
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Powered by Solana • Secured by blockchain
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
