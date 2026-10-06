-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('DUE', 'AWAITING_CONFIRMATION', 'PAID');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CASH');

-- CreateEnum
CREATE TYPE "DeclarationStatus" AS ENUM ('PENDING', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "OfficePosition" AS ENUM ('TREASURER', 'GENERAL_SECRETARY', 'CHAIRMAN', 'EC_VOLUNTEER');

-- CreateTable
CREATE TABLE "subscription_periods" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "startsOn" DATE NOT NULL,
    "endsOn" DATE NOT NULL,
    "amountFils" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KWD',

    CONSTRAINT "subscription_periods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "member_subscriptions" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "periodId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL DEFAULT 'DUE',
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "member_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_declarations" (
    "id" TEXT NOT NULL,
    "memberSubscriptionId" TEXT NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "receiptKey" TEXT,
    "status" "DeclarationStatus" NOT NULL DEFAULT 'PENDING',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedByMemberId" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "receiptNo" TEXT,
    "bookNo" TEXT,

    CONSTRAINT "payment_declarations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "office_bearer_assignments" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "position" "OfficePosition" NOT NULL,
    "term" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "office_bearer_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorMemberId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscription_periods_label_key" ON "subscription_periods"("label");

-- CreateIndex
CREATE INDEX "member_subscriptions_status_idx" ON "member_subscriptions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "member_subscriptions_memberId_periodId_key" ON "member_subscriptions"("memberId", "periodId");

-- CreateIndex
CREATE UNIQUE INDEX "office_bearer_assignments_memberId_position_term_key" ON "office_bearer_assignments"("memberId", "position", "term");

-- AddForeignKey
ALTER TABLE "member_subscriptions" ADD CONSTRAINT "member_subscriptions_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "member_subscriptions" ADD CONSTRAINT "member_subscriptions_periodId_fkey" FOREIGN KEY ("periodId") REFERENCES "subscription_periods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_declarations" ADD CONSTRAINT "payment_declarations_memberSubscriptionId_fkey" FOREIGN KEY ("memberSubscriptionId") REFERENCES "member_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_declarations" ADD CONSTRAINT "payment_declarations_confirmedByMemberId_fkey" FOREIGN KEY ("confirmedByMemberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "office_bearer_assignments" ADD CONSTRAINT "office_bearer_assignments_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorMemberId_fkey" FOREIGN KEY ("actorMemberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
