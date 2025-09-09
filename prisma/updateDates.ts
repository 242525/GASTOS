
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const expenses = await prisma.expense.findMany();

  for (const expense of expenses) {
    const newDate = new Date(expense.date);
    newDate.setDate(newDate.getDate() + 1);
    await prisma.expense.update({
      where: { id: expense.id },
      data: { date: newDate },
    });
  }

  console.log('Updated dates for all expenses.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
