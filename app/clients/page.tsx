import { prisma } from '@/lib/prisma';
import { formatAddressLine } from '@/lib/address';
import { BulkClientImporter } from '@/components/clients/BulkClientImporter';
import { DeleteClientButton } from '@/components/clients/DeleteClientButton';
import { DeleteAllClientsButton } from '@/components/clients/DeleteAllClientsButton';

export const dynamic = 'force-dynamic';

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({
    orderBy: { addressLine: 'asc' },
  });

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-sky-900">Client addresses</h1>
          <p className="mt-2 text-base text-sky-700">
            Paste the full list once and we keep it tidy for you. No need to add addresses one at a time.
          </p>
        </div>
        <div className="rounded-xl border border-blue-100 bg-white p-6 shadow-sm">
          <BulkClientImporter />
          {clients.length > 0 && (
            <div className="mt-4">
              <DeleteAllClientsButton />
            </div>
          )}
        </div>
      </section>

      {clients.length === 0 ? (
        <div className="rounded-xl border border-dashed border-blue-200 bg-white p-10 text-center text-base text-sky-700">
          No client addresses saved yet. Paste a list above to get started.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-blue-100 text-sm">
            <thead className="bg-sky-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-sky-800">
                  Address
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-sky-800">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {clients.map((client) => (
                <tr key={client.id} className="hover:bg-sky-50">
                  <td className="px-4 py-3 text-base font-medium text-sky-900">
                    {formatAddressLine(client.addressLine)}
                  </td>
                  <td className="px-4 py-3">
                    <DeleteClientButton clientId={client.id} address={client.addressLine} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
