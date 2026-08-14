import type { UserRecord } from './user';

/** Paging contract for `GET /users`, shared by the Express route and the members table. */


//2 screens of table, user never reaches bottom before next page populates
export const DEFAULT_PAGE_SIZE = 50;

/** Ceiling on a caller-supplied `limit`, so nobody can pull the whole table in one go. */
export const MAX_PAGE_SIZE = 200;

/** One page of users, as it arrives in the `data` field of the envelope. */
export interface UserPage {
  users: UserRecord[];
  /** Echoed back so the client knows which slice it is looking at. */
  offset: number;
  limit: number;
  /** Whether at least one more row exists past this page. */
  hasMore: boolean;
  /** Rows in the table overall, for "showing 250 of 5,000". */
  total: number;
}

export interface PaginationParams {
  offset: number;
  limit: number;
}

/** String discriminant for the same reason `UserFormValidation` uses one: `strictNullChecks` is off. */
export type PaginationValidation =
  | { status: 'valid'; values: PaginationParams }
  | { status: 'invalid'; message: string };

/** `NaN` for anything that isn't a non-negative integer. Missing means "use the default". */
function parseCount(value: unknown, fallback: number): number {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  // Express hands us `string | string[]`; a repeated query param is a caller mistake.
  if (typeof value !== 'string' || !/^\d+$/.test(value)) {
    return NaN;
  }

  return Number(value);
}

/** Validate `?offset=&limit=` off an untrusted request. Both are optional. */
export function parsePaginationQuery(query: unknown): PaginationValidation {
  const raw = (typeof query === 'object' && query !== null ? query : {}) as Record<string, unknown>;

  const offset = parseCount(raw.offset, 0);
  const limit = parseCount(raw.limit, DEFAULT_PAGE_SIZE);

  if (Number.isNaN(offset)) {
    return { status: 'invalid', message: '`offset` must be a whole number of rows to skip.' };
  }

  if (Number.isNaN(limit)) {
    return { status: 'invalid', message: '`limit` must be a whole number of rows to return.' };
  }

  if (limit < 1 || limit > MAX_PAGE_SIZE) {
    return { status: 'invalid', message: `\`limit\` must be between 1 and ${MAX_PAGE_SIZE}.` };
  }

  return { status: 'valid', values: { offset, limit } };
}
