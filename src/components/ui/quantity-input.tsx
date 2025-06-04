
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  disabled?: boolean;
  className?: string;
}

const QuantityInput = ({ 
  value, 
  onChange, 
  max = Infinity, 
  min = 0, 
  disabled = false,
  className 
}: QuantityInputProps) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Allow empty string for better UX while typing
    if (inputValue === '') {
      onChange(0);
      return;
    }
    
    const numValue = parseInt(inputValue, 10);
    
    // Validate if it's a valid number
    if (isNaN(numValue)) {
      return;
    }
    
    // Apply min/max constraints
    const clampedValue = Math.max(min, Math.min(max, numValue));
    onChange(clampedValue);
  };

  const handleDecrement = () => {
    const newValue = Math.max(min, value - 1);
    onChange(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + 1);
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only allow numbers, backspace, delete, arrow keys, tab
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'];
    const isNumber = /^[0-9]$/.test(e.key);
    
    if (!isNumber && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    }
  };

  return (
    <div className={cn("flex items-center bg-gray-50 rounded-lg md:rounded-xl border-2 border-gray-200 focus-within:border-primary transition-colors", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="w-8 h-8 md:w-10 md:h-10 rounded-l-lg md:rounded-l-xl border-0 p-0 hover:bg-gray-200 disabled:opacity-50"
      >
        <Minus className="w-3 h-3 md:w-4 md:h-4" />
      </Button>
      
      <Input
        type="text"
        inputMode="numeric"
        value={value || ''}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="text-center border-0 bg-transparent text-lg md:text-xl font-bold text-primary min-w-[3rem] md:min-w-[4rem] h-8 md:h-10 px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder="0"
      />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="w-8 h-8 md:w-10 md:h-10 rounded-r-lg md:rounded-r-xl border-0 p-0 hover:bg-gray-200 disabled:opacity-50"
      >
        <Plus className="w-3 h-3 md:w-4 md:h-4" />
      </Button>
    </div>
  );
};

export default QuantityInput;
