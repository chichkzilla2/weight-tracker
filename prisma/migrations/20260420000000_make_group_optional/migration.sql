-- AlterTable: make groupId nullable
ALTER TABLE "User" ALTER COLUMN "groupId" DROP NOT NULL;

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_groupId_fkey";

-- AddForeignKey with SET NULL on delete
ALTER TABLE "User" ADD CONSTRAINT "User_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "Group"("id") ON DELETE SET NULL ON UPDATE CASCADE;
