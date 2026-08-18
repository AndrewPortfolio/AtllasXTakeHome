import { useCallback, useEffect, useReducer, useRef } from 'react';
import { DEFAULT_PAGE_SIZE, type UserPage, type UserRecord } from 'shared';
import { ApiError, fetchUsers } from '../lib/api';

// initial = empty table, every later failure keeps showing current rows 
export type MembersPhase = 'initial' | 'loading' | 'idle' | 'error';

interface MembersState {
  users: UserRecord[];
  /** Rows in the table server-side, which is more than we've loaded until `hasMore` is false. */
  total: number;
  hasMore: boolean;
  phase: MembersPhase;
  error: string;
}

export interface MembersController extends MembersState {
  /** Fetches the next page. A no-op while a request is already out. */
  loadMore: () => void;
  /** Folds a just-created user into the table so the two don't drift apart. */
  noteCreated: (user: UserRecord) => void;
}

type MembersAction =
  | { type: 'start' }
  | { type: 'page'; page: UserPage }
  | { type: 'failed'; message: string }
  | { type: 'created'; user: UserRecord };

const INITIAL_STATE: MembersState = {
  users: [],
  total: 0,
  hasMore: true,
  phase: 'initial',
  error: '',
};

function reduce(state: MembersState, action: MembersAction): MembersState {
  switch (action.type) {
    case 'start':
      return {
        ...state,
        phase: state.users.length === 0 ? 'initial' : 'loading',
        error: '',
      };

    case 'page': {
      // Ordering by id means pages can't overlap, but a row added while we were paging can
      // still arrive twice. Cheaper to drop the duplicate than to render a broken key.
      const known = new Set(state.users.map(user => user.id));
      const arrivals = action.page.users.filter(user => !known.has(user.id));

      return {
        users: arrivals.length === 0 ? state.users : [...state.users, ...arrivals],
        total: action.page.total,
        hasMore: action.page.hasMore,
        phase: 'idle',
        error: '',
      };
    }

    case 'failed':
      return { ...state, phase: 'error', error: action.message };

    case 'created':
      return {
        ...state,
        total: state.total + 1,
        // The new row has the highest id, so it belongs at the very end of the table. Append
        // it only once we're holding the end; otherwise it's on a page still to be fetched.
        users: state.hasMore ? state.users : [...state.users, action.user],
      };
  }
}

/** Loads the members table one page at a time, oldest first. */
export function useMembers(): MembersController {
  const [state, dispatch] = useReducer(reduce, INITIAL_STATE);

  const nextOffset = useRef(0);
  const inFlight = useRef(false);

  const loadMore = useCallback(async () => {
    // Also what keeps React's development double-effect from asking for page one twice.
    if (inFlight.current) {
      return;
    }

    inFlight.current = true;
    dispatch({ type: 'start' });

    try {
      const page = await fetchUsers(nextOffset.current, DEFAULT_PAGE_SIZE);

      // Advance before the lock lifts: the observer can fire again the instant it does.
      nextOffset.current += page.users.length;
      dispatch({ type: 'page', page });
    } catch (error) {
      dispatch({
        type: 'failed',
        message: error instanceof ApiError
          ? error.message
          : 'Could not load members. Please try again.',
      });
    } finally {
      inFlight.current = false;
    }
  }, []);

  useEffect(() => {
    void loadMore();
  }, [loadMore]);

  const noteCreated = useCallback((user: UserRecord) => {
    dispatch({ type: 'created', user });
  }, []);

  return { ...state, loadMore, noteCreated };
}
