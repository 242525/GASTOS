import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const billingPeriodId = searchParams.get('billingPeriodId');

    let billingPeriod;

    if (billingPeriodId) {
      billingPeriod = await prisma.billingPeriod.findUnique({
        where: { id: parseInt(billingPeriodId) },
      });
    } else {
      const today = new Date();
      const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
      billingPeriod = await prisma.billingPeriod.findFirst({
        where: {
          startDate: { lte: todayUTC },
          endDate: { gte: todayUTC },
        },
      });
    }

    if (!billingPeriod) {
      return NextResponse.json({
        message: "Nenhum período de faturamento encontrado.",
        weeks: [],
        periodName: null
      });
    }

    // 2. Fetch all expenses within that period
    const expenses = await prisma.expense.findMany({
      where: {
        billingPeriodId: billingPeriod.id,
      },
      include: {
        category: true, // Include category details
      },
      orderBy: {
        date: 'asc',
      },
    });

    // 3. Group expenses by week
    const weeklyTotals: { [key: string]: { total: number; weekLabel: string; expenses: any[]; weekStart: Date } } = {};
    const periodStart = new Date(billingPeriod.startDate);
    const periodEnd = new Date(billingPeriod.endDate);

    const formatDate = (d: Date) => {
      const day = String(d.getUTCDate()).padStart(2, '0');
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    }

    for (const expense of expenses) {
      const expenseDate = new Date(expense.date);
      
      // Week starts on Sunday (day 0)
      const dayOfWeek = expenseDate.getUTCDay();
      const weekStart = new Date(expenseDate);
      weekStart.setUTCDate(expenseDate.getUTCDate() - dayOfWeek);
      weekStart.setUTCHours(0, 0, 0, 0); // Normalize time

      const weekEnd = new Date(weekStart);
      weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
      weekEnd.setUTCHours(23, 59, 59, 999); // Set to end of day

      // Clamp the week's display dates to the billing period's boundaries
      const displayWeekStart = new Date(Math.max(weekStart.getTime(), periodStart.getTime()));
      const displayWeekEnd = new Date(Math.min(weekEnd.getTime(), periodEnd.getTime()));

      const weekLabel = `Semana (${formatDate(displayWeekStart)} - ${formatDate(displayWeekEnd)})`;
      
      // Use a consistent key for the calendar week for grouping
      const weekKey = weekStart.toISOString();

      if (!weeklyTotals[weekKey]) {
        weeklyTotals[weekKey] = { total: 0, weekLabel, expenses: [], weekStart };
      }
      weeklyTotals[weekKey].total += expense.amount;
      weeklyTotals[weekKey].expenses.push(expense);
    }

    const summary = Object.values(weeklyTotals).sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());

    return NextResponse.json({
      periodName: billingPeriod.name,
      weeks: summary
    });

  } catch (error) {
    console.error("Error generating weekly summary:", error);
    return NextResponse.json(
      { error: "Error generating weekly summary" },
      { status: 500 }
    );
  }
}
