import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCcw } from 'lucide-react';

export interface PlotParameters {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
  resolution: number;
  zMin: number | null;
  zMax: number | null;
  autoZRange: boolean;
}

interface ParameterControlsProps {
  parameters: PlotParameters;
  onUpdate: (updates: Partial<PlotParameters>) => void;
  onReset: () => void;
}

/**
 * Component for controlling plot parameters (domain, resolution, z-range)
 */
export function ParameterControls({
  parameters,
  onUpdate,
  onReset,
}: ParameterControlsProps) {
  // Get current X and Y ranges (assume symmetric for display)
  const xRange = Math.abs(parameters.xMax);
  const yRange = Math.abs(parameters.yMax);

  // Handle axis range changes (sets both min and max symmetrically)
  const handleXRangeChange = (value: number) => {
    onUpdate({ xMin: -value, xMax: value });
  };

  const handleYRangeChange = (value: number) => {
    onUpdate({ yMin: -value, yMax: value });
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Plot Parameters</h3>
        <Button size="sm" variant="ghost" onClick={onReset}>
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset
        </Button>
      </div>

      {/* X Axis */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">X Axis</Label>
          <Badge variant="secondary" className="text-xs font-mono">
            [{-xRange}, {xRange}]
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Slider
            min={0}
            max={50}
            step={0.5}
            value={[xRange]}
            onValueChange={([value]) => handleXRangeChange(value)}
            className="flex-1"
          />
          <Input
            type="number"
            value={xRange}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && val >= 0) handleXRangeChange(val);
            }}
            className="h-7 w-16 text-xs"
            step="0.5"
            min="0"
          />
        </div>
      </div>

      {/* Y Axis */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Y Axis</Label>
          <Badge variant="secondary" className="text-xs font-mono">
            [{-yRange}, {yRange}]
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Slider
            min={0}
            max={50}
            step={0.5}
            value={[yRange]}
            onValueChange={([value]) => handleYRangeChange(value)}
            className="flex-1"
          />
          <Input
            type="number"
            value={yRange}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val) && val >= 0) handleYRangeChange(val);
            }}
            className="h-7 w-16 text-xs"
            step="0.5"
            min="0"
          />
        </div>
      </div>

      {/* Resolution */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="resolution" className="text-sm font-medium">
            Resolution
          </Label>
          <Badge variant="secondary" className="text-xs">
            {parameters.resolution} × {parameters.resolution}
          </Badge>
        </div>
        <Slider
          id="resolution"
          min={20}
          max={200}
          step={10}
          value={[parameters.resolution]}
          onValueChange={([value]) => onUpdate({ resolution: value })}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Fast (20)</span>
          <span>Smooth (200)</span>
        </div>
      </div>

      {/* Z Range */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Z Range</Label>
          <Button
            size="sm"
            variant={parameters.autoZRange ? 'default' : 'outline'}
            onClick={() => onUpdate({ autoZRange: !parameters.autoZRange })}
            className="h-7 text-xs"
          >
            {parameters.autoZRange ? 'Auto' : 'Manual'}
          </Button>
        </div>
        {!parameters.autoZRange && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="zMin" className="text-xs text-muted-foreground">
                Min
              </Label>
              <Input
                id="zMin"
                type="number"
                value={parameters.zMin ?? ''}
                onChange={(e) =>
                  onUpdate({ zMin: e.target.value ? parseFloat(e.target.value) : null })
                }
                placeholder="Auto"
                className="h-8"
                step="0.1"
              />
            </div>
            <div>
              <Label htmlFor="zMax" className="text-xs text-muted-foreground">
                Max
              </Label>
              <Input
                id="zMax"
                type="number"
                value={parameters.zMax ?? ''}
                onChange={(e) =>
                  onUpdate({ zMax: e.target.value ? parseFloat(e.target.value) : null })
                }
                placeholder="Auto"
                className="h-8"
                step="0.1"
              />
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="pt-2 border-t">
        <p className="text-xs text-muted-foreground">
          Axis sliders create symmetric ranges (±value). Higher resolution = smoother but slower.
        </p>
      </div>
    </Card>
  );
}
