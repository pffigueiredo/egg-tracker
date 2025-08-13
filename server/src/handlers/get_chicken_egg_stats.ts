import { db } from '../db';
import { chickensTable, eggRecordsTable } from '../db/schema';
import { type ChickenEggStats } from '../schema';
import { eq, count, sql } from 'drizzle-orm';

export const getChickenEggStats = async (): Promise<ChickenEggStats[]> => {
  try {
    // Query to get all chickens with their egg counts
    // Use LEFT JOIN to include chickens with 0 eggs
    const results = await db.select({
      chicken_id: chickensTable.id,
      chicken_name: chickensTable.name,
      total_eggs: sql<number>`COALESCE(COUNT(${eggRecordsTable.id}), 0)`.as('total_eggs')
    })
    .from(chickensTable)
    .leftJoin(eggRecordsTable, eq(chickensTable.id, eggRecordsTable.chicken_id))
    .groupBy(chickensTable.id, chickensTable.name)
    .orderBy(chickensTable.name)
    .execute();

    // Map results to match the ChickenEggStats schema
    return results.map(result => ({
      chicken_id: result.chicken_id,
      chicken_name: result.chicken_name,
      total_eggs: Number(result.total_eggs) // Ensure it's a number
    }));
  } catch (error) {
    console.error('Failed to fetch chicken egg stats:', error);
    throw error;
  }
};