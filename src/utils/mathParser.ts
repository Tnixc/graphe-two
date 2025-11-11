import { create, all } from 'mathjs';

// Create a mathjs instance with all functions
const math = create(all);

export interface ParsedExpression {
  expression: string;
  compiled: any;
  variables: string[];
}

/**
 * Parse a mathematical expression and validate it
 * @param expression - The math expression string (e.g., "sin(x*y)", "x^2 + y^2")
 * @returns ParsedExpression object with compiled function
 * @throws Error if expression is invalid
 */
export function parseExpression(expression: string): ParsedExpression {
  try {
    // Remove whitespace and validate non-empty
    const trimmed = expression.trim();
    if (!trimmed) {
      throw new Error('Expression cannot be empty');
    }

    // Parse and compile the expression
    const compiled = math.compile(trimmed);

    // Extract variable names (should be 'x' and 'y' for our use case)
    const node = math.parse(trimmed);
    const variables = extractVariables(node);

    // Validate that expression uses x and y (or neither for constants)
    const validVars = new Set(['x', 'y']);
    const invalidVars = variables.filter(v => !validVars.has(v));
    if (invalidVars.length > 0) {
      throw new Error(`Invalid variables: ${invalidVars.join(', ')}. Only 'x' and 'y' are allowed.`);
    }

    return {
      expression: trimmed,
      compiled,
      variables,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse expression: ${error.message}`);
    }
    throw new Error('Failed to parse expression: Unknown error');
  }
}

/**
 * Evaluate a parsed expression at a given (x, y) point
 * @param parsed - The parsed expression
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns The evaluated z value, or NaN if undefined/error
 */
export function evaluateAt(parsed: ParsedExpression, x: number, y: number): number {
  try {
    const result = parsed.compiled.evaluate({ x, y });

    // Handle complex numbers, infinity, etc.
    if (typeof result === 'number') {
      // Return NaN for infinity or invalid numbers
      if (!isFinite(result)) {
        return NaN;
      }
      return result;
    } else if (result?.im !== undefined) {
      // Complex number - take real part or return NaN
      return NaN;
    }

    return NaN;
  } catch (error) {
    // Division by zero, domain errors, etc.
    return NaN;
  }
}

/**
 * Extract variable names from a mathjs parse tree
 */
function extractVariables(node: any): string[] {
  const vars = new Set<string>();

  function traverse(n: any) {
    if (!n) return;

    if (n.type === 'SymbolNode' && !isConstant(n.name)) {
      vars.add(n.name);
    }

    // Traverse child nodes
    if (n.args) {
      n.args.forEach(traverse);
    }
    if (n.content) {
      traverse(n.content);
    }
    if (n.value) {
      traverse(n.value);
    }
  }

  traverse(node);
  return Array.from(vars);
}

/**
 * Check if a name is a known constant
 */
function isConstant(name: string): boolean {
  const constants = ['pi', 'e', 'i', 'PI', 'E', 'true', 'false', 'null', 'Infinity', 'NaN'];
  return constants.includes(name);
}

/**
 * Test if an expression is valid
 * @param expression - The expression string to test
 * @returns true if valid, false otherwise
 */
export function isValidExpression(expression: string): boolean {
  try {
    parseExpression(expression);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get list of available math functions for documentation/autocomplete
 */
export const availableFunctions = {
  trigonometric: ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2', 'sinh', 'cosh', 'tanh'],
  exponential: ['exp', 'log', 'log10', 'log2', 'ln', 'sqrt', 'cbrt'],
  arithmetic: ['abs', 'ceil', 'floor', 'round', 'sign', 'pow'],
  other: ['min', 'max', 'mod'],
  constants: ['pi', 'e'],
};
