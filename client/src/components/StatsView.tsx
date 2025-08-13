import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { ChickenEggStats, DailyEggStats } from '../../../server/src/schema';

interface StatsViewProps {
  chickenStats: ChickenEggStats[];
  dailyStats: DailyEggStats[];
}

export function StatsView({ chickenStats, dailyStats }: StatsViewProps) {
  // Calculate total eggs across all chickens
  const totalEggs = chickenStats.reduce((sum, stats) => sum + stats.total_eggs, 0);
  
  // Get top producer
  const topProducer = chickenStats.length > 0 
    ? chickenStats.reduce((prev, current) => 
        prev.total_eggs > current.total_eggs ? prev : current
      )
    : null;

  // Get recent daily stats (last 7 days)
  const recentDaily = dailyStats.slice(0, 7);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Total Eggs Recorded
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🥚</span>
              <span className="text-3xl font-bold text-yellow-700">
                {totalEggs}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Active Chickens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl">🐔</span>
              <span className="text-3xl font-bold text-orange-700">
                {chickenStats.length}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              Top Producer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-3xl">👑</span>
              <div>
                <p className="font-bold text-green-700">
                  {topProducer ? topProducer.chicken_name : 'None yet'}
                </p>
                <p className="text-sm text-green-600">
                  {topProducer ? `${topProducer.total_eggs} eggs` : ''}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chicken Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🐔 Chicken Performance
            </CardTitle>
            <CardDescription>
              Egg production by chicken
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chickenStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-sm">No egg statistics available</p>
                <p className="text-xs text-gray-400 mt-1">
                  Record some eggs to see chicken performance data
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {chickenStats.map((stats: ChickenEggStats) => (
                  <div key={stats.chicken_id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🐔</span>
                      <span className="font-medium text-gray-800">
                        {stats.chicken_name}
                      </span>
                    </div>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      {stats.total_eggs} eggs
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Daily Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📅 Daily Production
            </CardTitle>
            <CardDescription>
              Recent daily egg counts
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentDaily.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📈</div>
                <p className="text-sm">No daily statistics available</p>
                <p className="text-xs text-gray-400 mt-1">
                  Record some eggs to see daily production trends
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentDaily.map((daily: DailyEggStats, index: number) => (
                  <div key={daily.date}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {new Date(daily.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🥚</span>
                        <span className="font-bold text-gray-800">
                          {daily.total_eggs}
                        </span>
                      </div>
                    </div>
                    {index < recentDaily.length - 1 && (
                      <Separator className="mt-2" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stub data notice */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <p className="text-sm text-yellow-800 text-center">
            📝 <strong>Note:</strong> Statistics shown are from stub backend implementations. 
            Real data will appear when backend handlers are fully implemented.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}