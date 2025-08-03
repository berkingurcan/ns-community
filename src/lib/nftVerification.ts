import { PublicKey } from '@solana/web3.js';

export interface NFTVerificationConfig {
  collectionAddress: string;
  rpcEndpoint: string;
}

// Simple cache to prevent repeated API calls for same wallet
const verificationCache = new Map<string, { result: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// DAS API response interfaces
interface DASAsset {
  id: string;
  content?: {
    metadata?: {
      name?: string;
      symbol?: string;
    };
  };
  grouping?: Array<{
    group_key: string;
    group_value: string;
  }>;
  ownership: {
    owner: string;
    delegate?: string;
  };
  compression?: {
    compressed: boolean;
  };
}

interface DASResponse {
  result: {
    items: DASAsset[];
    total: number;
  };
}

/**
 * Verifies if a wallet owns at least one NFT from a specific compressed NFT collection using DAS API
 * @param walletAddress - The wallet address to check
 * @param config - Configuration containing collection address and RPC endpoint
 * @returns Promise<boolean> - True if wallet owns at least one NFT from the collection
 */
export async function verifyNFTOwnership(
  walletAddress: PublicKey,
  config: NFTVerificationConfig
): Promise<boolean> {
  try {
    const cacheKey = `${walletAddress.toString()}-${config.collectionAddress}`;
    const now = Date.now();
    
    // Check cache first
    const cached = verificationCache.get(cacheKey);
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      console.log('✅ Using cached NFT verification result for:', walletAddress.toString());
      return cached.result;
    }

    // Check if user is trying to use standard Solana RPC (which won't work)
    if (config.rpcEndpoint.includes('api.mainnet-beta.solana.com') || 
        config.rpcEndpoint.includes('api.devnet.solana.com') ||
        config.rpcEndpoint.includes('api.testnet.solana.com')) {
      console.error('⚠️  Standard Solana RPC endpoints do not support DAS API required for compressed NFTs.');
      console.error('Please use an RPC provider that supports DAS API (Helius, QuickNode, etc.)');
      throw new Error('RPC endpoint does not support DAS API. Please use Helius, QuickNode, or another DAS-compatible provider.');
    }

    console.log('🔍 Checking NFT ownership for wallet:', walletAddress.toString());
    console.log('Collection address:', config.collectionAddress);
    console.log('Using RPC endpoint:', config.rpcEndpoint);

    // Get all assets owned by the wallet using DAS API
    const ownedAssets = await getAssetsByOwner(walletAddress.toString(), config.rpcEndpoint);
    
    if (!ownedAssets || ownedAssets.length === 0) {
      console.log('No assets found for wallet');
      return false;
    }

    console.log(`Found ${ownedAssets.length} assets owned by wallet`);

    // Check if any of the owned assets belong to the specified collection
    const hasCollectionNFT = ownedAssets.some(asset => {
      if (asset.grouping && asset.grouping.length > 0) {
        return asset.grouping.some(group => 
          group.group_key === 'collection' && 
          group.group_value === config.collectionAddress
        );
      }
      return false;
    });

    console.log('Has collection NFT:', hasCollectionNFT);
    
    // Cache the result
    verificationCache.set(cacheKey, { result: hasCollectionNFT, timestamp: now });
    
    return hasCollectionNFT;
  } catch (error) {
    console.error('Error verifying NFT ownership:', error);
    
    // Cache negative result for shorter time (1 minute) in case of errors
    const cacheKey = `${walletAddress.toString()}-${config.collectionAddress}`;
    const now = Date.now();
    verificationCache.set(cacheKey, { result: false, timestamp: now - CACHE_DURATION + 60000 });
    
    return false;
  }
}

/**
 * Get all assets owned by a wallet using DAS API
 */
async function getAssetsByOwner(ownerAddress: string, rpcEndpoint: string): Promise<DASAsset[]> {
  try {
    const response = await fetch(rpcEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'get-assets-by-owner',
        method: 'getAssetsByOwner',
        params: {
          ownerAddress,
          page: 1,
          limit: 1000, // Get up to 1000 assets
          displayOptions: {
            showFungible: false, // Only NFTs, not fungible tokens
            showNativeBalance: false,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DASResponse = await response.json();
    
    if (data.result && data.result.items) {
      return data.result.items;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching assets by owner:', error);
    throw error;
  }
}

/**
 * Get all assets in a collection using DAS API
 */
async function getAssetsByGroup(collectionAddress: string, rpcEndpoint: string): Promise<DASAsset[]> {
  try {
    const response = await fetch(rpcEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'get-assets-by-group',
        method: 'getAssetsByGroup',
        params: {
          groupKey: 'collection',
          groupValue: collectionAddress,
          page: 1,
          limit: 1000,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: DASResponse = await response.json();
    
    if (data.result && data.result.items) {
      return data.result.items;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching assets by group:', error);
    throw error;
  }
}

/**
 * Alternative method: Get collection info and verify ownership
 * This is useful if you want to get more detailed information about the collection
 */
export async function verifyNFTOwnershipWithCollectionInfo(
  walletAddress: PublicKey,
  config: NFTVerificationConfig
): Promise<{ hasNFT: boolean; ownedNFTs: DASAsset[] }> {
  try {
    // Get all assets owned by the wallet
    const ownedAssets = await getAssetsByOwner(walletAddress.toString(), config.rpcEndpoint);
    
    // Filter to only include assets from the specified collection
    const ownedCollectionNFTs = ownedAssets.filter(asset => {
      if (asset.grouping && asset.grouping.length > 0) {
        return asset.grouping.some(group => 
          group.group_key === 'collection' && 
          group.group_value === config.collectionAddress
        );
      }
      return false;
    });

    return {
      hasNFT: ownedCollectionNFTs.length > 0,
      ownedNFTs: ownedCollectionNFTs
    };
  } catch (error) {
    console.error('Error verifying NFT ownership with collection info:', error);
    return { hasNFT: false, ownedNFTs: [] };
  }
}

/**
 * Check if a collection exists and is valid
 * @param collectionAddress - The collection address to verify
 * @param rpcEndpoint - RPC endpoint to use
 * @returns Promise<boolean> - True if collection exists and is accessible
 */
export async function verifyCollectionExists(
  collectionAddress: string,
  rpcEndpoint: string
): Promise<boolean> {
  try {
    const assets = await getAssetsByGroup(collectionAddress, rpcEndpoint);
    return assets.length > 0;
  } catch (error) {
    console.error('Error verifying collection existence:', error);
    return false;
  }
}