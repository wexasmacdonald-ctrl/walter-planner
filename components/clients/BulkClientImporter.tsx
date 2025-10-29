'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AddressLineSchema, normalizeAddressLine } from '@/lib/address';

const splitAddresses = (input: string) =>
  input
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter((line) => line.length);

export const BulkClientImporter = () => {
  const router = useRouter();
  const [rawInput, setRawInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const normalizedAddresses = useMemo(() => {
    const lines = splitAddresses(rawInput);
    const unique: string[] = [];
    const seen = new Set<string>();

    for (const line of lines) {
      const normalized = normalizeAddressLine(line);
      if (!seen.has(normalized)) {
        unique.push(normalized);
        seen.add(normalized);
      }
    }

    return unique;
  }, [rawInput]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!normalizedAddresses.length) {
      setError('Paste at least one address.');
      return;
    }

    for (const address of normalizedAddresses) {
      const validation = AddressLineSchema.safeParse(address);
      if (!validation.success) {
        setError(validation.error.issues[0]?.message ?? 'Invalid address detected.');
        return;
      }
    }

    try {
      setSaving(true);
      const response = await fetch('/api/clients/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: normalizedAddresses }),
      });

      if (!response.ok) {
        const details = await response.json().catch(() => null);
        throw new Error(details?.message ?? 'Unable to import addresses.');
      }

      const result = (await response.json()) as { created: number };
      setSuccess(`Saved ${result.created.toLocaleString()} address${result.created === 1 ? '' : 'es'}.`);
      setRawInput('');
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-3">
        <label className="text-sm font-semibold text-sky-900" htmlFor="bulk-addresses">
          Paste addresses (one per line)
        </label>
        <textarea
          id="bulk-addresses"
          value={rawInput}
          onChange={(event) => setRawInput(event.target.value)}
          rows={12}
          placeholder="123 Main St, City, ON, Canada"
          className="h-60 w-full resize-y rounded-xl border border-sky-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200"
          spellCheck={false}
        />
        <div className="rounded-xl bg-sky-50 px-4 py-3 text-sm text-sky-900">
          <p className="font-semibold">Quick steps</p>
          <ul className="mt-2 list-disc pl-5">
            <li>Use one address per line.</li>
            <li>Include the city and province code.</li>
            <li>Canada is added if it is missing.</li>
          </ul>
        </div>
        {normalizedAddresses.length > 0 && (
          <p className="text-sm font-medium text-sky-900">
            Ready to save {normalizedAddresses.length.toLocaleString()} address
            {normalizedAddresses.length === 1 ? '' : 'es'}.
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm text-rose-600">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-900">
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-2xl bg-sky-500 px-6 py-4 text-lg font-semibold text-white transition hover:bg-sky-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:opacity-50"
      >
        {saving ? 'Saving...' : 'Save addresses'}
      </button>
    </form>
  );
};
