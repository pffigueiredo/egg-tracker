import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { chickensTable, eggRecordsTable } from '../db/schema';
import { type RecordEggInput } from '../schema';
import { recordEgg } from '../handlers/record_egg';
import { eq } from 'drizzle-orm';

describe('recordEgg', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  let testChickenId: number;

  beforeEach(async () => {
    // Create a test chicken for all tests
    const chicken = await db.insert(chickensTable)
      .values({ name: 'Test Chicken' })
      .returning()
      .execute();
    testChickenId = chicken[0].id;
  });

  it('should record an egg for a valid chicken', async () => {
    const testInput: RecordEggInput = {
      chicken_id: testChickenId,
      laid_date: '2024-01-15'
    };

    const result = await recordEgg(testInput);

    // Verify return value structure
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.chicken_id).toEqual(testChickenId);
    expect(result.laid_date).toBeInstanceOf(Date);
    expect(result.laid_date.toISOString().split('T')[0]).toEqual('2024-01-15');
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save egg record to database', async () => {
    const testInput: RecordEggInput = {
      chicken_id: testChickenId,
      laid_date: '2024-01-15'
    };

    const result = await recordEgg(testInput);

    // Query database to verify record was saved
    const eggRecords = await db.select()
      .from(eggRecordsTable)
      .where(eq(eggRecordsTable.id, result.id))
      .execute();

    expect(eggRecords).toHaveLength(1);
    expect(eggRecords[0].chicken_id).toEqual(testChickenId);
    expect(eggRecords[0].laid_date).toEqual('2024-01-15');
    expect(eggRecords[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different date formats correctly', async () => {
    const testInput: RecordEggInput = {
      chicken_id: testChickenId,
      laid_date: '2024-12-25'
    };

    const result = await recordEgg(testInput);

    expect(result.laid_date).toBeInstanceOf(Date);
    expect(result.laid_date.getFullYear()).toEqual(2024);
    expect(result.laid_date.getMonth()).toEqual(11); // December is month 11 (0-indexed)
    expect(result.laid_date.getDate()).toEqual(25);
  });

  it('should throw error for non-existent chicken', async () => {
    const testInput: RecordEggInput = {
      chicken_id: 99999, // Non-existent chicken ID
      laid_date: '2024-01-15'
    };

    await expect(recordEgg(testInput)).rejects.toThrow(/chicken with id 99999 not found/i);
  });

  it('should allow multiple eggs from same chicken on same date', async () => {
    const testInput: RecordEggInput = {
      chicken_id: testChickenId,
      laid_date: '2024-01-15'
    };

    // Record first egg
    const firstEgg = await recordEgg(testInput);
    
    // Record second egg on same date
    const secondEgg = await recordEgg(testInput);

    expect(firstEgg.id).not.toEqual(secondEgg.id);
    expect(firstEgg.chicken_id).toEqual(secondEgg.chicken_id);
    expect(firstEgg.laid_date.toISOString()).toEqual(secondEgg.laid_date.toISOString());

    // Verify both records exist in database
    const allEggs = await db.select()
      .from(eggRecordsTable)
      .where(eq(eggRecordsTable.chicken_id, testChickenId))
      .execute();

    expect(allEggs).toHaveLength(2);
  });

  it('should handle eggs from different chickens', async () => {
    // Create second chicken
    const secondChicken = await db.insert(chickensTable)
      .values({ name: 'Second Chicken' })
      .returning()
      .execute();

    const firstInput: RecordEggInput = {
      chicken_id: testChickenId,
      laid_date: '2024-01-15'
    };

    const secondInput: RecordEggInput = {
      chicken_id: secondChicken[0].id,
      laid_date: '2024-01-15'
    };

    const firstEgg = await recordEgg(firstInput);
    const secondEgg = await recordEgg(secondInput);

    expect(firstEgg.chicken_id).toEqual(testChickenId);
    expect(secondEgg.chicken_id).toEqual(secondChicken[0].id);
    expect(firstEgg.laid_date.toISOString()).toEqual(secondEgg.laid_date.toISOString());

    // Verify both records exist
    const allEggs = await db.select()
      .from(eggRecordsTable)
      .execute();

    expect(allEggs).toHaveLength(2);
    expect(allEggs.map(egg => egg.chicken_id)).toContain(testChickenId);
    expect(allEggs.map(egg => egg.chicken_id)).toContain(secondChicken[0].id);
  });
});