-- AlterTable
ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN "lastName" TEXT;

-- Backfill firstName/lastName from existing realName.
-- firstName = first token, lastName = remaining tokens after trimming/collapsing spaces.
WITH normalized AS (
  SELECT
    "id",
    regexp_replace(trim("realName"), '[[:space:]]+', ' ', 'g') AS "fullName"
  FROM "User"
)
UPDATE "User" AS u
SET
  "firstName" = NULLIF(split_part(n."fullName", ' ', 1), ''),
  "lastName" = NULLIF(trim(substr(n."fullName", length(split_part(n."fullName", ' ', 1)) + 2)), '')
FROM normalized AS n
WHERE u."id" = n."id";

-- CreateIndex
CREATE INDEX "User_groupId_firstName_lastName_idx" ON "User"("groupId", "firstName", "lastName");
