import { useState, useEffect, useMemo } from 'react';
import { Plus, RefreshCw, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { FunctionInput, type FunctionData } from '@/components/plotter/FunctionInput';
import { ParameterControls, type PlotParameters } from '@/components/plotter/ParameterControls';
import { Plot3D, type PlotFunction } from '@/components/plotter/Plot3D';
import { parseExpression } from '@/utils/mathParser';
import { generateGrid } from '@/utils/gridGenerator';
import { defaultColormaps, getDistinctColors } from '@/utils/colormaps';

// Default plot parameters
const DEFAULT_PARAMETERS: PlotParameters = {
  xMin: -5,
  xMax: 5,
  yMin: -5,
  yMax: 5,
  resolution: 80,
  zMin: null,
  zMax: null,
  autoZRange: true,
};

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 11);

/**
 * Main 3D Function Plotter page - Full screen layout
 */
export default function FunctionPlotter() {
  // State for functions
  const [functions, setFunctions] = useState<FunctionData[]>([
    {
      id: generateId(),
      expression: '',
      colormap: defaultColormaps.general,
      opacity: 0.9,
      visible: true,
    },
  ]);

  // State for plot parameters
  const [parameters, setParameters] = useState<PlotParameters>(DEFAULT_PARAMETERS);

  // State for computed plot data
  const [plotFunctions, setPlotFunctions] = useState<PlotFunction[]>([]);
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
      const newPlotFunctions: PlotFunction[] = [];

      for (const func of functions) {
        try {
          if (!func.expression.trim()) {
            // Update function with error
            updateFunction(func.id, { error: 'Expression cannot be empty' });
            continue;
          }

          // Parse expression
          const parsed = parseExpression(func.expression);

          // Generate grid data
          const gridData = generateGrid(
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
            colormap: func.colormap,
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
    const newFunc: FunctionData = {
      id: generateId(),
      expression: '',
      colormap: defaultColormaps.general,
      opacity: 0.8,
      visible: true,
    };
    setFunctions([...functions, newFunc]);
  };

  // Update a function
  const updateFunction = (id: string, updates: Partial<FunctionData>) => {
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
      <div className="w-full md:w-[380px] border-r border-border overflow-y-auto flex-shrink-0 md:h-screen h-auto max-h-[40vh] md:max-h-none">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold">3D Function Plotter</h1>
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
                        <li>Enter functions using x and y variables</li>
                        <li>Use: sin, cos, tan, exp, log, sqrt, abs, etc.</li>
                        <li>Try: sin(x*y), x^2 - y^2, atan2(y,x)</li>
                        <li>Add multiple functions to compare</li>
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
              <FunctionInput
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
                onClick={() => updateFunction(functions[0].id, { expression: 'sin(x) * cos(y)' })}
              >
                <code className="font-mono text-xs">sin(x) * cos(y)</code>
              </button>
              <button
                className="w-full text-left p-2 hover:bg-muted rounded text-xs transition-colors"
                onClick={() => updateFunction(functions[0].id, { expression: 'x^2 + y^2' })}
              >
                <code className="font-mono text-xs">x^2 + y^2</code>
              </button>
              <button
                className="w-full text-left p-2 hover:bg-muted rounded text-xs transition-colors"
                onClick={() => updateFunction(functions[0].id, { expression: 'sin(sqrt(x^2 + y^2))' })}
              >
                <code className="font-mono text-xs">sin(sqrt(x^2 + y^2))</code>
              </button>
              <button
                className="w-full text-left p-2 hover:bg-muted rounded text-xs transition-colors"
                onClick={() => updateFunction(functions[0].id, { expression: 'atan2(y, x)' })}
              >
                <code className="font-mono text-xs">atan2(y, x)</code>
              </button>
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

        {/* 3D Plot - fills remaining space */}
        <div className="flex-1 p-4 overflow-hidden">
          <Plot3D
            functions={plotFunctions}
            zRange={zRange}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
