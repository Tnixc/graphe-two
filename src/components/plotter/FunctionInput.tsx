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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { colormaps, type ColorMap } from '@/utils/colormaps';

export interface FunctionData {
  id: string;
  expression: string;
  colormap: string;
  opacity: number;
  visible: boolean;
  error?: string;
}

interface FunctionInputProps {
  function: FunctionData;
  index: number;
  color: string;
  onUpdate: (id: string, updates: Partial<FunctionData>) => void;
  onRemove: (id: string) => void;
  canRemove: boolean;
}

/**
 * Component for inputting and configuring a single function
 */
export function FunctionInput({
  function: func,
  index,
  color,
  onUpdate,
  onRemove,
  canRemove,
}: FunctionInputProps) {
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
              placeholder="z = x^2 + y^2"
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
                  <p className="font-semibold">Expression Format</p>
                  <p>Enter: z = ..., f(x,y) = ..., or just the expression</p>
                  <p className="font-mono">Examples: xy, x^2+y^2, sin(xy)</p>
                  <p>Implicit multiplication: xy means x*y, 2x means 2*x</p>
                  <p>Functions: sin, cos, tan, exp, log, sqrt, abs, etc.</p>
                  <p>Constants: pi, e</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {func.error && (
          <p className="text-xs text-destructive">{func.error}</p>
        )}
      </div>

      {/* Colormap and Opacity */}
      <div className="space-y-3">
        {/* Colormap selection */}
        <div className="space-y-2">
          <Label htmlFor={`colormap-${func.id}`} className="text-xs">
            Colormap
          </Label>
          <Select
            value={func.colormap}
            onValueChange={(value) => onUpdate(func.id, { colormap: value })}
          >
            <SelectTrigger id={`colormap-${func.id}`} className="h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {colormaps.map((cm: ColorMap) => (
                <SelectItem key={cm.value} value={cm.value}>
                  <div className="flex items-center gap-2">
                    <span>{cm.name}</span>
                    <span className="text-xs text-muted-foreground">({cm.type})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Opacity slider */}
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
      </div>
    </div>
  );
}
