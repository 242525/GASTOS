import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  const month = searchParams.get('month');

  if (!year) {
    return NextResponse.json({ error: 'Year is required' }, { status: 400 });
  }

  try {
    if (month) {
      // Fetch salary for a specific month
      const salary = await prisma.salary.findFirst({
        where: {
          year: parseInt(year),
          month: parseInt(month),
        },
      });
      return NextResponse.json(salary);
    } else {
      // Fetch all salaries for a year
      const salaries = await prisma.salary.findMany({
        where: {
          year: parseInt(year),
        },
        orderBy: {
          month: 'asc',
        },
      });
      return NextResponse.json(salaries);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching salary' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { amount, year, month } = await request.json();
    const salary = await prisma.salary.upsert({
      where: {
        year_month: {
          year,
          month,
        }
      },
      update: {
        amount,
      },
      create: {
        amount,
        year,
        month,
      },
    });
    return NextResponse.json(salary, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error creating/updating salary' }, { status: 500 });
  }
}
