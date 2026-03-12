-- Add missing extraTokens column to User
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name = 'extraTokens'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "extraTokens" INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;