import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const expense = await prisma.expense.findUnique({
      where: { id: parseInt(params.id) },
      include: { 
        category: true,
        billingPeriod: true,
      },
    });
    if (!expense) {
      return NextResponse.json({ error: 'Expense not found' }, { status: 404 });
    }
    return NextResponse.json(expense);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching expense' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    console.log('Request body:', body);
    const { amount, description, categoryId, date, billingPeriodId } = body;
    
    const data: any = {
      amount: parseFloat(amount),
      description: description || null,
      categoryId: parseInt(categoryId),
      date: new Date(`${date}T00:00:00`), // Keep consistent with POST
      billingPeriodId: billingPeriodId ? parseInt(billingPeriodId) : null,
    };

    const updatedExpense = await prisma.expense.update({
      where: { id: parseInt(params.id) },
      data,
    });
    return NextResponse.json(updatedExpense);
  } catch (error) {
    console.error('Error updating expense:', error);
    return NextResponse.json({ error: 'Error updating expense' }, { status: 500 });
  }
}
