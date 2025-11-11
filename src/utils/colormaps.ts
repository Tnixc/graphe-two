/**
 * Colormap definitions for 3D surface plots
 * Plotly supports named colormaps and custom colorscales
 */

export type ColorMapType = 'sequential' | 'diverging' | 'cyclic';

export interface ColorMap {
  name: string;
  value: string;
  type: ColorMapType;
  description: string;
}

/**
 * Available colormaps organized by type
 * Plotly built-in colormaps: https://plotly.com/javascript/colorscales/
 */
export const colormaps: ColorMap[] = [
  // Sequential colormaps - good for general functions
  {
    name: 'Viridis',
    value: 'Viridis',
    type: 'sequential',
    description: 'Perceptually uniform, colorblind-friendly',
  },
  {
    name: 'Plasma',
    value: 'Plasma',
    type: 'sequential',
    description: 'High contrast, purple to yellow',
  },
  {
    name: 'Inferno',
    value: 'Inferno',
    type: 'sequential',
    description: 'Dark background, warm colors',
  },
  {
    name: 'Magma',
    value: 'Magma',
    type: 'sequential',
    description: 'Similar to inferno, more magenta',
  },
  {
    name: 'Cividis',
    value: 'Cividis',
    type: 'sequential',
    description: 'Optimized for colorblind viewers',
  },
  {
    name: 'Blues',
    value: 'Blues',
    type: 'sequential',
    description: 'Light to dark blue',
  },
  {
    name: 'Greens',
    value: 'Greens',
    type: 'sequential',
    description: 'Light to dark green',
  },
  {
    name: 'Reds',
    value: 'Reds',
    type: 'sequential',
    description: 'Light to dark red',
  },
  {
    name: 'Hot',
    value: 'Hot',
    type: 'sequential',
    description: 'Black-red-yellow-white',
  },
  {
    name: 'Jet',
    value: 'Jet',
    type: 'sequential',
    description: 'Rainbow colors (not perceptually uniform)',
  },

  // Diverging colormaps - good for functions centered around zero
  {
    name: 'RdBu',
    value: 'RdBu',
    type: 'diverging',
    description: 'Red to blue through white',
  },
  {
    name: 'RdYlBu',
    value: 'RdYlBu',
    type: 'diverging',
    description: 'Red-yellow-blue diverging',
  },
  {
    name: 'Spectral',
    value: 'Spectral',
    type: 'diverging',
    description: 'Rainbow diverging colormap',
  },
  {
    name: 'Picnic',
    value: 'Picnic',
    type: 'diverging',
    description: 'Blue to red through white',
  },
  {
    name: 'Portland',
    value: 'Portland',
    type: 'diverging',
    description: 'Blue-white-red',
  },

  // Cyclic colormaps - good for periodic/angular functions
  {
    name: 'HSV',
    value: 'HSV',
    type: 'cyclic',
    description: 'Full hue cycle, good for angles',
  },
  {
    name: 'Phase',
    value: 'Phase',
    type: 'cyclic',
    description: 'Cyclic colormap for phase',
  },
  {
    name: 'Twilight',
    value: 'Twilight',
    type: 'cyclic',
    description: 'Perceptually uniform cyclic',
  },
  {
    name: 'IceFire',
    value: 'IceFire',
    type: 'cyclic',
    description: 'Cyan-black-orange cyclic',
  },
];

/**
 * Get colormap by name
 */
export function getColorMap(name: string): ColorMap | undefined {
  return colormaps.find((cm) => cm.name === name || cm.value === name);
}

/**
 * Get default colormap for different use cases
 */
export const defaultColormaps = {
  general: 'Viridis',
  periodic: 'HSV',
  diverging: 'RdBu',
};

/**
 * Categorize colormaps by type
 */
export function getColormapsByType(type: ColorMapType): ColorMap[] {
  return colormaps.filter((cm) => cm.type === type);
}

/**
 * Generate colors for multiple functions
 * Returns an array of distinct colors for different plots
 */
export function getDistinctColors(count: number): string[] {
  const baseColors = [
    '#1f77b4', // blue
    '#ff7f0e', // orange
    '#2ca02c', // green
    '#d62728', // red
    '#9467bd', // purple
    '#8c564b', // brown
    '#e377c2', // pink
    '#7f7f7f', // gray
    '#bcbd22', // olive
    '#17becf', // cyan
  ];

  if (count <= baseColors.length) {
    return baseColors.slice(0, count);
  }

  // If we need more colors, generate them using HSL
  const colors: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = (i * 360) / count;
    colors.push(`hsl(${hue}, 70%, 50%)`);
  }

  return colors;
}
