import { create, all } from 'mathjs';

// Create a mathjs instance with all functions
const math = create(all);

export interface ParsedExpression {
  expression: string;
  compiled: any;
  variables: string[];
}

/**
 * Preprocess expression to handle implicit multiplication
 * Examples: xy → x*y, 2x → 2*x, xsin(x) → x*sin(x)
 */
function addImplicitMultiplication(expr: string): string {
  const functions = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
                     'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
                     'sec', 'csc', 'cot', 'asec', 'acsc', 'acot',
                     'exp', 'log', 'log10', 'log2', 'ln', 'sqrt', 'cbrt',
                     'abs', 'ceil', 'floor', 'round', 'sign', 'pow',
                     'min', 'max', 'mod', 'gcd', 'lcm'];

  const constants = ['pi', 'e', 'i', 'PI', 'E', 'Infinity', 'NaN'];

  let result = '';
  let i = 0;

  while (i < expr.length) {
    const char = expr[i];

    // Check if we're at the start of a function name
    let foundFunction = false;
    for (const fn of functions) {
      if (expr.substring(i).startsWith(fn + '(')) {
        result += fn + '(';
        i += fn.length + 1;
        foundFunction = true;
        break;
      }
    }
    if (foundFunction) continue;

    // Check if we're at the start of a constant
    let foundConstant = false;
    for (const constant of constants) {
      if (expr.substring(i).startsWith(constant) &&
          (i + constant.length >= expr.length || !/[a-zA-Z0-9]/.test(expr[i + constant.length]))) {
        result += constant;
        i += constant.length;
        foundConstant = true;
        break;
      }
    }
    if (foundConstant) continue;

    // Add current character
    result += char;

    // Check if we need to insert * after this character
    if (i + 1 < expr.length) {
      const nextChar = expr[i + 1];
      const needsMult = (
        // digit followed by letter: 2x, 2sin
        (/\d/.test(char) && /[a-zA-Z]/.test(nextChar)) ||
        // letter followed by digit: x2
        (/[a-zA-Z]/.test(char) && /\d/.test(nextChar)) ||
        // letter followed by letter (single vars): xy (checked below)
        (/[a-zA-Z]/.test(char) && /[a-zA-Z]/.test(nextChar)) ||
        // closing paren followed by anything: )x, )2, )(
        (char === ')' && (nextChar === '(' || /[a-zA-Z0-9]/.test(nextChar)))
      );

      if (needsMult) {
        // Don't insert * if next char starts a function or constant (already handled above)
        let skipMult = false;

        // Check if current position ends a function or constant we just processed
        for (const fn of functions) {
          if (expr.substring(i + 1).startsWith(fn + '(')) {
            skipMult = true;
            break;
          }
        }

        for (const constant of constants) {
          if (expr.substring(i + 1).startsWith(constant) &&
              (i + 1 + constant.length >= expr.length || !/[a-zA-Z0-9]/.test(expr[i + 1 + constant.length]))) {
            skipMult = true;
            break;
          }
        }

        if (!skipMult) {
          result += '*';
        }
      }
    }

    i++;
  }

  return result;
}

/**
 * Extract the right-hand side of an equation
 * Handles formats: "z = ...", "f(x,y) = ...", or just "..."
 */
function extractRHS(expression: string): string {
  const trimmed = expression.trim();

  // Check for equals sign
  const equalsIndex = trimmed.indexOf('=');
  if (equalsIndex === -1) {
    // No equals sign, return as-is
    return trimmed;
  }

  // Extract right-hand side
  const rhs = trimmed.substring(equalsIndex + 1).trim();
  if (!rhs) {
    throw new Error('Empty expression after "="');
  }

  return rhs;
}

/**
 * Parse a mathematical expression and validate it
 * @param expression - The math expression string (e.g., "sin(x*y)", "x^2 + y^2", "z = x^2 + y^2", "f(x,y) = xy")
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

    // Extract RHS if there's an equation format
    let rhs = extractRHS(trimmed);

    // Add implicit multiplication
    rhs = addImplicitMultiplication(rhs);

    // Parse and compile the expression
    const compiled = math.compile(rhs);

    // Extract variable names (should be 'x' and 'y' for our use case)
    const node = math.parse(rhs);
    const variables = extractVariables(node);

    // Validate that expression uses x and y (or neither for constants)
    const validVars = new Set(['x', 'y']);
    const invalidVars = variables.filter(v => !validVars.has(v));
    if (invalidVars.length > 0) {
      throw new Error(`Invalid variables: ${invalidVars.join(', ')}. Only 'x' and 'y' are allowed.`);
    }

    return {
      expression: rhs,
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

    // Only add SymbolNodes that are not constants or functions
    if (n.type === 'SymbolNode' && !isConstantOrFunction(n.name)) {
      vars.add(n.name);
    }

    // Skip function name in FunctionNode, but traverse arguments
    if (n.type === 'FunctionNode') {
      if (n.args) {
        n.args.forEach(traverse);
      }
      return;
    }

    // Traverse child nodes for other node types
    if (n.args && n.type !== 'FunctionNode') {
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
 * Check if a name is a known constant or function
 */
function isConstantOrFunction(name: string): boolean {
  const constants = ['pi', 'e', 'i', 'PI', 'E', 'true', 'false', 'null', 'Infinity', 'NaN'];

  // Common math functions
  const functions = [
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
    'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
    'sec', 'csc', 'cot', 'asec', 'acsc', 'acot',
    'exp', 'log', 'log10', 'log2', 'ln', 'sqrt', 'cbrt',
    'abs', 'ceil', 'floor', 'round', 'sign', 'pow',
    'min', 'max', 'mod', 'gcd', 'lcm',
  ];

  return constants.includes(name) || functions.includes(name);
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
