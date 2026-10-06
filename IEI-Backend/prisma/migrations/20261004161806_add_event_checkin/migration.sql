-- CreateTable
CREATE TABLE "event_check_ins" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL DEFAULT '1',
    "memberCode" TEXT NOT NULL,
    "memberId" TEXT,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deviceOffline" BOOLEAN NOT NULL DEFAULT false,
    "seats" INTEGER NOT NULL DEFAULT 1,
    "volunteerNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_check_ins_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "event_check_ins_eventId_idx" ON "event_check_ins"("eventId");

-- CreateIndex
CREATE INDEX "event_check_ins_memberCode_idx" ON "event_check_ins"("memberCode");

-- CreateIndex
CREATE UNIQUE INDEX "event_check_ins_eventId_memberCode_key" ON "event_check_ins"("eventId", "memberCode");

-- AddForeignKey
ALTER TABLE "event_check_ins" ADD CONSTRAINT "event_check_ins_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
