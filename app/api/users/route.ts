import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const ROLES = ['ADMIN', 'DEVELOPER', 'DRIVER'] as const;

const UserPayloadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  pin: z
    .string()
    .trim()
    .regex(/^\d{4}$/, 'PIN must be exactly 4 numbers'),
  role: z.enum(ROLES),
});

export async function GET() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json({ users });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const parsed = UserPayloadSchema.parse(data);

    const created = await prisma.user.create({
      data: {
        name: parsed.name,
        pin: parsed.pin,
        role: parsed.role,
      },
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', issues: error.issues },
        { status: 400 }
      );
    }
    if (error instanceof Error && 'code' in error && (error as { code: string }).code === 'P2002') {
      return NextResponse.json(
        { message: 'A user already exists with those details.' },
        { status: 409 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { message: 'Unable to create user' },
      { status: 500 }
    );
  }
}
