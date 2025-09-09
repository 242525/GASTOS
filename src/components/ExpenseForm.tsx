'use client';

import { useEffect, useState } from 'react';
import { Category, Expense, BillingPeriod } from '@prisma/client';

export default function ExpenseForm({
  onExpenseAdded,
  expenseToEdit,
}: {
  onExpenseAdded: () => void;
  expenseToEdit?: Expense & { category: Category };
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [billingPeriods, setBillingPeriods] = useState<BillingPeriod[]>([]);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [billingPeriodId, setBillingPeriodId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [observation, setObservation] = useState('');

  const isEditMode = !!expenseToEdit;

  // Find the ID for the 'Compras' category
  const comprasCategory = categories.find(cat => cat.name.toLowerCase() === 'compras');
  const showObservation = comprasCategory && categoryId === comprasCategory.id.toString();

  useEffect(() => {
    // Fetch categories
    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories);

    // Fetch billing periods
    fetch('/api/billing-periods')
      .then((res) => res.json())
      .then(setBillingPeriods);
  }, []);

  useEffect(() => {
    if (isEditMode && expenseToEdit) {
      setAmount(expenseToEdit.amount.toString());
      setCategoryId(expenseToEdit.categoryId.toString());
      setDate(new Date(expenseToEdit.date).toISOString().split('T')[0]);
      setObservation(expenseToEdit.description);
      setBillingPeriodId(expenseToEdit.billingPeriodId?.toString() || '');
    }
  }, [isEditMode, expenseToEdit]);

  // Reset observation when category changes
  useEffect(() => {
    if (!showObservation) {
      setObservation('');
    }
  }, [categoryId, showObservation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const expenseData: any = {
      description: observation,
      amount: parseFloat(amount),
      categoryId: parseInt(categoryId),
      date,
    };

    if (billingPeriodId) {
      expenseData.billingPeriodId = parseInt(billingPeriodId);
    }

    const url = isEditMode ? `/api/expenses/${expenseToEdit?.id}` : '/api/expenses';
    const method = isEditMode ? 'PUT' : 'POST';

    console.log('Submitting expense data:', JSON.stringify(expenseData, null, 2));

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expenseData),
      });

      if (response.ok) {
        console.log('Expense saved successfully!', await response.json());
        if (!isEditMode) {
          setAmount('');
          setCategoryId('');
          setBillingPeriodId('');
          setDate(new Date().toISOString().split('T')[0]);
          setObservation('');
        }
        onExpenseAdded();
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Invalid JSON response' }));
        console.error(`Error ${response.status}: Failed to save expense. Full error data:`, errorData);
        alert(`Falha ao salvar despesa: ${errorData.details || errorData.error || `Erro ${response.status}`}`);
      }
    } catch (error) {
      console.error('A network or other error occurred:', error);
      alert(`Ocorreu um erro de rede ou outro problema: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label htmlFor="amount" className="block mb-1 text-sm font-medium text-gray-400">Valor</label>
        <input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="date" className="block mb-1 text-sm font-medium text-gray-400">Data</label>
        <input
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
          required
        />
      </div>
      <div className="mb-4">
        <label htmlFor="category" className="block mb-1 text-sm font-medium text-gray-400">Categoria</label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
          required
        >
          <option value="">Selecione uma categoria</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="billingPeriod" className="block mb-1 text-sm font-medium text-gray-400">Período de Faturamento</label>
        <select
          id="billingPeriod"
          value={billingPeriodId}
          onChange={(e) => setBillingPeriodId(e.target.value)}
          className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
          required
        >
          <option value="">Selecione um período</option>
          {billingPeriods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.name}
            </option>
          ))}
        </select>
      </div>

      {showObservation && (
        <div className="mb-4">
          <label htmlFor="observation" className="block mb-1 text-sm font-medium text-gray-400">Observação</label>
          <textarea
            id="observation"
            value={observation}
            onChange={(e) => setObservation(e.target.value)}
            className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
            rows={3}
          />
        </div>
      )}

      <button type="submit" className="w-full bg-primary text-foreground p-2 rounded-md hover:bg-blue-700 transition-colors">
        {isEditMode ? 'Salvar Alterações' : 'Adicionar'}
      </button>
    </form>
  );
}