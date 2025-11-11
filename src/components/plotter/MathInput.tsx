import { useEffect, useRef, forwardRef, useImperativeHandle, createElement } from 'react';
import 'mathlive';
import type { MathfieldElement } from 'mathlive';
import { cn } from '@/lib/utils';

export interface MathInputProps {
  value?: string;
  onChange?: (latex: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
}

export interface MathInputRef {
  focus: () => void;
  blur: () => void;
  getValue: () => string;
  setValue: (latex: string) => void;
}

/**
 * MathInput component using MathLive for WYSIWYG math editing
 * Renders beautiful typeset mathematics and outputs LaTeX
 */
export const MathInput = forwardRef<MathInputRef, MathInputProps>(
  function MathInput(
    {
      value = '',
      onChange,
      onBlur,
      onFocus,
      placeholder = 'f(x,y) = ',
      className,
      disabled = false,
      autoFocus = false,
    },
    ref
  ) {
    const mathfieldRef = useRef<MathfieldElement>(null);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      focus: () => mathfieldRef.current?.focus(),
      blur: () => mathfieldRef.current?.blur(),
      getValue: () => mathfieldRef.current?.getValue() || '',
      setValue: (latex: string) => {
        if (mathfieldRef.current) {
          mathfieldRef.current.setValue(latex);
        }
      },
    }));

    // Set up the mathfield once mounted
    useEffect(() => {
      const mf = mathfieldRef.current;
      if (!mf) return;

      // Configure the mathfield
      mf.mathVirtualKeyboardPolicy = 'auto';
      mf.smartFence = true;
      mf.smartMode = true;
      mf.smartSuperscript = true;
      mf.removeExtraneousParentheses = true;

      // Set initial value
      if (value) {
        mf.setValue(value);
      }

      // Auto-focus if requested
      if (autoFocus) {
        setTimeout(() => mf.focus(), 100);
      }

      // Handle input events
      const handleInput = () => {
        const latex = mf.getValue();
        onChange?.(latex);
      };

      const handleFocus = () => {
        onFocus?.();
      };

      const handleBlur = () => {
        onBlur?.();
      };

      mf.addEventListener('input', handleInput);
      mf.addEventListener('focus', handleFocus);
      mf.addEventListener('blur', handleBlur);

      return () => {
        mf.removeEventListener('input', handleInput);
        mf.removeEventListener('focus', handleFocus);
        mf.removeEventListener('blur', handleBlur);
      };
    }, [onChange, onBlur, onFocus, autoFocus]);

    // Update value when prop changes (but not from user input)
    useEffect(() => {
      const mf = mathfieldRef.current;
      if (mf && value !== undefined && value !== mf.getValue()) {
        mf.setValue(value);
      }
    }, [value]);

    return createElement('math-field', {
      ref: mathfieldRef,
      className: cn(
        'w-full rounded-md border border-input bg-transparent shadow-sm transition-colors',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className
      ),
      style: {
        fontSize: '16px',
        padding: '8px 12px',
        minHeight: '40px',
        display: 'block',
      },
      ...(disabled && { disabled: true }),
      children: placeholder,
    });
  }
);

MathInput.displayName = 'MathInput';
