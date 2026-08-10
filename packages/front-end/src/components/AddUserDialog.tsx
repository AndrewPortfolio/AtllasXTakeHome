import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  emptyUserForm,
  LIMITS,
  todayAsDateInputValue,
  USER_FORM_FIELDS,
  userFormSchema,
  type UserFormValues,
  type UserRecord,
} from 'shared';
import { ApiError, createUser } from '../lib/api';
import { Button } from './Button';
import { Dialog } from './Dialog';
import { TextAreaField, TextField } from './form/Fields';

export interface AddUserDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (user: UserRecord) => void;
}

export function AddUserDialog({ open, onClose, onCreated }: AddUserDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: emptyUserForm(),
    // Don't scold people mid-keystroke; once a field has been judged, keep it live.
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const [submitError, setSubmitError] = useState('');

  // Start from a clean slate each time it opens, rather than resurrecting an abandoned draft.
  useEffect(() => {
    if (open) {
      reset(emptyUserForm());
    }
  }, [open, reset]);

  const handleClose = useCallback(() => {
    setSubmitError('');
    onClose();
  }, [onClose]);

  const onSubmit = handleSubmit(async values => {
    setSubmitError('');

    try {
      onCreated(await createUser(values));
      return;
    } catch (error) {
      if (!(error instanceof ApiError)) {
        setSubmitError('Something went wrong. Please try again.');
        return;
      }

      // Route the server's per-field reasons (a duplicate email, mostly) back onto the inputs
      // and jump to the first one.
      let focused = false;
      for (const field of USER_FORM_FIELDS) {
        const message = error.fields[field];

        if (message) {
          setError(field, { type: 'server', message }, { shouldFocus: !focused });
          focused = true;
        }
      }

      setSubmitError(error.message);
    }
  });

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      dismissible={!isSubmitting}
      title='Add user'
      description='Only a name and an email are required.'
    >
      <form onSubmit={onSubmit} noValidate className='flex min-h-0 flex-1 flex-col'>
        <div className='min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6 sm:py-5'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            <TextField
              label='First name'
              required
              autoComplete='given-name'
              autoCapitalize='words'
              maxLength={LIMITS.firstName}
              placeholder='Ada'
              error={errors.firstName?.message}
              {...register('firstName')}
            />

            <TextField
              label='Middle name'
              autoComplete='additional-name'
              autoCapitalize='words'
              maxLength={LIMITS.middleName}
              placeholder='Byron'
              error={errors.middleName?.message}
              {...register('middleName')}
            />

            <TextField
              label='Last name'
              required
              autoComplete='family-name'
              autoCapitalize='words'
              maxLength={LIMITS.lastName}
              placeholder='Lovelace'
              error={errors.lastName?.message}
              {...register('lastName')}
            />

            <TextField
              label='Phone number'
              type='tel'
              inputMode='tel'
              autoComplete='tel'
              maxLength={LIMITS.phoneNumber}
              placeholder='+1 (555) 010-1842'
              error={errors.phoneNumber?.message}
              {...register('phoneNumber')}
            />

            <TextField
              className='sm:col-span-2'
              label='Email'
              required
              type='email'
              inputMode='email'
              autoComplete='email'
              autoCapitalize='off'
              spellCheck={false}
              maxLength={LIMITS.email}
              placeholder='ada@example.com'
              error={errors.email?.message}
              {...register('email')}
            />

            <TextField
              className='sm:col-span-2'
              label='Address'
              autoComplete='street-address'
              maxLength={LIMITS.address}
              placeholder='12 Baker Street, London'
              error={errors.address?.message}
              {...register('address')}
            />

            <TextField
              label='Registered'
              type='date'
              max={todayAsDateInputValue()}
              hint='Defaults to today. Clear it to stamp the exact time instead.'
              error={errors.registered?.message}
              {...register('registered')}
            />

            <TextAreaField
              className='sm:col-span-2'
              label='Admin notes'
              rows={3}
              maxLength={LIMITS.adminNotes}
              placeholder='Anything the team should know about this member.'
              hint={`Up to ${LIMITS.adminNotes} characters.`}
              error={errors.adminNotes?.message}
              {...register('adminNotes')}
            />
          </div>
        </div>

        {/* Pinned so the primary action — and anything that went wrong — stays on screen
            without scrolling back up on a phone. */}
        <footer
          className='border-t border-neutral-200 bg-white px-4 py-3
            pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:rounded-b-2xl sm:px-6'
        >
          {submitError && (
            <div
              role='alert'
              className='mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800'
            >
              {submitError}
            </div>
          )}

          <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
            <Button variant='secondary' onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type='submit' loading={isSubmitting}>
              {isSubmitting ? 'Adding user…' : 'Add user'}
            </Button>
          </div>
        </footer>
      </form>
    </Dialog>
  );
}
