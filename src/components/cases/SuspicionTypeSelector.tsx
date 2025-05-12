
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

interface SuspicionTypeSelectorProps {
  suspicionType: string | null;
  setSuspicionType: (type: string | null) => void;
}

export const SuspicionTypeSelector = ({ suspicionType, setSuspicionType }: SuspicionTypeSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label>Tipo de Suspeita</Label>
      <RadioGroup
        value={suspicionType || ""}
        onValueChange={setSuspicionType}
        className="grid grid-cols-1 gap-2 md:grid-cols-2"
      >
        <div className="flex items-center space-x-2 rounded-md border p-2">
          <RadioGroupItem value="physical_abuse" id="physical_abuse" />
          <Label htmlFor="physical_abuse" className="cursor-pointer w-full">
            Abuso Físico
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 rounded-md border p-2">
          <RadioGroupItem value="psychological_abuse" id="psychological_abuse" />
          <Label htmlFor="psychological_abuse" className="cursor-pointer w-full">
            Abuso Psicológico
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 rounded-md border p-2">
          <RadioGroupItem value="sexual_abuse" id="sexual_abuse" />
          <Label htmlFor="sexual_abuse" className="cursor-pointer w-full">
            Abuso Sexual
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 rounded-md border p-2">
          <RadioGroupItem value="negligence" id="negligence" />
          <Label htmlFor="negligence" className="cursor-pointer w-full">
            Negligência
          </Label>
        </div>
        
        <div className="flex items-center space-x-2 rounded-md border p-2">
          <RadioGroupItem value="other" id="other" />
          <Label htmlFor="other" className="cursor-pointer w-full">
            Outro
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};
