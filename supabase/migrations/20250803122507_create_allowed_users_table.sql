-- Create the table for allowed users
CREATE TABLE public.allowed_users (
  discord_id TEXT PRIMARY KEY NOT NULL,
  note TEXT, -- Optional: for admin notes about the user
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.allowed_users ENABLE ROW LEVEL SECURITY;

-- Policy: Allow authenticated users to read the table
-- This is useful for checking if the current user is in the list
CREATE POLICY "Allow authenticated users to read"
ON public.allowed_users
FOR SELECT
TO authenticated
USING (true);

-- Policy: Only allow service_role to insert, update, or delete
-- This prevents users from adding themselves to the list
CREATE POLICY "Allow service_role full access"
ON public.allowed_users
FOR ALL
TO service_role
USING (true);


-- Add 'yamancan' to the allowed users list
-- IMPORTANT: Replace 'YAMANCAN_DISCORD_ID_HERE' with the actual Discord ID
INSERT INTO public.allowed_users (discord_id, note)
VALUES ('YAMANCAN_DISCORD_ID_HERE', 'yamancan - Initial admin');

