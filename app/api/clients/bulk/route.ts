import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { AddressLineSchema, normalizeAddressLine } from '@/lib/address';

const BulkSchema = z.object({
  addresses: z.array(z.string().trim().min(1)).min(1),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const parsed = BulkSchema.parse(payload);

    const unique: string[] = [];
    const seen = new Set<string>();

    for (const raw of parsed.addresses) {
      const normalized = normalizeAddressLine(raw);
      const validation = AddressLineSchema.safeParse(normalized);
      if (!validation.success) {
        throw validation.error;
      }
      if (!seen.has(normalized)) {
        seen.add(normalized);
        unique.push(normalized);
      }
    }

    if (!unique.length) {
      return NextResponse.json({ message: 'No addresses provided' }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.client.deleteMany();
      await tx.client.createMany({
        data: unique.map((addressLine) => ({
          addressLine,
        })),
      });
    });

    return NextResponse.json({ created: unique.length }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation failed', issues: error.issues },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json({ message: 'Unable to import addresses' }, { status: 500 });
  }
}
