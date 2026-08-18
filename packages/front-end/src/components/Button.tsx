import clsx from 'clsx';
import { ButtonHTMLAttributes, forwardRef } from 'react';
import { Spinner } from './Spinner';

type Variant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  // Swaps the label for a spinner and blocks further clicks
  loading?: boolean;
}

// min-h-[2.75rem] keeps every button at the 44px minimum touch target on phones.
const BASE = 'inline-flex min-h-[2.75rem] items-center justify-center gap-2 rounded-lg '
  + 'px-4 text-sm font-semibold transition-colors focus-visible:outline-none '
  + 'focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 '
  + 'disabled:cursor-not-allowed disabled:opacity-60';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-neutral-900 text-white hover:bg-neutral-700 disabled:hover:bg-neutral-900',
  secondary: 'border border-neutral-300 bg-white text-neutral-800 hover:bg-neutral-50',
  ghost: 'text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'primary', loading = false, disabled, className, children, type = 'button', ...rest },
  ref,
) {
  return (
    <button
      {...rest}
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={clsx(BASE, VARIANTS[variant], className)}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
});
