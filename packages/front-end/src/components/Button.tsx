import clsx from 'clsx';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  /** Swaps the label for a spinner and blocks further clicks. */
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

function Spinner() {
  return (
    <svg
      className='h-4 w-4 animate-spin'
      viewBox='0 0 24 24'
      fill='none'
      aria-hidden='true'
    >
      <circle className='opacity-25' cx='12' cy='12' r='10' stroke='currentColor' strokeWidth='4' />
      <path
        className='opacity-75'
        fill='currentColor'
        d='M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4z'
      />
    </svg>
  );
}
