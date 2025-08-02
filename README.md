This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## NFT-Gated Authentication

This application implements NFT-gated authentication using Solana wallet connection and Bubblegum compressed NFT verification. Users must own at least one NFT from a specified collection to access protected routes.

### Features

- **Solana Wallet Integration**: Connect with popular Solana wallets (Phantom, Solflare, Torus)
- **Compressed NFT Support**: Full support for Bubblegum compressed NFTs using Metaplex SDK
- **Collection-Based Gating**: Verify ownership of NFTs from a specific collection
- **Supabase Authentication**: Secure session management with Supabase Web3 auth
- **Route Protection**: HOC-based route protection with automatic redirects

### Configuration

Create a `.env.local` file in your project root with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# NFT Collection Configuration
# The address of the Bubblegum compressed NFT collection that users must own
NEXT_PUBLIC_NFT_COLLECTION_ADDRESS=your_nft_collection_address_here

# Solana RPC Configuration (REQUIRED - must support DAS API for compressed NFTs)
# Standard Solana RPCs don't support DAS API, use enhanced providers:
NEXT_PUBLIC_RPC_URL=https://rpc.helius.xyz/?api-key=your_api_key
```

### ⚠️ Important: DAS API Support Required

For compressed NFT verification, you **must** use an RPC provider that supports the Digital Asset Standard (DAS) API. Standard Solana RPC endpoints will **not work**.

**Recommended RPC providers:**

```env
# Helius (recommended - excellent DAS API support)
NEXT_PUBLIC_RPC_URL=https://rpc.helius.xyz/?api-key=your_api_key

# QuickNode (also supports DAS API)
NEXT_PUBLIC_RPC_URL=https://your-endpoint.solana-mainnet.quiknode.pro/your_api_key/

# Triton (supports DAS API)
NEXT_PUBLIC_RPC_URL=https://rpc.triton.one/?api-key=your_api_key
```

**For devnet testing:**
```env
# Helius devnet
NEXT_PUBLIC_RPC_URL=https://rpc-devnet.helius.xyz/?api-key=your_api_key
```

### Usage

#### Protecting Routes

Use the `withAuth` HOC to protect any component:

```tsx
import withAuth from '@/hoc/withAuth';
import MyProtectedComponent from './MyComponent';

export default withAuth(MyProtectedComponent);
```

#### Authentication Flow

1. User connects their Solana wallet
2. System verifies the wallet owns at least one NFT from the specified collection
3. If verified, user can authenticate with Supabase
4. Session is created and user gains access to protected routes

#### Manual NFT Verification

You can also use the NFT verification utilities directly:

```tsx
import { verifyNFTOwnership } from '@/lib/nftVerification';

const hasNFT = await verifyNFTOwnership(walletPublicKey, {
  collectionAddress: 'your_collection_address',
  rpcEndpoint: 'your_rpc_endpoint'
});
```

### Architecture

- **AuthContext**: Manages authentication state and includes NFT verification in login process
- **withAuth HOC**: Protects components by verifying both session and NFT ownership
- **NFT Verification**: Utility functions for checking compressed NFT ownership using Metaplex SDK
- **Wallet Provider**: Solana wallet adapter configuration with multiple wallet support

### Error Handling

The system handles various error scenarios:

- Wallet not connected
- NFT collection not configured
- User doesn't own required NFT
- RPC connection issues
- Authentication failures

Users are redirected to appropriate pages (`/unauthorized`, `/`) based on the error type.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
