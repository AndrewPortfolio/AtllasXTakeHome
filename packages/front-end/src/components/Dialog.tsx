import { ReactNode, useCallback, useEffect, useId, useRef, useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';

// `useSyncExternalStore` rather than a flag set from an effect: it reports false while the
// server renders and hydrates, then true, without a cascading re-render.
const neverChanges = () => () => undefined;
const onClient = () => true;
const onServer = () => false;

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export interface DialogProps {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  /** Set false while a submit is in flight so Escape/backdrop can't discard the work. */
  dismissible?: boolean;
  children: ReactNode;
}

/**
 * A modal that behaves like a sheet on phones and a centred card on desktop.
 *
 * The POs are mostly on mobile, so the small-screen case is the primary one: it takes the
 * full viewport (`100dvh`, which excludes the browser chrome that `100vh` doesn't) with the
 * header and action bar pinned and only the fields scrolling. That keeps the submit button
 * reachable with the keyboard open instead of stranding it below the fold.
 */
export function Dialog({
  open,
  title,
  description,
  onClose,
  dismissible = true,
  children,
}: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Portals need a DOM, which the server render doesn't have.
  const mounted = useSyncExternalStore(neverChanges, onClient, onServer);

  const requestClose = useCallback(() => {
    if (dismissible) {
      onClose();
    }
  }, [dismissible, onClose]);

  // Return focus to whatever opened the dialog.
  useEffect(() => {
    if (!open) {
      return;
    }

    const previouslyFocused = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    return () => previouslyFocused?.focus?.();
  }, [open]);

  // Stop the page behind the dialog from scrolling with it.
  useEffect(() => {
    if (!open) {
      return;
    }

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = overflow;
    };
  }, [open]);

  // Escape to dismiss, and keep Tab inside the panel.
  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        requestClose();
        return;
      }

      if (event.key !== 'Tab' || !panelRef.current) {
        return;
      }

      const targets = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
        .filter(element => element.offsetParent !== null);

      if (targets.length === 0) {
        return;
      }

      const first = targets[0];
      const last = targets[targets.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, requestClose]);

  if (!mounted || !open) {
    return null;
  }

  return createPortal(
    <div className='fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4'>
      <div
        aria-hidden='true'
        onMouseDown={requestClose}
        className='absolute inset-0 bg-neutral-900/50'
      />

      <div
        ref={panelRef}
        role='dialog'
        aria-modal='true'
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className='relative flex h-[100dvh] w-full flex-col bg-white shadow-2xl outline-none
          sm:h-auto sm:max-h-[85vh] sm:max-w-2xl sm:rounded-2xl'
      >
        <header className='flex items-start gap-3 border-b border-neutral-200 px-4 py-3.5 sm:px-6'>
          <div className='min-w-0 flex-1'>
            <h2 id={titleId} className='text-base font-semibold text-neutral-900 sm:text-lg'>
              {title}
            </h2>
            {description && (
              <p id={descriptionId} className='mt-0.5 text-sm text-neutral-500'>
                {description}
              </p>
            )}
          </div>

          <button
            type='button'
            onClick={requestClose}
            disabled={!dismissible}
            aria-label={`Close ${title}`}
            className='-mr-1.5 -mt-0.5 rounded-lg p-2 text-neutral-400 transition-colors
              hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-neutral-900 disabled:opacity-40'
          >
            <svg className='h-5 w-5' viewBox='0 0 20 20' fill='none' aria-hidden='true'>
              <path
                d='M5 5l10 10M15 5L5 15'
                stroke='currentColor'
                strokeWidth='1.75'
                strokeLinecap='round'
              />
            </svg>
          </button>
        </header>

        {children}
      </div>
    </div>,
    document.body,
  );
}
