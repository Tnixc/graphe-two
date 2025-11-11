import { ParsedExpression, evaluateAt } from './mathParser';

export interface Domain {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface GridData {
  x: number[];
  y: number[];
  z: number[][];
  zMin: number;
  zMax: number;
}

/**
 * Generate a 2D grid of points and evaluate the function at each point
 * @param parsed - The parsed mathematical expression
 * @param domain - The x and y ranges to evaluate over
 * @param resolution - Number of points along each axis (e.g., 100 means 100x100 grid)
 * @param zClip - Optional: clip z values to this range to handle singularities
 * @returns GridData with x, y arrays and z matrix
 */
export function generateGrid(
  parsed: ParsedExpression,
  domain: Domain,
  resolution: number,
  zClip?: { min: number; max: number }
): GridData {
  const { xMin, xMax, yMin, yMax } = domain;

  // Generate linearly spaced arrays for x and y
  const x = linspace(xMin, xMax, resolution);
  const y = linspace(yMin, yMax, resolution);

  // Evaluate function at each grid point
  const z: number[][] = [];
  let zMin = Infinity;
  let zMax = -Infinity;

  for (let i = 0; i < y.length; i++) {
    const row: number[] = [];
    for (let j = 0; j < x.length; j++) {
      let val = evaluateAt(parsed, x[j], y[i]);

      // Apply clipping if specified
      if (zClip) {
        if (isFinite(val)) {
          val = Math.max(zClip.min, Math.min(zClip.max, val));
        } else {
          val = NaN;
        }
      }

      row.push(val);

      // Track min/max for finite values
      if (isFinite(val)) {
        zMin = Math.min(zMin, val);
        zMax = Math.max(zMax, val);
      }
    }
    z.push(row);
  }

  // Handle case where all values are non-finite
  if (!isFinite(zMin)) zMin = 0;
  if (!isFinite(zMax)) zMax = 0;

  return { x, y, z, zMin, zMax };
}

/**
 * Generate linearly spaced array from start to end with n points
 * @param start - Start value
 * @param end - End value
 * @param n - Number of points
 * @returns Array of linearly spaced values
 */
function linspace(start: number, end: number, n: number): number[] {
  if (n < 2) return [start];

  const result: number[] = [];
  const step = (end - start) / (n - 1);

  for (let i = 0; i < n; i++) {
    result.push(start + step * i);
  }

  return result;
}

/**
 * Auto-calculate reasonable z-axis limits based on the data
 * Uses percentile-based approach to ignore extreme outliers
 * @param gridData - The grid data
 * @param percentile - Percentile to use for clipping (default 95)
 * @returns Suggested z limits
 */
export function autoZLimits(
  gridData: GridData,
  percentile: number = 95
): { min: number; max: number } {
  const allValues: number[] = [];

  // Collect all finite values
  for (const row of gridData.z) {
    for (const val of row) {
      if (isFinite(val)) {
        allValues.push(val);
      }
    }
  }

  if (allValues.length === 0) {
    return { min: -10, max: 10 };
  }

  // Sort values
  allValues.sort((a, b) => a - b);

  // Calculate percentile indices
  const lowerIdx = Math.floor((allValues.length * (100 - percentile)) / 200);
  const upperIdx = Math.ceil((allValues.length * (100 + percentile)) / 200) - 1;

  const min = allValues[lowerIdx];
  const max = allValues[upperIdx];

  // Add some padding
  const padding = (max - min) * 0.1;

  return {
    min: min - padding,
    max: max + padding,
  };
}

/**
 * Calculate statistics about the grid data
 */
export function calculateStats(gridData: GridData): {
  mean: number;
  median: number;
  validPoints: number;
  totalPoints: number;
  nanCount: number;
} {
  const allValues: number[] = [];

  for (const row of gridData.z) {
    for (const val of row) {
      if (isFinite(val)) {
        allValues.push(val);
      }
    }
  }

  const totalPoints = gridData.z.length * (gridData.z[0]?.length || 0);
  const validPoints = allValues.length;
  const nanCount = totalPoints - validPoints;

  if (validPoints === 0) {
    return { mean: 0, median: 0, validPoints, totalPoints, nanCount };
  }

  const mean = allValues.reduce((sum, val) => sum + val, 0) / validPoints;

  allValues.sort((a, b) => a - b);
  const median =
    allValues.length % 2 === 0
      ? (allValues[allValues.length / 2 - 1] + allValues[allValues.length / 2]) / 2
      : allValues[Math.floor(allValues.length / 2)];

  return { mean, median, validPoints, totalPoints, nanCount };
}
