import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const billingPeriodId = searchParams.get('billingPeriodId');
    const year = searchParams.get('year');

    let salaries, variableExpenses, fixedExpenses;

    if (billingPeriodId) {
      const billingPeriod = await prisma.billingPeriod.findUnique({
        where: { id: parseInt(billingPeriodId) },
      });

      if (!billingPeriod) {
        return NextResponse.json(
          { error: 'Billing period not found' },
          { status: 404 }
        );
      }

      const month = billingPeriod.startDate.getMonth() + 1;
      const periodYear = billingPeriod.startDate.getFullYear();

      [salaries, variableExpenses, fixedExpenses] = await Promise.all([
        prisma.salary.findMany({
          where: { year: periodYear, month },
        }),
        prisma.expense.findMany({
          where: { billingPeriodId: parseInt(billingPeriodId) },
          include: { category: true },
        }),
        prisma.fixedExpense.findMany({
          where: { billingPeriodId: parseInt(billingPeriodId) },
        }),
      ]);
    } else if (year) {
      const numericYear = parseInt(year);
      const startDate = new Date(numericYear, 0, 1);
      const endDate = new Date(numericYear + 1, 0, 1);

      [salaries, variableExpenses, fixedExpenses] = await Promise.all([
        prisma.salary.findMany({ where: { year: numericYear } }),
        prisma.expense.findMany({
          where: { date: { gte: startDate, lt: endDate } },
          include: { category: true },
        }),
        // Not filtering fixed expenses by year for now
        prisma.fixedExpense.findMany(),
      ]);
    } else {
      [salaries, variableExpenses, fixedExpenses] = await Promise.all([
        prisma.salary.findMany(),
        prisma.expense.findMany({ include: { category: true } }),
        prisma.fixedExpense.findMany(),
      ]);
    }

    // Calculate total income
    const totalIncome = salaries.reduce((acc, salary) => acc + salary.amount, 0);

    // Calculate total expenses
    const totalVariableExpenses = variableExpenses.reduce(
      (acc, expense) => acc + expense.amount,
      0
    );
    const totalFixedExpenses = fixedExpenses.reduce(
      (acc, expense) => acc + expense.amount,
      0
    );
    const totalExpenses = totalVariableExpenses + totalFixedExpenses;

    // Calculate balance
    const balance = totalIncome - totalExpenses;

    // Group expenses by category
    const expensesByCategory = variableExpenses.reduce((acc, expense) => {
      const categoryName = expense.category.name;
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      balance,
      expensesByCategory,
    });
  } catch (error) {
    console.error('Error fetching consolidated report:', error);
    return NextResponse.json(
      { error: 'Failed to fetch consolidated report' },
      { status: 500 }
    );
  }
}