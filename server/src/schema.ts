import { z } from 'zod';

// Chicken schema
export const chickenSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.coerce.date()
});

export type Chicken = z.infer<typeof chickenSchema>;

// Input schema for creating chickens
export const createChickenInputSchema = z.object({
  name: z.string().min(1, "Chicken name is required")
});

export type CreateChickenInput = z.infer<typeof createChickenInputSchema>;

// Egg record schema
export const eggRecordSchema = z.object({
  id: z.number(),
  chicken_id: z.number(),
  laid_date: z.coerce.date(),
  created_at: z.coerce.date()
});

export type EggRecord = z.infer<typeof eggRecordSchema>;

// Input schema for recording eggs
export const recordEggInputSchema = z.object({
  chicken_id: z.number(),
  laid_date: z.string() // Date as string input, will be converted to Date
});

export type RecordEggInput = z.infer<typeof recordEggInputSchema>;

// Statistics schemas
export const chickenEggStatsSchema = z.object({
  chicken_id: z.number(),
  chicken_name: z.string(),
  total_eggs: z.number()
});

export type ChickenEggStats = z.infer<typeof chickenEggStatsSchema>;

export const dailyEggStatsSchema = z.object({
  date: z.string(), // Date as string for display
  total_eggs: z.number()
});

export type DailyEggStats = z.infer<typeof dailyEggStatsSchema>;