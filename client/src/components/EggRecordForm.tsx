import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Chicken, RecordEggInput } from '../../../server/src/schema';

interface EggRecordFormProps {
  chickens: Chicken[];
  onSubmit: (data: RecordEggInput) => Promise<void>;
  isLoading?: boolean;
}

export function EggRecordForm({ chickens, onSubmit, isLoading = false }: EggRecordFormProps) {
  const [formData, setFormData] = useState<RecordEggInput>({
    chicken_id: 0,
    laid_date: new Date().toISOString().split('T')[0] // Today's date in YYYY-MM-DD format
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.chicken_id === 0) return;
    
    try {
      await onSubmit(formData);
      // Reset chicken selection but keep today's date
      setFormData((prev: RecordEggInput) => ({ 
        ...prev, 
        chicken_id: 0 
      }));
    } catch (error) {
      console.error('Error in EggRecordForm:', error);
    }
  };

  // Show message if no chickens available
  if (chickens.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">🐔</div>
        <p className="text-sm">No chickens added yet!</p>
        <p className="text-xs text-gray-400 mt-1">
          Add some chickens first to start recording eggs.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="chicken-select" className="text-sm font-medium">
          Which chicken laid the egg?
        </Label>
        <Select
          value={formData.chicken_id === 0 ? '' : formData.chicken_id.toString()}
          onValueChange={(value: string) =>
            setFormData((prev: RecordEggInput) => ({
              ...prev,
              chicken_id: parseInt(value)
            }))
          }
          disabled={isLoading}
        >
          <SelectTrigger id="chicken-select">
            <SelectValue placeholder="Select a chicken..." />
          </SelectTrigger>
          <SelectContent>
            {chickens.map((chicken: Chicken) => (
              <SelectItem key={chicken.id} value={chicken.id.toString()}>
                🐔 {chicken.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="laid-date" className="text-sm font-medium">
          Date the egg was laid
        </Label>
        <Input
          id="laid-date"
          type="date"
          value={formData.laid_date}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: RecordEggInput) => ({ 
              ...prev, 
              laid_date: e.target.value 
            }))
          }
          required
          disabled={isLoading}
          max={new Date().toISOString().split('T')[0]} // Can't select future dates
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={isLoading || formData.chicken_id === 0}
        className="w-full bg-yellow-600 hover:bg-yellow-700"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">🥚</span>
            Recording Egg...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            🥚 Record Egg
          </span>
        )}
      </Button>
    </form>
  );
}