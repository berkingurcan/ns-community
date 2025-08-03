'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletName } from '@solana/wallet-adapter-base';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface WalletOption {
  name: WalletName;
  icon: string;
  displayName: string;
  description: string;
  isPopular?: boolean;
}

const walletOptions: WalletOption[] = [
  {
    name: 'Phantom' as WalletName,
    icon: '👻',
    displayName: 'Phantom',
    description: 'Popular & secure',
    isPopular: true,
  },
  {
    name: 'Solflare' as WalletName,
    icon: '🔥',
    displayName: 'Solflare',
    description: 'Feature-rich wallet',
    isPopular: true,
  },
  {
    name: 'Backpack' as WalletName,
    icon: '🎒',
    displayName: 'Backpack',
    description: 'Next-level wallet',
  },
  {
    name: 'Brave' as WalletName,
    icon: '🦁',
    displayName: 'Brave Wallet',
    description: 'Built-in browser wallet',
  },
  {
    name: 'Coin98' as WalletName,
    icon: '💰',
    displayName: 'Coin98',
    description: 'Multi-chain wallet',
  },
  {
    name: 'Torus' as WalletName,
    icon: '🌐',
    displayName: 'Torus',
    description: 'Social login wallet',
  },
];

const moreWalletOptions: WalletOption[] = [
  {
    name: 'TokenPocket' as WalletName,
    icon: '📱',
    displayName: 'TokenPocket',
    description: 'Mobile-first wallet',
  },
  {
    name: 'MathWallet' as WalletName,
    icon: '🧮',
    displayName: 'MathWallet',
    description: 'Multi-platform wallet',
  },
  {
    name: 'SafePal' as WalletName,
    icon: '🔐',
    displayName: 'SafePal',
    description: 'Hardware & software wallet',
  },
  {
    name: 'BitKeep' as WalletName,
    icon: '🔑',
    displayName: 'BitKeep',
    description: 'Comprehensive wallet',
  },
  {
    name: 'Ledger' as WalletName,
    icon: '🏛️',
    displayName: 'Ledger',
    description: 'Hardware wallet',
  },
];

interface WalletSelectionProps {
  onWalletSelect?: (walletName: WalletName) => void;
  connected?: boolean;
  className?: string;
}

export function WalletSelection({ onWalletSelect, connected, className }: WalletSelectionProps) {
  const { select, wallet, connect, connecting, disconnect, wallets, publicKey } = useWallet();
  const [selectedWallet, setSelectedWallet] = useState<WalletName | null>(wallet?.adapter?.name || null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showMoreWallets, setShowMoreWallets] = useState(false);

  // Debug wallets on mount
  useEffect(() => {
    console.log('🔍 WalletSelection: Available wallet adapters:', wallets.map(w => ({
      name: w.adapter.name,
      readyState: w.adapter.readyState,
      connected: w.adapter.connected
    })));
  }, [wallets]);

  // Note: Global error handling is now done in layout.tsx to avoid conflicts

  // Real-time extension monitoring - Critical for detecting late injection
  useEffect(() => {
    let extensionCheckInterval: NodeJS.Timeout;
    let extensionCheckCount = 0;
    const MAX_CHECKS = 20; // 10 seconds total
    
    const checkWalletExtensions = () => {
      extensionCheckCount++;
      
      const extensionStatus = {
        phantom: {
          exists: !!(window as any)?.phantom?.solana,
          isConnected: (window as any)?.phantom?.solana?.isConnected,
          publicKey: (window as any)?.phantom?.solana?.publicKey?.toString()
        },
        backpack: {
          exists: !!(window as any)?.backpack?.solana,
          isConnected: (window as any)?.backpack?.solana?.isConnected,
          publicKey: (window as any)?.backpack?.solana?.publicKey?.toString()
        },
        solflare: {
          exists: !!(window as any)?.solflare,
          isConnected: (window as any)?.solflare?.isConnected,
        }
      };
      
      console.log(`🔍 Extension Check #${extensionCheckCount}/${MAX_CHECKS}:`, extensionStatus);
      
      // If we find any wallet extension, force a component update
      const hasAnyExtension = extensionStatus.phantom.exists || 
                             extensionStatus.backpack.exists || 
                             extensionStatus.solflare.exists;
      
      if (hasAnyExtension) {
        console.log('🎉 Wallet extensions detected! Forcing component refresh...');
        // Force re-render to update wallet availability detection
        setShowMoreWallets(prev => prev); // Trigger state update without change
      }
      
      // Stop checking after finding extensions or max attempts
      if (hasAnyExtension || extensionCheckCount >= MAX_CHECKS) {
        clearInterval(extensionCheckInterval);
        console.log('🏁 Extension monitoring stopped:', { 
          foundExtensions: hasAnyExtension,
          totalAttempts: extensionCheckCount 
        });
      }
    };
    
    // Start monitoring immediately and continue every 500ms
    checkWalletExtensions();
    extensionCheckInterval = setInterval(checkWalletExtensions, 500);
    
    return () => {
      if (extensionCheckInterval) {
        clearInterval(extensionCheckInterval);
      }
    };
  }, []); // Only run once on mount

  // Check for existing wallet connection on mount - Enhanced for autoConnect and Wallet Standard
  useEffect(() => {
    console.log('🔍 WalletSelection: Checking wallet state on mount', {
      hasWallet: !!wallet?.adapter,
      walletName: wallet?.adapter?.name,
      connected: connected,
      publicKey: !!publicKey,
      autoConnected: wallet?.adapter?.connected,
      walletStandard: !!(wallet?.adapter as any)?.standard
    });
    
    if (wallet?.adapter?.name) {
      setSelectedWallet(wallet.adapter.name);
      console.log('✅ Detected existing wallet connection:', wallet.adapter.name);
      
      // For Wallet Standard wallets (like Backpack), the name might be different
      if (wallet.adapter.name === 'Backpack') {
        console.log('🎒 Backpack detected via Wallet Standard');
      }
    }
    
    // If autoConnect worked and we have a connection, notify parent
    // This is crucial for Wallet Standard wallets like Backpack
    if (connected && publicKey && onWalletSelect) {
      const detectedWallet = wallet?.adapter?.name || 'Unknown';
      console.log('🚀 AutoConnect detected, notifying parent...', { 
        walletName: detectedWallet,
        isStandard: !!(wallet?.adapter as any)?.standard 
      });
      onWalletSelect(detectedWallet as WalletName);
    }
  }, [wallet?.adapter?.name, connected, publicKey, onWalletSelect]);

  const handleWalletClick = async (walletName: WalletName) => {
    console.log(`🎯 Attempting to connect to wallet: ${walletName}`);
    setIsConnecting(true);
    
    try {
      // If already connected to this wallet, do nothing
      if (connected && wallet?.adapter?.name === walletName && publicKey) {
        console.log(`✅ Already connected to ${walletName}`);
        setSelectedWallet(walletName);
        onWalletSelect?.(walletName);
        return;
      }

      // Disconnect from any existing wallet first
      if (connected) {
        console.log(`🔄 Disconnecting from ${wallet?.adapter?.name} to switch to ${walletName}`);
        await disconnect();
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Check if wallet is available before selecting
      const availableWallets = wallets.map(w => w.adapter.name);
      console.log(`🔍 Available wallets:`, availableWallets);
      console.log(`🎯 Looking for wallet:`, walletName);
      console.log(`📱 Wallets detail:`, wallets.map(w => ({
        name: w.adapter.name,
        readyState: w.adapter.readyState,
        publicKey: w.adapter.publicKey?.toString(),
        connected: w.adapter.connected
      })));
      
      if (!availableWallets.includes(walletName)) {
        console.error(`❌ ${walletName} not found in available wallets`);
        console.error(`Available: [${availableWallets.join(', ')}]`);
        throw new Error(`${walletName} wallet is not available. Available wallets: ${availableWallets.join(', ')}`);
      }

      // Select the requested wallet
      console.log(`🔧 Selecting ${walletName} adapter...`);
      select(walletName);
      
      // Wait for selection to complete with retries
      let attempts = 0;
      const maxAttempts = 10;
      
      while (attempts < maxAttempts && wallet?.adapter?.name !== walletName) {
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log(`[${attempts + 1}/${maxAttempts}] Waiting for ${walletName} selection...`);
        
        if (wallet?.adapter?.name !== walletName && attempts === 2) {
          // Retry selection after a few attempts
          console.log(`🔄 Retrying ${walletName} selection...`);
          select(walletName);
        }
        
        attempts++;
      }

      // Final check
      if (wallet?.adapter?.name !== walletName) {
        console.error(`❌ Wallet selection failed after ${maxAttempts} attempts`);
        console.error(`Available wallets:`, availableWallets);
        console.error(`Selected wallet:`, wallet?.adapter?.name || 'none');
        throw new Error(`Could not select ${walletName}. Please try refreshing the page and ensure ${walletName} is properly installed.`);
      }

      // Connect to the wallet
      console.log(`🔗 Connecting to ${walletName}...`);
      await connect();
      
      console.log(`✅ Successfully connected to ${walletName}`);
      setSelectedWallet(walletName);
      onWalletSelect?.(walletName);

    } catch (error) {
      console.error(`❌ Failed to connect to ${walletName}:`, error);
      setSelectedWallet(null);
      
      // User-friendly error handling
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('user rejected') || errorMessage.includes('user declined')) {
          console.log('User cancelled wallet connection');
          return;
        } else if (errorMessage.includes('not installed') || errorMessage.includes('not found')) {
          console.error(`${walletName} wallet is not installed. Please install it first.`);
        } else if (errorMessage.includes('locked')) {
          console.error(`${walletName} wallet is locked. Please unlock it and try again.`);
        } else {
          console.error(`Failed to connect to ${walletName}. Please make sure it's installed and unlocked.`);
        }
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const renderWalletButton = (walletOption: WalletOption) => {
    const isSelected = selectedWallet === walletOption.name;
    const isConnectedToThis = connected && wallet?.adapter?.name === walletOption.name;
    const isLoading = isConnecting && isSelected;
    
    // Enhanced wallet availability detection with detailed checking
    const isWalletAvailable = () => {
      const availability = (() => {
        switch (walletOption.name) {
          case 'Phantom': {
            const phantomWallet = (window as any)?.phantom?.solana;
            const isAvailable = !!phantomWallet;
            if (isAvailable) {
              console.log('🟢 Phantom detected:', {
                isConnected: phantomWallet?.isConnected,
                publicKey: phantomWallet?.publicKey?.toString(),
                hasMethod: typeof phantomWallet?.connect === 'function'
              });
            }
            return isAvailable;
          }
          case 'Backpack': {
            const backpackWallet = (window as any)?.backpack?.solana;
            const isAvailable = !!backpackWallet;
            if (isAvailable) {
              console.log('🟢 Backpack detected:', {
                isConnected: backpackWallet?.isConnected,
                publicKey: backpackWallet?.publicKey?.toString(),
                hasMethod: typeof backpackWallet?.connect === 'function'
              });
            }
            return isAvailable;
          }
          case 'Solflare': {
            const solflareWallet = (window as any)?.solflare;
            const isAvailable = !!solflareWallet;
            if (isAvailable) {
              console.log('🟢 Solflare detected:', {
                isConnected: solflareWallet?.isConnected,
                hasMethod: typeof solflareWallet?.connect === 'function'
              });
            }
            return isAvailable;
          }
          case 'Coin98':
            return !!(window as any)?.coin98;
          case 'TokenPocket':
            return !!(window as any)?.tokenpocket;
          case 'MathWallet':
            return !!(window as any)?.mathwallet;
          case 'SafePal':
            return !!(window as any)?.safepal;
          case 'BitKeep':
            return !!(window as any)?.bitkeep;
          case 'Ledger':
            return true; // Hardware wallet
          default:
            return true;
        }
      })();
      
      // Log the final availability status for debugging
      if (!availability && ['Phantom', 'Backpack', 'Solflare'].includes(walletOption.name)) {
        console.log(`🔴 ${walletOption.name} NOT detected in browser window`);
      }
      
      return availability;
    };
    
    const isAvailable = isWalletAvailable();
    const shouldDisable = !isAvailable || isLoading || connecting;
    
    const handleClick = async () => {
      if (!isAvailable) {
        console.warn(`${walletOption.name} wallet is not installed`);
        return;
      }
      
      // If connected to a different wallet, disconnect first then connect to new one
      if (connected && !isConnectedToThis) {
        console.log(`Switching from ${wallet?.adapter?.name} to ${walletOption.name}`);
        try {
          await disconnect();
          // Small delay to ensure clean disconnection
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.warn('Error disconnecting previous wallet:', error);
          // Continue anyway - some wallets might already be disconnected
        }
      }
      
      handleWalletClick(walletOption.name);
    };

    return (
      <button
        key={walletOption.name}
        onClick={handleClick}
        disabled={shouldDisable}
        className={cn(
          "relative group p-3 rounded-lg border transition-all duration-200",
          "bg-white dark:bg-white",
          isConnectedToThis
            ? "border-green-500 bg-green-50 dark:border-green-500 dark:bg-green-50"
            : isSelected
            ? "border-blue-300 bg-blue-50 dark:border-blue-300 dark:bg-blue-50"
            : isAvailable
            ? "border-gray-200 hover:border-gray-300 dark:border-gray-200 dark:hover:border-gray-300"
            : "border-gray-100 bg-gray-50 dark:border-gray-100 dark:bg-gray-50",
          shouldDisable && "opacity-50 cursor-not-allowed"
        )}
      >
        {/* Popular badge */}
        {walletOption.isPopular && (
          <div className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-md">
            Popular
          </div>
        )}

        <div className="flex items-center space-x-3">
          {/* Wallet Icon */}
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl transition-all duration-200">
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            ) : (
              <span>{walletOption.icon}</span>
            )}
          </div>

          {/* Wallet Info */}
          <div className="flex-1 text-left min-w-0">
            <div className="flex items-center space-x-1">
              <h4 className="font-semibold text-sm text-gray-900 truncate">
                {walletOption.displayName}
              </h4>
              {isConnectedToThis && (
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              )}
            </div>
            <p className="text-xs truncate">
              {isConnectedToThis 
                ? "✅ Connected & Ready"
                : !isAvailable 
                ? "❌ Not Installed" 
                : connected 
                ? "🔄 Click to Switch"
                : walletOption.description
              }
            </p>
          </div>

          {/* Connection Status */}
          <div className="shrink-0">
            {isConnectedToThis ? (
              <div className="w-5 h-5 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : isLoading ? (
              <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            ) : !isAvailable ? (
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
            ) : connected && !isConnectedToThis ? (
              <div className="w-5 h-5 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            ) : (
              <div className="w-5 h-5 rounded-full flex items-center justify-center">
                <svg className="w-2.5 h-2.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="text-center space-y-1">
        <h3 className="text-lg font-semibold text-gray-900">
          Choose Your Wallet
        </h3>
        <p className="text-sm text-gray-700">
          {connected && publicKey 
            ? `✅ Connected to ${wallet?.adapter?.name || 'wallet'} • Ready for authentication`
            : 'Connect your preferred Solana wallet to continue'
          }
        </p>
        {connected && publicKey && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-xs text-green-700 text-center">
              🎉 Perfect! Your wallet is connected. You can now click "Enter Project Hub" below to authenticate.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {walletOptions.map(renderWalletButton)}
      </div>

      {/* More Wallets Button */}
      <div className="text-center">
        <button
          onClick={() => setShowMoreWallets(!showMoreWallets)}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
        >
          {showMoreWallets ? 'Show Less' : 'More Wallets'}
        </button>
      </div>

      {/* More Wallets Section */}
      {showMoreWallets && (
        <div className="space-y-2">
          <div className="border-t border-gray-200 pt-3">
            <h4 className="text-sm font-medium text-gray-900 text-center mb-2">Additional Wallets</h4>
            <div className="grid grid-cols-2 gap-2">
              {moreWalletOptions.map(renderWalletButton)}
            </div>
          </div>
        </div>
      )}

      {/* Connection Helper Text */}
      <div className="text-center">
        <p className="text-xs text-gray-600">
          {connected ? (
            <span className="text-blue-600 font-medium">
              Wallet connected successfully
            </span>
          ) : (
            "Select a wallet to connect and authenticate"
          )}
        </p>
      </div>
    </div>
  );
}