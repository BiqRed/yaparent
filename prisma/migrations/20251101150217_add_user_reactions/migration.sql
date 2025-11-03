-- CreateTable
CREATE TABLE "UserReaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "fromUserId" TEXT NOT NULL,
    "toUserId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserReaction_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserReaction_toUserId_fkey" FOREIGN KEY ("toUserId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "UserReaction_fromUserId_idx" ON "UserReaction"("fromUserId");

-- CreateIndex
CREATE INDEX "UserReaction_toUserId_idx" ON "UserReaction"("toUserId");

-- CreateIndex
CREATE INDEX "UserReaction_type_idx" ON "UserReaction"("type");

-- CreateIndex
CREATE UNIQUE INDEX "UserReaction_fromUserId_toUserId_key" ON "UserReaction"("fromUserId", "toUserId");
