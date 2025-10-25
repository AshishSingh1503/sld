-- Supabase OTP Authentication Schema

-- 1. OTP Codes Table
CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  code text NOT NULL,
  type text NOT NULL CHECK (type IN ('signup', 'login', 'password_reset')),
  expires_at timestamp with time zone NOT NULL,
  verified boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_otp_codes_email_type ON otp_codes(email, type);
CREATE INDEX IF NOT EXISTS idx_otp_codes_expires_at ON otp_codes(expires_at);

-- 3. Row Level Security (RLS)
ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Example RLS policy: Only service role can access (customize as needed)
CREATE POLICY "Service role access only" ON otp_codes
  FOR ALL
  TO service_role
  USING (true);

-- 4. Cleanup Function for Expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
  DELETE FROM otp_codes WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql; 