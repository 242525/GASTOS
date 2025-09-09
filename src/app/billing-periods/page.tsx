'use client';

import { useState } from 'react';
import BillingPeriodForm from '@/components/BillingPeriodForm';
import BillingPeriodList from '@/components/BillingPeriodList';
import Link from 'next/link';

export default function BillingPeriodsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleBillingPeriodAdded = () => {
    setRefreshKey(oldKey => oldKey + 1);
  };

  return (
    <div className="container mx-auto p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar Períodos de Faturamento</h1>
        <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
          Voltar
        </Link>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <BillingPeriodForm onBillingPeriodAdded={handleBillingPeriodAdded} />
        </div>
        <div className="md:col-span-2">
          <BillingPeriodList refreshKey={refreshKey} />
        </div>
      </div>
    </div>
  );
}