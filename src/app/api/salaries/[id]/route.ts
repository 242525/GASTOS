import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET: Buscar um salário específico pelo ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const salary = await prisma.salary.findUnique({
      where: { id },
    });

    if (!salary) {
      return NextResponse.json({ error: 'Salário não encontrado' }, { status: 404 });
    }

    return NextResponse.json(salary);
  } catch (error) {
    console.error('Erro ao buscar salário:', error);
    return NextResponse.json({ error: 'Falha ao buscar salário' }, { status: 500 });
  }
}

// PUT: Atualizar um salário existente
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const { amount, year, month } = await request.json();

    // Validação simples dos dados recebidos
    if (typeof amount !== 'number' || typeof year !== 'number' || typeof month !== 'number') {
      return NextResponse.json({ error: 'Dados inválidos. Verifique os campos.' }, { status: 400 });
    }

    const updatedSalary = await prisma.salary.update({
      where: { id },
      data: { amount, year, month },
    });

    return NextResponse.json(updatedSalary);
  } catch (error) {
    console.error('Erro ao atualizar salário:', error);
    return NextResponse.json({ error: 'Falha ao atualizar salário' }, { status: 500 });
  }
}

// DELETE: Deletar um salário
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    await prisma.salary.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Salário deletado com sucesso' });
  } catch (error) {
    console.error('Erro ao deletar salário:', error);
    return NextResponse.json({ error: 'Falha ao deletar salário' }, { status: 500 });
  }
}