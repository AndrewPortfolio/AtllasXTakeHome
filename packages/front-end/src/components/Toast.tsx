import { useEffect } from 'react';

export interface ToastProps {
  message: string;
  onDismiss: () => void;
  /** Milliseconds before it disappears on its own. */
  duration?: number;
}

/**
 * A transient confirmation. Anchored to the bottom on phones (near the thumb) and to the
 * bottom-right on desktop.
 */
export function Toast({ message, onDismiss, duration = 6000 }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, duration);

    return () => window.clearTimeout(timer);
  }, [message, duration, onDismiss]);

  return (
    <div
      role='status'
      aria-live='polite'
      className='pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-4
        pb-[max(1rem,env(safe-area-inset-bottom))] sm:inset-x-auto sm:right-6 sm:justify-end'
    >
      <div
        className='pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl
          bg-neutral-900 px-4 py-3 text-sm text-white shadow-lg'
      >
        <svg className='mt-0.5 h-4 w-4 shrink-0 text-green-400' viewBox='0 0 20 20' fill='none' aria-hidden='true'>
          <path
            d='M4 10.5l4 4 8-9'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
          />
        </svg>

        <p className='min-w-0 flex-1'>{message}</p>

        <button
          type='button'
          onClick={onDismiss}
          aria-label='Dismiss notification'
          className='-mr-1 -mt-1 shrink-0 rounded-md p-1 text-neutral-400 transition-colors
            hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2
            focus-visible:ring-white'
        >
          <svg className='h-4 w-4' viewBox='0 0 20 20' fill='none' aria-hidden='true'>
            <path d='M5 5l10 10M15 5L5 15' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
          </svg>
        </button>
      </div>
    </div>
  );
}
