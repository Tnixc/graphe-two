import { memo, useMemo } from 'react';
import Plot from 'react-plotly.js';
import type { ComplexNumberData } from './ComplexPlaneInput';
import { useTheme } from '@/contexts/ThemeContext';

interface ComplexPlane2DProps {
  complexNumbers: ComplexNumberData[];
  xRange?: { min: number; max: number };
  yRange?: { min: number; max: number };
  width?: number | string;
  height?: number | string;
}

/**
 * 2D Complex plane plot component using Plotly
 * Shows complex numbers as vectors on the complex plane
 */
export const ComplexPlane2D = memo(function ComplexPlane2D({
  complexNumbers,
  xRange,
  yRange,
  width = '100%',
  height = 600,
}: ComplexPlane2DProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Calculate axis ranges based on complex numbers
  const axisRanges = useMemo(() => {
    const visibleNumbers = complexNumbers.filter((cn) => cn.visible && !cn.error);

    if (visibleNumbers.length === 0) {
      return {
        xRange: xRange || { min: -5, max: 5 },
        yRange: yRange || { min: -5, max: 5 },
      };
    }

    if (xRange && yRange) {
      return { xRange, yRange };
    }

    // Auto-calculate from data
    let minReal = Math.min(...visibleNumbers.map((cn) => cn.real));
    let maxReal = Math.max(...visibleNumbers.map((cn) => cn.real));
    let minImag = Math.min(...visibleNumbers.map((cn) => cn.imaginary));
    let maxImag = Math.max(...visibleNumbers.map((cn) => cn.imaginary));

    // Add padding
    const realPadding = Math.max(1, (maxReal - minReal) * 0.2);
    const imagPadding = Math.max(1, (maxImag - minImag) * 0.2);

    // Ensure origin is visible
    minReal = Math.min(minReal - realPadding, -1);
    maxReal = Math.max(maxReal + realPadding, 1);
    minImag = Math.min(minImag - imagPadding, -1);
    maxImag = Math.max(maxImag + imagPadding, 1);

    return {
      xRange: xRange || { min: minReal, max: maxReal },
      yRange: yRange || { min: minImag, max: maxImag },
    };
  }, [complexNumbers, xRange, yRange]);

  // Create Plotly data traces
  const data: any[] = useMemo(() => {
    const visibleNumbers = complexNumbers.filter((cn) => cn.visible && !cn.error);

    if (visibleNumbers.length === 0) {
      return [];
    }

    // Points trace
    const pointsTrace = {
      type: 'scatter',
      mode: 'markers+text',
      x: visibleNumbers.map((cn) => cn.real),
      y: visibleNumbers.map((cn) => cn.imaginary),
      marker: {
        size: 10,
        color: visibleNumbers.map((cn) => cn.color || '#3b82f6'),
        line: {
          color: isDark ? '#fff' : '#000',
          width: 1,
        },
      },
      text: visibleNumbers.map((cn) => cn.expression),
      textposition: 'top right',
      textfont: {
        size: 10,
        color: isDark ? '#e5e5e5' : '#404040',
      },
      hovertemplate: '%{text}<br>Re: %{x:.3f}<br>Im: %{y:.3f}<extra></extra>',
      name: 'Complex Numbers',
    };

    // Vector arrows (using annotations)
    return [pointsTrace];
  }, [complexNumbers, isDark]);

  // Create annotations for vector arrows
  const annotations = useMemo(() => {
    const visibleNumbers = complexNumbers.filter((cn) => cn.visible && !cn.error);

    return visibleNumbers.map((cn) => ({
      x: cn.real,
      y: cn.imaginary,
      ax: 0,
      ay: 0,
      xref: 'x',
      yref: 'y',
      axref: 'x',
      ayref: 'y',
      showarrow: true,
      arrowhead: 2,
      arrowsize: 1,
      arrowwidth: 2,
      arrowcolor: cn.color || '#3b82f6',
    }));
  }, [complexNumbers]);

  const layout: any = useMemo(() => ({
    autosize: true,
    margin: { l: 60, r: 40, b: 60, t: 40 },
    xaxis: {
      title: {
        text: 'Real',
        font: {
          size: 14,
          color: isDark ? '#e5e5e5' : '#404040',
        },
      },
      range: [axisRanges.xRange.min, axisRanges.xRange.max],
      gridcolor: isDark ? 'rgb(73, 73, 73)' : 'rgb(236, 236, 236)',
      zerolinecolor: isDark ? 'rgb(150, 150, 150)' : 'rgb(100, 100, 100)',
      zerolinewidth: 2,
      color: isDark ? '#e5e5e5' : '#404040',
    },
    yaxis: {
      title: {
        text: 'Imaginary',
        font: {
          size: 14,
          color: isDark ? '#e5e5e5' : '#404040',
        },
      },
      range: [axisRanges.yRange.min, axisRanges.yRange.max],
      gridcolor: isDark ? 'rgb(73, 73, 73)' : 'rgb(236, 236, 236)',
      zerolinecolor: isDark ? 'rgb(150, 150, 150)' : 'rgb(100, 100, 100)',
      zerolinewidth: 2,
      scaleanchor: 'x',
      scaleratio: 1,
      color: isDark ? '#e5e5e5' : '#404040',
    },
    paper_bgcolor: 'transparent',
    plot_bgcolor: isDark ? 'rgb(30, 30, 30)' : 'rgb(255, 255, 255)',
    annotations,
    showlegend: false,
  }), [isDark, axisRanges, annotations]);

  const config: any = {
    responsive: true,
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['toImage', 'lasso2d', 'select2d'],
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
