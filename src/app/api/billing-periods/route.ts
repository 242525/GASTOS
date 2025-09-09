import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const billingPeriods = await prisma.billingPeriod.findMany({
      orderBy: {
        startDate: 'desc',
      },
    });
    return NextResponse.json(billingPeriods);
  } catch (error) {
    console.error("Error fetching billing periods:", error);
    return NextResponse.json(
      { error: "Error fetching billing periods" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name, startDate, endDate, defaultElectricityBill, defaultGasBill, defaultCondoFee, defaultApartmentFinancing, defaultInternetBill, defaultPixAmount } = await request.json();

    if (!name || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newBillingPeriod = await prisma.billingPeriod.create({
      data: {
        name,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        defaultElectricityBill,
        defaultGasBill,
        defaultCondoFee,
        defaultApartmentFinancing,
        defaultInternetBill,
        defaultPixAmount,
      },
    });
    return NextResponse.json(newBillingPeriod, { status: 201 });
  } catch (error) {
    console.error("Error creating billing period:", error);
    return NextResponse.json(
      { error: "Error creating billing period" },
      { status: 500 }
    );
  }
}