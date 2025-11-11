import { memo } from 'react';
import Plot from 'react-plotly.js';
import type { GridData } from '@/utils/gridGenerator';

export interface PlotFunction {
  id: string;
  expression: string;
  gridData: GridData;
  colormap: string;
  opacity: number;
  visible: boolean;
}

interface Plot3DProps {
  functions: PlotFunction[];
  zRange?: { min: number; max: number } | 'auto';
  showColorbar?: boolean;
  width?: number | string;
  height?: number | string;
}

/**
 * 3D Surface plot component using Plotly
 */
export const Plot3D = memo(function Plot3D({
  functions,
  zRange = 'auto',
  showColorbar = true,
  width = '100%',
  height = 600,
}: Plot3DProps) {
  // Convert functions to Plotly data traces
  const data: any[] = functions
    .filter((f) => f.visible)
    .map((func) => ({
      type: 'surface',
      x: func.gridData.x,
      y: func.gridData.y,
      z: func.gridData.z,
      colorscale: func.colormap,
      opacity: func.opacity,
      showscale: showColorbar && functions.filter((f) => f.visible).indexOf(func) === 0,
      name: func.expression,
      hovertemplate: `x: %{x:.3f}<br>y: %{y:.3f}<br>z: %{z:.3f}<br>${func.expression}<extra></extra>`,
    }));

  // Calculate z-axis range
  let zAxisRange: [number, number] | undefined;
  if (zRange !== 'auto' && zRange) {
    zAxisRange = [zRange.min, zRange.max];
  } else {
    // Auto-calculate from data
    let minZ = Infinity;
    let maxZ = -Infinity;
    functions
      .filter((f) => f.visible)
      .forEach((func) => {
        minZ = Math.min(minZ, func.gridData.zMin);
        maxZ = Math.max(maxZ, func.gridData.zMax);
      });
    if (isFinite(minZ) && isFinite(maxZ)) {
      zAxisRange = [minZ, maxZ];
    }
  }

  const layout: any = {
    autosize: true,
    margin: { l: 0, r: 0, b: 0, t: 0 },
    scene: {
      xaxis: {
        title: 'x',
        gridcolor: 'rgb(200, 200, 200)',
        showbackground: true,
        backgroundcolor: 'rgb(240, 240, 240)',
      },
      yaxis: {
        title: 'y',
        gridcolor: 'rgb(200, 200, 200)',
        showbackground: true,
        backgroundcolor: 'rgb(240, 240, 240)',
      },
      zaxis: {
        title: 'z',
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
