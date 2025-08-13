import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { Chicken } from '../../../server/src/schema';

interface ChickenListProps {
  chickens: Chicken[];
}

export function ChickenList({ chickens }: ChickenListProps) {
  if (chickens.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">🐔</div>
        <p className="text-sm">No chickens in your flock yet</p>
        <p className="text-xs text-gray-400 mt-1">
          Add your first chicken using the form on the left!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {chickens.map((chicken: Chicken) => (
        <Card key={chicken.id} className="transition-all hover:shadow-md">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🐔</div>
                <div>
                  <h3 className="font-semibold text-orange-800">
                    {chicken.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    Added {chicken.created_at.toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Badge 
                variant="outline" 
                className="text-xs border-orange-200 text-orange-700"
              >
                ID: {chicken.id}
              </Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}