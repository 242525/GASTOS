'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import BillingPeriodForm from '@/components/BillingPeriodForm';
import FixedExpenseForm from '@/components/FixedExpenseForm';
import FixedExpenseList from '@/components/FixedExpenseList';
import { BillingPeriod } from '@prisma/client';
import Link from 'next/link';

export default function EditBillingPeriodPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod | null>(null);
  const [refreshFixedExpensesKey, setRefreshFixedExpensesKey] = useState(0);

  useEffect(() => {
    if (id) {
      fetch(`/api/billing-periods/${id}`)
        .then((res) => res.json())
        .then((data) => setBillingPeriod(data));
    }
  }, [id]);

  const handleBillingPeriodUpdated = () => {
    router.push('/billing-periods'); // Redirect to billing periods list after editing
  };

  const handleFixedExpenseAdded = () => {
    setRefreshFixedExpensesKey(prev => prev + 1);
  };

  if (!billingPeriod) {
    return <div className="text-center text-gray-400">Carregando...</div>;
  }

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Editar Período de Faturamento</h1>
        <Link href="/billing-periods" className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
          Voltar
        </Link>
      </header>
      <div className="bg-card-background p-6 rounded-lg shadow-md mb-8">
        <BillingPeriodForm onBillingPeriodAdded={handleBillingPeriodUpdated} initialData={billingPeriod} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-card-background p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Adicionar Gasto Fixo</h2>
          <FixedExpenseForm billingPeriodId={billingPeriod.id} onFixedExpenseAdded={handleFixedExpenseAdded} />
        </div>
        <div className="bg-card-background p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-foreground">Gastos Fixos</h2>
          <FixedExpenseList billingPeriodId={billingPeriod.id} refreshKey={refreshFixedExpensesKey} />
        </div>
      </div>
    </main>
  );
}
