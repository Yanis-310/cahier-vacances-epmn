ALTER TABLE "PasswordResetToken"
RENAME COLUMN "token" TO "tokenHash";

-- Existing reset links are invalidated during migration because legacy values were plaintext.
DELETE FROM "PasswordResetToken";

ALTER INDEX IF EXISTS "PasswordResetToken_token_key"
RENAME TO "PasswordResetToken_tokenHash_key";
