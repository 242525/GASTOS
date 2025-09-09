import { PrismaClient, Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        category: true,
        billingPeriod: true,
      },
      orderBy: {
        date: 'desc',
      }
    });
    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return NextResponse.json({ error: 'Error fetching expenses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Received expense data:', body);
    const { amount, description, categoryId, date, billingPeriodId } = body;

    if (!amount || !categoryId || !date) {
      return NextResponse.json({ error: 'Amount, categoryId, and date are required fields.' }, { status: 400 });
    }

    const data: Prisma.ExpenseCreateInput = {
      amount: parseFloat(amount),
      description: description || null,
      category: { connect: { id: parseInt(categoryId) } },
      date: new Date(`${date}T00:00:00`),
      billingPeriod: billingPeriodId ? { connect: { id: parseInt(billingPeriodId) } } : undefined,
    };

    const expense = await prisma.expense.create({
      data,
    });
    return NextResponse.json(expense, { status: 201 });
  } catch (error) {
    console.error('Error creating expense:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: 'Error creating expense', details: errorMessage }, { status: 500 });
  }
}
