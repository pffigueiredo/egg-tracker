import { db } from '../db';
import { eggRecordsTable } from '../db/schema';
import { type DailyEggStats } from '../schema';
import { sql } from 'drizzle-orm';

export const getDailyEggStats = async (): Promise<DailyEggStats[]> => {
  try {
    // Aggregate egg counts by laid_date
    const results = await db
      .select({
        date: eggRecordsTable.laid_date,
        total_eggs: sql<number>`count(*)::int`
      })
      .from(eggRecordsTable)
      .groupBy(eggRecordsTable.laid_date)
      .orderBy(eggRecordsTable.laid_date)
      .execute();

    // Convert date objects to string format for display
    return results.map(result => ({
      date: result.date, // date column already returns string format
      total_eggs: result.total_eggs
    }));
  } catch (error) {
    console.error('Failed to get daily egg stats:', error);
    throw error;
  }
};