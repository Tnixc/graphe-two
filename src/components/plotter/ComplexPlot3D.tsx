import { memo, useMemo } from 'react';
import Plot from 'react-plotly.js';
import type { ComplexGridData } from '@/utils/complexGridGenerator';

export interface ComplexPlotFunction {
  id: string;
  expression: string;
  gridData: ComplexGridData;
  opacity: number;
  visible: boolean;
}

interface ComplexPlot3DProps {
  functions: ComplexPlotFunction[];
  zRange?: { min: number; max: number } | 'auto';
  showColorbar?: boolean;
  width?: number | string;
  height?: number | string;
}

/**
 * Convert phase-based coloring to HSL color values for Plotly
 * Creates a custom colorscale based on the phase of the complex values
 */
function generatePhaseColors(imaginary: number[][]): number[][] {
  const colors: number[][] = [];

  for (let i = 0; i < imaginary.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < imaginary[i].length; j++) {
      const imagVal = imaginary[i][j];

      if (!isFinite(imagVal)) {
        // Use gray for invalid values
        row.push(0);
      } else {
        // Map imaginary part to hue (0-360)
        // We'll normalize this later based on the range
        row.push(imagVal);
      }
    }
    colors.push(row);
  }

  return colors;
}

/**
 * Create HSL-based colorscale for phase visualization
 * Maps phase values to colors: Red (0°) → Yellow (60°) → Green (120°) → Cyan (180°) → Blue (240°) → Magenta (300°) → Red (360°)
 */
function createPhaseColorscale(): any[] {
  return [
    [0.0, 'hsl(0, 100%, 50%)'],     // Red
    [0.167, 'hsl(60, 100%, 50%)'],  // Yellow
    [0.333, 'hsl(120, 100%, 50%)'], // Green
    [0.5, 'hsl(180, 100%, 50%)'],   // Cyan
    [0.667, 'hsl(240, 100%, 50%)'], // Blue
    [0.833, 'hsl(300, 100%, 50%)'], // Magenta
    [1.0, 'hsl(0, 100%, 50%)'],     // Red (wrap around)
  ];
}

/**
 * 3D Surface plot component for complex functions using Plotly
 * Height represents Re(f(z)), color represents Im(f(z)) as phase
 */
export const ComplexPlot3D = memo(function ComplexPlot3D({
  functions,
  zRange = 'auto',
  showColorbar = true,
  width = '100%',
  height = 600,
}: ComplexPlot3DProps) {
  // Convert functions to Plotly data traces
  const data: any[] = useMemo(() => {
    return functions
      .filter((f) => f.visible)
      .map((func) => {
        // Use imaginary part for coloring
        const surfaceColors = generatePhaseColors(func.gridData.imaginary);

        return {
          type: 'surface',
          x: func.gridData.x,
          y: func.gridData.y,
          z: func.gridData.real, // Real part as height
          surfacecolor: surfaceColors,
          colorscale: createPhaseColorscale(),
          opacity: func.opacity,
          showscale: showColorbar && functions.filter((f) => f.visible).indexOf(func) === 0,
          name: func.expression,
          hovertemplate:
            `Re(z): %{x:.3f}<br>` +
            `Im(z): %{y:.3f}<br>` +
            `Re(f(z)): %{z:.3f}<br>` +
            `Im(f(z)): %{surfacecolor:.3f}<br>` +
            `${func.expression}<extra></extra>`,
          colorbar: {
            title: 'Im(f(z))',
            titleside: 'right',
            tickmode: 'auto',
            nticks: 8,
          },
        };
      });
  }, [functions, showColorbar]);

  // Calculate z-axis range (for real part)
  const zAxisRange: [number, number] | undefined = useMemo(() => {
    if (zRange !== 'auto' && zRange) {
      return [zRange.min, zRange.max];
    }

    // Auto-calculate from data
    let minZ = Infinity;
    let maxZ = -Infinity;
    functions
      .filter((f) => f.visible)
      .forEach((func) => {
        minZ = Math.min(minZ, func.gridData.realMin);
        maxZ = Math.max(maxZ, func.gridData.realMax);
      });

    if (isFinite(minZ) && isFinite(maxZ)) {
      return [minZ, maxZ];
    }

    return undefined;
  }, [functions, zRange]);

  const layout: any = {
    autosize: true,
    margin: { l: 0, r: 0, b: 0, t: 0 },
    scene: {
      xaxis: {
        title: 'Re(z)',
        gridcolor: 'rgb(200, 200, 200)',
        showbackground: true,
        backgroundcolor: 'rgb(240, 240, 240)',
      },
      yaxis: {
        title: 'Im(z)',
        gridcolor: 'rgb(200, 200, 200)',
        showbackground: true,
        backgroundcolor: 'rgb(240, 240, 240)',
      },
      zaxis: {
        title: 'Re(f(z))',
        gridcolor: 'rgb(200, 200, 200)',
        showbackground: true,
        backgroundcolor: 'rgb(240, 240, 240)',
        range: zAxisRange,
      },
      camera: {
        eye: { x: 1.5, y: 1.5, z: 1.3 },
        center: { x: 0, y: 0, z: 0 },
      },
      aspectmode: 'auto',
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
  };

  const config: any = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['toImage'],
  };

  return (
    <div className="w-full h-full bg-card rounded-lg border overflow-hidden">
      <Plot
        data={data}
        layout={layout}
        config={config}
        style={{ width, height }}
        useResizeHandler
      />
    </div>
  );
});
