/**
 * Production Credit Ledger & Transaction Model
 * Crucial Rule:
 * Credit is NOT stored as an arbitrary mutable number.
 * It is managed strictly through an immutable transaction ledger.
 * Balance = sum(transactions.map(t => t.amount))
 * Database Table: production_credit_transactions
 */

export type CreditTransactionType = 
  | 'earned_extra'       // +N earned by completing designs beyond the daily target
  | 'spent_off_day'      // -N used to take an off day or reduce daily target
  | 'manual_adjustment'  // ±N explicit audit adjustment by user
  | 'weekend_bonus'      // +N earned on voluntary weekend work
  | 'expired';           // -N if an expiration rule was configured

export interface CreditTransactionEntity {
  id: string; // UUID primary key
  userId: string;
  amount: number; // +1, +2, +4, -1, -2 (can be positive or negative, never 0)
  type: CreditTransactionType;
  sourceDay: string; // Date when the transaction occurred or was generated (YYYY-MM-DD)
  relatedDay?: string; // Optional target date for which the credit was applied (YYYY-MM-DD)
  date: string; // Timestamp ISO string when transaction occurred
  note: string; // Explanation (e.g. "+2 تصميم إضافي في يوم 2026-09-22")
  relatedDesignId?: string; // Optional link to specific design
  createdAt: string;
}

export interface ProductionCreditSummary {
  currentBalance: number; // Calculated strictly as sum of all transactions
  totalEarnedAllTime: number; // Sum of positive amounts
  totalSpentAllTime: number; // Absolute sum of negative amounts
  transactionsCount: number;
  recentTransactions: CreditTransactionEntity[];
  ledgerAuditHealthy: boolean; // Integrity verification flag
}
