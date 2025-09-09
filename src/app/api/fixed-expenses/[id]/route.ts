import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const fixedExpense = await prisma.fixedExpense.findUnique({
      where: { id: parseInt(params.id) },
    });
    if (!fixedExpense) {
      return NextResponse.json({ error: 'Fixed expense not found' }, { status: 404 });
    }
    return NextResponse.json(fixedExpense);
  } catch (error) {
    console.error('Error fetching fixed expense:', error);
    return NextResponse.json({ error: 'Error fetching fixed expense' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { description, amount, installmentNumber, totalInstallments, billingPeriodId } = await request.json();

    const updatedFixedExpense = await prisma.fixedExpense.update({
      where: { id: parseInt(params.id) },
      data: {
        description,
        amount: parseFloat(amount),
        installmentNumber: parseInt(installmentNumber),
        totalInstallments: totalInstallments ? parseInt(totalInstallments) : null,
        billingPeriodId: parseInt(billingPeriodId),
      },
    });
    return NextResponse.json(updatedFixedExpense);
  } catch (error) {
    console.error('Error updating fixed expense:', error);
    return NextResponse.json({ error: 'Error updating fixed expense' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.fixedExpense.delete({
      where: { id: parseInt(params.id) },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting fixed expense:', error);
    return NextResponse.json({ error: 'Error deleting fixed expense' }, { status: 500 });
  }
}
