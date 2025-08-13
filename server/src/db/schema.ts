import { serial, text, pgTable, timestamp, date, integer } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Chickens table
export const chickensTable = pgTable('chickens', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Egg records table
export const eggRecordsTable = pgTable('egg_records', {
  id: serial('id').primaryKey(),
  chicken_id: integer('chicken_id').notNull().references(() => chickensTable.id),
  laid_date: date('laid_date').notNull(), // Date when the egg was laid
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// Define relations
export const chickensRelations = relations(chickensTable, ({ many }) => ({
  eggRecords: many(eggRecordsTable),
}));

export const eggRecordsRelations = relations(eggRecordsTable, ({ one }) => ({
  chicken: one(chickensTable, {
    fields: [eggRecordsTable.chicken_id],
    references: [chickensTable.id],
  }),
}));

// TypeScript types for the table schemas
export type Chicken = typeof chickensTable.$inferSelect;
export type NewChicken = typeof chickensTable.$inferInsert;
export type EggRecord = typeof eggRecordsTable.$inferSelect;
export type NewEggRecord = typeof eggRecordsTable.$inferInsert;

// Important: Export all tables and relations for proper query building
export const tables = { 
  chickens: chickensTable, 
  eggRecords: eggRecordsTable 
};

export const schema = {
  chickens: chickensTable,
  eggRecords: eggRecordsTable,
  chickensRelations,
  eggRecordsRelations,
};