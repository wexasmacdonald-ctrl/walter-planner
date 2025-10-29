-- CreateTable
CREATE TABLE "EmployeeAssignment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmployeeAssignment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_RouteReviewer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "routeId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RouteReviewer_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RouteReviewer_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RouteReviewer" ("createdAt", "id", "reviewerId", "routeId") SELECT "createdAt", "id", "reviewerId", "routeId" FROM "RouteReviewer";
DROP TABLE "RouteReviewer";
ALTER TABLE "new_RouteReviewer" RENAME TO "RouteReviewer";
CREATE UNIQUE INDEX "RouteReviewer_routeId_reviewerId_key" ON "RouteReviewer"("routeId", "reviewerId");
CREATE TABLE "new_RouteStop" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "routeId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "sequence" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "RouteStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "RouteStop_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_RouteStop" ("clientId", "createdAt", "id", "routeId", "sequence", "updatedAt") SELECT "clientId", "createdAt", "id", "routeId", "sequence", "updatedAt" FROM "RouteStop";
DROP TABLE "RouteStop";
ALTER TABLE "new_RouteStop" RENAME TO "RouteStop";
CREATE UNIQUE INDEX "RouteStop_routeId_clientId_key" ON "RouteStop"("routeId", "clientId");
CREATE UNIQUE INDEX "RouteStop_routeId_sequence_key" ON "RouteStop"("routeId", "sequence");
CREATE TABLE "new_UserSupervisor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supervisorId" TEXT NOT NULL,
    "driverId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserSupervisor_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UserSupervisor_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_UserSupervisor" ("createdAt", "driverId", "id", "supervisorId") SELECT "createdAt", "driverId", "id", "supervisorId" FROM "UserSupervisor";
DROP TABLE "UserSupervisor";
ALTER TABLE "new_UserSupervisor" RENAME TO "UserSupervisor";
CREATE UNIQUE INDEX "UserSupervisor_supervisorId_driverId_key" ON "UserSupervisor"("supervisorId", "driverId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "EmployeeAssignment_userId_idx" ON "EmployeeAssignment"("userId");

