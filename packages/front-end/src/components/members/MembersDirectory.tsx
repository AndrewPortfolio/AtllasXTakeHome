import { ReactNode } from 'react';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import type { MembersController } from '../../hooks/useMembers';
import { Button } from '../Button';
import { Spinner } from '../Spinner';
import { MembersCards } from './MembersCards';
import { MembersTable } from './MembersTable';

//no longer readable after this point 
const TABLE_LAYOUT = '(min-width: 1024px)';

export interface MembersDirectoryProps {
  members: MembersController;
  onAddUser: () => void;
}

export function MembersDirectory({ members, onAddUser }: MembersDirectoryProps) {
  const { users, total, hasMore, phase, error, loadMore } = members;

  const showTable = useMediaQuery(TABLE_LAYOUT);

  // Paused while a page is in flight, and after a failure until the reader asks again — one
  // broken request shouldn't turn into a request per scroll.
  const sentinelRef = useInfiniteScroll(loadMore, hasMore && phase === 'idle');

  if (phase === 'initial') {
    return (
      <Panel>
        <p className='flex items-center justify-center gap-2 text-sm text-neutral-500'>
          <Spinner />
          Loading members…
        </p>
      </Panel>
    );
  }

  if (users.length === 0) {
    return phase === 'error'
      ? (
        <Panel>
          <h2 className='text-base font-semibold'>Couldn&apos;t load the directory</h2>
          <p className='mx-auto mt-1.5 max-w-sm text-sm text-neutral-500'>{error}</p>
          <Button variant='secondary' onClick={loadMore} className='mt-5'>Try again</Button>
        </Panel>
      )
      : (
        <Panel>
          <h2 className='text-base font-semibold'>No members yet</h2>
          <p className='mx-auto mt-1.5 max-w-sm text-sm text-neutral-500'>
            The directory is empty. Add someone and they&apos;ll show up here.
          </p>
          <Button variant='secondary' onClick={onAddUser} className='mt-5'>
            Add your first user
          </Button>
        </Panel>
      );
  }

  return (
    <section aria-busy={phase === 'loading'}>
      <p role='status' className='pb-2 text-sm text-neutral-500'>
        Showing {users.length.toLocaleString()} of {total.toLocaleString()}
      </p>

      <div className='rounded-xl border border-neutral-200 bg-white'>
        {showTable ? <MembersTable users={users} /> : <MembersCards users={users} />}
      </div>

      {/* Crosses into view before the last rows do, which is what starts the next page. */}
      <div ref={sentinelRef} aria-hidden='true' className='h-px' />

      <div className='px-4 py-6 text-center text-sm text-neutral-500'>
        {phase === 'error' && (
          <div
            role='alert'
            className='mx-auto max-w-md rounded-lg border border-red-200 bg-red-50 px-4 py-3'
          >
            <p className='text-red-800'>{error}</p>
            <Button variant='secondary' onClick={loadMore} className='mt-3'>Try again</Button>
          </div>
        )}

        {phase === 'loading' && (
          <p className='flex items-center justify-center gap-2'>
            <Spinner />
            Loading more members…
          </p>
        )}

        {phase === 'idle' && !hasMore && (
          <p>That&apos;s everyone — all {total.toLocaleString()} members are listed.</p>
        )}
      </div>
    </section>
  );
}

/** The bordered placeholder the dashboard shows when there's no table to draw. */
function Panel({ children }: { children: ReactNode }) {
  return (
    <section className='rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center'>
      {children}
    </section>
  );
}
