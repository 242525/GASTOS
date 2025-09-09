import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const today = new Date();
    const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));

    const currentBillingPeriod = await prisma.billingPeriod.findFirst({
      where: {
        startDate: { lte: todayUTC },
        endDate: { gte: todayUTC },
      },
    });

    if (!currentBillingPeriod) {
      return NextResponse.json({ message: "Nenhum período de faturamento ativo para a data atual." }, { status: 404 });
    }

    return NextResponse.json(currentBillingPeriod);
  } catch (error) {
    console.error("Error fetching current billing period:", error);
    return NextResponse.json(
      { error: "Error fetching current billing period" },
      { status: 500 }
    );
  }
}
