'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

export const DeleteAllClientsButton = () => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteAll = async () => {
    const confirmed = window.confirm('Delete every saved address? This cannot be undone.');
    if (!confirmed) {
      return;
    }

    setError(null);
    setDeleting(true);
    try {
      const response = await fetch('/api/clients', { method: 'DELETE' });
      if (!response.ok) {
        const details = await response.json().catch(() => null);
        throw new Error(details?.message ?? 'Unable to delete addresses.');
      }
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleDeleteAll}
        disabled={deleting || pending}
        className="w-full rounded-xl border border-rose-200 bg-white px-4 py-3 text-base font-semibold text-rose-600 transition hover:bg-rose-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-200 disabled:opacity-50"
      >
        {deleting || pending ? 'Deleting...' : 'Delete all addresses'}
      </button>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
};
