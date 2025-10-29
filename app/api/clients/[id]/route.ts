import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;
  try {
    await prisma.client.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    if ((error as Error).name === 'NotFoundError') {
      return NextResponse.json({ message: 'Not found' }, { status: 404 });
    }
    console.error(error);
    return NextResponse.json(
      { message: 'Unable to delete client' },
      { status: 500 }
    );
  }
}
