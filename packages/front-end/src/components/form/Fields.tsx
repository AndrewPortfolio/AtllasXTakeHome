import clsx from 'clsx';
import {
  forwardRef,
  InputHTMLAttributes,
  ReactNode,
  TextareaHTMLAttributes,
  useId,
} from 'react';

interface FieldChrome {
  label: string;
  /** Validation message. Its presence is what puts the control into its error state. */
  error?: string;
  /** Static help text, hidden while an error is showing so the two never compete. */
  hint?: string;
}

// text-base (16px) is deliberate: anything smaller makes iOS Safari zoom in on focus.
const CONTROL = 'mt-1.5 block w-full rounded-lg border bg-white px-3 py-2.5 text-base '
  + 'text-neutral-900 shadow-sm transition-colors placeholder:text-neutral-400 '
  + 'focus:outline-none focus:ring-2 disabled:bg-neutral-50 disabled:text-neutral-500';

const CONTROL_DEFAULT = 'border-neutral-300 focus:border-neutral-900 focus:ring-neutral-900/20';
const CONTROL_ERROR = 'border-red-400 focus:border-red-500 focus:ring-red-500/20';

function useFieldIds(error?: string, hint?: string) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  return {
    id,
    errorId,
    hintId,
    // Point at whichever of the two is actually rendered.
    describedBy: error ? errorId : (hint ? hintId : undefined),
  };
}

function FieldShell({
  id,
  label,
  required,
  error,
  hint,
  errorId,
  hintId,
  children,
}: FieldChrome & {
  id: string;
  required?: boolean;
  errorId: string;
  hintId: string;
  children: ReactNode;
}) {
  return (
    <>
      <label htmlFor={id} className='block text-sm font-medium text-neutral-800'>
        {label}
        {required && <span className='ml-0.5 text-red-600' aria-hidden='true'>*</span>}
      </label>

      {children}

      {error
        ? <p id={errorId} role='alert' className='mt-1.5 text-xs font-medium text-red-600'>{error}</p>
        : hint && <p id={hintId} className='mt-1.5 text-xs text-neutral-500'>{hint}</p>}
    </>
  );
}

export type TextFieldProps = FieldChrome
  & Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>
  & { className?: string };

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  { label, error, hint, className, required, ...input },
  ref,
) {
  const { id, errorId, hintId, describedBy } = useFieldIds(error, hint);

  return (
    <div className={className}>
      <FieldShell
        id={id}
        label={label}
        required={required}
        error={error}
        hint={hint}
        errorId={errorId}
        hintId={hintId}
      >
        <input
          {...input}
          id={id}
          ref={ref}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={clsx(CONTROL, error ? CONTROL_ERROR : CONTROL_DEFAULT)}
        />
      </FieldShell>
    </div>
  );
});

export type TextAreaFieldProps = FieldChrome
  & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'>
  & { className?: string };

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaFieldProps>(
  function TextAreaField({ label, error, hint, className, required, rows = 3, ...textarea }, ref) {
    const { id, errorId, hintId, describedBy } = useFieldIds(error, hint);

    return (
      <div className={className}>
        <FieldShell
          id={id}
          label={label}
          required={required}
          error={error}
          hint={hint}
          errorId={errorId}
          hintId={hintId}
        >
          <textarea
            {...textarea}
            id={id}
            ref={ref}
            rows={rows}
            required={required}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={clsx(CONTROL, 'resize-y', error ? CONTROL_ERROR : CONTROL_DEFAULT)}
          />
        </FieldShell>
      </div>
    );
  },
);
