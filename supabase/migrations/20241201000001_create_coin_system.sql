-- =============================================
-- NS COMMUNITY COIN SYSTEM
-- "Continental Coins" - Like John Wick's markers
-- Every collaboration = 1 coin. Sacred. Valuable.
-- =============================================

-- Create coin transaction types enum
CREATE TYPE coin_transaction_type AS ENUM (
  'registration_bonus',
  'collaboration_reward', 
  'collaboration_payment',
  'admin_bonus',
  'admin_penalty'
);

-- Create coin transaction status enum
CREATE TYPE coin_transaction_status AS ENUM (
  'completed',
  'pending', 
  'failed'
);

-- =============================================
-- COIN TRANSACTIONS TABLE
-- Every coin movement is recorded here
-- =============================================
CREATE TABLE coin_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL CHECK (amount != 0),
  transaction_type coin_transaction_type NOT NULL,
  status coin_transaction_status DEFAULT 'completed' NOT NULL,
  description TEXT NOT NULL,
  
  -- Metadata for context (collaboration details)
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Constraints
  CONSTRAINT valid_amount CHECK (amount BETWEEN -999 AND 999),
  CONSTRAINT no_self_transfer CHECK (from_user_id != to_user_id OR from_user_id IS NULL)
);

-- =============================================
-- USER COIN BALANCES TABLE  
-- Current balance for each user (for performance)
-- =============================================
CREATE TABLE user_coin_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER DEFAULT 0 NOT NULL CHECK (balance >= 0),
  total_earned INTEGER DEFAULT 0 NOT NULL CHECK (total_earned >= 0),
  total_spent INTEGER DEFAULT 0 NOT NULL CHECK (total_spent >= 0),
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_coin_transactions_to_user ON coin_transactions(to_user_id);
CREATE INDEX idx_coin_transactions_from_user ON coin_transactions(from_user_id);
CREATE INDEX idx_coin_transactions_created_at ON coin_transactions(created_at DESC);
CREATE INDEX idx_coin_transactions_type ON coin_transactions(transaction_type);
CREATE INDEX idx_user_coin_balances_balance ON user_coin_balances(balance DESC);

-- =============================================
-- RLS POLICIES
-- Users can only see their own transactions and balances
-- =============================================
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_coin_balances ENABLE ROW LEVEL SECURITY;

-- Users can read their own transactions (as sender or receiver)
CREATE POLICY "Users can read own transactions" ON coin_transactions
  FOR SELECT USING (
    to_user_id = auth.uid() OR 
    from_user_id = auth.uid()
  );

-- Only system/backend can insert transactions (for now)
CREATE POLICY "System can insert transactions" ON coin_transactions
  FOR INSERT WITH CHECK (true);

-- Users can read their own balance
CREATE POLICY "Users can read own balance" ON user_coin_balances
  FOR SELECT USING (user_id = auth.uid());

-- Only system can manage balances
CREATE POLICY "System can manage balances" ON user_coin_balances
  FOR ALL WITH CHECK (true);

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to safely transfer coins between users
CREATE OR REPLACE FUNCTION transfer_coins(
  p_from_user_id UUID,
  p_to_user_id UUID,
  p_amount INTEGER,
  p_transaction_type coin_transaction_type,
  p_description TEXT,
  p_metadata JSONB DEFAULT '{}'
) RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_sender_balance INTEGER;
BEGIN
  -- Validate inputs
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  IF p_from_user_id = p_to_user_id THEN
    RAISE EXCEPTION 'Cannot transfer to self';
  END IF;

  -- Check sender balance (skip for system transactions)
  IF p_from_user_id IS NOT NULL THEN
    SELECT balance INTO v_sender_balance 
    FROM user_coin_balances 
    WHERE user_id = p_from_user_id;
    
    IF v_sender_balance IS NULL THEN
      RAISE EXCEPTION 'Sender balance not found';
    END IF;
    
    IF v_sender_balance < p_amount THEN
      RAISE EXCEPTION 'Insufficient balance';
    END IF;
  END IF;

  -- Start transaction
  BEGIN
    -- Create transaction record
    INSERT INTO coin_transactions (
      from_user_id, to_user_id, amount, transaction_type, 
      description, metadata, status
    ) VALUES (
      p_from_user_id, p_to_user_id, p_amount, p_transaction_type,
      p_description, p_metadata, 'completed'
    ) RETURNING id INTO v_transaction_id;

    -- Update sender balance (if not system transaction)
    IF p_from_user_id IS NOT NULL THEN
      UPDATE user_coin_balances 
      SET 
        balance = balance - p_amount,
        total_spent = total_spent + p_amount,
        updated_at = NOW()
      WHERE user_id = p_from_user_id;
    END IF;

    -- Update receiver balance (upsert in case balance doesn't exist)
    INSERT INTO user_coin_balances (user_id, balance, total_earned, updated_at)
    VALUES (p_to_user_id, p_amount, p_amount, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      balance = user_coin_balances.balance + p_amount,
      total_earned = user_coin_balances.total_earned + p_amount,
      updated_at = NOW();

    RETURN v_transaction_id;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to give registration bonus
CREATE OR REPLACE FUNCTION give_registration_bonus(p_user_id UUID)
RETURNS UUID AS $$
BEGIN
  -- Check if user already received bonus
  IF EXISTS (
    SELECT 1 FROM coin_transactions 
    WHERE to_user_id = p_user_id 
    AND transaction_type = 'registration_bonus'
  ) THEN
    RAISE EXCEPTION 'Registration bonus already given';
  END IF;

  -- Give 3 coins as registration bonus
  RETURN transfer_coins(
    NULL,  -- System transaction
    p_user_id,
    3,     -- 3 coins bonus
    'registration_bonus',
    'Welcome to NSphere Community! Your Continental Coins await.',
    '{}'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to handle collaboration acceptance
CREATE OR REPLACE FUNCTION handle_collaboration_accept(
  p_helper_id UUID,
  p_project_owner_id UUID, 
  p_project_id TEXT,
  p_project_title TEXT,
  p_request_id TEXT
) RETURNS UUID AS $$
BEGIN
  -- The sacred 1 coin transfer - like John Wick's Continental
  -- Every collaboration, no matter the complexity = 1 coin
  RETURN transfer_coins(
    p_project_owner_id,  -- Project owner pays
    p_helper_id,         -- Helper receives
    1,                   -- Always 1 coin - sacred rule
    'collaboration_reward',
    'Continental Coin earned for collaboration on "' || p_project_title || '"',
    jsonb_build_object(
      'project_id', p_project_id,
      'project_title', p_project_title,
      'collaboration_request_id', p_request_id
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================
-- TRIGGER TO AUTO-GIVE REGISTRATION BONUS
-- =============================================
CREATE OR REPLACE FUNCTION auto_give_registration_bonus()
RETURNS TRIGGER AS $$
BEGIN
  -- Give bonus when user profile is created
  PERFORM give_registration_bonus(NEW.id);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail profile creation
    RAISE WARNING 'Failed to give registration bonus: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_auto_registration_bonus
  AFTER INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_give_registration_bonus();

-- =============================================
-- HELPER VIEWS
-- =============================================

-- View for user transaction history
CREATE VIEW user_transaction_history AS
SELECT 
  t.*,
  CASE 
    WHEN t.to_user_id = auth.uid() THEN t.amount
    ELSE -t.amount
  END as user_amount,
  CASE 
    WHEN t.to_user_id = auth.uid() THEN 'incoming'
    ELSE 'outgoing'  
  END as direction
FROM coin_transactions t
WHERE t.to_user_id = auth.uid() OR t.from_user_id = auth.uid()
ORDER BY t.created_at DESC;

-- =============================================
-- COMMENTS
-- =============================================
COMMENT ON TABLE coin_transactions IS 'Continental Coins - Every collaboration = 1 coin. Sacred. Valuable.';
COMMENT ON TABLE user_coin_balances IS 'User coin balances - cached for performance';
COMMENT ON FUNCTION transfer_coins IS 'Safely transfer coins between users with validation';
COMMENT ON FUNCTION give_registration_bonus IS 'Give 3 coin welcome bonus to new users';
COMMENT ON FUNCTION handle_collaboration_accept IS 'The sacred 1 coin collaboration transfer';