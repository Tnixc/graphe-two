import { X, Eye, EyeOff, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface ComplexFunctionData {
  id: string;
  expression: string;
  opacity: number;
  visible: boolean;
  error?: string;
}

interface ComplexFunctionInputProps {
  function: ComplexFunctionData;
  index: number;
  color: string;
  onUpdate: (id: string, updates: Partial<ComplexFunctionData>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

/**
 * Component for inputting and configuring a single complex function
 * Simpler than FunctionInput - no colormap selection (phase-based coloring is automatic)
 */
export function ComplexFunctionInput({
  function: func,
  index,
  color,
  onUpdate,
  onRemove,
  canRemove,
}: ComplexFunctionInputProps) {
  const handleExpressionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newExpression = e.target.value;
    onUpdate(func.id, { expression: newExpression });
  };

  return (
    <div className="p-4 bg-card border rounded-lg space-y-3">
      {/* Header with function number and controls */}
      <div className="flex items-center gap-2">
        <div
          className="w-3 h-3 rounded-full flex-shrink-0"
          style={{ backgroundColor: color }}
          title={`Function ${index + 1} color`}
        />
        <Badge variant="outline" className="text-xs">
          f{index + 1}
        </Badge>
        <div className="flex-1" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onUpdate(func.id, { visible: !func.visible })}
              >
                {func.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {func.visible ? 'Hide function' : 'Show function'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {canRemove && (
          <Button size="sm" variant="ghost" onClick={() => onRemove(func.id)}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Expression input */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              id={`expr-${func.id}`}
              type="text"
              value={func.expression}
              onChange={handleExpressionChange}
              placeholder="w = z^2"
              className={func.error ? 'border-destructive font-mono' : 'font-mono'}
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
                  <p className="font-semibold">Complex Expression Format</p>
                  <p>Enter: w = ..., f(z) = ..., or just the expression</p>
                  <p className="font-mono">Examples: z^2, 1/z, sin(z), exp(z)</p>
                  <p>Implicit multiplication: zz means z*z, 2z means 2*z</p>
                  <p>Functions: sin, cos, tan, exp, log, sqrt, etc.</p>
                  <p>Constants: pi, e, i</p>
                  <p className="pt-1 font-semibold">Visualization:</p>
                  <p>Height = Re(f(z)), Color = Im(f(z))</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {func.error && (
          <p className="text-xs text-destructive">{func.error}</p>
        )}
      </div>

      {/* Opacity slider only (no colormap - phase coloring is automatic) */}
      <div className="space-y-2">
        <Label htmlFor={`opacity-${func.id}`} className="text-xs">
          Opacity: {Math.round(func.opacity * 100)}%
        </Label>
        <Slider
          id={`opacity-${func.id}`}
          min={0}
          max={1}
          step={0.05}
          value={[func.opacity]}
          onValueChange={([value]) => onUpdate(func.id, { opacity: value })}
        />
      </div>

      {/* Phase coloring info */}
      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          Color automatically shows phase (argument) of the complex output
        </p>
      </div>
    </div>
  );
}
