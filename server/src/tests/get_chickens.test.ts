import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { chickensTable } from '../db/schema';
import { getChickens } from '../handlers/get_chickens';

describe('getChickens', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should return empty array when no chickens exist', async () => {
    const result = await getChickens();

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it('should return all chickens from database', async () => {
    // Create test chickens
    await db.insert(chickensTable)
      .values([
        { name: 'Henrietta' },
        { name: 'Gertrude' },
        { name: 'Beatrice' }
      ])
      .execute();

    const result = await getChickens();

    expect(result).toHaveLength(3);
    
    // Check that all chickens are returned with correct structure
    const chickenNames = result.map(chicken => chicken.name).sort();
    expect(chickenNames).toEqual(['Beatrice', 'Gertrude', 'Henrietta']);

    // Verify each chicken has required fields
    result.forEach(chicken => {
      expect(chicken.id).toBeDefined();
      expect(typeof chicken.id).toBe('number');
      expect(chicken.name).toBeDefined();
      expect(typeof chicken.name).toBe('string');
      expect(chicken.created_at).toBeInstanceOf(Date);
    });
  });

  it('should return chickens ordered by insertion order', async () => {
    // Create chickens in specific order
    const firstChicken = await db.insert(chickensTable)
      .values({ name: 'First Chicken' })
      .returning()
      .execute();

    const secondChicken = await db.insert(chickensTable)
      .values({ name: 'Second Chicken' })
      .returning()
      .execute();

    const result = await getChickens();

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe(firstChicken[0].id);
    expect(result[0].name).toBe('First Chicken');
    expect(result[1].id).toBe(secondChicken[0].id);
    expect(result[1].name).toBe('Second Chicken');
  });

  it('should handle single chicken correctly', async () => {
    await db.insert(chickensTable)
      .values({ name: 'Lonely Chicken' })
      .execute();

    const result = await getChickens();

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Lonely Chicken');
    expect(result[0].id).toBeDefined();
    expect(result[0].created_at).toBeInstanceOf(Date);
  });

  it('should return chickens with valid timestamps', async () => {
    const beforeInsert = new Date();
    
    await db.insert(chickensTable)
      .values({ name: 'Time Test Chicken' })
      .execute();

    const afterInsert = new Date();
    const result = await getChickens();

    expect(result).toHaveLength(1);
    expect(result[0].created_at).toBeInstanceOf(Date);
    expect(result[0].created_at.getTime()).toBeGreaterThanOrEqual(beforeInsert.getTime());
    expect(result[0].created_at.getTime()).toBeLessThanOrEqual(afterInsert.getTime());
  });
});