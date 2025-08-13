import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { chickensTable, eggRecordsTable } from '../db/schema';
import { getDailyEggStats } from '../handlers/get_daily_egg_stats';

describe('getDailyEggStats', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no egg records exist', async () => {
    const result = await getDailyEggStats();

    expect(result).toEqual([]);
  });

  it('should return daily egg statistics for a single day', async () => {
    // Create a chicken first
    const [chicken] = await db.insert(chickensTable)
      .values({ name: 'Test Chicken' })
      .returning()
      .execute();

    // Record eggs for one day
    await db.insert(eggRecordsTable)
      .values([
        { chicken_id: chicken.id, laid_date: '2024-01-15' },
        { chicken_id: chicken.id, laid_date: '2024-01-15' },
        { chicken_id: chicken.id, laid_date: '2024-01-15' }
      ])
      .execute();

    const result = await getDailyEggStats();

    expect(result).toHaveLength(1);
    expect(result[0].date).toEqual('2024-01-15');
    expect(result[0].total_eggs).toEqual(3);
  });

  it('should return daily egg statistics for multiple days', async () => {
    // Create chickens
    const chickens = await db.insert(chickensTable)
      .values([
        { name: 'Chicken 1' },
        { name: 'Chicken 2' }
      ])
      .returning()
      .execute();

    // Record eggs across multiple days
    await db.insert(eggRecordsTable)
      .values([
        { chicken_id: chickens[0].id, laid_date: '2024-01-15' },
        { chicken_id: chickens[0].id, laid_date: '2024-01-15' },
        { chicken_id: chickens[1].id, laid_date: '2024-01-15' },
        { chicken_id: chickens[0].id, laid_date: '2024-01-16' },
        { chicken_id: chickens[1].id, laid_date: '2024-01-17' },
        { chicken_id: chickens[1].id, laid_date: '2024-01-17' }
      ])
      .execute();

    const result = await getDailyEggStats();

    expect(result).toHaveLength(3);
    
    // Results should be ordered by date
    expect(result[0].date).toEqual('2024-01-15');
    expect(result[0].total_eggs).toEqual(3);
    
    expect(result[1].date).toEqual('2024-01-16');
    expect(result[1].total_eggs).toEqual(1);
    
    expect(result[2].date).toEqual('2024-01-17');
    expect(result[2].total_eggs).toEqual(2);
  });

  it('should order results by date ascending', async () => {
    // Create a chicken
    const [chicken] = await db.insert(chickensTable)
      .values({ name: 'Test Chicken' })
      .returning()
      .execute();

    // Record eggs in non-chronological order
    await db.insert(eggRecordsTable)
      .values([
        { chicken_id: chicken.id, laid_date: '2024-01-20' },
        { chicken_id: chicken.id, laid_date: '2024-01-15' },
        { chicken_id: chicken.id, laid_date: '2024-01-18' }
      ])
      .execute();

    const result = await getDailyEggStats();

    expect(result).toHaveLength(3);
    expect(result[0].date).toEqual('2024-01-15');
    expect(result[1].date).toEqual('2024-01-18');
    expect(result[2].date).toEqual('2024-01-20');
  });

  it('should handle same day eggs from different chickens', async () => {
    // Create multiple chickens
    const chickens = await db.insert(chickensTable)
      .values([
        { name: 'Chicken A' },
        { name: 'Chicken B' },
        { name: 'Chicken C' }
      ])
      .returning()
      .execute();

    // All chickens lay eggs on the same day
    await db.insert(eggRecordsTable)
      .values([
        { chicken_id: chickens[0].id, laid_date: '2024-01-15' },
        { chicken_id: chickens[0].id, laid_date: '2024-01-15' },
        { chicken_id: chickens[1].id, laid_date: '2024-01-15' },
        { chicken_id: chickens[2].id, laid_date: '2024-01-15' },
        { chicken_id: chickens[2].id, laid_date: '2024-01-15' }
      ])
      .execute();

    const result = await getDailyEggStats();

    expect(result).toHaveLength(1);
    expect(result[0].date).toEqual('2024-01-15');
    expect(result[0].total_eggs).toEqual(5);
  });

  it('should return correct data types', async () => {
    // Create a chicken and record an egg
    const [chicken] = await db.insert(chickensTable)
      .values({ name: 'Test Chicken' })
      .returning()
      .execute();

    await db.insert(eggRecordsTable)
      .values({ chicken_id: chicken.id, laid_date: '2024-01-15' })
      .execute();

    const result = await getDailyEggStats();

    expect(result).toHaveLength(1);
    expect(typeof result[0].date).toBe('string');
    expect(typeof result[0].total_eggs).toBe('number');
    expect(result[0].total_eggs).toBeGreaterThan(0);
  });
});