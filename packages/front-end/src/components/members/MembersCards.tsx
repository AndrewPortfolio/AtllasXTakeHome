import { useWindowVirtualizer } from '@tanstack/react-virtual';
import clsx from 'clsx';
import { Fragment, memo, useLayoutEffect, useRef, useState } from 'react';
import { fullName, type UserRecord } from 'shared';
import { CARD_COLUMNS } from './columns';

//phone layout, all 9 cols can't be viewed properly via phone
// each user in db becomes a card w same fields stacked as label/value pairs

// Only used for cards that haven't been measured yet; real heights vary with address length.
const ESTIMATED_CARD_HEIGHT = 196;

// Cards kept mounted beyond the viewport, so a fast flick doesn't scroll into blank space.
const OVERSCAN = 6;

//windowed only cards near viewport exist in DOM. Prev version throttled the phone
//caused phone to reload bc of memory pressure
//window scroll, not a nested scroller: a box inside the page fights touch scrolling.
export function MembersCards({ users }: { users: UserRecord[] }) {
  const listRef = useRef<HTMLUListElement>(null);

  // Where the list starts down the page, so virtual positions line up with the real scroll.
  const [scrollMargin, setScrollMargin] = useState(0);

  useLayoutEffect(() => {
    const measure = () => setScrollMargin(listRef.current?.offsetTop ?? 0);

    measure();
    window.addEventListener('resize', measure);

    return () => window.removeEventListener('resize', measure);
  }, []);

  const virtualizer = useWindowVirtualizer({
    count: users.length,
    estimateSize: () => ESTIMATED_CARD_HEIGHT,
    overscan: OVERSCAN,
    scrollMargin,
    // Keyed by member, so a measured height stays with its card as the list grows.
    getItemKey: index => users[index].id,
  });

  return (
    <ul ref={listRef} className='relative' style={{ height: virtualizer.getTotalSize() }}>
      {virtualizer.getVirtualItems().map(item => (
        <li
          key={item.key}
          data-index={item.index}
          // Measured rather than assumed: a wrapped address makes a card taller.
          ref={virtualizer.measureElement}
          className={clsx(
            'absolute inset-x-0 top-0 px-4 py-3.5',
            item.index < users.length - 1 && 'border-b border-neutral-200',
          )}
          style={{ transform: `translateY(${item.start - scrollMargin}px)` }}
        >
          <MemberCard user={users[item.index]} />
        </li>
      ))}
    </ul>
  );
}

const MemberCard = memo(function MemberCard({ user }: { user: UserRecord }) {
  return (
    <>
      <div className='flex items-baseline gap-3'>
        <h3 className='min-w-0 flex-1 truncate font-medium text-neutral-900'>{fullName(user)}</h3>
        <span className='shrink-0 text-xs tabular-nums text-neutral-400'>#{user.id}</span>
      </div>

      <p className='mt-0.5 break-all text-sm text-neutral-600'>{user.email}</p>

      {/* 6.5rem keeps the longest label ("Phone number") on one line */}
      <dl className='mt-2.5 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm'>
        {CARD_COLUMNS.map(column => {
          const value = column.value(user);

          return (
            <Fragment key={column.key}>
              <dt className='text-neutral-500'>{column.header}</dt>
              <dd className='min-w-0 break-words text-neutral-800'>
                {value || <span className='text-neutral-300'>—</span>}
              </dd>
            </Fragment>
          );
        })}
      </dl>
    </>
  );
});
