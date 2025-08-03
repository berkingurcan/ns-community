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
    // Check if we're already connected to this exact wallet
    if (connected && wallet?.adapter?.name === walletName) {
      console.log(`Already connected to ${walletName}, disconnecting...`);
      await disconnect();
      setSelectedWallet(null);
      return;
    }

    setSelectedWallet(walletName);
    setIsConnecting(true);
    
    try {
      console.log(`Attempting to connect to wallet: ${walletName}`);
      
      // BYPASS 1: If publicKey exists, wallet is already working - skip adapter detection
      if (publicKey && connected) {
        console.log(`🚀 BYPASS: Wallet already connected with publicKey, skipping adapter detection`);
        console.log(`✅ Using existing connection: ${publicKey.toBase58()}`);
        onWalletSelect?.(walletName);
        return;
      }
      
      // BYPASS 2: Check for direct wallet availability (for any wallet, not just Phantom)
      const directWalletCheck = (() => {
        switch (walletName) {
          case 'Phantom':
            return (window as any)?.phantom?.solana?.isConnected;
          case 'Backpack':
            return (window as any)?.backpack?.solana?.isConnected;
          case 'Solflare':
            return (window as any)?.solflare?.isConnected;
          default:
            return false;
        }
      })();
      
      if (directWalletCheck) {
        console.log(`🚀 BYPASS: ${walletName} already connected directly in browser`);
        try {
          const walletProvider = (() => {
            switch (walletName) {
              case 'Phantom': return (window as any).phantom.solana;
              case 'Backpack': return (window as any).backpack.solana;
              case 'Solflare': return (window as any).solflare;
              default: return null;
            }
          })();
          
          if (walletProvider?.publicKey) {
            console.log(`✅ Using existing ${walletName} connection: ${walletProvider.publicKey.toString()}`);
            setSelectedWallet(walletName);
            onWalletSelect?.(walletName);
            return;
          }
        } catch (error) {
          console.warn(`⚠️ Direct ${walletName} check failed, continuing with adapter...`);
        }
      }
      
      // Force disconnect any existing connection first (even if connected=false)
      if (wallet?.adapter || connected) {
        console.log(`🔄 Clearing existing wallet connection (${wallet?.adapter?.name})...`);
        await disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Even longer wait for cleanup
      }
      
      // Clear any previous wallet state
      setSelectedWallet(null);
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Critical: Force select the EXACT wallet requested
      console.log(`🎯 Selecting wallet: ${walletName} (FORCED)`);
      select(walletName);
      
      // Verify the correct wallet was selected
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log(`🔍 Verification: Selected wallet is now: ${wallet?.adapter?.name}`);
      
      if (wallet?.adapter?.name && wallet.adapter.name !== walletName) {
        console.error(`❌ WALLET MISMATCH! Expected: ${walletName}, Got: ${wallet.adapter.name}`);
        // Try to force select again
        select(walletName);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      // Wait for wallet to be properly selected with ULTRA aggressive monitoring
      console.log('Waiting for wallet to be selected with dual detection...');
      let attempts = 0;
      const maxAttempts = 30; // More attempts
      let walletFound = false;
      
      while (attempts < maxAttempts && !walletFound) {
        await new Promise(resolve => setTimeout(resolve, 150)); // Faster polling
        
        // DUAL DETECTION: Check both adapter AND browser wallet object
        const hasWallet = wallet?.adapter;
        const correctName = wallet?.adapter?.name === walletName;
        const notConnecting = wallet?.adapter?.connecting === false;
        const isConnected = wallet?.adapter?.connected === true;
        const isReady = wallet?.adapter?.readyState === 'Installed';
        
        // Also check browser wallet directly (critical for extension conflicts!)
        const browserWallet = (() => {
          switch (walletName) {
            case 'Phantom': 
              return (window as any)?.phantom?.solana;
            case 'Backpack': 
              return (window as any)?.backpack?.solana;
            case 'Solflare': 
              return (window as any)?.solflare;
            default: 
              return null;
          }
        })();
        
        const hasBrowserWallet = !!browserWallet;
        const browserConnected = browserWallet?.isConnected;
        
        console.log(`[${attempts + 1}/${maxAttempts}] Detection Status:`, {
          adapter: {
            exists: !!hasWallet,
            name: wallet?.adapter?.name,
            ready: isReady,
            connected: isConnected
          },
          browser: {
            exists: hasBrowserWallet,
            connected: browserConnected,
            type: walletName
          }
        });
        
        // SUCCESS CONDITIONS: Either adapter ready OR browser wallet available
        if ((hasWallet && (correctName || isConnected)) || hasBrowserWallet) {
          console.log(`✅ ${walletName} detected and ready! (adapter: ${!!hasWallet}, browser: ${hasBrowserWallet})`);
          walletFound = true;
          break;
        }
        
        attempts++;
      }
      
      // More forgiving final check with better error messaging
      if (!walletFound) {
        // Try one more time with a longer delay and force connect
        console.log(`Final attempt to connect ${walletName}...`);
        console.log('Debug wallet state:', { 
          hasWallet: !!wallet?.adapter, 
          walletName: wallet?.adapter?.name, 
          connecting: wallet?.adapter?.connecting,
          connected: wallet?.adapter?.connected 
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // More lenient - try connecting even if polling failed
        if (wallet?.adapter?.name === walletName) {
          console.log(`Found ${walletName} adapter, proceeding with connection despite polling timeout...`);
          walletFound = true;
        } else if (wallet?.adapter?.connected) {
          console.log(`Wallet already connected (${wallet.adapter.name}), proceeding...`);
          walletFound = true;
        } else if (!wallet?.adapter) {
          // FALLBACK: Check if specific wallet exists in browser even if adapter isn't detected
          const walletInBrowser = (() => {
            switch (walletName) {
              case 'Phantom': return (window as any)?.phantom?.solana;
              case 'Solflare': return (window as any)?.solflare;
              case 'Backpack': return (window as any)?.backpack;
              default: return null;
            }
          })();
          
          if (walletInBrowser) {
            console.warn(`⚠️ ${walletName} exists in browser but adapter not detected. Trying direct connection...`);
            
            // Try direct connection bypass for supported wallets
            try {
              let connected = false;
              if (walletName === 'Phantom') {
                await (window as any).phantom.solana.connect();
                connected = true;
              } else if (walletName === 'Backpack') {
                // Backpack might use slightly different connection method
                const backpackWallet = (window as any).backpack?.solana;
                if (backpackWallet) {
                  await backpackWallet.connect();
                  connected = true;
                  console.log(`🎒 Backpack direct connection established`);
                }
              }
              
              if (connected) {
                console.log(`✅ Direct ${walletName} connection successful!`);
                setSelectedWallet(walletName);
                onWalletSelect?.(walletName);
                return;
              }
            } catch (directError) {
              console.warn(`⚠️ Direct ${walletName} connection failed:`, (directError as Error).message);
            }
          }
          
          // Graceful handling - don't throw error, just log warning
          console.warn(`⚠️ ${walletName} extension not available or not properly initialized.`);
          console.info(`💡 To use ${walletName}:`);
          console.info(`   1. Install the ${walletName} browser extension`);
          console.info(`   2. Refresh the page`);
          console.info(`   3. Try connecting again`);
          
          // Don't throw error - just return gracefully
          return;
        } else if (wallet.adapter.name !== walletName) {
          throw new Error(`Wrong wallet selected (${wallet.adapter.name} instead of ${walletName}). Please try again.`);
        }
      }
      
      // CRITICAL: Final verification before connecting (with Wallet Standard support)
      const finalVerification = wallet?.adapter?.name;
      console.log(`🔒 FINAL VERIFICATION: About to connect to ${finalVerification}, Expected: ${walletName}`);
      console.log(`🔍 Wallet Standard Info:`, {
        isStandard: !!(wallet?.adapter as any)?.standard,
        icon: (wallet?.adapter as any)?.icon,
        url: (wallet?.adapter as any)?.url
      });
      
      // More flexible matching for Wallet Standard wallets
      const isCorrectWallet = finalVerification === walletName || 
                             (walletName === 'Backpack' && finalVerification === 'Backpack') ||
                             (walletName === 'Backpack' && (wallet?.adapter as any)?.standard && finalVerification?.includes('Backpack'));
      
      if (!isCorrectWallet && finalVerification) {
        console.error(`🚨 CRITICAL WALLET MISMATCH!`);
        console.error(`Expected: ${walletName}`);
        console.error(`Adapter says: ${finalVerification}`);
        console.error(`This would cause wrong wallet to sign! STOPPING.`);
        
        // Force re-select the correct wallet one more time
        console.log(`🔄 Emergency re-select attempt for ${walletName}...`);
        select(walletName);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (wallet?.adapter?.name !== walletName) {
          throw new Error(`Wallet selection failed. Expected ${walletName} but got ${wallet?.adapter?.name}. Please try again.`);
        }
      }
      
      // Try to connect
      console.log(`🔗 Connecting to wallet: ${walletName} (VERIFIED: ${wallet?.adapter?.name})`);
      await connect();
      console.log(`✅ Successfully connected to wallet: ${walletName}`);
      
      // Update state and notify parent
      setSelectedWallet(walletName);
      onWalletSelect?.(walletName);
      
    } catch (error) {
      console.error(`Wallet connection failed for ${walletName}:`, error);
      setSelectedWallet(null);
      
      // Show user-friendly error messages
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        const errorStack = error.stack?.toLowerCase() || '';
        
        // Handle browser extension runtime errors
        if (errorMessage.includes('runtime.lasterror') || 
            errorMessage.includes('receiving end does not exist') ||
            errorMessage.includes('extension context invalidated') ||
            errorStack.includes('chrome-extension://')) {
          console.warn(`${walletName}: Browser extension conflict detected. This is usually harmless.`);
          console.error(`Extension runtime error with ${walletName}: Please try refreshing the page or restart your browser.`);
          return;
        }
        
        if (errorMessage.includes('user rejected') || errorMessage.includes('user declined')) {
          console.warn('Connection was rejected by user');
          // Don't throw error for user rejection - just reset state
          return;
        } else if (errorMessage.includes('wallet not found') || 
                   errorMessage.includes('not installed') ||
                   errorMessage.includes('extension not detected')) {
          console.error(`${walletName} is not installed. Please install the wallet extension first.`);
        } else if (errorMessage.includes('wallet is locked') || 
                   errorMessage.includes('not ready')) {
          console.error(`${walletName} is locked. Please unlock your wallet and try again.`);
        } else if (errorMessage.includes('wrong wallet selected')) {
          console.error(`Wallet mismatch detected. Please try connecting again.`);
        } else {
          console.error(`Failed to connect to ${walletName}. Please make sure it's installed and unlocked.`);
        }
      } else {
        // Handle non-Error objects
        console.error(`Unknown error connecting to ${walletName}:`, error);
      }
      
      // Don't re-throw errors - just log them and reset state
      // This prevents unhandled promise rejections
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