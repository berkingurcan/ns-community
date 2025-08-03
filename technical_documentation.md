# Technical Documentation: "Project Hub"

## 1. Project Overview

The "Project Hub" is a full-stack application built with Next.js, leveraging the power of Solana for blockchain interactions and Supabase for backend services. The platform is designed to be an exclusive, NFT-gated community hub where users can showcase their projects and connect with other builders.

## 2. Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (v15.4.5)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
-   **Blockchain:** [Solana](https://solana.com/)
-   **Wallet Integration:** [Anza Wallet Adapter](https://github.com/anza-xyz/wallet-adapter) (Official Solana Wallet Adapter)
-   **Backend:** [Supabase](https://supabase.io/)
    -   **Authentication:** Supabase Auth (with Web3 and Solana)
    -   **Database:** Supabase (PostgreSQL)
    -   **Storage:** Supabase Storage (for project logos)

## 3. Project Structure

The project follows a standard Next.js `src` directory structure:

```
src/
├── app/                # Next.js App Router: Pages and layouts
│   ├── page.tsx        # Main homepage
│   ├── onboarding/     # Onboarding page for new users
│   └── ...
├── components/         # Reusable React components
│   └── ui/             # UI components (Button, Card, etc.)
├── context/            # React Context providers
│   └── EnhancedAuthContext.tsx # Enhanced authentication and session management
├── hoc/                # Higher-Order Components
│   └── withEnhancedAuth.tsx    # Enhanced route protection with comprehensive validation
├── lib/                # Libraries and helper functions
│   ├── supabaseClient.ts # Initializes the Supabase client
│   ├── nftVerification.ts# Handles NFT ownership verification
│   └── ...
└── types/              # TypeScript type definitions
    └── project.ts      # Defines the Project data structure
```

## 4. Authentication Flow

The authentication process is a critical part of the application and involves several steps:

1.  **Wallet Connection:**
    -   The user connects their Solana wallet using the **Anza Wallet Adapter** (official Solana wallet adapter).
    -   **AutoConnect Enabled**: The adapter automatically reconnects to previously connected wallets for seamless user experience.
    -   The UI provides comprehensive wallet support including:
        -   **Legacy Adapters**: Phantom, Solflare, Coin98, Torus, TokenPocket, MathWallet, SafePal, BitKeep, Ledger
        -   **Wallet Standard**: Backpack and other modern wallets are auto-detected via Wallet Standard protocol
        -   **Enhanced Detection**: Real-time extension monitoring with fallback mechanisms for browser wallet objects
    -   **Multi-layer Detection System**:
        1. **Extension Monitoring**: Real-time detection of wallet browser extensions (500ms intervals for 10 seconds)
        2. **Adapter Detection**: Standard wallet adapter initialization and readiness checks  
        3. **Direct Browser Detection**: Fallback to direct `window.walletName` object detection
        4. **Wallet Standard Support**: Native support for modern wallets implementing Wallet Standard

2.  **NFT Ownership Verification:**
    -   Once the wallet is connected, the app calls the `verifyNFTOwnership` function from `src/lib/nftVerification.ts`.
    -   This function uses the **DAS API** (via a custom RPC endpoint like Helius or QuickNode) to check if the user's wallet contains the required NFT from the specified collection address.

3.  **Supabase Authentication:**
    -   If NFT ownership is verified, the app proceeds with `supabase.auth.signInWithWeb3`.
    -   This initiates a signature request to the user's wallet to prove ownership.
    -   Upon successful signature verification, Supabase creates a JWT session for the user.

4.  **Profile Check and Onboarding:**
    -   With a valid session, the `EnhancedAuthContext` checks if a user profile exists in the `user_profiles` table.
    -   **Enhanced Profile Checking**: Includes timeout protection (5 seconds) to prevent hanging on database queries
    -   If no profile exists, the user is automatically redirected to the `/onboarding` page to complete their profile.
    -   **Session Persistence**: The context maintains session state across page refreshes and handles `onAuthStateChange` events

## 5. Database Schema

For a detailed breakdown of the database schema, data models, and frontend integrations, please see the [`DATABASE.md`](./DATABASE.md) file.

## 6. Key Components and Libraries

### `EnhancedAuthContext.tsx`
-   This is the heart of the enhanced authentication system. It manages the user's session, profile data, and provides comprehensive `login` and `logout` functions.
-   **Enhanced Features**:
  - Network validation to ensure user is on correct Solana network
  - Session-wallet validation to prevent session hijacking
  - Timeout protection for database queries (5-second limit)
  - Session persistence across page refreshes
  - Graceful error handling with user-friendly messages
-   It handles automatic redirection to the onboarding page for new users.

### `nftVerification.ts`
-   This library is responsible for the NFT-gating mechanism.
-   It uses the **DAS (Digital Asset Standard) API** to query for compressed NFTs, which is more efficient than standard RPC methods.
-   **Important:** This requires a custom RPC endpoint that supports the DAS API (e.g., Helius, QuickNode). Standard Solana RPC endpoints will not work.

### `WalletSelection.tsx`
-   An enhanced UI component that displays available Solana wallets with comprehensive detection and connection logic.
-   **Key Features**:
  - **Real-time Extension Monitoring**: Continuously monitors browser for wallet extension injection (500ms intervals)
  - **Multi-layer Detection**: Combines adapter detection, browser object detection, and Wallet Standard support
  - **Enhanced Connection Flow**: 
    - Dual bypass system for already-connected wallets
    - Aggressive polling with 30 attempts for wallet readiness
    - Critical verification before connection to prevent wrong wallet signing
    - Direct connection fallbacks for extension conflicts
  - **Wallet Standard Support**: Native support for modern wallets like Backpack
  - **Visual Status Indicators**: Real-time status display (Connected & Ready, Not Installed, Switch Required)
  - **Error Resilience**: Graceful handling of browser extension conflicts and runtime errors
-   **AutoConnect Integration**: Works seamlessly with autoConnect for session persistence

### `ProjectForm.tsx`
-   A form component used for creating and editing projects.
-   It includes fields for the project name, description, logo, and other details.

## 7. Environment Variables

The application relies on a `.env.local` file for configuration. The following variables are required:

-   `NEXT_PUBLIC_SUPABASE_URL`: The URL of your Supabase project.
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: The anonymous key for your Supabase project.
-   `NEXT_PUBLIC_NFT_COLLECTION_ADDRESS`: The address of the NFT collection used for gating access.
-   `NEXT_PUBLIC_RPC_URL`: A custom RPC endpoint that supports the DAS API (e.g., Helius, QuickNode). If not provided, the app will fallback to the default Solana mainnet RPC, but NFT verification may not work properly.

## 8. Potential Issues and Solutions

### `WalletNotSelectedError` (RESOLVED)
-   **Cause:** This error occurred when the `connect()` function was called before a wallet was properly selected and initialized.
-   **Solution:** ✅ **FIXED** - Enhanced wallet selection with:
  - Aggressive polling (30 attempts with 150ms intervals)
  - Dual detection (adapter + browser object)
  - Critical verification before connection
  - Multiple fallback mechanisms

### Wrong Wallet Signing Issue (RESOLVED)
-   **Cause:** User selects one wallet (e.g., Backpack) but different wallet (e.g., Phantom) prompts for signing.
-   **Solution:** ✅ **FIXED** - Added critical wallet verification:
  - Final verification step before `connect()` call
  - Emergency re-select mechanism for mismatches
  - Enhanced autoConnect handling with proper wallet state management

### "Enter Project Hub" Button Not Appearing (RESOLVED)
-   **Cause:** For Wallet Standard wallets (like Backpack), the `publicKey` was not being set properly, preventing the authentication button from appearing.
-   **Solution:** ✅ **FIXED** - Enhanced Wallet Standard support:
  - AutoConnect re-enabled for proper Wallet Standard detection
  - Enhanced `onWalletSelect` callback handling
  - Better session persistence across page refreshes

### Browser Extension Conflicts
-   **Cause:** Multiple wallet extensions (Pocket Universe, Auro Wallet, Backpack) can cause runtime errors and conflicts.
-   **Solution:** ✅ **MITIGATED** - Added comprehensive error suppression:
  - Global error handling in `layout.tsx` to suppress harmless extension errors
  - User guidance to disable conflicting extensions
  - Graceful degradation when extensions conflict

### NFT Verification Failures
-   **Cause:** The NFT verification can fail if the RPC endpoint does not support the DAS API.
-   **Solution:** Use a custom RPC provider like Helius or QuickNode. The code includes validation to ensure proper RPC endpoint configuration.

### Profile Check Timeouts (RESOLVED)
-   **Cause:** Database queries could hang indefinitely, causing poor user experience.
-   **Solution:** ✅ **FIXED** - Added timeout protection:
  - 5-second timeout on profile queries
  - Graceful fallback (assumes no profile exists)
  - Prevents application hanging on database issues

## 9. Recent Updates (January 2025)

### Wallet Adapter System Overhaul
**Status:** ✅ **COMPLETED**

Major improvements to wallet connection reliability and user experience:

#### 🔧 **Core Fixes**
- **AutoConnect Re-enabled**: Following [official Solana documentation](https://solana.com/tr/developers/cookbook/wallets/connect-wallet-react), re-enabled autoConnect for proper Wallet Standard support
- **Wallet Standard Support**: Enhanced support for modern wallets (Backpack) using Wallet Standard protocol
- **Critical Verification**: Added final verification step before wallet connection to prevent wrong wallet signing
- **Enhanced Detection**: Multi-layer detection system with real-time extension monitoring

#### 🎯 **User Experience Improvements**
- **Visual Status Indicators**: Clear wallet status (Connected & Ready, Not Installed, Switch Required)
- **Error Resilience**: Graceful handling of browser extension conflicts
- **Session Persistence**: Proper handling of autoConnect across page refreshes
- **Button Visibility Fix**: Resolved issue where "Enter Project Hub" button wouldn't appear for Wallet Standard wallets

#### 📚 **Following Best Practices**
- Implementation based on [Anza Wallet Adapter](https://github.com/anza-xyz/wallet-adapter) official repository
- Follows patterns from [Solana Cookbook React guide](https://solana.com/tr/developers/cookbook/wallets/connect-wallet-react)
- Enhanced error handling and timeout protection
- Comprehensive logging for debugging and monitoring
