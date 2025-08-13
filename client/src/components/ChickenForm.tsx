import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreateChickenInput } from '../../../server/src/schema';

interface ChickenFormProps {
  onSubmit: (data: CreateChickenInput) => Promise<void>;
  isLoading?: boolean;
}

export function ChickenForm({ onSubmit, isLoading = false }: ChickenFormProps) {
  const [formData, setFormData] = useState<CreateChickenInput>({
    name: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    try {
      await onSubmit(formData);
      // Reset form after successful submission
      setFormData({ name: '' });
    } catch (error) {
      // Error handling is done in parent component
      console.error('Error in ChickenForm:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="chicken-name" className="text-sm font-medium">
          Chicken Name
        </Label>
        <Input
          id="chicken-name"
          type="text"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData((prev: CreateChickenInput) => ({ 
              ...prev, 
              name: e.target.value 
            }))
          }
          placeholder="Enter a name for your chicken (e.g., Henrietta, Clucky)"
          required
          disabled={isLoading}
          className="w-full"
        />
      </div>
      
      <Button 
        type="submit" 
        disabled={isLoading || !formData.name.trim()}
        className="w-full bg-orange-600 hover:bg-orange-700"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="animate-spin">🐔</span>
            Adding Chicken...
          </span>
        ) : (
          <span className="flex items-center gap-2">
            ➕ Add Chicken
          </span>
        )}
      </Button>
    </form>
  );
}