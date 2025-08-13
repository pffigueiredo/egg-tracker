import { db } from '../db';
import { eggRecordsTable, chickensTable } from '../db/schema';
import { type RecordEggInput, type EggRecord } from '../schema';
import { eq } from 'drizzle-orm';

export const recordEgg = async (input: RecordEggInput): Promise<EggRecord> => {
  try {
    // First, verify that the chicken exists to prevent foreign key constraint violations
    const chicken = await db.select()
      .from(chickensTable)
      .where(eq(chickensTable.id, input.chicken_id))
      .limit(1)
      .execute();

    if (chicken.length === 0) {
      throw new Error(`Chicken with id ${input.chicken_id} not found`);
    }

    // Insert egg record
    const result = await db.insert(eggRecordsTable)
      .values({
        chicken_id: input.chicken_id,
        laid_date: input.laid_date // Date string can be inserted directly into date column
      })
      .returning()
      .execute();

    // Return the created egg record
    const eggRecord = result[0];
    return {
      ...eggRecord,
      laid_date: new Date(eggRecord.laid_date) // Convert date string back to Date object
    };
  } catch (error) {
    console.error('Egg recording failed:', error);
    throw error;
  }
};