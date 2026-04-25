-- CreateIndex
CREATE INDEX "User_groupId_realName_idx" ON "User"("groupId", "realName");

-- CreateIndex
CREATE INDEX "WeightEntry_userId_recordedAt_idx" ON "WeightEntry"("userId", "recordedAt");

-- CreateIndex
CREATE INDEX "WaistEntry_userId_recordedAt_idx" ON "WaistEntry"("userId", "recordedAt");
