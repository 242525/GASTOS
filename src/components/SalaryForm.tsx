'use client';

import { Salary } from '@prisma/client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface SalaryFormData {
  amount: number;
  year: number;
  month: number;
}

interface SalaryFormProps {
  onSubmit: (data: SalaryFormData) => Promise<void>;
  initialData?: Salary | null;
}

export default function SalaryForm({ onSubmit, initialData }: SalaryFormProps) {
  const router = useRouter();
  const [amount, setAmount] = useState('');
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isEditMode && initialData) {
      setAmount(initialData.amount.toString());
      setYear(initialData.year.toString());
      setMonth(initialData.month.toString());
    }
  }, [isEditMode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const salaryData: SalaryFormData = {
      amount: parseFloat(amount),
      year: parseInt(year),
      month: parseInt(month),
    };

    await onSubmit(salaryData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card-background p-6 rounded-lg shadow-md border border-border-color">
      <div className="mb-4">
        <label htmlFor="salary-amount" className="block mb-2 text-sm font-medium text-gray-400">Valor</label>
        <input
          id="salary-amount"
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label htmlFor="year" className="block mb-2 text-sm font-medium text-gray-400">Ano</label>
          <input
            id="year"
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="month" className="block mb-2 text-sm font-medium text-gray-400">Mês</label>
          <input
            id="month"
            type="number"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
            required
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="bg-gray-700 text-foreground p-2 rounded-md hover:bg-gray-600 transition-colors"
        >
          Cancelar
        </button>
        <button type="submit" className="bg-green-600 text-foreground p-2 rounded-md hover:bg-green-700 transition-colors">
          {isEditMode ? 'Salvar Alterações' : 'Adicionar Salário'}
        </button>
      </div>
    </form>
  );
}