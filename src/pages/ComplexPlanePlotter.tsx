import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Info, Calculator, ChevronDown } from 'lucide-react';
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
import { ComplexPlaneInput, type ComplexNumberData } from '@/components/plotter/ComplexPlaneInput';
import { ComplexPlane2D } from '@/components/plotter/ComplexPlane2D';
import { getDistinctColors } from '@/utils/colormaps';

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 11);

/**
 * Complex Plane Plotter page - Shows complex numbers as vectors on the complex plane
 */
export default function ComplexPlanePlotter() {
  const navigate = useNavigate();

  // State for complex numbers
  const [complexNumbers, setComplexNumbers] = useState<ComplexNumberData[]>([
    {
      id: generateId(),
      expression: '',
      real: 0,
      imaginary: 0,
      visible: true,
    },
  ]);

  // Colors for multiple complex numbers
  const colors = useMemo(
    () => getDistinctColors(complexNumbers.length),
    [complexNumbers.length]
  );

  // Add colors to complex numbers
  const complexNumbersWithColors = useMemo(
    () => complexNumbers.map((cn, index) => ({ ...cn, color: colors[index] })),
    [complexNumbers, colors]
  );

  // Add a new complex number
  const addComplexNumber = () => {
    const newNumber: ComplexNumberData = {
      id: generateId(),
      expression: '',
      real: 0,
      imaginary: 0,
      visible: true,
    };
    setComplexNumbers([...complexNumbers, newNumber]);
  };

  // Update a complex number
  const updateComplexNumber = (id: string, updates: Partial<ComplexNumberData>) => {
    setComplexNumbers((prev) =>
      prev.map((cn) => (cn.id === id ? { ...cn, ...updates } : cn))
    );
  };

  // Remove a complex number
  const removeComplexNumber = (id: string) => {
    setComplexNumbers((prev) => prev.filter((cn) => cn.id !== id));
  };

  return (
    <div className="h-screen w-screen flex flex-col md:flex-row overflow-hidden bg-background">
      {/* Left sidebar - Controls */}
      <div className="w-full md:w-[320px] border-r border-border overflow-y-auto flex-shrink-0 md:h-screen h-auto max-h-[40vh] md:max-h-none">
        <div className="p-3 space-y-3">
          {/* Header */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-bold">Complex Plane</h1>
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
                        <li>Enter complex numbers like: 3+4i, 5-2i, 3, -4i</li>
                        <li>Each complex number is shown as a vector from the origin</li>
                        <li>The horizontal axis is the real part</li>
                        <li>The vertical axis is the imaginary part</li>
                        <li>Use the mouse to zoom and pan the plot</li>
                      </ul>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {complexNumbers.filter((cn) => cn.visible).length} visible
              </Badge>
            </div>
          </div>

          {/* Complex number inputs */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Complex Numbers</h2>
              <Button size="sm" onClick={addComplexNumber} disabled={complexNumbers.length >= 10}>
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            </div>
            {complexNumbers.map((cn, index) => (
              <ComplexPlaneInput
                key={cn.id}
                complexNumber={cn}
                index={index}
                color={colors[index]}
                onUpdate={updateComplexNumber}
                onRemove={removeComplexNumber}
                canRemove={complexNumbers.length > 1}
              />
            ))}
            {complexNumbers.length >= 10 && (
              <p className="text-xs text-muted-foreground text-center">
                Maximum 10 complex numbers supported
              </p>
            )}
          </div>

          {/* Examples section */}
          <div className="pt-4 border-t">
            <h3 className="text-sm font-semibold mb-2">Examples:</h3>
            <div className="space-y-1">
              <button
                className="w-full text-left p-2 hover:bg-muted rounded text-xs transition-colors"
                onClick={() => updateComplexNumber(complexNumbers[0].id, { expression: '3+4i' })}
              >
                <code className="font-mono text-xs">3+4i</code>
              </button>
              <button
                className="w-full text-left p-2 hover:bg-muted rounded text-xs transition-colors"
                onClick={() => updateComplexNumber(complexNumbers[0].id, { expression: '-2+5i' })}
              >
                <code className="font-mono text-xs">-2+5i</code>
              </button>
              <button
                className="w-full text-left p-2 hover:bg-muted rounded text-xs transition-colors"
                onClick={() => updateComplexNumber(complexNumbers[0].id, { expression: '4-3i' })}
              >
                <code className="font-mono text-xs">4-3i</code>
              </button>
              <button
                className="w-full text-left p-2 hover:bg-muted rounded text-xs transition-colors"
                onClick={() => updateComplexNumber(complexNumbers[0].id, { expression: 'i' })}
              >
                <code className="font-mono text-xs">i</code>
              </button>
              <button
                className="w-full text-left p-2 hover:bg-muted rounded text-xs transition-colors"
                onClick={() => {
                  // Add Euler's identity components
                  if (complexNumbers.length < 10) {
                    updateComplexNumber(complexNumbers[0].id, { expression: '1' });
                    const id2 = generateId();
                    setComplexNumbers([
                      ...complexNumbers.slice(0, 1),
                      {
                        id: id2,
                        expression: 'i',
                        real: 0,
                        imaginary: 1,
                        visible: true,
                      },
                      ...complexNumbers.slice(1),
                    ]);
                  }
                }}
              >
                <code className="font-mono text-xs">Euler's components (1, i)</code>
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
            Complex numbers shown as vectors from origin
          </div>
          <div className="text-xs text-muted-foreground sm:hidden">
            Vector plot
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Calculator className="h-4 w-4" />
                  <span className="hidden sm:inline">Complex Plane</span>
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
                <DropdownMenuItem onClick={() => navigate('/complex')}>
                  <div className="flex flex-col">
                    <span className="font-medium">Complex Functions</span>
                    <span className="text-xs text-muted-foreground">Plot complex-valued functions</span>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/complex-plane')} className="bg-muted">
                  <div className="flex flex-col">
                    <span className="font-medium">Complex Plane</span>
                    <span className="text-xs text-muted-foreground">Plot complex numbers as vectors</span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* 2D Complex Plane Plot - fills remaining space */}
        <div className="flex-1 p-2 overflow-hidden">
          <ComplexPlane2D
            complexNumbers={complexNumbersWithColors}
            height="100%"
          />
        </div>
      </div>
    </div>
  );
}
