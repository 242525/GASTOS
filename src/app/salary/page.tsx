'use client';

import { useState } from 'react';
import SalaryForm from '@/components/SalaryForm';
import AnnualSalaryList from '@/components/AnnualSalaryList';
import Link from 'next/link';
import { Salary } from '@prisma/client';

export default function SalaryPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSaveSalary = async (formData: Omit<Salary, 'id'>) => {
    try {
      const response = await fetch('/api/salaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar o salário.');
      }
      // Incrementa a chave para forçar a atualização da lista
      setRefreshKey(oldKey => oldKey + 1);
    } catch (error) {
      console.error('Erro:', error);
      alert('Não foi possível salvar o salário.');
    }
  };

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Gerenciar Salários</h1>
        <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
          Voltar
        </Link>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-card-background p-6 rounded-lg shadow-md border border-border-color">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Adicionar Novo Salário</h2>
            <SalaryForm onSubmit={handleSaveSalary} />
          </div>
        </div>
        <div className="lg:col-span-2">
          <AnnualSalaryList refreshKey={refreshKey} />
        </div>
      </div>
    </main>
  );
}
