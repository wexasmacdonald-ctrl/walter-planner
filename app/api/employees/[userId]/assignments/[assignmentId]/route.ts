import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AddressLineSchema, normalizeAddressLine } from '@/lib/address';

interface RouteParams {
  params: {
    userId: string;
    assignmentId: string;
  };
}

export async function PUT(request: Request, { params }: RouteParams) {
  const { userId, assignmentId } = params;

  const body = await request.json().catch(() => null);
  if (!body || typeof body.addressLine !== 'string') {
    return NextResponse.json({ message: 'Provide an addressLine string.' }, { status: 400 });
  }

  const normalized = normalizeAddressLine(body.addressLine);
  const validation = AddressLineSchema.safeParse(normalized);
  if (!validation.success) {
    return NextResponse.json({ message: validation.error.issues[0]?.message ?? 'Invalid address.' }, { status: 400 });
  }

  const existing = await prisma.employeeAssignment.findUnique({
    where: { id: assignmentId },
  });

  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ message: 'Assignment not found.' }, { status: 404 });
  }

  const assignment = await prisma.employeeAssignment.update({
    where: { id: assignmentId },
    data: { addressLine: normalized },
  });

  return NextResponse.json({ assignment });
}

export async function DELETE(_: Request, { params }: RouteParams) {
  const { userId, assignmentId } = params;

  const existing = await prisma.employeeAssignment.findUnique({
    where: { id: assignmentId },
  });

  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ message: 'Assignment not found.' }, { status: 404 });
  }

  await prisma.employeeAssignment.delete({ where: { id: assignmentId } });

  return NextResponse.json({ success: true });
}
