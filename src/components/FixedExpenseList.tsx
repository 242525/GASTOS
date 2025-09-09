'use client';

import { useState, useEffect } from 'react';
import { FixedExpense } from '@prisma/client';
import { formatCurrencyBRL } from '@/utils/formatting';

interface FixedExpenseListProps {
  billingPeriodId: number;
  refreshKey: number;
}

export default function FixedExpenseList({
  billingPeriodId,
  refreshKey,
}: FixedExpenseListProps) {
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFixedExpenses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/fixed-expenses?billingPeriodId=${billingPeriodId}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar gastos fixos.');
        }
        const data = await response.json();
        setFixedExpenses(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      } finally {
        setIsLoading(false);
      }
    };

    if (billingPeriodId) {
      fetchFixedExpenses();
    }
  }, [billingPeriodId, refreshKey]);

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este gasto fixo?')) {
      const response = await fetch(`/api/fixed-expenses/${id}`, { method: 'DELETE' });
      if (response.ok) {
        setFixedExpenses(fixedExpenses.filter(exp => exp.id !== id));
      } else {
        alert('Falha ao excluir o gasto fixo.');
      }
    }
  };

  if (isLoading) {
    return <p className="text-center text-gray-400">Carregando gastos fixos...</p>;
  }

  if (error) {
    return <p className="text-center text-red-400">Erro: {error}</p>;
  }

  if (fixedExpenses.length === 0) {
    return <p className="text-center text-gray-400">Nenhum gasto fixo encontrado para este período.</p>;
  }

  return (
    <ul className="space-y-3">
      {fixedExpenses.map((expense) => (
        <li key={expense.id} className="p-4 bg-background rounded-lg border border-border-color flex justify-between items-center">
          <div>
            <p className="font-medium text-foreground">{expense.description}</p>
            <p className="text-sm text-gray-400">Parcela: {expense.installmentNumber}{expense.totalInstallments ? ` de ${expense.totalInstallments}` : ''}</p>
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-lg text-red-400 mr-4">{formatCurrencyBRL(expense.amount)}</span>
            <button onClick={() => handleDelete(expense.id)} className="text-red-400 hover:text-red-300 text-sm">
              Excluir
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
