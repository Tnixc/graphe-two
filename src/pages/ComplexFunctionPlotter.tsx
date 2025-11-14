import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, RefreshCw, Info, Calculator, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ComplexFunctionInput, type ComplexFunctionData } from '@/components/plotter/ComplexFunctionInput';
import { ParameterControls, type PlotParameters } from '@/components/plotter/ParameterControls';
import { ComplexPlot3D, type ComplexPlotFunction } from '@/components/plotter/ComplexPlot3D';
import { parseComplexExpression } from '@/utils/complexMathParser';
import { generateComplexGrid } from '@/utils/complexGridGenerator';
import { getDistinctColors } from '@/utils/colormaps';

// Default plot parameters
const DEFAULT_PARAMETERS: PlotParameters = {
  xMin: -2,
  xMax: 2,
  yMin: -2,
  yMax: 2,
  resolution: 60,
  zMin: null,
  zMax: null,
  autoZRange: true,
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 11);

/**
 * Complex Function Plotter page - visualizes complex functions f(z)
 * Height represents Re(f(z)), color represents Im(f(z)) as phase
 */
export default function ComplexFunctionPlotter() {
  const navigate = useNavigate();

  // State for functions
  const [functions, setFunctions] = useState<ComplexFunctionData[]>([
    {
      id: generateId(),
      expression: '',
      opacity: 0.9,
      visible: true,
    },
  ]);

  // State for plot parameters
  const [parameters, setParameters] = useState<PlotParameters>(DEFAULT_PARAMETERS);

  // State for computed plot data
  const [plotFunctions, setPlotFunctions] = useState<ComplexPlotFunction[]>([]);
  const [isComputing, setIsComputing] = useState(false);

  // Colors for multiple functions
  const functionColors = useMemo(
    () => getDistinctColors(functions.length),
    [functions.length]
  );

  // Compute plot data when functions or parameters change
  useEffect(() => {
    computePlotData();
  }, [functions, parameters]);

  const computePlotData = async () => {
    setIsComputing(true);

    // Use setTimeout to allow UI to update
    setTimeout(() => {
      const newPlotFunctions: ComplexPlotFunction[] = [];

      for (const func of functions) {
        try {
          if (!func.expression.trim()) {
            // Update function with error
            updateFunction(func.id, { error: 'Expression cannot be empty' });
            continue;
          }

          // Parse expression
          const parsed = parseComplexExpression(func.expression);

          // Generate grid data for complex function
          const gridData = generateComplexGrid(
            parsed,
            {
              xMin: parameters.xMin,
              xMax: parameters.xMax,
              yMin: parameters.yMin,
              yMax: parameters.yMax,
            },
            parameters.resolution,
            // Auto-clip to reasonable values if auto z-range is enabled
            parameters.autoZRange ? { min: -1000, max: 1000 } : undefined
          );

          newPlotFunctions.push({
            id: func.id,
            expression: func.expression,
            gridData,
            opacity: func.opacity,
            visible: func.visible,
          });

          // Clear error if successful
          if (func.error) {
            updateFunction(func.id, { error: undefined });
          }
        } catch (error) {
          // Update function with error message
          const errorMsg = error instanceof Error ? error.message : 'Unknown error';
          updateFunction(func.id, { error: errorMsg });
        }
      }

      setPlotFunctions(newPlotFunctions);
      setIsComputing(false);
    }, 0);
  };

  // Add a new function
  const addFunction = () => {
    const newFunc: ComplexFunctionData = {
      id: generateId(),
      expression: '',
      opacity: 0.8,
      visible: true,
    };
    setFunctions([...functions, newFunc]);
  };

  // Update a function
  const updateFunction = (id: string, updates: Partial<ComplexFunctionData>) => {
    setFunctions((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  // Remove a function
  const removeFunction = (id: string) => {
    setFunctions((prev) => prev.filter((f) => f.id !== id));
  };

  // Update parameters
  const updateParameters = (updates: Partial<PlotParameters>) => {
    setParameters((prev) => ({ ...prev, ...updates }));
  };

  // Reset parameters to default
  const resetParameters = () => {
    setParameters(DEFAULT_PARAMETERS);
  };

  // Determine z-range for plot
  const zRange = useMemo(() => {
    if (!parameters.autoZRange && parameters.zMin !== null && parameters.zMax !== null) {
      return { min: parameters.zMin, max: parameters.zMax };
    }
    return 'auto' as const;
  }, [parameters.autoZRange, parameters.zMin, parameters.zMax]);

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-background">
      {/* Left sidebar - Controls */}
      <div className="w-full md:w-[320px] border-r border-border overflow-y-auto flex-shrink-0 md:h-screen h-auto max-h-[40vh] md:max-h-none">
        <div className="p-3 space-y-3">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold">Complex Function Plotter</h1>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm" side="right">
                    <div className="space-y-2 text-sm">
                      <p className="font-semibold">Quick Guide:</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Enter: w = ..., f(z) = ..., or just the expression</li>
                        <li>z = x + yi (x and y are real and imaginary axes)</li>
                        <li>Height shows Re(f(z)), color shows Im(f(z))</li>
                        <li>Implicit multiplication: zz means z*z, 2z means 2*z</li>
                        <li>Functions: sin, cos, exp, log, sqrt, etc.</li>
                        <li>Try: z^2, 1/z, sin(z), exp(z)</li>
                        <li>Rotate plot by clicking and dragging</li>
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {functions.filter((f) => f.visible).length} visible
              </Badge>
              {isComputing && (
                <Badge variant="outline" className="flex items-center gap-1 text-xs">
                  <RefreshCw className="h-3 w-3 animate-spin" />
                  Computing...
                </Badge>
              )}
            </div>
          </div>

          {/* Function inputs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Functions</h2>
              <Button size="sm" onClick={addFunction} disabled={functions.length >= 5}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            {functions.map((func, index) => (
              <ComplexFunctionInput
                key={func.id}
                function={func}
                index={index}
                color={functionColors[index]}
                onUpdate={updateFunction}
                onRemove={removeFunction}
                canRemove={functions.length > 1}
              />
            ))}
            {functions.length >= 5 && (
              <p className="text-xs text-muted-foreground text-center">
                Maximum 5 functions supported
              </p>
            )}
          </div>

          {/* Parameter controls */}
          <ParameterControls
            parameters={parameters}
            onUpdate={updateParameters}
            onReset={resetParameters}
          />

          {/* Examples section */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold mb-2">Examples:</h3>
            <div className="space-y-1">
              <button
                className="w-full text-left p-2 hover:bg-muted rounded text-xs transition-colors"
                onClick={() => updateFunction(functions[0].id, { expression: 'z^2' })}
              >
                <code className="font-mono text-xs">z^2</code>
                <span className="text-muted-foreground ml-2">(Quadratic)</span>
              </button>
              <button
                className="w-full text-left p-2 hover:bg-muted rounded text-xs transition-colors"
                onClick={() => updateFunction(functions[0].id, { expression: '1/z' })}
              >
                <code className="font-mono text-xs">1/z</code>
                <span className="text-muted-foreground ml-2">(Reciprocal)</span>
              </button>
              <button
                className="w-full text-left p-2 hover:bg-muted rounded text-xs transition-colors"
                onClick={() => updateFunction(functions[0].id, { expression: 'sin(z)' })}
              >
                <code className="font-mono text-xs">sin(z)</code>
                <span className="text-muted-foreground ml-2">(Sine)</span>
              </button>
              <button
                className="w-full text-left p-2 hover:bg-muted rounded text-xs transition-colors"
                onClick={() => updateFunction(functions[0].id, { expression: 'exp(z)' })}
              >
                <code className="font-mono text-xs">exp(z)</code>
                <span className="text-muted-foreground ml-2">(Exponential)</span>
              </button>
              <button
                className="w-full text-left p-2 hover:bg-muted rounded text-xs transition-colors"
                onClick={() => updateFunction(functions[0].id, { expression: 'z^3 - 1' })}
              >
                <code className="font-mono text-xs">z^3 - 1</code>
                <span className="text-muted-foreground ml-2">(Cubic)</span>
              </button>
            </div>
          </div>

          {/* Info about phase coloring */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold mb-2">Phase Coloring:</h3>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p>Colors represent the imaginary part:</p>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex-1 h-6 rounded" style={{
                  background: 'linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(0, 100%, 50%))'
                }} />
              </div>
              <p className="text-center">Im(f(z)) varies from min to max</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Plot area (takes remaining space) */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {/* Top bar */}
        <div className="flex-shrink-0 border-b border-border px-4 py-2 flex items-center justify-between bg-background">
          <div className="text-sm text-muted-foreground hidden sm:block">
            Drag to rotate • Scroll to zoom • Double-click to reset
          </div>
          <div className="text-xs text-muted-foreground sm:hidden">
            Drag to rotate
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Calculator className="h-4 w-4" />
                  <span className="hidden sm:inline">Complex Functions</span>
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Function Type</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/')}>
                  <div className="flex flex-col">
                    <span className="font-medium">Real Functions</span>
                    <span className="text-xs text-muted-foreground">Plot real-valued functions</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/complex')} className="bg-muted">
                  <div className="flex flex-col">
                    <span className="font-medium">Complex Functions</span>
                    <span className="text-xs text-muted-foreground">Plot complex-valued functions</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/complex-plane')}>
                  <div className="flex flex-col">
                    <span className="font-medium">Complex Plane</span>
                    <span className="text-xs text-muted-foreground">Plot complex numbers as vectors</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              size="sm"
              variant="outline"
              onClick={computePlotData}
              disabled={isComputing}
            >
              <RefreshCw className={`h-4 w-4 mr-1 ${isComputing ? 'animate-spin' : ''}`} />
              Replot
            </Button>
          </div>
        </div>

        {/* 3D Plot - fills remaining space */}
        <div className="flex-1 p-2 overflow-hidden">
          <ComplexPlot3D
            functions={plotFunctions}
            zRange={zRange}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
