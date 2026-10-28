-- AlterTable
ALTER TABLE "User" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "stripeCheckoutSessionId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCheckoutSessionId_key" ON "User"("stripeCheckoutSessionId");
