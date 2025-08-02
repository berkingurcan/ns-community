
'use client';

import { useAuth } from '@/context/AuthContext';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
// Removed unused imports
import { verifyNFTOwnership } from '@/lib/nftVerification';

const withAuth = (WrappedComponent: React.ComponentType) => {
    const AuthComponent = (props: React.ComponentProps<typeof WrappedComponent>) => {
        const { session } = useAuth();
        const { publicKey } = useWallet();
        const { connection } = useConnection();
        const router = useRouter();
        const [hasNft, setHasNft] = useState(false);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const checkNft = async () => {
                if (!session || !publicKey) {
                    router.push('/');
                    return;
                }

                try {
                    // Get collection address from environment variables
                    const collectionAddress = process.env.NEXT_PUBLIC_NFT_COLLECTION_ADDRESS;
                    if (!collectionAddress) {
                        console.error('NFT collection address not configured in environment variables');
                        router.push('/unauthorized');
                        return;
                    }

                    // Get RPC endpoint from environment variable (must support DAS API)
                    const rpcEndpoint = process.env.NEXT_PUBLIC_RPC_URL || connection.rpcEndpoint;
                    
                    if (!rpcEndpoint) {
                        console.error('RPC endpoint not configured. DAS API support required for compressed NFTs.');
                        router.push('/unauthorized');
                        return;
                    }

                    console.log('Verifying NFT ownership for collection:', collectionAddress);
                    
                    // Verify NFT ownership using the new compressed NFT verification
                    const hasNFT = await verifyNFTOwnership(publicKey, {
                        collectionAddress,
                        rpcEndpoint
                    });

                    if (hasNFT) {
                        console.log('User has required NFT from collection');
                        setHasNft(true);
                    } else {
                        console.log('User does not have required NFT from collection');
                        router.push('/unauthorized');
                    }
                } catch (error) {
                    console.error('Error checking NFT ownership:', error);
                    router.push('/unauthorized');
                } finally {
                    setLoading(false);
                }
            };

            checkNft();
        }, [session, publicKey, connection, router]);

        if (loading) {
            return <div>Loading...</div>; // Or a loading spinner
        }

        if (!session || !hasNft) {
            return null; // or a redirect component
        }

        return <WrappedComponent {...props} />;
    };

    return AuthComponent;
};

export default withAuth;
