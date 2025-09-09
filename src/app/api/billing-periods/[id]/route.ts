import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const billingPeriod = await prisma.billingPeriod.findUnique({
      where: { id: parseInt(params.id) },
    });
    if (!billingPeriod) {
      return NextResponse.json({ error: 'Billing period not found' }, { status: 404 });
    }
    return NextResponse.json(billingPeriod);
  } catch (error) {
    console.error('Error fetching billing period:', error);
    return NextResponse.json({ error: 'Error fetching billing period' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { name, startDate, endDate, defaultElectricityBill, defaultGasBill, defaultCondoFee, defaultApartmentFinancing, defaultInternetBill, defaultPixAmount } = await request.json();

    const updatedBillingPeriod = await prisma.billingPeriod.update({
      where: { id: parseInt(params.id) },
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
    return NextResponse.json(updatedBillingPeriod);
  } catch (error) {
    console.error('Error updating billing period:', error);
    return NextResponse.json({ error: 'Error updating billing period' }, { status: 500 });
  }
}
