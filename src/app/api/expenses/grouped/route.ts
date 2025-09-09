import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 1. Fetch all billing periods and their expenses
    const billingPeriods = await prisma.billingPeriod.findMany({
      include: {
        expenses: {
          include: {
            category: true,
          },
          orderBy: {
            date: 'asc',
          },
        },
      },
      orderBy: {
        startDate: 'desc', // Most recent periods first
      },
    });

    // 2. Group expenses by week within each period
    const formattedPeriods = billingPeriods.map(period => {
      const weeklyTotals: { [key: string]: { weekLabel: string; weekStart: Date; expenses: any[] } } = {};
      const periodStart = new Date(period.startDate);
      const periodEnd = new Date(period.endDate);

      const formatDate = (d: Date) => {
        const day = String(d.getUTCDate()).padStart(2, '0');
        const month = String(d.getUTCMonth() + 1).padStart(2, '0');
        return `${day}/${month}`;
      };

      for (const expense of period.expenses) {
        const expenseDate = new Date(expense.date);
        
        const dayOfWeek = expenseDate.getUTCDay(); // Sunday = 0
        const weekStart = new Date(expenseDate);
        weekStart.setUTCDate(expenseDate.getUTCDate() - dayOfWeek);
        weekStart.setUTCHours(0, 0, 0, 0);

        const weekEnd = new Date(weekStart);
        weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
        weekEnd.setUTCHours(23, 59, 59, 999);

        const displayWeekStart = new Date(Math.max(weekStart.getTime(), periodStart.getTime()));
        const displayWeekEnd = new Date(Math.min(weekEnd.getTime(), periodEnd.getTime()));

        const weekLabel = `Semana (${formatDate(displayWeekStart)} - ${formatDate(displayWeekEnd)})`;
        const weekKey = weekStart.toISOString();

        if (!weeklyTotals[weekKey]) {
          weeklyTotals[weekKey] = { weekLabel, weekStart, expenses: [] };
        }
        weeklyTotals[weekKey].expenses.push(expense);
      }

      const weeks = Object.values(weeklyTotals).sort((a, b) => a.weekStart.getTime() - b.weekStart.getTime());

      return {
        id: period.id,
        name: period.name,
        weeks,
      };
    });

    return NextResponse.json(formattedPeriods);
  } catch (error) {
    console.error('Error fetching and grouping expenses:', error);
    return NextResponse.json({ error: 'Error fetching expenses' }, { status: 500 });
  }
}
