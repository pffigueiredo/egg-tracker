import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { chickensTable, eggRecordsTable } from '../db/schema';
import { getChickenEggStats } from '../handlers/get_chicken_egg_stats';

describe('getChickenEggStats', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no chickens exist', async () => {
    const result = await getChickenEggStats();
    
    expect(result).toEqual([]);
  });

  it('should return chickens with zero eggs when no eggs recorded', async () => {
    // Create chickens without eggs
    await db.insert(chickensTable).values([
      { name: 'Henrietta' },
      { name: 'Beatrice' }
    ]).execute();

    const result = await getChickenEggStats();

    expect(result).toHaveLength(2);
    
    // Should be ordered by name
    expect(result[0].chicken_name).toEqual('Beatrice');
    expect(result[0].total_eggs).toEqual(0);
    expect(result[0].chicken_id).toBeDefined();
    
    expect(result[1].chicken_name).toEqual('Henrietta');
    expect(result[1].total_eggs).toEqual(0);
    expect(result[1].chicken_id).toBeDefined();
  });

  it('should return correct egg counts for chickens with eggs', async () => {
    // Create chickens
    const chickens = await db.insert(chickensTable).values([
      { name: 'Henrietta' },
      { name: 'Beatrice' },
      { name: 'Clementine' }
    ]).returning().execute();

    // Record eggs for different chickens
    await db.insert(eggRecordsTable).values([
      { chicken_id: chickens[0].id, laid_date: '2024-01-01' },
      { chicken_id: chickens[0].id, laid_date: '2024-01-02' },
      { chicken_id: chickens[0].id, laid_date: '2024-01-03' }, // Henrietta: 3 eggs
      { chicken_id: chickens[1].id, laid_date: '2024-01-01' },
      { chicken_id: chickens[1].id, laid_date: '2024-01-02' }, // Beatrice: 2 eggs
      // Clementine: 0 eggs
    ]).execute();

    const result = await getChickenEggStats();

    expect(result).toHaveLength(3);
    
    // Should be ordered by name: Beatrice, Clementine, Henrietta
    expect(result[0].chicken_name).toEqual('Beatrice');
    expect(result[0].total_eggs).toEqual(2);
    expect(result[0].chicken_id).toEqual(chickens[1].id);

    expect(result[1].chicken_name).toEqual('Clementine');
    expect(result[1].total_eggs).toEqual(0);
    expect(result[1].chicken_id).toEqual(chickens[2].id);

    expect(result[2].chicken_name).toEqual('Henrietta');
    expect(result[2].total_eggs).toEqual(3);
    expect(result[2].chicken_id).toEqual(chickens[0].id);
  });

  it('should handle multiple eggs on the same date', async () => {
    // Create a chicken
    const chickens = await db.insert(chickensTable).values([
      { name: 'Prolific Hen' }
    ]).returning().execute();

    // Record multiple eggs on the same date (rare but possible)
    await db.insert(eggRecordsTable).values([
      { chicken_id: chickens[0].id, laid_date: '2024-01-01' },
      { chicken_id: chickens[0].id, laid_date: '2024-01-01' },
      { chicken_id: chickens[0].id, laid_date: '2024-01-02' }
    ]).execute();

    const result = await getChickenEggStats();

    expect(result).toHaveLength(1);
    expect(result[0].chicken_name).toEqual('Prolific Hen');
    expect(result[0].total_eggs).toEqual(3);
    expect(result[0].chicken_id).toEqual(chickens[0].id);
  });

  it('should return results ordered by chicken name', async () => {
    // Create chickens in non-alphabetical order
    const chickens = await db.insert(chickensTable).values([
      { name: 'Zara' },
      { name: 'Alice' },
      { name: 'Maya' }
    ]).returning().execute();

    // Add some eggs
    await db.insert(eggRecordsTable).values([
      { chicken_id: chickens[0].id, laid_date: '2024-01-01' },
      { chicken_id: chickens[1].id, laid_date: '2024-01-02' },
      { chicken_id: chickens[2].id, laid_date: '2024-01-03' }
    ]).execute();

    const result = await getChickenEggStats();

    expect(result).toHaveLength(3);
    expect(result[0].chicken_name).toEqual('Alice');
    expect(result[1].chicken_name).toEqual('Maya');
    expect(result[2].chicken_name).toEqual('Zara');
  });

  it('should return correct data types', async () => {
    // Create a chicken with eggs
    const chickens = await db.insert(chickensTable).values([
      { name: 'Type Test Hen' }
    ]).returning().execute();

    await db.insert(eggRecordsTable).values([
      { chicken_id: chickens[0].id, laid_date: '2024-01-01' }
    ]).execute();

    const result = await getChickenEggStats();

    expect(result).toHaveLength(1);
    expect(typeof result[0].chicken_id).toBe('number');
    expect(typeof result[0].chicken_name).toBe('string');
    expect(typeof result[0].total_eggs).toBe('number');
  });
});