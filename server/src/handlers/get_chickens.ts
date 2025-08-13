import { db } from '../db';
import { chickensTable } from '../db/schema';
import { type Chicken } from '../schema';

export const getChickens = async (): Promise<Chicken[]> => {
  try {
    // Fetch all chickens from database
    const results = await db.select()
      .from(chickensTable)
      .execute();

    return results;
  } catch (error) {
    console.error('Failed to fetch chickens:', error);
    throw error;
  }
};