import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const RoutePayloadSchema = z.object({
  name: z.string().trim().optional(),
  driverId: z.string().trim().optional(),
  reviewerIds: z.array(z.string().trim()).optional(),
  clientIds: z.array(z.string().trim()).min(1, 'Select at least one address'),
});

export async function GET() {
  const routes = await prisma.route.findMany({
    orderBy: { createdAt: 'desc' },
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
  return NextResponse.json({ routes });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = RoutePayloadSchema.parse(data);

    let driverRecord: { id: string; name: string; role: string } | null = null;
    if (parsed.driverId) {
      driverRecord = await prisma.user.findUnique({
        where: { id: parsed.driverId },
        select: { id: true, name: true, role: true },
      });
      if (!driverRecord || driverRecord.role !== 'DRIVER') {
        return NextResponse.json(
          { message: 'Driver not found or invalid role' },
          { status: 400 }
        );
      }
    }

    const clients = await prisma.client.findMany({
      where: { id: { in: parsed.clientIds } },
      select: { id: true },
    });
    if (clients.length !== parsed.clientIds.length) {
      return NextResponse.json(
        { message: 'One or more addresses were not found' },
        { status: 400 }
      );
    }

    const reviewers = parsed.reviewerIds
      ? await prisma.user.findMany({
          where: { id: { in: parsed.reviewerIds } },
        })
      : [];
    if (parsed.reviewerIds && reviewers.length !== parsed.reviewerIds.length) {
      return NextResponse.json(
        { message: 'One or more reviewers were not found' },
        { status: 400 }
      );
    }

    const driverName = driverRecord?.name;
    const generatedName = driverName
      ? `${driverName} route`
      : `Route ${new Date().toLocaleDateString()}`;
    const routeName = parsed.name && parsed.name.length ? parsed.name : generatedName;

    const route = await prisma.$transaction(async (tx) => {
      const createdRoute = await tx.route.create({
        data: {
          name: routeName,
          status: 'DRAFT',
          serviceDate: null,
          notes: null,
          driverId: parsed.driverId ?? null,
        },
      });

      await tx.routeStop.createMany({
        data: parsed.clientIds.map((clientId, index) => ({
          routeId: createdRoute.id,
          clientId,
          sequence: index,
        })),
      });

      if (parsed.reviewerIds && parsed.reviewerIds.length) {
        await tx.routeReviewer.createMany({
          data: parsed.reviewerIds.map((reviewerId) => ({
            routeId: createdRoute.id,
            reviewerId,
          })),
        });
      }

      return createdRoute;
    });

    const hydrated = await prisma.route.findUnique({
      where: { id: route.id },
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

    return NextResponse.json(hydrated, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', issues: error.issues },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { message: 'Unable to create route' },
      { status: 500 }
    );
  }
}
