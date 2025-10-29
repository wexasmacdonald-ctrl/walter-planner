import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const ROLES = ['ADMIN', 'DEVELOPER', 'DRIVER'] as const;

const UserUpdateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').optional(),
  email: z
    .string()
    .trim()
    .email('Invalid email')
    .optional()
    .or(z.literal(''))
    .transform((value) => (value ? value : undefined)),
  role: z.enum(ROLES).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    const data = await request.json();
    const parsed = UserUpdateSchema.parse(data);

    const updated = await prisma.user.update({
      where: { id },
      data: parsed,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', issues: error.issues },
        { status: 400 }
      );
    }
    if (
      error instanceof Error &&
      'code' in error &&
      (error as { code: string }).code === 'P2002'
    ) {
      return NextResponse.json(
        { message: 'Email already exists' },
        { status: 409 }
      );
    }
    if ((error as Error).name === 'NotFoundError') {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { message: 'Unable to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).name === 'NotFoundError') {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { message: 'Unable to delete user' },
      { status: 500 }
    );
  }
}
