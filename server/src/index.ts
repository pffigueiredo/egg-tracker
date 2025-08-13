import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { 
  createChickenInputSchema, 
  recordEggInputSchema 
} from './schema';
import { createChicken } from './handlers/create_chicken';
import { getChickens } from './handlers/get_chickens';
import { recordEgg } from './handlers/record_egg';
import { getChickenEggStats } from './handlers/get_chicken_egg_stats';
import { getDailyEggStats } from './handlers/get_daily_egg_stats';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),
  
  // Chicken management
  createChicken: publicProcedure
    .input(createChickenInputSchema)
    .mutation(({ input }) => createChicken(input)),
  
  getChickens: publicProcedure
    .query(() => getChickens()),
  
  // Egg recording
  recordEgg: publicProcedure
    .input(recordEggInputSchema)
    .mutation(({ input }) => recordEgg(input)),
  
  // Statistics
  getChickenEggStats: publicProcedure
    .query(() => getChickenEggStats()),
  
  getDailyEggStats: publicProcedure
    .query(() => getDailyEggStats()),
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors()(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  server.listen(port);
  console.log(`TRPC server listening at port: ${port}`);
}

start();