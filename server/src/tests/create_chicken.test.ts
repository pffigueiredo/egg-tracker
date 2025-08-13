import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { db } from '../db';
import { chickensTable } from '../db/schema';
import { type CreateChickenInput } from '../schema';
import { createChicken } from '../handlers/create_chicken';
import { eq } from 'drizzle-orm';

// Simple test input
const testInput: CreateChickenInput = {
  name: 'Henrietta'
};

describe('createChicken', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should create a chicken', async () => {
    const result = await createChicken(testInput);

    // Basic field validation
    expect(result.name).toEqual('Henrietta');
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('number');
    expect(result.id).toBeGreaterThan(0);
    expect(result.created_at).toBeInstanceOf(Date);
  });

  it('should save chicken to database', async () => {
    const result = await createChicken(testInput);

    // Query using proper drizzle syntax
    const chickens = await db.select()
      .from(chickensTable)
      .where(eq(chickensTable.id, result.id))
      .execute();

    expect(chickens).toHaveLength(1);
    expect(chickens[0].name).toEqual('Henrietta');
    expect(chickens[0].id).toEqual(result.id);
    expect(chickens[0].created_at).toBeInstanceOf(Date);
  });

  it('should handle different chicken names', async () => {
    const testInput1 = { name: 'Clucky' };
    const testInput2 = { name: 'Feathers' };

    const result1 = await createChicken(testInput1);
    const result2 = await createChicken(testInput2);

    expect(result1.name).toEqual('Clucky');
    expect(result2.name).toEqual('Feathers');
    expect(result1.id).not.toEqual(result2.id);

    // Verify both are in the database
    const allChickens = await db.select()
      .from(chickensTable)
      .execute();

    expect(allChickens).toHaveLength(2);
    const names = allChickens.map(chicken => chicken.name).sort();
    expect(names).toEqual(['Clucky', 'Feathers']);
  });

  it('should assign unique IDs to different chickens', async () => {
    const result1 = await createChicken({ name: 'Chicken 1' });
    const result2 = await createChicken({ name: 'Chicken 2' });
    const result3 = await createChicken({ name: 'Chicken 3' });

    const ids = [result1.id, result2.id, result3.id];
    const uniqueIds = new Set(ids);

    expect(uniqueIds.size).toEqual(3);
    ids.forEach(id => {
      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
    });
  });

  it('should set created_at timestamp', async () => {
    const beforeCreate = new Date();
    const result = await createChicken(testInput);
    const afterCreate = new Date();

    expect(result.created_at).toBeInstanceOf(Date);
    expect(result.created_at.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
    expect(result.created_at.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
  });
});