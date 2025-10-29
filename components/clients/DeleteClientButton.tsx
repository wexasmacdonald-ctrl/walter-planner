'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface DeleteClientButtonProps {
  clientId: string;
  address: string;
}

export const DeleteClientButton = ({ clientId, address }: DeleteClientButtonProps) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!window.confirm(`Remove ${address}? This cannot be undone.`)) {
      return;
    }
    setError(null);
    setDeleting(true);

    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const details = await response.json().catch(() => null);
        throw new Error(details?.message ?? 'Unable to delete client.');
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
    <div className="flex flex-col items-start gap-2">
      <Button
        type="button"
        variant="ghost"
        className="text-rose-600 hover:bg-rose-50"
        loading={deleting || pending}
        onClick={handleDelete}
      >
        Delete
      </Button>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
};
