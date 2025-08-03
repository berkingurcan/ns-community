// Coin transaction types
export type CoinTransactionType = 
  | 'registration_bonus'      // 3 coins on registration
  | 'collaboration_reward'    // 1 coin for helping others
  | 'collaboration_payment'   // -1 coin when receiving help
  | 'admin_bonus'            // Manual bonus from admin
  | 'admin_penalty';         // Manual penalty from admin

// Coin transaction status
export type CoinTransactionStatus = 'completed' | 'pending' | 'failed';

// Single coin transaction interface
export interface CoinTransaction {
  id: string;
  fromUserId?: string;        // null for system transactions (registration_bonus)
  toUserId: string;
  amount: number;             // positive for receiving, negative for sending
  type: CoinTransactionType;
  status: CoinTransactionStatus;
  description: string;
  metadata?: {
    projectId?: string;       // for collaboration transactions
    projectTitle?: string;
    collaborationRequestId?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// User coin balance interface
export interface UserCoinBalance {
  userId: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
  updatedAt: string;
}

// Coin transfer request interface
export interface CoinTransferRequest {
  fromUserId: string;
  toUserId: string;
  amount: number;
  type: CoinTransactionType;
  description: string;
  metadata?: {
    projectId?: string;
    projectTitle?: string;
    collaborationRequestId?: string;
  };
}

// Coin system constants
export const COIN_CONFIG = {
  REGISTRATION_BONUS: 3,
  COLLABORATION_REWARD: 1,
  MIN_BALANCE: 0,
  MAX_BALANCE: 999,
} as const;

// Coin transaction type labels
export const COIN_TRANSACTION_LABELS: Record<CoinTransactionType, string> = {
  registration_bonus: 'Registration Bonus',
  collaboration_reward: 'Collaboration Reward',
  collaboration_payment: 'Collaboration Payment',
  admin_bonus: 'Admin Bonus',
  admin_penalty: 'Admin Penalty',
};

// Coin transaction type descriptions
export const COIN_TRANSACTION_DESCRIPTIONS: Record<CoinTransactionType, string> = {
  registration_bonus: 'Welcome bonus for joining the platform',
  collaboration_reward: 'Earned by helping other developers',
  collaboration_payment: 'Payment for receiving collaboration help',
  admin_bonus: 'Bonus awarded by platform administrators',
  admin_penalty: 'Penalty applied by platform administrators',
};

// Coin transaction type colors for UI
export const COIN_TRANSACTION_COLORS: Record<CoinTransactionType, string> = {
  registration_bonus: 'text-blue-600 bg-blue-50 border-blue-200',
  collaboration_reward: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  collaboration_payment: 'text-orange-600 bg-orange-50 border-orange-200',
  admin_bonus: 'text-purple-600 bg-purple-50 border-purple-200',
  admin_penalty: 'text-red-600 bg-red-50 border-red-200',
};