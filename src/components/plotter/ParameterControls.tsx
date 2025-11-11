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
  const handleNumberInput = (field: keyof PlotParameters, value: string) => {
    const num = parseFloat(value);
    if (!isNaN(num)) {
      onUpdate({ [field]: num });
    }
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

      {/* X Domain */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">X Axis</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="xMin" className="text-xs text-muted-foreground w-10">
              Min
            </Label>
            <Slider
              min={-20}
              max={0}
              step={0.5}
              value={[parameters.xMin]}
              onValueChange={([value]) => onUpdate({ xMin: value })}
              className="flex-1"
            />
            <Input
              id="xMin"
              type="number"
              value={parameters.xMin}
              onChange={(e) => handleNumberInput('xMin', e.target.value)}
              className="h-7 w-16 text-xs"
              step="0.1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="xMax" className="text-xs text-muted-foreground w-10">
              Max
            </Label>
            <Slider
              min={0}
              max={20}
              step={0.5}
              value={[parameters.xMax]}
              onValueChange={([value]) => onUpdate({ xMax: value })}
              className="flex-1"
            />
            <Input
              id="xMax"
              type="number"
              value={parameters.xMax}
              onChange={(e) => handleNumberInput('xMax', e.target.value)}
              className="h-7 w-16 text-xs"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* Y Domain */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Y Axis</Label>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="yMin" className="text-xs text-muted-foreground w-10">
              Min
            </Label>
            <Slider
              min={-20}
              max={0}
              step={0.5}
              value={[parameters.yMin]}
              onValueChange={([value]) => onUpdate({ yMin: value })}
              className="flex-1"
            />
            <Input
              id="yMin"
              type="number"
              value={parameters.yMin}
              onChange={(e) => handleNumberInput('yMin', e.target.value)}
              className="h-7 w-16 text-xs"
              step="0.1"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="yMax" className="text-xs text-muted-foreground w-10">
              Max
            </Label>
            <Slider
              min={0}
              max={20}
              step={0.5}
              value={[parameters.yMax]}
              onValueChange={([value]) => onUpdate({ yMax: value })}
              className="flex-1"
            />
            <Input
              id="yMax"
              type="number"
              value={parameters.yMax}
              onChange={(e) => handleNumberInput('yMax', e.target.value)}
              className="h-7 w-16 text-xs"
              step="0.1"
            />
          </div>
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
          Use sliders for quick adjustments. Higher resolution = smoother plots but slower.
        </p>
      </div>
    </Card>
  );
}
