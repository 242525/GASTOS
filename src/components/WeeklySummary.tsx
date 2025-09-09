'use client';

import { useState, useEffect } from 'react';
import { formatCurrencyBRL } from '@/utils/formatting';
import { Expense, Category, BillingPeriod } from '@prisma/client';

interface ExpenseWithCategory extends Expense {
  category: Category;
}

interface WeeklySummaryData {
  weekLabel: string;
  total: number;
  expenses: ExpenseWithCategory[];
}

interface ApiResponse {
  periodName: string | null;
  weeks: WeeklySummaryData[];
  message?: string;
}

interface WeeklySummaryProps {
  currentBillingPeriod: BillingPeriod | null;
}

export default function WeeklySummary({ currentBillingPeriod }: WeeklySummaryProps) {
  const [summary, setSummary] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  const toggleWeekExpansion = (weekLabel: string) => {
    setExpandedWeeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekLabel)) {
        newSet.delete(weekLabel);
      } else {
        newSet.add(weekLabel);
      }
      return newSet;
    });
  };

  useEffect(() => {
    const fetchSummary = async () => {
      if (!currentBillingPeriod) {
        setIsLoading(false);
        setSummary(null); // Clear summary if no period
        return;
      }
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/reports/weekly-summary?billingPeriodId=${currentBillingPeriod.id}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar o resumo semanal.');
        }
        const data: ApiResponse = await response.json();
        setSummary(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, [currentBillingPeriod]);

  if (isLoading) {
    return <p className="text-center text-gray-400">Carregando resumo...</p>;
  }

  if (error) {
    return <p className="text-center text-red-400">Erro: {error}</p>;
  }

  if (!summary || (!currentBillingPeriod && summary.weeks.length === 0)) {
    return (
      <div className="text-center bg-card-background p-8 rounded-lg">
        <h3 className="text-xl font-semibold text-foreground">Resumo Semanal</h3>
        <p className="text-gray-400 mt-2">{summary?.message || "Nenhum período de faturamento ativo ou dados para exibir."}</p>
      </div>
    );
  }

  const calculateDaysRemaining = (endDate: Date) => {
    const today = new Date();
    const end = new Date(endDate);
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = currentBillingPeriod ? calculateDaysRemaining(new Date(currentBillingPeriod.endDate)) : 0;

  return (
    <div className="bg-card-background p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">
        Resumo Semanal do Período: <span className="text-blue-400">{summary.periodName}</span>
        {currentBillingPeriod && (
          <span className="ml-4 text-sm text-gray-400">({daysRemaining} dias restantes)</span>
        )}
      </h2>
      <ul className="space-y-3">
        {summary.weeks.map((week) => (
          <li key={week.weekLabel} className="p-4 bg-background rounded-lg border border-border-color">
            <div className="flex justify-between items-center cursor-pointer" onClick={() => toggleWeekExpansion(week.weekLabel)}>
              <span className="font-medium text-gray-300">{week.weekLabel}</span>
              <div className="flex items-center">
                <span className="font-semibold text-lg text-red-400 mr-2">{formatCurrencyBRL(week.total)}</span>
                <svg
                  className={`w-4 h-4 transition-transform ${expandedWeeks.has(week.weekLabel) ? 'rotate-90' : 'rotate-0'}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
            {expandedWeeks.has(week.weekLabel) && week.expenses.length > 0 && (
              <ul className="mt-4 space-y-2 pl-4 border-l border-border-color">
                {week.expenses.map((expense) => (
                  <li key={expense.id} className="flex justify-between items-center text-sm text-gray-400">
                    <span>{expense.description || expense.category.name}</span>
                    <span className="font-medium text-red-300">{formatCurrencyBRL(expense.amount)}</span>
                  </li>
                ))}
              </ul>
            )}
            {expandedWeeks.has(week.weekLabel) && week.expenses.length === 0 && (
              <p className="text-center text-gray-500 mt-4">Nenhuma despesa encontrada para esta semana.</p>
            )}
          </li>
        ))}
      </ul>
      {summary.weeks.length === 0 && (
        <p className="text-center text-gray-400 mt-4">Nenhuma despesa encontrada para este período.</p>
      )}
    </div>
  );
}
