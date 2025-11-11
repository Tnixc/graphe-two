import { memo, useMemo } from 'react';
import Plot from 'react-plotly.js';
import type { GridData } from '@/utils/gridGenerator';
import { useTheme } from '@/contexts/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

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
        minZ = Math.min(minZ, func.gridData.zMin);
        maxZ = Math.max(maxZ, func.gridData.zMax);
      });
    if (isFinite(minZ) && isFinite(maxZ)) {
      return [minZ, maxZ];
    }
    return undefined;
  }, [functions, zRange]);

  const layout: any = useMemo(() => ({
    autosize: true,
    margin: { l: 0, r: 0, b: 0, t: 0 },
    scene: {
      xaxis: {
        title: 'x',
        gridcolor: isDark ? 'rgb(73, 73, 73)' : 'rgb(236, 236, 236)',
        showbackground: true,
        backgroundcolor: isDark ? 'rgb(37, 37, 37)' : 'rgb(249, 249, 249)',
      },
      yaxis: {
        title: 'y',
        gridcolor: isDark ? 'rgb(73, 73, 73)' : 'rgb(236, 236, 236)',
        showbackground: true,
        backgroundcolor: isDark ? 'rgb(37, 37, 37)' : 'rgb(249, 249, 249)',
      },
      zaxis: {
        title: 'z',
        gridcolor: isDark ? 'rgb(73, 73, 73)' : 'rgb(236, 236, 236)',
        showbackground: true,
        backgroundcolor: isDark ? 'rgb(37, 37, 37)' : 'rgb(249, 249, 249)',
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
  }), [isDark, zAxisRange]);

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
