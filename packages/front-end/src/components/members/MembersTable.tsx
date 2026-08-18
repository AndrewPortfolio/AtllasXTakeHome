import clsx from 'clsx';
import { memo } from 'react';
import type { UserRecord } from 'shared';
import { HEADER_OFFSET_VARIABLE } from '../../hooks/useHeaderOffset';
import { USER_COLUMNS } from './columns';

//keeps the top header sticky (always viewable)
const STICKY_TOP = { top: `var(${HEADER_OFFSET_VARIABLE}, 0px)` };

const CELL = 'truncate px-3 py-2.5 text-left';

export const MembersTable = memo(function MembersTable({ users }: { users: UserRecord[] }) {
  return (
    <table className='w-full table-fixed border-separate border-spacing-0 text-sm'>
      <caption className='sr-only'>Members, oldest first.</caption>

      <thead>
        <tr>
          {USER_COLUMNS.map(column => (
            <th
              key={column.key}
              scope='col'
              style={STICKY_TOP}
              // Opaque, so rows pass cleanly underneath rather than showing through.
              className={clsx(
                CELL,
                column.className,
                'sticky z-10 border-b border-neutral-200 bg-white text-xs font-medium',
                'uppercase tracking-wide text-neutral-500',
                'first:rounded-tl-xl last:rounded-tr-xl',
              )}
            >
              {column.shortHeader ?? column.header}
            </th>
          ))}
        </tr>
      </thead>

      <tbody>
        {users.map(user => <MemberRow key={user.id} user={user} />)}
      </tbody>
    </table>
  );
});

//memoised appending a page, don't want to re-redner every row everytime 
const MemberRow = memo(function MemberRow({ user }: { user: UserRecord }) {
  return (
    <tr className='hover:bg-neutral-50'>
      {USER_COLUMNS.map(column => {
        const value = column.value(user);

        return (
          <td
            key={column.key}
            // Truncation is what keeps every row the same height; the full value is a hover away.
            title={value || undefined}
            className={clsx(CELL, column.className, 'border-b border-neutral-100 text-neutral-700')}
          >
            {value || <span className='text-neutral-300'>—</span>}
          </td>
        );
      })}
    </tr>
  );
});
