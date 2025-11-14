import { X, Eye, EyeOff, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface ComplexNumberData {
  id: string;
  expression: string;
  real: number;
  imaginary: number;
  visible: boolean;
  error?: string;
  color?: string;
}

interface ComplexPlaneInputProps {
  complexNumber: ComplexNumberData;
  index: number;
  color: string;
  onUpdate: (id: string, updates: Partial<ComplexNumberData>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

/**
 * Parses a complex number expression
 * Supports formats: "3+4i", "5-2i", "3", "-4i", "2i", "i", "-i"
 */
export function parseComplexNumber(expr: string): { real: number; imaginary: number; error?: string } {
  const trimmed = expr.trim();
  if (!trimmed) {
    return { real: 0, imaginary: 0, error: 'Empty expression' };
  }

  // Handle pure imaginary with just 'i' or '-i'
  if (trimmed === 'i') {
    return { real: 0, imaginary: 1 };
  }
  if (trimmed === '-i') {
    return { real: 0, imaginary: -1 };
  }

  // Replace 'i' with temporary marker to parse
  const withoutI = trimmed.replace(/i/g, '');

  // Try to match patterns
  // Pattern 1: a+bi or a-bi
  const complexPattern = /^([+-]?\d*\.?\d*)\s*([+-])\s*(\d*\.?\d*)$/;
  const match = complexPattern.exec(withoutI);

  if (match) {
    const realPart = match[1] === '' || match[1] === '+' ? 0 : parseFloat(match[1]);
    const sign = match[2] === '+' ? 1 : -1;
    const imagPart = match[3] === '' ? 1 : parseFloat(match[3]);

    if (isNaN(realPart) || isNaN(imagPart)) {
      return { real: 0, imaginary: 0, error: 'Invalid number format' };
    }

    return { real: realPart, imaginary: sign * imagPart };
  }

  // Pattern 2: Just a real number
  if (!trimmed.includes('i')) {
    const realNum = parseFloat(trimmed);
    if (isNaN(realNum)) {
      return { real: 0, imaginary: 0, error: 'Invalid number format' };
    }
    return { real: realNum, imaginary: 0 };
  }

  // Pattern 3: Just imaginary (like "4i" or "-3i")
  const imagOnlyPattern = /^([+-]?\d*\.?\d*)$/;
  const imagMatch = imagOnlyPattern.exec(withoutI);
  if (imagMatch) {
    const imagNum = imagMatch[1] === '' || imagMatch[1] === '+' ? 1 :
                    imagMatch[1] === '-' ? -1 : parseFloat(imagMatch[1]);
    if (isNaN(imagNum)) {
      return { real: 0, imaginary: 0, error: 'Invalid number format' };
    }
    return { real: 0, imaginary: imagNum };
  }

  return { real: 0, imaginary: 0, error: 'Invalid complex number format' };
}

/**
 * Component for inputting and configuring a single complex number
 */
export function ComplexPlaneInput({
  complexNumber,
  index,
  color,
  onUpdate,
  onRemove,
  canRemove,
}: ComplexPlaneInputProps) {
  const handleExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newExpression = e.target.value;
    const parsed = parseComplexNumber(newExpression);

    onUpdate(complexNumber.id, {
      expression: newExpression,
      real: parsed.real,
      imaginary: parsed.imaginary,
      error: parsed.error,
    });
  };

  return (
    <div className="p-4 bg-card border rounded-lg space-y-3">
      {/* Header with number indicator and controls */}
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
          title={`Complex number ${index + 1} color`}
        />
        <Badge variant="outline" className="text-xs">
          z{index + 1}
        </Badge>
        <div className="flex-1" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onUpdate(complexNumber.id, { visible: !complexNumber.visible })}
              >
                {complexNumber.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {complexNumber.visible ? 'Hide vector' : 'Show vector'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {canRemove && (
          <Button size="sm" variant="ghost" onClick={() => onRemove(complexNumber.id)}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Expression input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              id={`expr-${complexNumber.id}`}
              type="text"
              value={complexNumber.expression}
              onChange={handleExpressionChange}
              placeholder="3+4i"
              className={complexNumber.error ? 'border-destructive font-mono' : 'font-mono'}
            />
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" variant="ghost">
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs" side="left">
                <div className="space-y-1 text-xs">
                  <p className="font-semibold">Complex Number Format</p>
                  <p className="font-mono">Examples:</p>
                  <p className="font-mono">3+4i, 5-2i, 3, -4i, i</p>
                  <p>Real part + Imaginary part with i</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {complexNumber.error && (
          <p className="text-xs text-destructive">{complexNumber.error}</p>
        )}

        {!complexNumber.error && complexNumber.expression && (
          <p className="text-xs text-muted-foreground">
            {complexNumber.real} + {complexNumber.imaginary}i
          </p>
        )}
      </div>
    </div>
  );
}
