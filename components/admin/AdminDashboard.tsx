'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DeleteUserButton } from '@/components/admin/DeleteUserButton';

type Role = 'ADMIN' | 'DEVELOPER' | 'DRIVER';

type User = {
  id: string;
  name: string;
  pin: string;
  role: string;
  createdAt: string;
};

interface AdminDashboardProps {
  users: User[];
}

export const AdminDashboard = ({ users }: AdminDashboardProps) => {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [role, setRole] = useState<Role>('DRIVER');

  const roleOptions: { value: Role; label: string }[] = useMemo(
    () => [
      { value: 'DRIVER', label: 'Driver' },
      { value: 'ADMIN', label: 'Admin' },
      { value: 'DEVELOPER', label: 'Developer' },
    ],
    []
  );

  const roleLabelMap = useMemo(
    () =>
      roleOptions.reduce<Record<Role, string>>((acc, option) => {
        acc[option.value] = option.label;
        return acc;
      }, {} as Record<Role, string>),
    [roleOptions]
  );

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setFeedback('Enter a name before saving.');
      return;
    }
    if (pin.trim().length !== 4) {
      setFeedback('Enter a 4-digit PIN.');
      return;
    }

    setBusy(true);
    setFeedback(null);

    try {
      const payload = {
        name: name.trim(),
        pin: pin.trim(),
        role,
      };

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => null);
        throw new Error(details?.message ?? 'Unable to save account.');
      }

      setName('');
      setPin('');
      setRole('DRIVER');
      setFeedback('Account saved. It will appear below.');
      router.refresh();
    } catch (error) {
      setFeedback((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const sortedUsers = useMemo(
    () =>
      users.map((user) => ({
        ...user,
        addedOn: new Date(user.createdAt).toLocaleDateString(),
      })),
    [users]
  );

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-sky-900">Account setup</h1>
          <p className="text-base text-sky-700">
            Add each teammate&apos;s name, pick their role, and give them a simple 4-digit PIN. Keep the PIN handy—they will use
            it to sign in later.
          </p>
        </div>
        <form
          onSubmit={handleCreateUser}
          className="mt-6 flex flex-col gap-4 rounded-2xl border border-blue-50 bg-sky-50 p-6 lg:flex-row lg:items-end"
        >
          <div className="flex-1 space-y-2">
            <label className="text-sm font-semibold text-sky-900" htmlFor="employee-name">
              Name
            </label>
            <Input
              id="employee-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Alex Martinez"
              required
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-semibold text-sky-900" htmlFor="employee-pin">
              4-digit PIN
            </label>
            <Input
              id="employee-pin"
              inputMode="numeric"
              pattern="\d{4}"
              maxLength={4}
              value={pin}
              onChange={(event) => setPin(event.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="1234"
              required
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-sm font-semibold text-sky-900" htmlFor="employee-role">
              Role
            </label>
            <select
              id="employee-role"
              value={role}
              onChange={(event) => setRole(event.target.value as Role)}
              className="w-full rounded-xl border border-sky-200 bg-white px-4 py-3 text-base font-medium text-slate-900 shadow-sm transition-colors focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
            >
              {roleOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" loading={busy} disabled={busy} className="w-full lg:w-auto">
            Save account
          </Button>
        </form>
        {feedback && (
          <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-900">
            {feedback}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-sky-900">Saved accounts</h2>
        {sortedUsers.length === 0 ? (
          <p className="mt-4 text-base text-sky-700">No accounts yet. Add someone above to get started.</p>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-blue-100">
            <table className="min-w-full divide-y divide-blue-100 text-sm">
              <thead className="bg-sky-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-sky-800">Name</th>
                  <th className="px-4 py-3 text-left font-semibold text-sky-800">Role</th>
                  <th className="px-4 py-3 text-left font-semibold text-sky-800">PIN</th>
                  <th className="px-4 py-3 text-left font-semibold text-sky-800">Added</th>
                  <th className="px-4 py-3 text-left font-semibold text-sky-800">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-blue-50">
                {sortedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-sky-50">
                    <td className="px-4 py-3 text-base font-semibold text-sky-900">{user.name}</td>
                    <td className="px-4 py-3 text-sky-800">{roleLabelMap[user.role as Role] ?? user.role}</td>
                    <td className="px-4 py-3 font-mono text-base text-sky-900">{user.pin}</td>
                    <td className="px-4 py-3 text-sky-700">{user.addedOn}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        {user.role === 'DRIVER' && (
                          <Link
                            href={`/admin/drivers/${user.id}`}
                            className="inline-flex items-center rounded-lg border border-sky-200 px-3 py-1 text-sm font-medium text-sky-900 transition hover:bg-sky-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                          >
                            Manage list
                          </Link>
                        )}
                        <DeleteUserButton userId={user.id} name={user.name} roleLabel={roleLabelMap[user.role as Role] ?? user.role} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
