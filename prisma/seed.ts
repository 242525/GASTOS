import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    'Gasolina',
    'Supermercado',
    'Almoço',
    'Cartão de Crédito',
    'Luz',
    'Água',
    'Condomínio',
    'Financiamento',
    'Outros'
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { name: category },
      update: {},
      create: {
        name: category,
      },
    });
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
