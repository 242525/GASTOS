import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const billingPeriodId = searchParams.get('billingPeriodId');

    if (!billingPeriodId) {
      return NextResponse.json({ error: 'billingPeriodId is required' }, { status: 400 });
    }

    const fixedExpenses = await prisma.fixedExpense.findMany({
      where: {
        billingPeriodId: parseInt(billingPeriodId),
      },
      orderBy: {
        installmentNumber: 'asc',
      },
    });
    return NextResponse.json(fixedExpenses);
  } catch (error) {
    console.error("Error fetching fixed expenses:", error);
    return NextResponse.json(
      { error: "Error fetching fixed expenses" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { description, amount, installmentNumber, totalInstallments, billingPeriodId } = await request.json();

    if (!description || !amount || !installmentNumber || !billingPeriodId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const newFixedExpense = await prisma.fixedExpense.create({
      data: {
        description,
        amount: parseFloat(amount),
        installmentNumber: parseInt(installmentNumber),
        totalInstallments: totalInstallments ? parseInt(totalInstallments) : null,
        billingPeriodId: parseInt(billingPeriodId),
      },
    });
    return NextResponse.json(newFixedExpense, { status: 201 });
  } catch (error) {
    console.error("Error creating fixed expense:", error);
    return NextResponse.json(
      { error: "Error creating fixed expense" },
      { status: 500 }
    );
  }
}
