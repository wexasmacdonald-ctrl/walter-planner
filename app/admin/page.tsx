import { prisma } from '@/lib/prisma';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const users = await prisma.user.findMany({
    orderBy: [{ role: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, role: true, pin: true, createdAt: true },
  });

  return <AdminDashboard users={users} />;
}
