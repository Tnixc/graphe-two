import { ParsedComplexExpression, evaluateComplexAt } from './complexMathParser';

export interface Domain {
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

export interface ComplexGridData {
  x: number[];
  y: number[];
  real: number[][];
  imaginary: number[][];
  realMin: number;
  realMax: number;
  imaginaryMin: number;
  imaginaryMax: number;
}

/**
 * Generate a 2D grid of complex points and evaluate the function at each point
 * For complex functions f(z) where z = x + yi:
 * - x and y represent the real and imaginary parts of the input
 * - real part of f(z) is used as height (z-axis)
 * - imaginary part of f(z) is used for phase coloring
 *
 * @param parsed - The parsed complex mathematical expression
 * @param domain - The x and y ranges to evaluate over (complex plane)
 * @param resolution - Number of points along each axis (e.g., 100 means 100x100 grid)
 * @param zClip - Optional: clip real values to this range to handle singularities
 * @returns ComplexGridData with x, y arrays and real/imaginary matrices
 */
export function generateComplexGrid(
  parsed: ParsedComplexExpression,
  domain: Domain,
  resolution: number,
  zClip?: { min: number; max: number }
): ComplexGridData {
  const { xMin, xMax, yMin, yMax } = domain;

  // Generate linearly spaced arrays for x and y (real and imaginary axes)
  const x = linspace(xMin, xMax, resolution);
  const y = linspace(yMin, yMax, resolution);

  // Evaluate function at each grid point
  const real: number[][] = [];
  const imaginary: number[][] = [];
  let realMin = Infinity;
  let realMax = -Infinity;
  let imaginaryMin = Infinity;
  let imaginaryMax = -Infinity;

  for (let i = 0; i < y.length; i++) {
    const realRow: number[] = [];
    const imaginaryRow: number[] = [];

    for (let j = 0; j < x.length; j++) {
      const result = evaluateComplexAt(parsed, x[j], y[i]);
      let realVal = result.real;
      let imagVal = result.imaginary;

      // Apply clipping to real part if specified (height)
      if (zClip) {
        if (isFinite(realVal)) {
          realVal = Math.max(zClip.min, Math.min(zClip.max, realVal));
        } else {
          realVal = NaN;
        }
      }

      realRow.push(realVal);
      imaginaryRow.push(imagVal);

      // Track min/max for finite values
      if (isFinite(realVal)) {
        realMin = Math.min(realMin, realVal);
        realMax = Math.max(realMax, realVal);
      }
      if (isFinite(imagVal)) {
        imaginaryMin = Math.min(imaginaryMin, imagVal);
        imaginaryMax = Math.max(imaginaryMax, imagVal);
      }
    }

    real.push(realRow);
    imaginary.push(imaginaryRow);
  }

  // Handle case where all values are non-finite
  if (!isFinite(realMin)) realMin = 0;
  if (!isFinite(realMax)) realMax = 0;
  if (!isFinite(imaginaryMin)) imaginaryMin = 0;
  if (!isFinite(imaginaryMax)) imaginaryMax = 0;

  return { x, y, real, imaginary, realMin, realMax, imaginaryMin, imaginaryMax };
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
 * Auto-calculate reasonable z-axis limits based on the real part data
 * Uses percentile-based approach to ignore extreme outliers
 * @param gridData - The complex grid data
 * @param percentile - Percentile to use for clipping (default 95)
 * @returns Suggested z limits for the real part
 */
export function autoComplexZLimits(
  gridData: ComplexGridData,
  percentile: number = 95
): { min: number; max: number } {
  const allValues: number[] = [];

  // Collect all finite real values
  for (const row of gridData.real) {
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
 * Calculate statistics about the complex grid data
 */
export function calculateComplexStats(gridData: ComplexGridData): {
  realMean: number;
  realMedian: number;
  imaginaryMean: number;
  imaginaryMedian: number;
  validPoints: number;
  totalPoints: number;
  nanCount: number;
} {
  const realValues: number[] = [];
  const imaginaryValues: number[] = [];

  for (let i = 0; i < gridData.real.length; i++) {
    for (let j = 0; j < gridData.real[i].length; j++) {
      const realVal = gridData.real[i][j];
      const imagVal = gridData.imaginary[i][j];

      if (isFinite(realVal) && isFinite(imagVal)) {
        realValues.push(realVal);
        imaginaryValues.push(imagVal);
      }
    }
  }

  const totalPoints = gridData.real.length * (gridData.real[0]?.length || 0);
  const validPoints = realValues.length;
  const nanCount = totalPoints - validPoints;

  if (validPoints === 0) {
    return {
      realMean: 0,
      realMedian: 0,
      imaginaryMean: 0,
      imaginaryMedian: 0,
      validPoints,
      totalPoints,
      nanCount
    };
  }

  const realMean = realValues.reduce((sum, val) => sum + val, 0) / validPoints;
  const imaginaryMean = imaginaryValues.reduce((sum, val) => sum + val, 0) / validPoints;

  realValues.sort((a, b) => a - b);
  imaginaryValues.sort((a, b) => a - b);

  const realMedian =
    realValues.length % 2 === 0
      ? (realValues[realValues.length / 2 - 1] + realValues[realValues.length / 2]) / 2
      : realValues[Math.floor(realValues.length / 2)];

  const imaginaryMedian =
    imaginaryValues.length % 2 === 0
      ? (imaginaryValues[imaginaryValues.length / 2 - 1] + imaginaryValues[imaginaryValues.length / 2]) / 2
      : imaginaryValues[Math.floor(imaginaryValues.length / 2)];

  return { realMean, realMedian, imaginaryMean, imaginaryMedian, validPoints, totalPoints, nanCount };
}

/**
 * Convert complex value to phase (angle in radians)
 * Used for coloring based on argument of complex number
 * @param real - Real part
 * @param imaginary - Imaginary part
 * @returns Phase in radians [-π, π]
 */
export function complexToPhase(real: number, imaginary: number): number {
  return Math.atan2(imaginary, real);
}

/**
 * Convert phase to HSL hue (0-360 degrees)
 * @param phase - Phase in radians [-π, π]
 * @returns Hue in degrees [0, 360]
 */
export function phaseToHue(phase: number): number {
  // Map [-π, π] to [0, 360]
  return ((phase + Math.PI) / (2 * Math.PI)) * 360;
}
