import {
  DEFAULT_PAGE_SIZE,
  type ApiFailure,
  type ApiSuccess,
  type UserFieldErrors,
  type UserFormValues,
  type UserPage,
  type UserRecord,
} from 'shared';

/** The port the express server in `packages/back-end` listens on. */
const API_PORT = 50000;

//api can run from laptop + mobile if connected to same wifi
function sameHostApi(): string {
  if (typeof window === 'undefined') {
    return `http://127.0.0.1:${API_PORT}`;
  }

  return `${window.location.protocol}//${window.location.hostname}:${API_PORT}`;
}

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? sameHostApi()).replace(/\/+$/, '');

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

/** The request never reached the server: DNS, a refused connection, the API being down. */
function unreachable(): ApiError {
  return new ApiError(
    `Couldn't reach the server. Check that the API is running at ${API_BASE_URL}.`,
    0,
  );
}

/**
 * Fetch one page of users, oldest first.
 *
 * The server orders by id, so `offset` addresses a stable row no matter how many pages the
 * table has already pulled in.
 */
export async function fetchUsers(offset = 0, limit = DEFAULT_PAGE_SIZE): Promise<UserPage> {
  const query = new URLSearchParams({ offset: String(offset), limit: String(limit) });
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}/users?${query}`);
  } catch {
    throw unreachable();
  }

  const envelope = await readEnvelope<UserPage>(response);

  if (!response.ok) {
    throw new ApiError(envelope.error ?? 'Could not load users. Please try again.', response.status);
  }

  if (!envelope.data?.users) {
    throw new ApiError('The server sent back a page with no users in it.', response.status);
  }

  return envelope.data;
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
    throw unreachable();
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
