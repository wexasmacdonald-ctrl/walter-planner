import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { AddressLineSchema, normalizeAddressLine } from '@/lib/address';

const ClientPayloadSchema = z.object({
  addressLine: AddressLineSchema,
});

export async function GET() {
  const clients = await prisma.client.findMany({
    orderBy: { addressLine: 'asc' },
  });
  return NextResponse.json({ clients });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const addressLine = normalizeAddressLine(data.addressLine);
    ClientPayloadSchema.parse({
      ...data,
      addressLine,
    });

    const created = await prisma.client.create({
      data: {
        addressLine,
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
    console.error(error);
    return NextResponse.json(
      { message: 'Unable to create client' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const result = await prisma.client.deleteMany();
    return NextResponse.json({ deleted: result.count });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Unable to delete clients' },
      { status: 500 }
    );
  }
}
