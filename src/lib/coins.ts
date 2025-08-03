import { 
  CoinTransaction, 
  CoinTransferRequest, 
  UserCoinBalance, 
  CoinTransactionType,
  COIN_CONFIG 
} from '@/types/coin';
import { supabase } from '@/lib/supabaseClient';

/**
 * NS COMMUNITY COIN SYSTEM
 * "Continental Coins" - Like John Wick's Continental Hotel
 * Every collaboration = 1 coin. Sacred. Valuable. No negotiation.
 */
export class CoinService {
  // Get user's current coin balance
  static async getUserBalance(userId: string): Promise<UserCoinBalance> {
    try {
      const { data, error } = await supabase
        .from('user_coin_balances')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No balance record found, create one
          const { data: newBalance, error: insertError } = await supabase
            .from('user_coin_balances')
            .insert({
              user_id: userId,
              balance: 0,
              total_earned: 0,
              total_spent: 0
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating user balance:', insertError);
            throw insertError;
          }

          return {
            userId: newBalance.user_id,
            balance: newBalance.balance,
            totalEarned: newBalance.total_earned,
            totalSpent: newBalance.total_spent,
            updatedAt: newBalance.updated_at,
          };
        }
        throw error;
      }

      return {
        userId: data.user_id,
        balance: data.balance,
        totalEarned: data.total_earned,
        totalSpent: data.total_spent,
        updatedAt: data.updated_at,
      };
    } catch (error) {
      console.error('Error getting user balance:', error);
      throw error;
    }
  }

  // Get user's transaction history
  static async getUserTransactions(userId: string): Promise<CoinTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('coin_transactions')
        .select('*')
        .or(`to_user_id.eq.${userId},from_user_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting user transactions:', error);
        throw error;
      }

      return data.map(tx => ({
        id: tx.id,
        fromUserId: tx.from_user_id,
        toUserId: tx.to_user_id,
        amount: tx.to_user_id === userId ? tx.amount : -tx.amount, // Positive for incoming, negative for outgoing
        type: tx.transaction_type,
        status: tx.status,
        description: tx.description,
        metadata: tx.metadata,
        createdAt: tx.created_at,
        updatedAt: tx.updated_at,
      }));
    } catch (error) {
      console.error('Error getting user transactions:', error);
      throw error;
    }
  }

  // Transfer coins between users - "Continental Coins" style
  static async transferCoins(request: CoinTransferRequest): Promise<{
    success: boolean;
    transaction?: CoinTransaction;
    error?: string;
  }> {
    try {
      console.log('🪙 Continental Coin Transfer:', request);
      
      const { fromUserId, toUserId, amount, type, description, metadata } = request;

      // Call the Supabase database function for safe transfer
      const { data, error } = await supabase.rpc('transfer_coins', {
        p_from_user_id: fromUserId,
        p_to_user_id: toUserId,
        p_amount: amount,
        p_transaction_type: type,
        p_description: description,
        p_metadata: metadata || {}
      });

      if (error) {
        console.error('❌ Continental Coin Transfer Failed:', error);
        return { 
          success: false, 
          error: error.message || 'Transfer failed' 
        };
      }

      // Get the created transaction
      const { data: transactionData, error: txError } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('id', data)
        .single();

      if (txError) {
        console.error('Error fetching transaction:', txError);
        return { success: false, error: 'Transaction created but failed to fetch details' };
      }

      const transaction: CoinTransaction = {
        id: transactionData.id,
        fromUserId: transactionData.from_user_id,
        toUserId: transactionData.to_user_id,
        amount: transactionData.amount,
        type: transactionData.transaction_type,
        status: transactionData.status,
        description: transactionData.description,
        metadata: transactionData.metadata,
        createdAt: transactionData.created_at,
        updatedAt: transactionData.updated_at,
      };

      console.log('✅ Continental Coin Transfer Successful:', transaction);
      return { success: true, transaction };
      
    } catch (error) {
      console.error('❌ Unexpected error in coin transfer:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Transfer failed' 
      };
    }
  }

  // Give registration bonus to new users - "Continental Welcome"
  static async giveRegistrationBonus(userId: string): Promise<{
    success: boolean;
    transaction?: CoinTransaction;
    error?: string;
  }> {
    try {
      console.log('🎁 Giving Continental Welcome Bonus to:', userId);
      
      // Call the Supabase database function for registration bonus
      const { data, error } = await supabase.rpc('give_registration_bonus', {
        p_user_id: userId
      });

      if (error) {
        console.error('❌ Registration bonus failed:', error);
        return { 
          success: false, 
          error: error.message || 'Registration bonus failed' 
        };
      }

      // Get the created transaction
      const { data: transactionData, error: txError } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('id', data)
        .single();

      if (txError) {
        console.error('Error fetching bonus transaction:', txError);
        return { success: false, error: 'Bonus given but failed to fetch details' };
      }

      const transaction: CoinTransaction = {
        id: transactionData.id,
        fromUserId: transactionData.from_user_id,
        toUserId: transactionData.to_user_id,
        amount: transactionData.amount,
        type: transactionData.transaction_type,
        status: transactionData.status,
        description: transactionData.description,
        metadata: transactionData.metadata,
        createdAt: transactionData.created_at,
        updatedAt: transactionData.updated_at,
      };

      console.log('✅ Continental Welcome Bonus Given:', transaction);
      return { success: true, transaction };
      
    } catch (error) {
      console.error('❌ Unexpected error in registration bonus:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration bonus failed' 
      };
    }
  }

  // Handle collaboration reward - "The Sacred 1 Coin Transfer"
  // Like John Wick's Continental - Every collaboration = 1 coin. Always. Sacred.
  static async handleCollaborationAccept(
    helperId: string,      // Person who will help (gets the coin)
    helpeeId: string,      // Person who receives help (pays the coin)
    projectId: string,
    projectTitle: string,
    collaborationRequestId: string
  ): Promise<{
    success: boolean;
    transaction?: CoinTransaction;
    error?: string;
  }> {
    try {
      console.log('🏛️ CONTINENTAL COLLABORATION TRANSFER - DEBUG PARAMS:', {
        helper: helperId,
        helperType: typeof helperId,
        helperIsUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(helperId),
        projectOwner: helpeeId,
        projectOwnerType: typeof helpeeId,
        projectOwnerIsUUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(helpeeId),
        project: projectTitle,
        projectId: projectId,
        requestId: collaborationRequestId
      });
      
      // Call the Supabase database function for collaboration accept
      const { data, error } = await supabase.rpc('handle_collaboration_accept', {
        p_helper_id: helperId,
        p_project_owner_id: helpeeId,
        p_project_id: projectId,
        p_project_title: projectTitle,
        p_request_id: collaborationRequestId
      });

      if (error) {
        console.error('❌ Continental Collaboration Transfer Failed:');
        console.error('Error message:', error.message || 'Unknown error');
        console.error('Error code:', error.code);
        console.error('Error details:', error.details);
        if (error.hint) console.error('Error hint:', error.hint);
        return { 
          success: false, 
          error: error.message || error.code || 'Collaboration transfer failed' 
        };
      }

      // Get the created transaction
      const { data: transactionData, error: txError } = await supabase
        .from('coin_transactions')
        .select('*')
        .eq('id', data)
        .single();

      if (txError) {
        console.error('Error fetching collaboration transaction:', txError);
        return { success: false, error: 'Collaboration transfer completed but failed to fetch details' };
      }

      const transaction: CoinTransaction = {
        id: transactionData.id,
        fromUserId: transactionData.from_user_id,
        toUserId: transactionData.to_user_id,
        amount: transactionData.amount,
        type: transactionData.transaction_type,
        status: transactionData.status,
        description: transactionData.description,
        metadata: transactionData.metadata,
        createdAt: transactionData.created_at,
        updatedAt: transactionData.updated_at,
      };

      console.log('✅ CONTINENTAL COLLABORATION COMPLETED:', transaction);
      console.log('🪙 The Sacred 1 Coin has been transferred. Honor demands payment.');
      return { success: true, transaction };
      
    } catch (error) {
      console.error('❌ Unexpected error in collaboration transfer:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Collaboration transfer failed' 
      };
    }
  }

  // Get all transactions (for admin purposes)
  static async getAllTransactions(): Promise<CoinTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('coin_transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error getting all transactions:', error);
        throw error;
      }

      return data.map(tx => ({
        id: tx.id,
        fromUserId: tx.from_user_id,
        toUserId: tx.to_user_id,
        amount: tx.amount,
        type: tx.transaction_type,
        status: tx.status,
        description: tx.description,
        metadata: tx.metadata,
        createdAt: tx.created_at,
        updatedAt: tx.updated_at,
      }));
    } catch (error) {
      console.error('Error getting all transactions:', error);
      throw error;
    }
  }

  // Get platform statistics - "Continental Hotel Metrics"
  static async getPlatformStats(): Promise<{
    totalUsers: number;
    totalCoinsInCirculation: number;
    totalTransactions: number;
    totalCollaborations: number;
  }> {
    try {
      // Get total users with coin balances
      const { count: totalUsers } = await supabase
        .from('user_coin_balances')
        .select('*', { count: 'exact', head: true });

      // Get total coins in circulation
      const { data: balanceData, error: balanceError } = await supabase
        .from('user_coin_balances')
        .select('balance');

      if (balanceError) throw balanceError;

      const totalCoinsInCirculation = balanceData
        .reduce((sum, { balance }) => sum + balance, 0);

      // Get total transactions
      const { count: totalTransactions } = await supabase
        .from('coin_transactions')
        .select('*', { count: 'exact', head: true });

      // Get total collaborations
      const { count: totalCollaborations } = await supabase
        .from('coin_transactions')
        .select('*', { count: 'exact', head: true })
        .eq('transaction_type', 'collaboration_reward');

      return {
        totalUsers: totalUsers || 0,
        totalCoinsInCirculation,
        totalTransactions: totalTransactions || 0,
        totalCollaborations: totalCollaborations || 0,
      };
    } catch (error) {
      console.error('Error getting platform stats:', error);
      // Return default values on error
      return {
        totalUsers: 0,
        totalCoinsInCirculation: 0,
        totalTransactions: 0,
        totalCollaborations: 0,
      };
    }
  }
}