import { create, all } from 'mathjs';

// Create a mathjs instance with all functions
const math = create(all);

export interface ParsedComplexExpression {
  expression: string;
  compiled: any;
  variables: string[];
}

export interface ComplexResult {
  real: number;
  imaginary: number;
}

/**
 * Preprocess expression to handle implicit multiplication
 * Examples: zz → z*z, 2z → 2*z, zsin(z) → z*sin(z)
 */
function addImplicitMultiplication(expr: string): string {
  const functions = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
                     'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
                     'sec', 'csc', 'cot', 'asec', 'acsc', 'acot',
                     'exp', 'log', 'log10', 'log2', 'ln', 'sqrt', 'cbrt',
                     'abs', 'ceil', 'floor', 'round', 'sign', 'pow',
                     'min', 'max', 'mod', 'gcd', 'lcm', 'conj', 'arg',
                     'real', 'imag', 're', 'im'];

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
        // digit followed by letter: 2z, 2sin
        (/\d/.test(char) && /[a-zA-Z]/.test(nextChar)) ||
        // letter followed by digit: z2
        (/[a-zA-Z]/.test(char) && /\d/.test(nextChar)) ||
        // letter followed by letter (single vars): zz (checked below)
        (/[a-zA-Z]/.test(char) && /[a-zA-Z]/.test(nextChar)) ||
        // closing paren followed by anything: )z, )2, )(
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
 * Handles formats: "w = ...", "f(z) = ...", or just "..."
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
 * Parse a complex mathematical expression and validate it
 * @param expression - The complex math expression string (e.g., "z^2", "sin(z)", "w = z^2 + 1")
 * @returns ParsedComplexExpression object with compiled function
 * @throws Error if expression is invalid
 */
export function parseComplexExpression(expression: string): ParsedComplexExpression {
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

    // Extract variable names (should be 'z' for our use case)
    const node = math.parse(rhs);
    const variables = extractVariables(node);

    // Validate that expression uses only z (or neither for constants)
    const validVars = new Set(['z', 'x', 'y']); // Allow x, y as alternate names
    const invalidVars = variables.filter(v => !validVars.has(v));
    if (invalidVars.length > 0) {
      throw new Error(`Invalid variables: ${invalidVars.join(', ')}. Only 'z' is allowed.`);
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
 * Evaluate a parsed complex expression at a given complex point z = x + yi
 * @param parsed - The parsed expression
 * @param x - Real part of z
 * @param y - Imaginary part of z
 * @returns ComplexResult with real and imaginary parts, or NaN values if error
 */
export function evaluateComplexAt(parsed: ParsedComplexExpression, x: number, y: number): ComplexResult {
  try {
    // Create complex number z = x + yi
    const z = math.complex(x, y);

    // Evaluate the expression
    const result = parsed.compiled.evaluate({ z, x, y });

    // Handle the result
    if (typeof result === 'number') {
      // Real number result
      return { real: result, imaginary: 0 };
    } else if (result && typeof result === 'object' && 're' in result && 'im' in result) {
      // Complex number result
      const re = typeof result.re === 'number' ? result.re : NaN;
      const im = typeof result.im === 'number' ? result.im : NaN;

      // Check for invalid values
      if (!isFinite(re) || !isFinite(im)) {
        return { real: NaN, imaginary: NaN };
      }

      return { real: re, imaginary: im };
    }

    return { real: NaN, imaginary: NaN };
  } catch (error) {
    // Division by zero, domain errors, etc.
    return { real: NaN, imaginary: NaN };
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

  // Common math functions (including complex functions)
  const functions = [
    'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'atan2',
    'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
    'sec', 'csc', 'cot', 'asec', 'acsc', 'acot',
    'exp', 'log', 'log10', 'log2', 'ln', 'sqrt', 'cbrt',
    'abs', 'ceil', 'floor', 'round', 'sign', 'pow',
    'min', 'max', 'mod', 'gcd', 'lcm',
    'conj', 'arg', 'real', 'imag', 're', 'im',
  ];

  return constants.includes(name) || functions.includes(name);
}

/**
 * Test if a complex expression is valid
 * @param expression - The expression string to test
 * @returns true if valid, false otherwise
 */
export function isValidComplexExpression(expression: string): boolean {
  try {
    parseComplexExpression(expression);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get list of available complex math functions for documentation/autocomplete
 */
export const availableComplexFunctions = {
  trigonometric: ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sinh', 'cosh', 'tanh'],
  exponential: ['exp', 'log', 'ln', 'sqrt', 'pow'],
  complex: ['conj', 'arg', 'real', 'imag', 're', 'im', 'abs'],
  arithmetic: ['abs', 'sign'],
  constants: ['pi', 'e', 'i'],
};
