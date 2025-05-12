
import { ChangeEvent, forwardRef } from 'react';
import { Input } from '@/components/ui/input';
import { formatCPF } from '@/utils/formatters';

interface CPFInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCPFChange?: (formattedCPF: string) => void;
}

const CPFInput = forwardRef<HTMLInputElement, CPFInputProps>(
  ({ value, onChange, onCPFChange, ...props }, ref) => {
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      const formatted = formatCPF(e.target.value);
      
      // Update the input with the formatted value
      e.target.value = formatted;
      
      // Call the original onChange if provided
      if (onChange) {
        onChange(e);
      }
      
      // Call the additional onCPFChange if provided
      if (onCPFChange) {
        onCPFChange(formatted);
      }
    };
    
    return (
      <Input
        ref={ref}
        value={value}
        onChange={handleChange}
        placeholder="Ex: 123.456.789-01"
        maxLength={14}
        {...props}
      />
    );
  }
);

CPFInput.displayName = 'CPFInput';

export default CPFInput;
