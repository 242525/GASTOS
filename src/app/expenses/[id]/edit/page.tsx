'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ExpenseForm from '@/components/ExpenseForm';
import { Expense, Category } from '@prisma/client';

export default function EditExpensePage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [expense, setExpense] = useState<Expense & { category: Category } | null>(null);

  useEffect(() => {
    if (id) {
      fetch(`/api/expenses/${id}`)
        .then((res) => res.json())
        .then((data) => setExpense(data));
    }
  }, [id]);

  const handleExpenseUpdated = () => {
    router.push('/'); // Redirect to home page after editing
  };

  if (!expense) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Despesa</h1>
      <ExpenseForm onExpenseAdded={handleExpenseUpdated} expenseToEdit={expense} />
    </div>
  );
}