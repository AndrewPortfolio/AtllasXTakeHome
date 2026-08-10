import clsx from 'clsx';
import Head from 'next/head';
import { Inter } from 'next/font/google';
import { useCallback, useState } from 'react';
import { fullName, type UserRecord } from 'shared';
import { AddUserDialog } from '../components/AddUserDialog';
import { Button } from '../components/Button';
import { Toast } from '../components/Toast';

const inter = Inter({ subsets: ['latin'] });

export default function Home() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');

  const handleCreated = useCallback((user: UserRecord) => {
    setIsAddOpen(false);
    setConfirmation(`${fullName(user)} was added to the directory.`);
  }, []);

  const dismissConfirmation = useCallback(() => setConfirmation(''), []);

  return (
    <>
      <Head>
        <title>Members · Atllas</title>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <div className={clsx('min-h-[100dvh] bg-neutral-50 text-neutral-900', inter.className)}>
        <header className='sticky top-0 z-30 border-b border-neutral-200 bg-white/90 backdrop-blur'>
          <div className='mx-auto flex max-w-5xl items-center gap-4 px-4 py-3 sm:px-6 sm:py-4'>
            <div className='min-w-0 flex-1'>
              <h1 className='truncate text-lg font-semibold sm:text-xl'>Members</h1>
              <p className='mt-0.5 hidden text-sm text-neutral-500 sm:block'>
                Everyone currently in the Atllas directory.
              </p>
            </div>

            <Button onClick={() => setIsAddOpen(true)} className='shrink-0'>
              <svg className='h-4 w-4' viewBox='0 0 20 20' fill='none' aria-hidden='true'>
                <path d='M10 4v12M4 10h12' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
              </svg>
              Add user
            </Button>
          </div>
        </header>

        <main className='mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8'>
          <section className='rounded-xl border border-dashed border-neutral-300 bg-white px-6 py-12 text-center'>
            <h2 className='text-base font-semibold'>The members table lands here</h2>
            <p className='mx-auto mt-1.5 max-w-sm text-sm text-neutral-500'>
              Browsing, searching and sorting are still to come. In the meantime you can add
              people to the directory.
            </p>
            <Button variant='secondary' onClick={() => setIsAddOpen(true)} className='mt-5'>
              Add your first user
            </Button>
          </section>
        </main>
      </div>

      <AddUserDialog
        open={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={handleCreated}
      />

      {confirmation && <Toast message={confirmation} onDismiss={dismissConfirmation} />}
    </>
  );
}
