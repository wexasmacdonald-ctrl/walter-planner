'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AddressLineSchema, normalizeAddressLine } from '@/lib/address';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type Assignment = {
  id: string;
  addressLine: string;
  createdAt: string;
};

type DriverAssignmentsManagerProps = {
  user: {
    id: string;
    name: string;
  };
  initialAssignments: Assignment[];
};

const splitAddresses = (input: string) =>
  input
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

export const DriverAssignmentsManager = ({ user, initialAssignments }: DriverAssignmentsManagerProps) => {
  const router = useRouter();
  const [assignments, setAssignments] = useState<Assignment[]>(initialAssignments);
  const [inputValue, setInputValue] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const parsedAddresses = useMemo(() => {
    const unique: string[] = [];
    const seen = new Set<string>();
    for (const line of splitAddresses(inputValue)) {
      const normalized = normalizeAddressLine(line);
      if (!seen.has(normalized)) {
        seen.add(normalized);
        unique.push(normalized);
      }
    }
    return unique;
  }, [inputValue]);

  const handleBulkSubmit = async (replace: boolean) => {
    setFeedback(null);
    if (parsedAddresses.length === 0) {
      setFeedback('Paste at least one address first.');
      return;
    }

    try {
      for (const item of parsedAddresses) {
        const validation = AddressLineSchema.safeParse(item);
        if (!validation.success) {
          throw new Error(validation.error.issues[0]?.message ?? 'Invalid address detected.');
        }
      }

      setPending(true);
      const response = await fetch(`/api/employees/${user.id}/assignments/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: parsedAddresses, replace }),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => null);
        throw new Error(details?.message ?? 'Unable to save addresses.');
      }

      const data = (await response.json()) as { assignments: Assignment[] };
      setAssignments(data.assignments);
      setInputValue('');
      router.refresh();
      setFeedback(replace ? 'List replaced successfully.' : 'Addresses added to this driver.');
    } catch (error) {
      setFeedback((error as Error).message);
    } finally {
      setPending(false);
    }
  };

  const startEditing = (assignment: Assignment) => {
    setActiveId(assignment.id);
    setEditingId(assignment.id);
    setEditingValue(assignment.addressLine);
    setFeedback(null);
  };

  const handleEditSave = async () => {
    if (!editingId) return;
    const normalized = normalizeAddressLine(editingValue);
    if (!normalized) {
      setFeedback('Address cannot be empty.');
      return;
    }
    const validation = AddressLineSchema.safeParse(normalized);
    if (!validation.success) {
      setFeedback(validation.error.issues[0]?.message ?? 'Invalid address.');
      return;
    }
    try {
      setSavingEdit(true);
      const response = await fetch(`/api/employees/${user.id}/assignments/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressLine: normalized }),
      });
      if (!response.ok) {
        const details = await response.json().catch(() => null);
        throw new Error(details?.message ?? 'Unable to update address.');
      }
      const { assignment } = (await response.json()) as { assignment: Assignment };
      setAssignments((prev) => prev.map((item) => (item.id === assignment.id ? assignment : item)));
      setEditingId(null);
      setActiveId(null);
      setEditingValue('');
      setFeedback('Address updated.');
    } catch (error) {
      setFeedback((error as Error).message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDelete = async (assignmentId: string) => {
    const target = assignments.find((item) => item.id === assignmentId);
    if (!target) return;
    if (!window.confirm(`Remove "${target.addressLine}" from ${user.name}?`)) {
      return;
    }
    setFeedback(null);
    try {
      setDeletingId(assignmentId);
      const response = await fetch(`/api/employees/${user.id}/assignments/${assignmentId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const details = await response.json().catch(() => null);
        throw new Error(details?.message ?? 'Unable to delete address.');
      }
      setAssignments((prev) => prev.filter((item) => item.id !== assignmentId));
      setActiveId(null);
      setEditingId(null);
      setFeedback('Address removed.');
    } catch (error) {
      setFeedback((error as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-900">
          {feedback}
        </div>
      )}

      <section className="space-y-4 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-sky-900">Paste addresses</h2>
          <p className="text-sm text-sky-700">
            Use this box to paste the full list (one per line). You can reuse it later to add new addresses.
          </p>
        </header>
        <textarea
          className="h-48 w-full resize-y rounded-xl border border-sky-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          placeholder="123 Main St, City, ON, Canada"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          spellCheck={false}
        />
        {parsedAddresses.length > 0 && (
          <p className="text-sm font-medium text-sky-900">
            Ready to process {parsedAddresses.length} address{parsedAddresses.length === 1 ? '' : 'es'}.
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => handleBulkSubmit(false)} disabled={pending} loading={pending}>
            Add addresses
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => handleBulkSubmit(true)}
          >
            Replace list
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="text-sm text-sky-700 hover:bg-sky-100"
            onClick={() => setInputValue('')}
            disabled={pending}
          >
            Clear box
          </Button>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-sky-900">Assigned addresses</h2>
          <p className="text-sm text-sky-700">Click an address to edit or remove it.</p>
        </header>

        {assignments.length === 0 ? (
          <div className="rounded-xl border border-dashed border-sky-200 px-6 py-10 text-center text-sm text-sky-700">
            No addresses assigned yet.
          </div>
        ) : (
          <ul className="divide-y divide-blue-100 rounded-xl border border-blue-100">
            {assignments.map((assignment, index) => {
              const isActive = activeId === assignment.id;
              const isEditing = editingId === assignment.id;
              return (
                <li
                  key={assignment.id}
                  className="cursor-pointer bg-white px-5 py-4 transition hover:bg-sky-50"
                  onClick={() => {
                    if (isEditing) return;
                    setActiveId(isActive ? null : assignment.id);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 text-sm font-semibold text-sky-800">
                      {index + 1}
                    </span>
                    <div className="flex-1 space-y-3">
                      {isEditing ? (
                        <Input
                          value={editingValue}
                          onChange={(event) => setEditingValue(event.target.value)}
                          onClick={(event) => event.stopPropagation()}
                          autoFocus
                        />
                      ) : (
                        <p className="text-base text-sky-900">{assignment.addressLine}</p>
                      )}

                      {isActive && !isEditing && (
                        <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
                          <Button
                            type="button"
                            variant="secondary"
                            className="px-4 py-2 text-sm"
                            onClick={() => startEditing(assignment)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="px-4 py-2 text-sm text-rose-600 hover:bg-rose-50"
                            onClick={() => handleDelete(assignment.id)}
                            loading={deletingId === assignment.id}
                            disabled={deletingId === assignment.id}
                          >
                            Delete
                          </Button>
                        </div>
                      )}

                      {isEditing && (
                        <div className="flex flex-wrap gap-2" onClick={(event) => event.stopPropagation()}>
                          <Button
                            type="button"
                            className="px-4 py-2 text-sm"
                            onClick={handleEditSave}
                            loading={savingEdit}
                            disabled={savingEdit}
                          >
                            Save
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            className="px-4 py-2 text-sm text-sky-700 hover:bg-sky-100"
                            onClick={() => {
                              setEditingId(null);
                              setActiveId(null);
                              setEditingValue('');
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};
