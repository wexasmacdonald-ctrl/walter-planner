import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { DriverAssignmentsManager } from '@/components/admin/DriverAssignmentsManager';

interface DriverPageProps {
  params: {
    userId: string;
  };
}

export const dynamic = 'force-dynamic';

export default async function AdminDriverDetailPage({ params }: DriverPageProps) {
  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    select: { id: true, name: true, role: true, pin: true },
  });

  if (!user || user.role !== 'DRIVER') {
    notFound();
  }

  const assignments = await prisma.employeeAssignment.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
    select: { id: true, addressLine: true, createdAt: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 rounded-xl border border-blue-100 bg-white px-4 py-2 text-sm font-medium text-sky-900 shadow-sm transition hover:bg-sky-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300"
        >
          Back to drivers
        </Link>
        <span className="text-sm font-medium text-sky-900">PIN: {user.pin}</span>
      </div>

      <header className="space-y-2">
        <h1 className="text-3xl font-bold text-sky-900">{user.name}</h1>
        <p className="text-base text-sky-700">Manage this driver&apos;s address list below.</p>
      </header>

      <DriverAssignmentsManager user={{ id: user.id, name: user.name }} initialAssignments={assignments} />
    </div>
  );
}
