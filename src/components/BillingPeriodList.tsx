'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BillingPeriod } from '@prisma/client';

export default function BillingPeriodList({ refreshKey }: { refreshKey: number }) {
  const [billingPeriods, setBillingPeriods] = useState<BillingPeriod[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillingPeriods = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/billing-periods');
        if (!response.ok) {
          throw new Error('Falha ao buscar períodos de faturamento.');
        }
        const data = await response.json();
        setBillingPeriods(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBillingPeriods();
  }, [refreshKey]);

  if (isLoading) {
    return <p className="text-center text-gray-500">Carregando períodos...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Erro: {error}</p>;
  }

  if (billingPeriods.length === 0) {
    return <p className="text-center text-gray-500">Nenhum período de faturamento encontrado.</p>;
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
  };

  return (
    <div className="bg-card-background p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">Períodos de Faturamento</h2>
      <ul className="space-y-3">
        {billingPeriods.map((period) => (
          <li key={period.id} className="p-4 bg-background rounded-lg border border-border-color">
            <div className="flex justify-between items-center">
              <span className="font-medium text-foreground">{period.name}</span>
              <div className="flex items-center text-sm text-gray-400">
                <span>{formatDate(period.startDate.toString())}</span>
                <span className="mx-2">-</span>
                <span>{formatDate(period.endDate.toString())}</span>
                <Link href={`/billing-periods/${period.id}/edit`} className="ml-4 text-blue-400 hover:text-blue-300">
                  Editar
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
