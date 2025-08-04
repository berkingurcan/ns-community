-- Fix coin system foreign key constraints
-- The original migration referenced auth.users but our system uses user_profiles

-- First, drop the existing foreign key constraints
ALTER TABLE coin_transactions 
DROP CONSTRAINT IF EXISTS coin_transactions_from_user_id_fkey,
DROP CONSTRAINT IF EXISTS coin_transactions_to_user_id_fkey;

ALTER TABLE user_coin_balances 
DROP CONSTRAINT IF EXISTS user_coin_balances_user_id_fkey;

-- Add correct foreign key constraints referencing user_profiles
ALTER TABLE coin_transactions 
ADD CONSTRAINT coin_transactions_from_user_id_fkey 
FOREIGN KEY (from_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE coin_transactions 
ADD CONSTRAINT coin_transactions_to_user_id_fkey 
FOREIGN KEY (to_user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

ALTER TABLE user_coin_balances 
ADD CONSTRAINT user_coin_balances_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES user_profiles(id) ON DELETE CASCADE;

-- Update the transfer_coins function to validate against user_profiles
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

  -- Validate that users exist in user_profiles
  IF p_to_user_id IS NOT NULL AND NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = p_to_user_id
  ) THEN
    RAISE EXCEPTION 'Recipient user profile not found: %', p_to_user_id;
  END IF;

  -- Check sender balance (skip for system transactions)
  IF p_from_user_id IS NOT NULL THEN
    -- Validate sender exists
    IF NOT EXISTS (
      SELECT 1 FROM user_profiles WHERE id = p_from_user_id
    ) THEN
      RAISE EXCEPTION 'Sender user profile not found: %', p_from_user_id;
    END IF;

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

-- Update give_registration_bonus function to validate user_profiles
CREATE OR REPLACE FUNCTION give_registration_bonus(p_user_id UUID)
RETURNS UUID AS $$
BEGIN
  -- Validate user exists in user_profiles
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles WHERE id = p_user_id
  ) THEN
    RAISE EXCEPTION 'User profile not found: %', p_user_id;
  END IF;

  -- Check if user already received bonus
  IF EXISTS (
    SELECT 1 FROM coin_transactions 
    WHERE to_user_id = p_user_id 
    AND transaction_type = 'registration_bonus'
  ) THEN
    RAISE EXCEPTION 'Registration bonus already given';
  END IF;

  -- Give the bonus (system transaction - from_user_id is NULL)
  RETURN transfer_coins(
    NULL,                    -- System transaction
    p_user_id,              -- Recipient
    10,                     -- Continental Welcome Bonus: 10 coins
    'registration_bonus',
    'Continental Welcome Bonus - Welcome to NSphere!',
    jsonb_build_object('bonus_type', 'registration')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update auto_give_registration_bonus trigger function
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

-- Update comments
COMMENT ON FUNCTION transfer_coins IS 'Safely transfer coins between user profiles with validation';
COMMENT ON FUNCTION give_registration_bonus IS 'Give registration bonus to new user profile';
COMMENT ON FUNCTION auto_give_registration_bonus IS 'Trigger function to auto-give registration bonus on profile creation';