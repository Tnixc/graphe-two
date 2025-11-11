import { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Info, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
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
import { MathInput } from './MathInput';
import { latexToMathjs } from '@/utils/latexConverter';

export interface FunctionData {
  id: string;
  expression: string;  // mathjs expression
  latex?: string;      // LaTeX representation (optional)
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
 * Uses MathLive for WYSIWYG math input
 */
export function FunctionInput({
  function: func,
  index,
  color,
  onUpdate,
  onRemove,
  canRemove,
}: FunctionInputProps) {
  const [latexValue, setLatexValue] = useState(func.latex || '');
  const [showRawExpression, setShowRawExpression] = useState(false);

  // Convert initial expression to LaTeX if needed
  useEffect(() => {
    if (!func.latex && func.expression) {
      // If we have an expression but no LaTeX, use the expression as-is
      // (this happens with the default examples)
      setLatexValue(func.expression);
    }
  }, []);

  const handleLatexChange = (latex: string) => {
    setLatexValue(latex);
  };

  const handleLatexBlur = () => {
    try {
      // Convert LaTeX to mathjs expression
      const mathjsExpr = latexToMathjs(latexValue);

      if (mathjsExpr && mathjsExpr !== func.expression) {
        onUpdate(func.id, {
          expression: mathjsExpr,
          latex: latexValue
        });
      }
    } catch (error) {
      // Conversion failed - will be caught by parser validation
      console.error('LaTeX conversion error:', error);
    }
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
                onClick={() => setShowRawExpression(!showRawExpression)}
              >
                <Code className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {showRawExpression ? 'Show math editor' : 'Show raw expression'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
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
        <div className="flex items-start gap-2">
          <Label htmlFor={`expr-${func.id}`} className="text-sm pt-2">
            z =
          </Label>
          <div className="flex-1">
            <MathInput
              value={latexValue}
              onChange={handleLatexChange}
              onBlur={handleLatexBlur}
              placeholder="x^2 + y^2"
              className={func.error ? 'border-destructive' : ''}
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
                  <p className="font-semibold">WYSIWYG Math Editor</p>
                  <p>Type math naturally - it formats as you type!</p>
                  <p className="font-mono">Try: x^2, sqrt(x), sin(x*y), x/y</p>
                  <p>Use arrow keys to navigate, / for fractions</p>
                  <p>Constants: pi, e</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Show raw expression when toggled */}
        {showRawExpression && func.expression && (
          <div className="text-xs font-mono p-2 bg-muted rounded">
            <div className="text-muted-foreground mb-1">mathjs expression:</div>
            <code>{func.expression}</code>
          </div>
        )}

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
