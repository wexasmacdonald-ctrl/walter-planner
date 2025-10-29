import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AddressLineSchema, normalizeAddressLine } from '@/lib/address';

interface RouteParams {
  params: {
    userId: string;
  };
}

export async function GET(_: Request, { params }: RouteParams) {
  const { userId } = params;

  const assignments = await prisma.employeeAssignment.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ assignments });
}

export async function POST(request: Request, { params }: RouteParams) {
  const { userId } = params;
  const body = await request.json().catch(() => null);

  if (!body || typeof body.addressLine !== 'string') {
    return NextResponse.json({ message: 'Provide an addressLine string.' }, { status: 400 });
  }

  const normalized = normalizeAddressLine(body.addressLine);
  const validation = AddressLineSchema.safeParse(normalized);
  if (!validation.success) {
    return NextResponse.json({ message: validation.error.issues[0]?.message ?? 'Invalid address.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ message: 'User not found.' }, { status: 404 });
  }

  const assignment = await prisma.employeeAssignment.create({
    data: {
      userId,
      addressLine: normalized,
    },
  });

  return NextResponse.json({ assignment }, { status: 201 });
}
