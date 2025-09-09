'use client';

import { useState } from 'react';

interface FixedExpenseFormProps {
  billingPeriodId: number;
  onFixedExpenseAdded: () => void;
}

export default function FixedExpenseForm({
  billingPeriodId,
  onFixedExpenseAdded,
}: FixedExpenseFormProps) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [installmentNumber, setInstallmentNumber] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!description || !amount || !installmentNumber) {
      setError('Descrição, Valor e Parcela Atual são obrigatórios.');
      return;
    }

    const response = await fetch('/api/fixed-expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        description,
        amount: parseFloat(amount),
        installmentNumber: parseInt(installmentNumber),
        totalInstallments: totalInstallments ? parseInt(totalInstallments) : null,
        billingPeriodId,
      }),
    });

    if (response.ok) {
      setDescription('');
      setAmount('');
      setInstallmentNumber('');
      setTotalInstallments('');
      onFixedExpenseAdded();
    } else {
      const { error } = await response.json();
      setError(error || 'Falha ao criar o gasto fixo.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="description" className="block mb-1 text-sm font-medium text-gray-400">Descrição</label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="amount" className="block mb-1 text-sm font-medium text-gray-400">Valor</label>
          <input
            id="amount"
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div>
          <label htmlFor="installmentNumber" className="block mb-1 text-sm font-medium text-gray-400">Parcela Atual</label>
          <input
            id="installmentNumber"
            type="number"
            value={installmentNumber}
            onChange={(e) => setInstallmentNumber(e.target.value)}
            className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
            required
          />
        </div>
      </div>
      <div>
        <label htmlFor="totalInstallments" className="block mb-1 text-sm font-medium text-gray-400">Total de Parcelas (Opcional)</label>
        <input
          id="totalInstallments"
          type="number"
          value={totalInstallments}
          onChange={(e) => setTotalInstallments(e.target.value)}
          className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button type="submit" className="w-full bg-primary text-white p-2 rounded-md hover:bg-blue-700 transition-colors">
        Adicionar Gasto Fixo
      </button>
    </form>
  );
}
