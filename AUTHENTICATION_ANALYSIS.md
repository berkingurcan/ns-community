# Authentication Flow Analysis & Edge Cases

## Current Authentication Flow

1. **Wallet Connection** → WalletSelection component connects to Solana wallet
2. **NFT Verification** → AuthContext.login() verifies NFT ownership via DAS API  
3. **Supabase Auth** → signInWithWeb3() creates session
4. **Profile Check** → Checks user_profiles table for wallet address
5. **Route Protection** → withAuth HOC re-verifies NFT ownership

## Critical Edge Cases Identified

### 🚨 Network Mismatch Issues

**Issue**: App hardcoded to mainnet, no network detection
- App configured for `WalletAdapterNetwork.Mainnet`
- User wallet may be on devnet/testnet
- NFT verification fails silently on wrong network
- No user feedback about network mismatch

**Scenarios**:
```typescript
// Scenario 1: User on devnet, app expects mainnet
user.wallet.network = "devnet"
app.expectedNetwork = "mainnet"
nftVerification.result = false // Wrong network, no NFTs found
user.experience = "Rejected with no clear reason"

// Scenario 2: Developer testing on devnet
developer.env = "devnet" 
app.config = "mainnet"
testNFTs.location = "devnet"
verification.result = false // Can't find devnet NFTs on mainnet
```

### 🚨 Session Persistence Vulnerabilities

**Issue**: Session persists but wallet state doesn't match
- Supabase session tied to wallet address
- User can change wallets while session active
- No validation that current wallet = session wallet

**Scenarios**:
```typescript
// Scenario 1: Wallet switching attack
user.authenticates = "wallet_A"
session.created = "wallet_A" 
user.switches_to = "wallet_B" // Different wallet, same browser
session.still_valid = true // Still shows as authenticated
user.access = "granted" // Access with wrong wallet

// Scenario 2: Browser session hijacking
user_A.authenticates = "wallet_A"
user_A.closes_browser = true
user_B.opens_same_browser = true
user_B.connects = "wallet_B"
session.still_exists = "wallet_A" // Wrong session active
```

### 🚨 NFT Verification Race Conditions

**Issue**: Dual NFT verification creates inconsistency
- NFT check in `AuthContext.login()`
- Same check in `withAuth.tsx` HOC
- No synchronization between checks
- User can transfer NFT between checks

**Scenarios**:
```typescript
// Scenario 1: NFT transfer during login
login.nftCheck = true // Has NFT during login
user.transfers_nft = true // Transfers NFT to another wallet
withAuth.nftCheck = false // No longer has NFT
user.experience = "Logged in but kicked out immediately"

// Scenario 2: Race condition
Promise.all([
  authContext.login(), // Check 1
  withAuth.checkNFT() // Check 2 
])
// Both run simultaneously with different RPC calls
// May get inconsistent results due to timing
```

### 🚨 Configuration & RPC Failures

**Issue**: No validation of critical configuration
- Collection address not validated
- No fallback for RPC failures
- Silent failures with incompatible RPC

**Scenarios**:
```typescript
// Scenario 1: Invalid collection address
env.NFT_COLLECTION_ADDRESS = "invalid_address"
verification.result = false // Always fails
user.experience = "Can never authenticate"

// Scenario 2: RPC downtime
rpc.status = "down"
nftVerification.throws = "Network error"
user.experience = "Random authentication failures"

// Scenario 3: Standard RPC endpoint
env.RPC_URL = "api.mainnet-beta.solana.com" // No DAS support
nftVerification.throws = "DAS API not supported"
user.experience = "App completely broken"
```

### 🚨 Wallet State Management Issues

**Issue**: Complex wallet state with no cleanup
- Multiple wallets can be "connected"
- Previous wallet selection persists
- No clear state reset on logout

**Scenarios**:
```typescript
// Scenario 1: Multiple wallet confusion
user.connects = "phantom"
user.also_connects = "solflare" 
wallet.adapter.name = "phantom" | "solflare" // Undefined state
nftVerification.wallet = "???" // Which wallet to check?

// Scenario 2: Stale wallet state
user.authenticates = "phantom"
user.disconnects = "phantom"
localState.selectedWallet = "phantom" // Still selected
user.refreshes_page = true
autoConnect.attempts = "phantom" // Tries to reconnect
```

## Login Scenarios Matrix

### ✅ Happy Path Scenarios
1. **First-time user with NFT**
   - Connect wallet → Verify NFT → Auth → Onboarding → Success

2. **Returning user with profile**
   - Connect wallet → Session restored → Profile exists → Dashboard

### ❌ Edge Case Scenarios

#### Network Issues
3. **User on wrong network**
   - Wallet: Devnet | App: Mainnet → NFT verification fails

4. **Network switching mid-session**
   - Auth on Mainnet → User switches to Devnet → Verification fails

#### NFT & Ownership Issues  
5. **User without required NFT**
   - Connect wallet → NFT check fails → Show NFT required popup

6. **NFT transferred after auth**
   - Auth successful → User transfers NFT → withAuth blocks access

7. **Multiple NFTs in wallet**
   - User has multiple collection NFTs → Should still verify (first found)

#### Session & State Issues
8. **Session exists, wallet changed**
   - Previous session active → User connects different wallet → Mismatch

9. **Browser refresh during auth**
   - Mid-authentication → Page refresh → State lost

10. **Concurrent tabs/sessions**
    - Multiple tabs open → Different auth states → Conflict

#### Configuration Issues
11. **Missing environment variables**
    - No collection address → App fails to start

12. **Invalid collection address**
    - Malformed address → NFT verification always fails

13. **RPC endpoint issues**
    - Standard RPC (no DAS) → Verification throws errors
    - RPC downtime → Network errors

#### Wallet-Specific Issues
14. **Wallet not installed**
    - User selects Phantom → Phantom not installed → Connection fails

15. **Wallet locked/disconnected**
    - Mid-session wallet lock → Loss of connection

16. **Hardware wallet scenarios**
    - Ledger connection → Requires physical confirmation

## Critical Improvements Needed

### 1. Network Detection & Validation
- Detect user's current network
- Validate network matches app expectation
- Provide clear UI for network switching

### 2. Session-Wallet Validation
- Validate current wallet matches session
- Automatic logout on wallet mismatch
- Clear state management

### 3. Robust Error Handling
- Specific error messages for each failure type
- Retry mechanisms for network issues
- Graceful degradation

### 4. Configuration Validation
- Validate collection address on startup
- Test RPC endpoint compatibility
- Fallback strategies

### 5. Improved UX
- Loading states for all async operations
- Clear error messages with solutions
- Progress indicators for multi-step auth

## Implementation Priority

**High Priority** (Security & Functionality):
1. Network validation and mismatch detection
2. Session-wallet validation  
3. Configuration validation
4. RPC endpoint compatibility checks

**Medium Priority** (User Experience):
1. Better error messages and UX
2. Loading states and progress indicators
3. Retry mechanisms

**Low Priority** (Nice to Have):
1. Advanced session management
2. Multi-tab coordination
3. Performance optimizations