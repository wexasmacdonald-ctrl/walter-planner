import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

interface DriverPageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function DriverPage({ searchParams }: DriverPageProps) {
  const userIdParam = searchParams?.userId;
  const userId = Array.isArray(userIdParam) ? userIdParam[0] : userIdParam;

  if (!userId) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-sky-900">Driver dashboard</h1>
        <div className="rounded-xl bg-sky-50 px-4 py-3 text-base text-sky-800">
          Append{' '}
          <code className="rounded bg-sky-100 px-2 py-1 text-sm text-sky-900">?userId=...</code>{' '}
          to the address bar to impersonate a driver. Example:{' '}
          <code className="rounded bg-sky-100 px-2 py-1 text-sm text-sky-900">
            /driver?userId=YOUR-ID
          </code>
        </div>
      </div>
    );
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-sky-900">Driver dashboard</h1>
        <p className="text-base text-rose-600">User not found.</p>
      </div>
    );
  }

  const supervisorLinks = await prisma.userSupervisor.findMany({
    where: { supervisorId: user.id },
    select: { driverId: true },
  });
  const supervisedDriverIds = supervisorLinks.map((link) => link.driverId);

  let routes;
  if (user.role === 'ADMIN' || user.role === 'DEVELOPER') {
    routes = await prisma.route.findMany({
      orderBy: { serviceDate: 'asc' },
      include: {
        driver: true,
        stops: {
          orderBy: { sequence: 'asc' },
          include: { client: true },
        },
        reviewers: {
          include: { reviewer: true },
        },
      },
    });
  } else {
    routes = await prisma.route.findMany({
      where: {
        OR: [
          { driverId: user.id },
          {
            driverId: { in: supervisedDriverIds },
          },
          {
            reviewers: {
              some: { reviewerId: user.id },
            },
          },
        ],
      },
      orderBy: { serviceDate: 'asc' },
      include: {
        driver: true,
        stops: {
          orderBy: { sequence: 'asc' },
          include: { client: true },
        },
        reviewers: {
          include: { reviewer: true },
        },
      },
    });
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-sky-900">
          {user.name}&apos;s routes
        </h1>
        <p className="mt-2 text-base text-sky-700">
          Showing assignments for {user.role}. Drivers only see their own routes plus any they review.
        </p>
      </header>

      {routes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-blue-200 bg-white p-10 text-center text-base text-sky-700">
          No routes assigned yet.
        </div>
      ) : (
        <div className="space-y-4">
          {routes.map((route) => (
            <div
              key={route.id}
              className="rounded-xl border border-blue-100 bg-white p-5 shadow-sm"
            >
              <div>
                <h2 className="text-xl font-semibold text-sky-900">{route.name}</h2>
                <p className="text-sm text-sky-700">
                  Driver: {route.driver ? route.driver.name : 'Not set'}
                </p>
                {route.reviewers.length > 0 && (
                  <p className="text-sm text-sky-700">
                    Reviewers:{' '}
                    {route.reviewers.map((reviewer) => reviewer.reviewer.name).join(', ')}
                  </p>
                )}
              </div>
              <ol className="mt-4 space-y-2 text-base text-sky-900">
                {route.stops.map((stop) => (
                  <li key={stop.id}>
                    <span className="mr-2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-800">
                      {stop.sequence + 1}
                    </span>
                    {stop.client.addressLine}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
