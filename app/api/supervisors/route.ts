import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const SupervisorSchema = z.object({
  supervisorId: z.string().trim().min(1, 'Supervisor is required'),
  driverId: z.string().trim().min(1, 'Driver is required'),
});

export async function GET() {
  const links = await prisma.userSupervisor.findMany({
    include: {
      supervisor: true,
      driver: true,
    },
  });
  return NextResponse.json({ links });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = SupervisorSchema.parse(data);

    const [supervisor, driver] = await Promise.all([
      prisma.user.findUnique({ where: { id: parsed.supervisorId } }),
      prisma.user.findUnique({ where: { id: parsed.driverId } }),
    ]);

    if (!supervisor || !driver) {
      return NextResponse.json(
        { message: 'Supervisor or driver not found' },
        { status: 400 }
      );
    }
    if (supervisor.role !== 'DRIVER' && supervisor.role !== 'DEVELOPER' && supervisor.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Supervisor must be an employee account' },
        { status: 400 }
      );
    }
    if (driver.role !== 'DRIVER') {
      return NextResponse.json(
        { message: 'Only drivers can be reviewed' },
        { status: 400 }
      );
    }

    const link = await prisma.userSupervisor.upsert({
      where: {
        supervisorId_driverId: {
          supervisorId: parsed.supervisorId,
          driverId: parsed.driverId,
        },
      },
      update: {},
      create: {
        supervisorId: parsed.supervisorId,
        driverId: parsed.driverId,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', issues: error.issues },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { message: 'Unable to link supervisor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const supervisorId = url.searchParams.get('supervisorId');
    const driverId = url.searchParams.get('driverId');
    if (!supervisorId || !driverId) {
      return NextResponse.json(
        { message: 'supervisorId and driverId are required' },
        { status: 400 }
      );
    }

    await prisma.userSupervisor.delete({
      where: {
        supervisorId_driverId: {
          supervisorId,
          driverId,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Unable to remove supervisor link' },
      { status: 500 }
    );
  }
}
