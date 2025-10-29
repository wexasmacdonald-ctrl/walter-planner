import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AddressLineSchema, normalizeAddressLine } from '@/lib/address';

interface RouteParams {
  params: {
    userId: string;
  };
}

type BulkRequestBody = {
  addresses: string[];
  replace?: boolean;
};

export async function POST(request: Request, { params }: RouteParams) {
  const { userId } = params;
  const payload = (await request.json().catch(() => null)) as BulkRequestBody | null;

  if (!payload || !Array.isArray(payload.addresses)) {
    return NextResponse.json({ message: 'Provide an addresses array.' }, { status: 400 });
  }

  const trimmed = payload.addresses
    .map((address) => normalizeAddressLine(String(address ?? '')))
    .filter((value) => value.length > 0);

  if (trimmed.length === 0) {
    return NextResponse.json({ message: 'Paste at least one address.' }, { status: 400 });
  }

  const unique: string[] = [];
  const seen = new Set<string>();

  for (const candidate of trimmed) {
    if (seen.has(candidate)) {
      continue;
    }
    const validation = AddressLineSchema.safeParse(candidate);
    if (!validation.success) {
      return NextResponse.json({ message: validation.error.issues[0]?.message ?? 'Invalid address detected.' }, { status: 400 });
    }
    unique.push(candidate);
    seen.add(candidate);
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ message: 'User not found.' }, { status: 404 });
  }

  if (payload.replace) {
    await prisma.$transaction(async (tx) => {
      await tx.employeeAssignment.deleteMany({ where: { userId } });
      if (unique.length > 0) {
        await tx.employeeAssignment.createMany({
          data: unique.map((addressLine) => ({ userId, addressLine })),
        });
      }
    });
  } else {
    const existing = await prisma.employeeAssignment.findMany({
      where: { userId },
      select: { addressLine: true },
    });
    const existingSet = new Set(existing.map((entry) => entry.addressLine));
    const newAddresses = unique.filter((address) => !existingSet.has(address));

    if (newAddresses.length > 0) {
      await prisma.employeeAssignment.createMany({
        data: newAddresses.map((addressLine) => ({ userId, addressLine })),
      });
    }
  }

  const assignments = await prisma.employeeAssignment.findMany({
    where: { userId },
    orderBy: { createdAt: 'asc' },
    select: { id: true, addressLine: true, createdAt: true },
  });

  return NextResponse.json({ assignments });
}
