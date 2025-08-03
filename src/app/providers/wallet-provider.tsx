
'use client';

import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    TorusWalletAdapter,
    Coin98WalletAdapter,
    MathWalletAdapter,
    TokenPocketWalletAdapter,
    SafePalWalletAdapter,
    BitKeepWalletAdapter,
    LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo, useEffect, useState } from 'react';
import { getConfiguredNetwork, validateConfiguration } from '@/lib/networkValidation';

export default function Wallet({ children }: { children: React.ReactNode }) {
    const [configValidation, setConfigValidation] = useState<{
        isValid: boolean;
        issues: string[];
        warnings: string[];
    } | null>(null);

    // Get network from configuration instead of hardcoding
    const network = useMemo(() => getConfiguredNetwork(), []);
    
    // Use custom RPC endpoint if available, otherwise fallback to clusterApiUrl
    const endpoint = useMemo(() => {
        const customRpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
        return customRpcUrl || clusterApiUrl(network);
    }, [network]);

    // Validate configuration on mount
    useEffect(() => {
        const validateConfig = async () => {
            try {
                const validation = await validateConfiguration();
                setConfigValidation(validation);
                
                if (!validation.isValid) {
                    console.error('❌ Configuration issues detected:', validation.issues);
                }
                
                if (validation.warnings.length > 0) {
                    console.warn('⚠️ Configuration warnings:', validation.warnings);
                }
            } catch (error) {
                console.error('Error validating configuration:', error);
            }
        };

        validateConfig();
    }, []);

    const wallets = useMemo(
        () => [
            // Popular wallets first
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            
            // Other common wallets
            new Coin98WalletAdapter(),
            new TorusWalletAdapter(),
            new TokenPocketWalletAdapter(),
            new MathWalletAdapter(),
            new SafePalWalletAdapter(),
            new BitKeepWalletAdapter(),
            new LedgerWalletAdapter(),
            
            // Note: Backpack uses Wallet Standard and will be auto-detected
            // Following official Solana cookbook pattern for Wallet Standard support
        ],
        [network]
    );

    // Show configuration errors if critical issues exist
    if (configValidation && !configValidation.isValid) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-red-50">
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 text-lg">⚠️</span>
                        </div>
                        <h2 className="text-lg font-semibold text-red-800">Configuration Error</h2>
                    </div>
                    <div className="space-y-2 mb-4">
                        {configValidation.issues.map((issue, index) => (
                            <div key={index} className="text-sm text-red-700 bg-red-50 p-2 rounded">
                                {issue}
                            </div>
                        ))}
                    </div>
                    <p className="text-sm text-gray-600">
                        Please check your environment variables and configuration.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>{children}</WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}
