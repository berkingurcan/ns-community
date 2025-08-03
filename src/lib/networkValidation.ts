import { Connection, PublicKey } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';

export interface NetworkInfo {
  name: string;
  cluster: WalletAdapterNetwork;
  chainId: string;
  rpcUrl: string;
}

export interface NetworkValidationResult {
  isValid: boolean;
  currentNetwork: NetworkInfo | null;
  expectedNetwork: NetworkInfo;
  message: string;
  shouldSwitchNetwork: boolean;
}

// Network configurations
export const SUPPORTED_NETWORKS: Record<WalletAdapterNetwork, NetworkInfo> = {
  [WalletAdapterNetwork.Mainnet]: {
    name: 'Mainnet Beta',
    cluster: WalletAdapterNetwork.Mainnet,
    chainId: '0x1',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
  },
  [WalletAdapterNetwork.Devnet]: {
    name: 'Devnet',
    cluster: WalletAdapterNetwork.Devnet,
    chainId: '0x2',
    rpcUrl: 'https://api.devnet.solana.com',
  },
  [WalletAdapterNetwork.Testnet]: {
    name: 'Testnet',
    cluster: WalletAdapterNetwork.Testnet,
    chainId: '0x3',
    rpcUrl: 'https://api.testnet.solana.com',
  },
};

/**
 * Detect the current network from an RPC endpoint
 */
export async function detectNetworkFromRPC(rpcUrl: string): Promise<NetworkInfo | null> {
  try {
    const connection = new Connection(rpcUrl, 'confirmed');
    
    // Get the genesis hash to determine network
    const genesisHash = await connection.getGenesisHash();
    
    // Known genesis hashes for different networks
    const networkHashes = {
      [WalletAdapterNetwork.Mainnet]: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdpKuc147dw2N9d',
      [WalletAdapterNetwork.Devnet]: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1wcaWoxPkrZBG',
      [WalletAdapterNetwork.Testnet]: '4uhcVJyU9pJkvQyS88uRDiswHXSCkY3zQawwpjk2NsNY',
    };

    // Find matching network
    for (const [network, hash] of Object.entries(networkHashes)) {
      if (genesisHash === hash) {
        return SUPPORTED_NETWORKS[network as WalletAdapterNetwork];
      }
    }

    // If not a standard network, try to determine from RPC URL
    if (rpcUrl.includes('devnet')) {
      return SUPPORTED_NETWORKS[WalletAdapterNetwork.Devnet];
    } else if (rpcUrl.includes('testnet')) {
      return SUPPORTED_NETWORKS[WalletAdapterNetwork.Testnet];
    } else if (rpcUrl.includes('mainnet')) {
      return SUPPORTED_NETWORKS[WalletAdapterNetwork.Mainnet];
    }

    return null;
  } catch (error) {
    console.error('Error detecting network from RPC:', error);
    return null;
  }
}

/**
 * Validate if the current wallet/connection is on the expected network
 */
export async function validateNetwork(
  connection: Connection,
  expectedNetwork: WalletAdapterNetwork,
  walletPublicKey?: PublicKey
): Promise<NetworkValidationResult> {
  const expected = SUPPORTED_NETWORKS[expectedNetwork];
  
  try {
    // Try to detect current network
    const currentNetwork = await detectNetworkFromRPC(connection.rpcEndpoint);
    
    if (!currentNetwork) {
      return {
        isValid: false,
        currentNetwork: null,
        expectedNetwork: expected,
        message: `Unable to detect network from RPC endpoint: ${connection.rpcEndpoint}`,
        shouldSwitchNetwork: false,
      };
    }

    // Check if networks match
    if (currentNetwork.cluster === expectedNetwork) {
      return {
        isValid: true,
        currentNetwork,
        expectedNetwork: expected,
        message: `Connected to correct network: ${currentNetwork.name}`,
        shouldSwitchNetwork: false,
      };
    } else {
      return {
        isValid: false,
        currentNetwork,
        expectedNetwork: expected,
        message: `Network mismatch: Connected to ${currentNetwork.name}, but app expects ${expected.name}`,
        shouldSwitchNetwork: true,
      };
    }
  } catch (error) {
    return {
      isValid: false,
      currentNetwork: null,
      expectedNetwork: expected,
      message: `Network validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      shouldSwitchNetwork: false,
    };
  }
}

/**
 * Check if an RPC endpoint supports DAS API (required for compressed NFTs)
 */
export async function validateDASSupport(rpcUrl: string): Promise<{
  isSupported: boolean;
  message: string;
}> {
  try {
    // Test DAS API by making a simple request
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'test-das-support',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress: '11111111111111111111111111111111', // Dummy address for testing
          page: 1,
          limit: 1,
        },
      }),
    });

    const data = await response.json();
    
    // If we get a proper DAS response (even with no results), DAS is supported
    if (data.result !== undefined) {
      return {
        isSupported: true,
        message: 'RPC endpoint supports DAS API',
      };
    }
    
    // Check for specific DAS API error indicating the method exists but failed
    if (data.error && data.error.message) {
      const errorMessage = data.error.message.toLowerCase();
      if (errorMessage.includes('method not found') || errorMessage.includes('method does not exist')) {
        return {
          isSupported: false,
          message: 'RPC endpoint does not support DAS API. Please use a DAS-compatible provider like Helius or QuickNode.',
        };
      } else {
        // Other errors might indicate DAS is supported but request failed
        return {
          isSupported: true,
          message: 'RPC endpoint appears to support DAS API (got valid error response)',
        };
      }
    }

    return {
      isSupported: false,
      message: 'Unable to determine DAS API support',
    };
  } catch (error) {
    return {
      isSupported: false,
      message: `Error testing DAS API support: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Get the current network environment from configuration
 */
export function getConfiguredNetwork(): WalletAdapterNetwork {
  // Check if we have an environment variable specifying the network
  const envNetwork = process.env.NEXT_PUBLIC_SOLANA_NETWORK?.toLowerCase();
  
  switch (envNetwork) {
    case 'devnet':
      return WalletAdapterNetwork.Devnet;
    case 'testnet':
      return WalletAdapterNetwork.Testnet;
    case 'mainnet':
    case 'mainnet-beta':
      return WalletAdapterNetwork.Mainnet;
    default:
      // Default to mainnet if not specified
      return WalletAdapterNetwork.Mainnet;
  }
}

/**
 * Validate configuration for potential issues
 */
export async function validateConfiguration(): Promise<{
  isValid: boolean;
  issues: string[];
  warnings: string[];
}> {
  const issues: string[] = [];
  const warnings: string[] = [];

  // Check required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    issues.push('NEXT_PUBLIC_SUPABASE_URL is not configured');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    issues.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is not configured');
  }
  
  if (!process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS) {
    issues.push('NEXT_PUBLIC_NFT_COLLECTION_ADDRESS is not configured');
  } else {
    // Validate collection address format
    try {
      new PublicKey(process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS);
    } catch {
      issues.push('NEXT_PUBLIC_NFT_COLLECTION_ADDRESS is not a valid Solana public key');
    }
  }

  // Check RPC configuration
  const rpcUrl = process.env.NEXT_PUBLIC_RPC_URL;
  if (!rpcUrl) {
    warnings.push('NEXT_PUBLIC_RPC_URL is not configured, using default Solana RPC (may not support DAS API)');
  } else {
    // Check if using standard Solana RPC (won't support DAS)
    if (rpcUrl.includes('api.mainnet-beta.solana.com') ||
        rpcUrl.includes('api.devnet.solana.com') ||
        rpcUrl.includes('api.testnet.solana.com')) {
      issues.push('Standard Solana RPC endpoints do not support DAS API required for compressed NFTs');
    } else {
      // Test DAS support
      const dasResult = await validateDASSupport(rpcUrl);
      if (!dasResult.isSupported) {
        warnings.push(`RPC endpoint may not support DAS API: ${dasResult.message}`);
      }
    }
  }

  // Check network consistency
  const configuredNetwork = getConfiguredNetwork();
  if (rpcUrl) {
    const detectedNetwork = await detectNetworkFromRPC(rpcUrl);
    if (detectedNetwork && detectedNetwork.cluster !== configuredNetwork) {
      warnings.push(`Network mismatch: Configured for ${configuredNetwork} but RPC appears to be ${detectedNetwork.cluster}`);
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
    warnings,
  };
}