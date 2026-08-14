import { FIELD_LABELS, type UserRecord } from 'shared';


// One definition per schema column for desktop and mobile
// deskstop populates them in order, the mobile card renders the ones flagged `onCard`.

// key is the column id the database knows, so the sorting can goes straight to API 
// sortable determines which header it applies to

export interface UserColumn {
  //column id
  key: keyof UserRecord;
  //columns
  header: string;
  // shorter header for the table, where the full label doesn't fit. Cards use `header`.
  shortHeader?: string;
  //determines if a column shows on mobile, email and name handled separatly 
  sortable: boolean;
  //check to see if table fits on page, if not remove last columns and widen table 
  onCard: boolean;
  // if display string = `''` = row no val, displays '-'
  className: string;
  value(user: UserRecord): string;
}

//UTC so that it is always consistent 
const REGISTERED_FORMAT = new Intl.DateTimeFormat(undefined, {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
});

function formatRegistered(value: string): string {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? '' : REGISTERED_FORMAT.format(date);
}

//if value is null return ''
function text(value: string): string {
  return value ?? '';
}

export const USER_COLUMNS: readonly UserColumn[] = [
  {
    key: 'id',
    header: 'ID',
    sortable: true,
    onCard: false,
    className: 'w-[5%] tabular-nums',
    value: user => String(user.id),
  },
  {
    key: 'registered',
    header: FIELD_LABELS.registered,
    sortable: true,
    onCard: true,
    className: 'w-[12%]',
    value: user => formatRegistered(user.registered),
  },
  {
    key: 'firstName',
    header: FIELD_LABELS.firstName,
    sortable: true,
    onCard: false,
    className: 'w-[9%]',
    value: user => user.firstName,
  },
  {
    key: 'middleName',
    header: FIELD_LABELS.middleName,
    shortHeader: 'Middle',
    sortable: true,
    onCard: false,
    className: 'w-[8%]',
    value: user => text(user.middleName),
  },
  {
    key: 'lastName',
    header: FIELD_LABELS.lastName,
    sortable: true,
    onCard: false,
    className: 'w-[9%]',
    value: user => user.lastName,
  },
  {
    key: 'email',
    header: FIELD_LABELS.email,
    sortable: true,
    onCard: false,
    className: 'w-[17%]',
    value: user => user.email,
  },
  {
    key: 'phoneNumber',
    header: FIELD_LABELS.phoneNumber,
    shortHeader: 'Phone',
    sortable: true,
    onCard: true,
    className: 'w-[13%]',
    value: user => text(user.phoneNumber),
  },
  {
    key: 'address',
    header: FIELD_LABELS.address,
    sortable: false,
    onCard: true,
    className: 'w-[16%]',
    value: user => text(user.address),
  },
  {
    key: 'adminNotes',
    header: FIELD_LABELS.adminNotes,
    shortHeader: 'Notes',
    sortable: false,
    onCard: true,
    className: 'w-[11%]',
    value: user => text(user.adminNotes),
  },
];

//fields under name and email
export const CARD_COLUMNS = USER_COLUMNS.filter(column => column.onCard);
