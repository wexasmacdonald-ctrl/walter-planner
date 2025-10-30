'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

interface DeleteUserButtonProps {
  userId: string;
  name: string;
  roleLabel: string;
}

export const DeleteUserButton = ({ userId, name, roleLabel }: DeleteUserButtonProps) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${roleLabel} "${name}"? This cannot be undone.`)) {
      return;
    }

    setError(null);
    setDeleting(true);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const details = await response.json().catch(() => null);
        throw new Error(details?.message ?? 'Unable to delete account.');
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      setError((error as Error).message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        variant="ghost"
        className="text-rose-600 hover:bg-rose-50"
        loading={deleting || pending}
        onClick={handleDelete}
      >
        Delete
      </Button>
      {error && <span className="text-xs text-rose-600">{error}</span>}
    </div>
  );
};
