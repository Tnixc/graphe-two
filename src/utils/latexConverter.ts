/**
 * Convert LaTeX math expressions to mathjs-compatible syntax
 * Handles common LaTeX commands and converts them to JavaScript math notation
 */

export function latexToMathjs(latex: string): string {
  if (!latex || latex.trim() === '') {
    return '';
  }

  let result = latex.trim();

  // Remove display math delimiters if present
  result = result.replace(/^\\\[|\\\]$/g, '');
  result = result.replace(/^\$\$|\$\$$/g, '');
  result = result.replace(/^\$|\$$/g, '');

  // Replace common LaTeX functions
  const replacements: Array<[RegExp, string]> = [
    // Trigonometric functions
    [/\\sin\s*/g, 'sin'],
    [/\\cos\s*/g, 'cos'],
    [/\\tan\s*/g, 'tan'],
    [/\\cot\s*/g, 'cot'],
    [/\\sec\s*/g, 'sec'],
    [/\\csc\s*/g, 'csc'],

    // Inverse trig functions
    [/\\arcsin\s*/g, 'asin'],
    [/\\arccos\s*/g, 'acos'],
    [/\\arctan\s*/g, 'atan'],
    [/\\arccot\s*/g, 'acot'],
    [/\\arcsec\s*/g, 'asec'],
    [/\\arccsc\s*/g, 'acsc'],

    // Hyperbolic functions
    [/\\sinh\s*/g, 'sinh'],
    [/\\cosh\s*/g, 'cosh'],
    [/\\tanh\s*/g, 'tanh'],

    // Logarithms
    [/\\ln\s*/g, 'log'],  // Natural log in mathjs is log()
    [/\\log\s*/g, 'log10'],  // Base-10 log

    // Exponential
    [/\\exp\s*/g, 'exp'],

    // Square root - handle \sqrt{...}
    [/\\sqrt\{([^}]+)\}/g, 'sqrt($1)'],

    // Absolute value - handle \left| ... \right|
    [/\\left\|([^|]+)\\right\|/g, 'abs($1)'],
    [/\|([^|]+)\|/g, 'abs($1)'],

    // Fractions - handle \frac{a}{b}
    [/\\frac\{([^}]+)\}\{([^}]+)\}/g, '(($1)/($2))'],

    // Powers/exponents - handle x^{2} or x^2
    [/\^\\left\{([^}]+)\\right\}/g, '^($1)'],
    [/\^\\{([^}]+)\\}/g, '^($1)'],
    [/\^\{([^}]+)\}/g, '^($1)'],

    // Greek letters
    [/\\pi\s*/g, 'pi'],
    [/\\theta\s*/g, 'theta'],
    [/\\phi\s*/g, 'phi'],
    [/\\alpha\s*/g, 'alpha'],
    [/\\beta\s*/g, 'beta'],
    [/\\gamma\s*/g, 'gamma'],
    [/\\delta\s*/g, 'delta'],

    // Constants
    [/\\e\s*/g, 'e'],

    // Parentheses variants
    [/\\left\(/g, '('],
    [/\\right\)/g, ')'],
    [/\\left\[/g, '('],
    [/\\right\]/g, ')'],

    // Remove spacing commands
    [/\\,/g, ''],
    [/\\;/g, ''],
    [/\\:/g, ''],
    [/\\!/g, ''],
    [/\\ /g, ''],

    // Handle implicit multiplication (e.g., 2x -> 2*x, )( -> )*(
    [/(\d)([a-zA-Z])/g, '$1*$2'],  // Number before letter
    [/\)([a-zA-Z])/g, ')*$1'],      // ) before letter
    [/\)(\()/g, ')*$1'],            // )(
    [/([a-zA-Z])(\()/g, '$1*$2'],   // letter before (
    [/(\d)(\()/g, '$1*$2'],         // number before (
    [/\)(\d)/g, ')*$1'],            // ) before number

    // Clean up any remaining backslashes
    [/\\/g, ''],
  ];

  // Apply all replacements
  for (const [pattern, replacement] of replacements) {
    result = result.replace(pattern, replacement);
  }

  // Remove any remaining curly braces used for grouping in LaTeX
  result = result.replace(/\{/g, '(');
  result = result.replace(/\}/g, ')');

  return result.trim();
}

/**
 * Test if a LaTeX string can be converted to mathjs
 */
export function canConvertLatex(latex: string): boolean {
  try {
    const converted = latexToMathjs(latex);
    return converted.length > 0;
  } catch {
    return false;
  }
}

/**
 * Common LaTeX examples for testing
 */
export const latexExamples = {
  basic: {
    latex: 'x^2 + y^2',
    mathjs: 'x^2 + y^2',
  },
  fraction: {
    latex: '\\frac{x}{y}',
    mathjs: '((x)/(y))',
  },
  sqrt: {
    latex: '\\sqrt{x^2 + y^2}',
    mathjs: 'sqrt(x^2 + y^2)',
  },
  trig: {
    latex: '\\sin(x) \\cdot \\cos(y)',
    mathjs: 'sin(x) * cos(y)',
  },
  complex: {
    latex: '\\frac{\\sin(\\sqrt{x^2 + y^2})}{\\sqrt{x^2 + y^2}}',
    mathjs: '((sin(sqrt(x^2 + y^2)))/(sqrt(x^2 + y^2)))',
  },
};
