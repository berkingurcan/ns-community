
'use client';

import { useAuth } from '@/context/AuthContext';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';

const withAuth = (WrappedComponent: React.ComponentType) => {
    const AuthComponent = (props: any) => {
        const { session } = useAuth();
        const { publicKey }s = useWallet();
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
                    const nftCollectionMint = new PublicKey(process.env.NEXT_PUBLIC_NFT_COLLECTION_MINT!);
                    const nfts = await connection.getParsedTokenAccountsByOwner(
                        publicKey,
                        {
                            programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
                        }
                    );

                    const userHasNft = nfts.value.some(nft => {
                        const mint = new PublicKey(nft.account.data.parsed.info.mint);
                        // This is a simplified check. For a more robust solution,
                        // you would likely need to fetch the NFT's metadata to verify the collection.
                        return mint.equals(nftCollectionMint);
                    });

                    if (userHasNft) {
                        setHasNft(true);
                    } else {
                        router.push('/unauthorized'); // Redirect to an unauthorized page
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
