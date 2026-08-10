import { z } from 'zod';

/**
 * The one definition of what a valid user looks like.
 *
 * Both sides consume this: the Express route validates request bodies with
 * `validateUserForm`, and the Add User form feeds `userFormSchema` straight into
 * react-hook-form. There is deliberately no second copy of these rules.
 *
 * Shapes here mirror the Sequelize model in `packages/back-end/src/services/db.ts`,
 * which is fixed.
 */

// ---------------------------------------------------------------------------
// Limits and patterns
// ---------------------------------------------------------------------------

/** Every text column in the schema is a VARCHAR(255), so nothing may exceed this. */
export const MAX_COLUMN_LENGTH = 255;

export const LIMITS = {
  firstName: 80,
  middleName: 80,
  lastName: 80,
  email: MAX_COLUMN_LENGTH,
  phoneNumber: 32,
  address: MAX_COLUMN_LENGTH,
  adminNotes: MAX_COLUMN_LENGTH,
} as const;

export const MIN_PHONE_LENGTH = 7;

/**
 * Pragmatic email check. Intentionally permissive — the unique constraint and the real
 * world are both stricter than any regex worth maintaining here.
 */
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Digits plus the usual formatting characters. */
export const PHONE_PATTERN = /^[0-9+()\-.\s]+$/;

/** The `YYYY-MM-DD` an `<input type="date">` produces. */
export const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Registrations can't predate the schema by a century. */
export const EARLIEST_REGISTERED_DATE = '1900-01-01';

export const FIELD_LABELS = {
  registered: 'Registered',
  firstName: 'First name',
  middleName: 'Middle name',
  lastName: 'Last name',
  email: 'Email',
  phoneNumber: 'Phone number',
  address: 'Address',
  adminNotes: 'Admin notes',
} as const;

// ---------------------------------------------------------------------------
// Dates
// ---------------------------------------------------------------------------

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** Today in the caller's timezone, as a `YYYY-MM-DD` string. */
export function todayAsDateInputValue(): string {
  const now = new Date();
  return toDateString(new Date(now.getTime() - now.getTimezoneOffset() * 60_000));
}

/**
 * The newest date we'll accept as a registration date.
 *
 * Computed from the UTC clock so the browser and the server always agree, and padded by a
 * day because a PO in UTC+13 is legitimately "today" while a UTC server still says
 * yesterday. The date input's `max` attribute is the stricter local today, so the picker
 * still steers people to the right answer.
 */
export function latestAllowedRegisteredDate(): string {
  return toDateString(new Date(Date.now() + 24 * 60 * 60 * 1000));
}

/** Checks a real calendar date, so 2024-02-31 doesn't silently roll over into March. */
export function isCalendarDate(value: string): boolean {
  if (!DATE_INPUT_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);

  return month >= 1
    && month <= 12
    && day >= 1
    && day <= new Date(Date.UTC(year, month, 0)).getUTCDate();
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const text = (field: keyof typeof FIELD_LABELS) => z
  .string({ error: `${FIELD_LABELS[field]} must be text.` })
  .trim();

const requiredName = (field: 'firstName' | 'lastName') => text(field)
  .min(1, `${FIELD_LABELS[field]} is required.`)
  .max(LIMITS[field], `${FIELD_LABELS[field]} must be ${LIMITS[field]} characters or fewer.`);

const optionalText = (field: 'middleName' | 'address' | 'adminNotes') => text(field)
  .max(LIMITS[field], `${FIELD_LABELS[field]} must be ${LIMITS[field]} characters or fewer.`);

/**
 * Validates the form as the user types it: every field is a string, and `''` means "not
 * provided". Keeping the input and output types identical is what lets react-hook-form bind
 * to it directly while the server parses the very same shape off the wire.
 */
export const userFormSchema = z.object({
  // Blank means "registered as of right now", which the server stamps.
  registered: text('registered')
    .refine(
      value => value === '' || isCalendarDate(value),
      'Enter a valid date.',
    )
    .refine(
      value => value === '' || value >= EARLIEST_REGISTERED_DATE,
      `${FIELD_LABELS.registered} date is unrealistically far in the past.`,
    )
    .refine(
      value => value === '' || value <= latestAllowedRegisteredDate(),
      `${FIELD_LABELS.registered} date cannot be in the future.`,
    ),

  firstName: requiredName('firstName'),
  middleName: optionalText('middleName'),
  lastName: requiredName('lastName'),

  email: text('email')
    .min(1, `${FIELD_LABELS.email} is required.`)
    .max(LIMITS.email, `${FIELD_LABELS.email} must be ${LIMITS.email} characters or fewer.`)
    .regex(EMAIL_PATTERN, 'Enter a valid email address.'),

  phoneNumber: text('phoneNumber')
    .refine(
      value => value === '' || PHONE_PATTERN.test(value),
      `${FIELD_LABELS.phoneNumber} may only contain digits and + ( ) - . characters.`,
    )
    .refine(
      value => value === '' || value.length >= MIN_PHONE_LENGTH,
      `${FIELD_LABELS.phoneNumber} must be at least ${MIN_PHONE_LENGTH} characters.`,
    )
    .refine(
      value => value.length <= LIMITS.phoneNumber,
      `${FIELD_LABELS.phoneNumber} must be ${LIMITS.phoneNumber} characters or fewer.`,
    ),

  address: optionalText('address'),
  adminNotes: optionalText('adminNotes'),
});

export type UserFormValues = z.infer<typeof userFormSchema>;
export type UserFormField = keyof UserFormValues;

/** Field name -> human-readable reason, keyed so the client can highlight the right input. */
export type UserFieldErrors = Partial<Record<UserFormField, string>>;

export const USER_FORM_FIELDS = [
  'registered',
  'firstName',
  'middleName',
  'lastName',
  'email',
  'phoneNumber',
  'address',
  'adminNotes',
] as const satisfies readonly UserFormField[];

export function emptyUserForm(): UserFormValues {
  return {
    registered: todayAsDateInputValue(),
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    adminNotes: '',
  };
}

// ---------------------------------------------------------------------------
// Server-side entry point
// ---------------------------------------------------------------------------

/**
 * A string discriminant (rather than a boolean `ok`) because this workspace compiles with
 * `strictNullChecks: false`, under which TypeScript won't narrow on a boolean literal.
 */
export type UserFormValidation =
  | { status: 'valid'; values: UserFormValues }
  | { status: 'invalid'; message: string; fields: UserFieldErrors };

/**
 * Validate an untrusted request body. Missing keys are treated as blank, so an API client
 * only has to send the fields it actually cares about.
 */
export function validateUserForm(body: unknown): UserFormValidation {
  if (typeof body !== 'object' || body === null || Array.isArray(body)) {
    return {
      status: 'invalid',
      message: 'Expected a JSON object describing the user.',
      fields: {},
    };
  }

  const raw = body as Record<string, unknown>;
  const candidate: Record<string, unknown> = {};

  for (const field of USER_FORM_FIELDS) {
    const value = raw[field];
    candidate[field] = value === undefined || value === null ? '' : value;
  }

  const result = userFormSchema.safeParse(candidate);

  // Explicit comparison: see the note on UserFormValidation.
  if (result.success === false) {
    const fields: UserFieldErrors = {};

    for (const issue of result.error.issues) {
      const field = issue.path[0] as UserFormField;

      // First issue per field wins — that's the one the user should fix first.
      if (field && !fields[field]) {
        fields[field] = issue.message;
      }
    }

    return {
      status: 'invalid',
      message: 'Some fields need your attention.',
      fields,
    };
  }

  return { status: 'valid', values: result.data };
}

// ---------------------------------------------------------------------------
// Wire format
// ---------------------------------------------------------------------------

/**
 * A user as it comes back from the API: the Sequelize model run through `JSON.stringify`,
 * so `registered` is an ISO 8601 string and nullable columns are `null` (or absent, on a
 * row that was just created without them).
 */
export interface UserRecord {
  id: number;
  registered: string | null;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  address?: string | null;
  adminNotes: string;
}

/** Envelope every route in `packages/back-end/src/routes` responds with. */
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiFailure {
  success: false;
  /** Human-readable summary, safe to show to the user. */
  error?: string;
  /** Per-field reasons, present when the failure was a validation error. */
  fields?: UserFieldErrors;
}

export function fullName(user: Pick<UserRecord, 'firstName' | 'middleName' | 'lastName'>): string {
  return [user.firstName, user.middleName, user.lastName].filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Persistence shape
// ---------------------------------------------------------------------------

/** What gets handed to `User.create`. `id` is auto-incremented by the database. */
export interface CreateUserAttributes {
  registered: Date;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  adminNotes: string;
}

/**
 * Turn validated form values into columns.
 *
 * Blank optional fields become `undefined` so they land as NULL rather than as an empty
 * string, and `registered` is stored at UTC midnight of the chosen day — the field has
 * day granularity, so pinning it to a fixed zone keeps it from drifting a day when it's
 * formatted for display.
 */
export function toCreateUserAttributes(values: UserFormValues): CreateUserAttributes {
  const optional = (value: string): string | undefined => (value === '' ? undefined : value);

  return {
    registered: values.registered === ''
      ? new Date()
      : new Date(`${values.registered}T00:00:00.000Z`),
    firstName: values.firstName,
    middleName: optional(values.middleName),
    lastName: values.lastName,
    email: values.email,
    phoneNumber: optional(values.phoneNumber),
    address: optional(values.address),
    // The column is NOT NULL with a '' default; be explicit rather than relying on it.
    adminNotes: values.adminNotes,
  };
}
