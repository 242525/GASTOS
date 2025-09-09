-- CreateTable
CREATE TABLE "FixedExpense" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "installmentNumber" INTEGER NOT NULL,
    "totalInstallments" INTEGER,
    "billingPeriodId" INTEGER NOT NULL,
    CONSTRAINT "FixedExpense_billingPeriodId_fkey" FOREIGN KEY ("billingPeriodId") REFERENCES "BillingPeriod" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
