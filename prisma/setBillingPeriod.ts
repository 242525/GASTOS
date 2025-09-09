import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const billingPeriod = await prisma.billingPeriod.findFirst({
    where: { name: 'SETEMBRO25' },
  });

  if (billingPeriod) {
    await prisma.expense.updateMany({
      data: {
        billingPeriodId: billingPeriod.id,
      },
    });
    console.log('All expenses have been updated with the billing period "SETEMBRO25".');
  } else {
    console.error('Billing period "SETEMBRO25" not found.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
