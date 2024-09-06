-- DropForeignKey
ALTER TABLE "Tokens" DROP CONSTRAINT "Tokens_userId_fkey";

-- AddForeignKey
ALTER TABLE "Tokens" ADD CONSTRAINT "Tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
