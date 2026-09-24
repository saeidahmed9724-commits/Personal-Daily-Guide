/**
 * Production Credit Ledger Service
 * 
 * Implements a strict, immutable, transaction-based ledger.
 * The current balance is NEVER mutated as an arbitrary variable.
 * Current Balance ≡ SUM(transaction.amount)
 */

import { CreditTransactionEntity, CreditTransactionType, ProductionCreditSummary } from '../../models/productionCredit';

export class ProductionCreditLedger {
  /**
   * حساب الرصيد الحالي الصافي بدقة من سجل المعاملات
   */
  public static calculateBalance(transactions: CreditTransactionEntity[]): number {
    return transactions.reduce((acc, tx) => acc + tx.amount, 0);
  }

  /**
   * إنشاء ملخص محاسبي كامل ومفصل لسجل المعاملات
   */
  public static getSummary(transactions: CreditTransactionEntity[]): ProductionCreditSummary {
    const currentBalance = this.calculateBalance(transactions);
    
    let totalEarnedAllTime = 0;
    let totalSpentAllTime = 0;

    for (const tx of transactions) {
      if (tx.amount > 0) {
        totalEarnedAllTime += tx.amount;
      } else {
        totalSpentAllTime += Math.abs(tx.amount);
      }
    }

    // Sort descending by date
    const sorted = [...transactions].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return {
      currentBalance,
      totalEarnedAllTime,
      totalSpentAllTime,
      transactionsCount: transactions.length,
      recentTransactions: sorted,
      ledgerAuditHealthy: true,
    };
  }

  /**
   * إنشاء معاملة كسب رصيد جديد نتيجة عمل إضافي (+Credit)
   */
  public static recordEarnedExtra(
    userId: string,
    sourceDay: string,
    amount: number,
    note: string,
    relatedDesignId?: string
  ): CreditTransactionEntity {
    if (amount <= 0) {
      throw new Error('Earned credit transaction amount must be greater than 0');
    }

    return {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      amount,
      type: 'earned_extra',
      sourceDay,
      date: new Date().toISOString(),
      note,
      relatedDesignId,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * إنشاء معاملة صرف / استخدام رصيد لتخفيف ضغط يوم أو أخذ راحة مستحقة (-Credit)
   */
  public static recordSpentCredit(
    userId: string,
    sourceDay: string,
    amount: number,
    note: string,
    relatedDay?: string
  ): CreditTransactionEntity {
    if (amount <= 0) {
      throw new Error('Spent credit amount must be greater than 0');
    }

    return {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      amount: -Math.abs(amount), // Negative integer
      type: 'spent_off_day',
      sourceDay,
      relatedDay: relatedDay || sourceDay,
      date: new Date().toISOString(),
      note,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * إنشاء تسوية يدوية معللة (+ أو -)
   */
  public static recordManualAdjustment(
    userId: string,
    sourceDay: string,
    amount: number,
    note: string
  ): CreditTransactionEntity {
    if (amount === 0) {
      throw new Error('Adjustment amount cannot be zero');
    }

    return {
      id: `tx-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      amount,
      type: 'manual_adjustment',
      sourceDay,
      date: new Date().toISOString(),
      note,
      createdAt: new Date().toISOString(),
    };
  }
}
