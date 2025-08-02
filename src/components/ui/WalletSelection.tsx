'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-base';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface WalletOption {
  name: WalletName;
  icon: string;
  displayName: string;
  description: string;
  color: string;
  isPopular?: boolean;
}

const walletOptions: WalletOption[] = [
  {
    name: 'Phantom' as WalletName,
    icon: '👻',
    displayName: 'Phantom',
    description: 'Popular & secure',
    color: 'from-purple-500 to-indigo-600',
    isPopular: true,
  },
  {
    name: 'Solflare' as WalletName,
    icon: '🔥',
    displayName: 'Solflare',
    description: 'Feature-rich wallet',
    color: 'from-orange-500 to-red-600',
  },
  {
    name: 'Torus' as WalletName,
    icon: '🌐',
    displayName: 'Torus',
    description: 'Social login wallet',
    color: 'from-blue-500 to-cyan-600',
  },
];

interface WalletSelectionProps {
  onWalletSelect?: (walletName: WalletName) => void;
  connected?: boolean;
  className?: string;
}

export function WalletSelection({ onWalletSelect, connected, className }: WalletSelectionProps) {
  const { select, wallet, connect, connecting, disconnect } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<WalletName | null>(wallet?.adapter?.name || null);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleWalletClick = async (walletName: WalletName) => {
    if (connected && wallet?.adapter?.name === walletName) {
      // If already connected to this wallet, disconnect
      await disconnect();
      setSelectedWallet(null);
      return;
    }

    setSelectedWallet(walletName);
    setIsConnecting(true);
    
    try {
      select(walletName);
      await connect();
      onWalletSelect?.(walletName);
    } catch (error) {
      console.error('Wallet connection failed:', error);
      setSelectedWallet(null);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Choose Your Wallet
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Connect your preferred Solana wallet to continue
        </p>
      </div>

      <div className="grid gap-3">
        {walletOptions.map((walletOption) => {
          const isSelected = selectedWallet === walletOption.name;
          const isConnectedToThis = connected && wallet?.adapter?.name === walletOption.name;
          const isLoading = isConnecting && isSelected;

          return (
            <button
              key={walletOption.name}
              onClick={() => handleWalletClick(walletOption.name)}
              disabled={connecting || isConnecting}
              className={cn(
                "relative group p-4 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg",
                "bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm",
                isConnectedToThis
                  ? "border-green-400 bg-green-50/80 dark:bg-green-900/20 shadow-green-200 dark:shadow-green-800/30 shadow-lg"
                  : isSelected
                  ? "border-blue-400 bg-blue-50/80 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
                (connecting || isConnecting) && !isSelected && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Popular badge */}
              {walletOption.isPopular && (
                <div className="absolute -top-2 -right-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                  Popular
                </div>
              )}

              <div className="flex items-center space-x-4">
                {/* Wallet Icon */}
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-md transition-all duration-300",
                  `bg-gradient-to-br ${walletOption.color}`,
                  "group-hover:shadow-lg group-hover:scale-110"
                )}>
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>{walletOption.icon}</span>
                  )}
                </div>

                {/* Wallet Info */}
                <div className="flex-1 text-left">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200">
                      {walletOption.displayName}
                    </h4>
                    {isConnectedToThis && (
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                          Connected
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {walletOption.description}
                  </p>
                </div>

                {/* Connection Status */}
                <div className="flex-shrink-0">
                  {isConnectedToThis ? (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : isLoading ? (
                    <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                  ) : (
                    <div className="w-8 h-8 border-2 border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center group-hover:border-gray-400">
                      <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              {/* Subtle glow effect for connected wallet */}
              {isConnectedToThis && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-green-400/20 to-blue-400/20 animate-pulse pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {/* Connection Helper Text */}
      <div className="text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {connected ? (
            <span className="text-green-600 dark:text-green-400 font-medium">
              ✅ Wallet connected successfully
            </span>
          ) : (
            "Select a wallet to connect and authenticate"
          )}
        </p>
      </div>
    </div>
  );
}