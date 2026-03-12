-- Add missing columns to User table for OAuth and passwordHash
-- Uses DO blocks to add only if column doesn't exist (PostgreSQL doesn't have IF NOT EXISTS for columns)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name = 'passwordHash'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "passwordHash" TEXT;
    -- Migrate data from password if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'User' AND column_name = 'password') THEN
      UPDATE "User" SET "passwordHash" = "password" WHERE "password" IS NOT NULL AND "password" != '';
      ALTER TABLE "User" DROP COLUMN "password";
    END IF;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name = 'provider'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "provider" TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name = 'providerId'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "providerId" TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'User' AND column_name = 'avatarUrl'
  ) THEN
    ALTER TABLE "User" ADD COLUMN "avatarUrl" TEXT;
  END IF;
END $$;
