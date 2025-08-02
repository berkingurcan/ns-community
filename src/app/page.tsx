
'use client';

import { useAuth } from '@/context/AuthContext';
import { useWallet } from '@solana/wallet-adapter-react';
import { Button } from '@/components/ui/Button';
import { StepIndicator } from '@/components/ui/StepIndicator';
import { WalletSelection } from '@/components/ui/WalletSelection';
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative flex items-center justify-center p-4 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Floating geometric shapes */}
                <div className="absolute top-20 right-20 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full blur-xl animate-float"></div>
                <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 rounded-full blur-xl animate-float-delay"></div>
                <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-xl animate-pulse-slow"></div>
                
                {/* Grid pattern overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>
                
                {/* Subtle stars */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.1)_1px,transparent_1px),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
            </div>

            <div className="relative w-full max-w-lg">
                {/* Main card with enhanced glass morphism */}
                <div className="bg-white/10 dark:bg-white/5 backdrop-blur-2xl rounded-3xl border border-white/20 dark:border-white/10 p-8 space-y-8 shadow-2xl shadow-purple-500/10 relative overflow-hidden">
                    {/* Card glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-blue-500/5 rounded-3xl"></div>
                    <div className="absolute inset-px bg-gradient-to-br from-white/10 to-transparent rounded-3xl"></div>
                    
                    {/* Header section with enhanced web3 styling */}
                    <div className="relative text-center space-y-6">
                        {/* Animated logo with blockchain-inspired design */}
                        <div className="relative mx-auto w-24 h-24 group">
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 rounded-2xl animate-spin-slow opacity-75"></div>
                            <div className="relative w-full h-full bg-gradient-to-br from-purple-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-500">
                                {/* Blockchain/Web3 inspired icon */}
                                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
                                </svg>
                                
                                {/* Subtle inner glow */}
                                <div className="absolute inset-2 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent animate-gradient-x">
                                    NFT Gated
                                </h1>
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
                                    <span className="text-purple-300 font-mono text-sm tracking-wider">WEB3</span>
                                    <div className="w-8 h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent"></div>
                                </div>
                            </div>
                            <p className="text-gray-300 text-lg leading-relaxed max-w-sm mx-auto">
                                Connect your Solana wallet to access exclusive NFT-gated content
                            </p>
                        </div>
                    </div>

                    {/* Authentication section with enhanced styling */}
                    <div className="relative space-y-8">
                        {!session ? (
                            <div className="space-y-6">
                                {/* Enhanced step indicators */}
                                <div className="relative">
                                    <StepIndicator 
                                        steps={[
                                            {
                                                label: "Connect Wallet",
                                                completed: connected,
                                                active: !connected
                                            },
                                            {
                                                label: "Authenticate", 
                                                completed: !!session,
                                                active: connected && !session
                                            },
                                            {
                                                label: "Access Granted",
                                                completed: !!session,
                                                active: false
                                            }
                                        ]}
                                    />
                                </div>

                                {/* Custom wallet selection */}
                                <div className="relative">
                                    <WalletSelection 
                                        connected={connected}
                                        onWalletSelect={() => {}}
                                        className="animate-slideUp"
                                    />
                                </div>

                                {/* Enhanced authentication button */}
                                {publicKey && (
                                    <div className="space-y-4 animate-fadeIn">
                                        {/* Wallet connected indicator */}
                                        <div className="relative p-4 rounded-2xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 backdrop-blur-sm">
                                            <div className="flex items-center space-x-4">
                                                <div className="relative">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                                                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full"></div>
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-green-100">Wallet Connected</p>
                                                    <p className="text-xs text-green-300 font-mono tracking-wider">
                                                        {publicKey.toBase58().slice(0, 6)}...{publicKey.toBase58().slice(-6)}
                                                    </p>
                                                </div>
                                                <div className="text-green-400 opacity-50">
                                                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        {/* Enhanced authentication button */}
                                        <Button 
                                            onClick={handleLogin}
                                            disabled={isLoading}
                                            className="relative w-full h-14 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 hover:from-purple-500 hover:via-blue-500 hover:to-cyan-500 text-white font-bold text-lg rounded-2xl shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all duration-500 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                                        >
                                            {/* Button background animation */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                                            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.1)_50%,transparent_70%)] translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                                            
                                            <div className="relative z-10">
                                                {isLoading ? (
                                                    <div className="flex items-center justify-center space-x-3">
                                                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                        <span>Authenticating...</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center space-x-3">
                                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                                        </svg>
                                                        <span>Authenticate & Enter</span>
                                                    </div>
                                                )}
                                            </div>
                                        </Button>
                                    </div>
                                )}

                                {/* Enhanced help text */}
                                <div className="text-center space-y-3">
                                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-sm">
                                        <p className="text-sm text-purple-200 leading-relaxed">
                                            🔐 Your wallet signature verifies NFT ownership for secure access
                                        </p>
                                    </div>
                                    {!connected && (
                                        <div className="flex items-center justify-center space-x-2 animate-pulse">
                                            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                                            <p className="text-sm text-cyan-300 font-medium">
                                                Connect your wallet to begin
                                            </p>
                                            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : (
                            /* Enhanced logged in state */
                            <div className="text-center space-y-8 animate-fadeIn">
                                {/* Success animation */}
                                <div className="relative mx-auto w-24 h-24">
                                    <div className="absolute inset-0 bg-gradient-to-br from-green-400 via-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
                                    <div className="relative w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl">
                                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {/* Success particles */}
                                        <div className="absolute inset-0 rounded-full">
                                            <div className="absolute top-2 right-2 w-2 h-2 bg-yellow-300 rounded-full animate-ping"></div>
                                            <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-300"></div>
                                            <div className="absolute top-1/2 right-1 w-1 h-1 bg-cyan-300 rounded-full animate-bounce delay-500"></div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                            Access Granted! 🎉
                                        </h2>
                                        <p className="text-gray-300 text-lg">
                                            You're authenticated and ready to explore
                                        </p>
                                    </div>
                                    
                                    {publicKey && (
                                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-xs text-gray-400 mb-1">Active Wallet</p>
                                                    <p className="text-sm font-mono text-gray-200 tracking-wider">
                                                        {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
                                                    </p>
                                                </div>
                                                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Enhanced logout button */}
                                <Button 
                                    onClick={logout} 
                                    variant="outline"
                                    className="relative w-full h-12 bg-white/5 border-2 border-red-400/30 text-red-300 hover:bg-red-500/10 hover:border-red-400/50 font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] group overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/5 to-red-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                                    <div className="relative flex items-center justify-center space-x-2">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        <span>Disconnect Wallet</span>
                                    </div>
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Enhanced Footer */}
                    <div className="relative text-center pt-6 border-t border-white/10">
                        <div className="flex items-center justify-center space-x-3 mb-2">
                            <div className="w-4 h-4 bg-gradient-to-r from-purple-400 to-cyan-400 rounded-full animate-pulse"></div>
                            <p className="text-sm text-gray-400 font-medium">
                                Powered by <span className="text-purple-400 font-semibold">Solana</span>
                            </p>
                            <div className="w-4 h-4 bg-gradient-to-r from-cyan-400 to-purple-400 rounded-full animate-pulse delay-500"></div>
                        </div>
                        <p className="text-xs text-gray-500">
                            🔐 Secured by blockchain technology
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
