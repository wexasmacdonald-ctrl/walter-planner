'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type User = {
  id: string;
  name: string;
  email: string | null;
  role: string;
  createdAt: string;
};

interface AdminDashboardProps {
  users: User[];
}

export const AdminDashboard = ({ users }: AdminDashboardProps) => {
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const drivers = useMemo(() => users.filter((user) => user.role === 'DRIVER'), [users]);

  const handleCreateUser = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim()) {
      setFeedback('Enter a name before saving.');
      return;
    }

    setBusy(true);
    setFeedback(null);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim() || undefined,
        role: 'DRIVER',
      };

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => null);
        throw new Error(details?.message ?? 'Unable to create employee.');
      }

      setName('');
      setEmail('');
      setFeedback('Employee saved. Refresh the page to see the list update.');
    } catch (error) {
      setFeedback((error as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-sky-900">Drivers</h1>
          <p className="text-base text-sky-700">Create a record for each driver below. Click a name to manage their list.</p>
        </div>
        <form onSubmit={handleCreateUser} className="mt-6 flex flex-col gap-4 rounded-2xl border border-blue-50 bg-sky-50 p-6 sm:flex-row sm:items-end">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-semibold text-sky-900" htmlFor="employee-name">
              Driver name
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
            <label className="text-sm font-semibold text-sky-900" htmlFor="employee-email">
              Email (optional)
            </label>
            <Input
              id="employee-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="alex@example.com"
            />
          </div>
          <Button type="submit" loading={busy} disabled={busy} className="w-full sm:w-auto">
            Save driver
          </Button>
        </form>
        {feedback && (
          <div className="mt-4 rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-900">
            {feedback}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
        {drivers.length === 0 ? (
          <p className="text-base text-sky-700">No drivers yet. Add someone above to get started.</p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {drivers.map((driver) => (
              <li key={driver.id}>
                <Link
                  href={`/admin/drivers/${driver.id}`}
                  className="block rounded-2xl border border-blue-100 bg-sky-50 px-5 py-4 transition hover:border-sky-300 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
                >
                  <p className="text-lg font-semibold text-sky-900">{driver.name}</p>
                  {driver.email && <p className="text-sm text-sky-700">{driver.email}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
