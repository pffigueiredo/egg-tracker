import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { trpc } from '@/utils/trpc';
import { ChickenForm } from '@/components/ChickenForm';
import { EggRecordForm } from '@/components/EggRecordForm';
import { ChickenList } from '@/components/ChickenList';
import { StatsView } from '@/components/StatsView';
// Using type-only imports for better TypeScript compliance
import type { 
  Chicken, 
  CreateChickenInput, 
  RecordEggInput,
  ChickenEggStats,
  DailyEggStats 
} from '../../server/src/schema';

function App() {
  // State management with proper typing
  const [chickens, setChickens] = useState<Chicken[]>([]);
  const [chickenStats, setChickenStats] = useState<ChickenEggStats[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyEggStats[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('manage');

  // Load data functions with useCallback to prevent unnecessary re-renders
  const loadChickens = useCallback(async () => {
    try {
      const result = await trpc.getChickens.query();
      setChickens(result);
    } catch (error) {
      console.error('Failed to load chickens:', error);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const [chickenStatsResult, dailyStatsResult] = await Promise.all([
        trpc.getChickenEggStats.query(),
        trpc.getDailyEggStats.query()
      ]);
      setChickenStats(chickenStatsResult);
      setDailyStats(dailyStatsResult);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadChickens();
    loadStats();
  }, [loadChickens, loadStats]);

  // Handle chicken creation
  const handleCreateChicken = async (input: CreateChickenInput) => {
    setIsLoading(true);
    try {
      const newChicken = await trpc.createChicken.mutate(input);
      setChickens((prev: Chicken[]) => [...prev, newChicken]);
      // Refresh stats after adding new chicken
      await loadStats();
    } catch (error) {
      console.error('Failed to create chicken:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle egg recording
  const handleRecordEgg = async (input: RecordEggInput) => {
    setIsLoading(true);
    try {
      await trpc.recordEgg.mutate(input);
      // Refresh stats after recording egg
      await loadStats();
    } catch (error) {
      console.error('Failed to record egg:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-800 mb-2 flex items-center justify-center gap-2">
            🐔 Chicken Coop Tracker
          </h1>
          <p className="text-orange-600">
            Track your feathered friends and their daily egg production
          </p>
          
          {/* Stub data warning */}
          <div className="mt-4 p-3 bg-yellow-100 border border-yellow-300 rounded-md">
            <p className="text-sm text-yellow-800">
              ⚠️ <strong>Development Mode:</strong> Using placeholder data - backend handlers are stub implementations
            </p>
          </div>
        </div>

        {/* Main content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="manage" className="text-lg">
              🐔 Manage Chickens
            </TabsTrigger>
            <TabsTrigger value="record" className="text-lg">
              🥚 Record Eggs
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-lg">
              📊 Statistics
            </TabsTrigger>
          </TabsList>

          {/* Chicken Management Tab */}
          <TabsContent value="manage" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Add Chicken Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    ➕ Add New Chicken
                  </CardTitle>
                  <CardDescription>
                    Give your chicken a name to start tracking their eggs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChickenForm 
                    onSubmit={handleCreateChicken} 
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>

              {/* Current Chickens */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🏠 Your Flock
                    <Badge variant="secondary" className="ml-2">
                      {chickens.length}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    All your registered chickens
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ChickenList chickens={chickens} />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Egg Recording Tab */}
          <TabsContent value="record" className="space-y-6">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  🥚 Record New Egg
                </CardTitle>
                <CardDescription>
                  Log when one of your chickens lays an egg
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EggRecordForm 
                  chickens={chickens}
                  onSubmit={handleRecordEgg}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="space-y-6">
            <StatsView 
              chickenStats={chickenStats}
              dailyStats={dailyStats}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;