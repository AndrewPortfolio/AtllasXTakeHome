import type { ApiFailure, ApiSuccess, UserFieldErrors, UserFormValues, UserRecord } from 'shared';

/** The express server from `packages/back-end`, which defaults to port 50000. */
export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:50000')
  .replace(/\/+$/, '');

/** A failed request, carrying whatever per-field reasons the server sent back. */
export class ApiError extends Error {
  /** HTTP status, or 0 when the request never made it to the server. */
  readonly status: number;

  readonly fields: UserFieldErrors;

  constructor(message: string, status: number, fields: UserFieldErrors = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.fields = fields;
  }
}

/**
 * Read the response envelope without narrowing on `success`.
 *
 * This workspace compiles with `strictNullChecks: false`, under which TypeScript won't
 * discriminate a union on a boolean literal. Dropping the discriminant and treating both
 * halves as optional sidesteps that — the HTTP status already tells us which one we got.
 */
type Envelope<T> = Partial<Omit<ApiSuccess<T>, 'success'> & Omit<ApiFailure, 'success'>>;

async function readEnvelope<T>(response: Response): Promise<Envelope<T>> {
  try {
    return (await response.json()) as Envelope<T>;
  } catch {
    // A proxy error page, an empty 500, ... nothing useful to show the user.
    return {};
  }
}

/**
 * Create a user.
 *
 * `values` is posted as-is: the server validates the exact same shape with the exact same
 * schema from `shared`, so anything the form accepts is something the server understands.
 */
export async function createUser(values: UserFormValues): Promise<UserRecord> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });
  } catch {
    throw new ApiError(
      `Couldn't reach the server. Check that the API is running at ${API_BASE_URL}.`,
      0,
    );
  }

  const envelope = await readEnvelope<UserRecord>(response);

  if (!response.ok) {
    throw new ApiError(
      envelope.error ?? 'Something went wrong. Please try again.',
      response.status,
      envelope.fields ?? {},
    );
  }

  if (!envelope.data) {
    throw new ApiError('The server accepted the user but returned nothing.', response.status);
  }

  return envelope.data;
}
