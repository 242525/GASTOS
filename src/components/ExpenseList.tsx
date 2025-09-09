'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatCurrencyBRL } from '@/utils/formatting';
import { Expense, Category } from '@prisma/client';

type ExpenseWithCategory = Expense & { category: Category };

interface WeekData {
  weekLabel: string;
  expenses: ExpenseWithCategory[];
}

interface PeriodData {
  id: number;
  name: string;
  weeks: WeekData[];
}

export default function ExpenseList({ refreshKey }: { refreshKey: number }) {
  const [groupedExpenses, setGroupedExpenses] = useState<PeriodData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPeriods, setExpandedPeriods] = useState<Set<number>>(new Set());
  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/expenses/grouped');
        if (!response.ok) {
          throw new Error('Falha ao buscar despesas.');
        }
        const data: PeriodData[] = await response.json();
        setGroupedExpenses(data);
        // Automatically expand the first period
        if (data.length > 0) {
          setExpandedPeriods(new Set([data[0].id]));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExpenses();
  }, [refreshKey]);

  const togglePeriodExpansion = (periodId: number) => {
    setExpandedPeriods(prev => {
      const newSet = new Set(prev);
      if (newSet.has(periodId)) {
        newSet.delete(periodId);
      } else {
        newSet.add(periodId);
      }
      return newSet;
    });
  };

  const toggleWeekExpansion = (weekLabel: string) => {
    setExpandedWeeks(prev => {
      const newSet = new Set(prev);
      const uniqueKey = weekLabel; // Assuming weekLabel is unique enough for a session
      if (newSet.has(uniqueKey)) {
        newSet.delete(uniqueKey);
      } else {
        newSet.add(uniqueKey);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return <p className="text-center text-gray-400">Carregando despesas...</p>;
  }

  if (error) {
    return <p className="text-center text-red-400">Erro: {error}</p>;
  }

  if (groupedExpenses.length === 0) {
    return <p className="text-center text-gray-400">Nenhuma despesa encontrada.</p>;
  }

  return (
    <div className="space-y-4">
      {groupedExpenses.map(period => (
        <div key={period.id} className="bg-background rounded-lg border border-border-color">
          <h2 
            className="text-xl font-bold text-blue-400 p-4 cursor-pointer flex justify-between items-center"
            onClick={() => togglePeriodExpansion(period.id)}
          >
            {period.name}
            <svg 
              className={`w-5 h-5 transition-transform ${expandedPeriods.has(period.id) ? 'rotate-90' : 'rotate-0'}`} 
              fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </h2>
          {expandedPeriods.has(period.id) && (
            <div className="px-4 pb-4 space-y-3">
              {period.weeks.map(week => (
                <div key={week.weekLabel} className="p-3 bg-card-background rounded-lg border border-border-color">
                  <h3 
                    className="font-semibold text-gray-300 cursor-pointer flex justify-between items-center"
                    onClick={() => toggleWeekExpansion(week.weekLabel)}
                  >
                    {week.weekLabel}
                    <svg 
                      className={`w-4 h-4 transition-transform ${expandedWeeks.has(week.weekLabel) ? 'rotate-90' : 'rotate-0'}`} 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </h3>
                  {expandedWeeks.has(week.weekLabel) && (
                    <ul className="mt-3 space-y-3">
                      {week.expenses.map(exp => (
                        <li key={exp.id} className="flex flex-col p-3 bg-background rounded-lg shadow-sm border border-border-color">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-300 px-2 py-1 bg-card-background rounded-full border border-border-color">{exp.category.name}</span>
                            <div className="text-right">
                              <span className="font-semibold text-lg text-red-400">{formatCurrencyBRL(exp.amount)}</span>
                              <span className="block text-xs text-gray-400">{new Date(exp.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</span>
                            </div>
                          </div>
                          {exp.description && (
                            <p className="text-sm text-gray-300 mt-2">Obs: {exp.description}</p>
                          )}
                          <div className="mt-3 text-right">
                            <Link href={`/expenses/${exp.id}/edit`} className="text-sm text-blue-400 hover:text-blue-300">
                              Editar
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
