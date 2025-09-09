'use client';

import { useState, useEffect } from 'react';
import { BillingPeriod } from '@prisma/client';

export default function BillingPeriodForm({
  onBillingPeriodAdded,
  initialData,
}: {
  onBillingPeriodAdded: () => void;
  initialData?: BillingPeriod | null;
}) {
  const [name, setName] = useState(initialData?.name || '');
  const [startDate, setStartDate] = useState(initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '');
  const [endDate, setEndDate] = useState(initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '');
  const [defaultElectricityBill, setDefaultElectricityBill] = useState(initialData?.defaultElectricityBill?.toString() || '');
  const [defaultGasBill, setDefaultGasBill] = useState(initialData?.defaultGasBill?.toString() || '');
  const [defaultCondoFee, setDefaultCondoFee] = useState(initialData?.defaultCondoFee?.toString() || '');
  const [defaultApartmentFinancing, setDefaultApartmentFinancing] = useState(initialData?.defaultApartmentFinancing?.toString() || '');
  const [defaultInternetBill, setDefaultInternetBill] = useState(initialData?.defaultInternetBill?.toString() || '');
  const [defaultPixAmount, setDefaultPixAmount] = useState(initialData?.defaultPixAmount?.toString() || '');
  const [error, setError] = useState('');

  const isEditMode = !!initialData;

  useEffect(() => {
    if (isEditMode && initialData) {
      setName(initialData.name);
      setStartDate(initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '');
      setEndDate(initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '');
      setDefaultElectricityBill(initialData.defaultElectricityBill?.toString() || '');
      setDefaultGasBill(initialData.defaultGasBill?.toString() || '');
      setDefaultCondoFee(initialData.defaultCondoFee?.toString() || '');
      setDefaultApartmentFinancing(initialData.defaultApartmentFinancing?.toString() || '');
      setDefaultInternetBill(initialData.defaultInternetBill?.toString() || '');
      setDefaultPixAmount(initialData.defaultPixAmount?.toString() || '');
    }
  }, [isEditMode, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !startDate || !endDate) {
      setError('Todos os campos são obrigatórios.');
      return;
    }

    const url = isEditMode ? `/api/billing-periods/${initialData?.id}` : '/api/billing-periods';
    const method = isEditMode ? 'PUT' : 'POST';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        startDate,
        endDate,
        defaultElectricityBill: defaultElectricityBill ? parseFloat(defaultElectricityBill) : null,
        defaultGasBill: defaultGasBill ? parseFloat(defaultGasBill) : null,
        defaultCondoFee: defaultCondoFee ? parseFloat(defaultCondoFee) : null,
        defaultApartmentFinancing: defaultApartmentFinancing ? parseFloat(defaultApartmentFinancing) : null,
        defaultInternetBill: defaultInternetBill ? parseFloat(defaultInternetBill) : null,
        defaultPixAmount: defaultPixAmount ? parseFloat(defaultPixAmount) : null,
      }),
    });

    if (response.ok) {
      if (!isEditMode) {
        setName('');
        setStartDate('');
        setEndDate('');
      }
      onBillingPeriodAdded();
    } else {
      const { error } = await response.json();
      setError(error || `Falha ao ${isEditMode ? 'atualizar' : 'criar'} o período de faturamento.`);
    }
  };

  return (
    <div className="bg-card-background p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">{isEditMode ? 'Editar Período de Faturamento' : 'Criar Novo Período de Faturamento'}</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-400">Nome do Período</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
            required
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block mb-1 text-sm font-medium text-gray-400">Data de Início</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block mb-1 text-sm font-medium text-gray-400">Data de Fim</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="defaultElectricityBill" className="block mb-1 text-sm font-medium text-gray-400">Conta de Luz (Padrão)</label>
            <input
              id="defaultElectricityBill"
              type="number"
              step="0.01"
              value={defaultElectricityBill}
              onChange={(e) => setDefaultElectricityBill(e.target.value)}
              className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="defaultGasBill" className="block mb-1 text-sm font-medium text-gray-400">Conta de Gás (Padrão)</label>
            <input
              id="defaultGasBill"
              type="number"
              step="0.01"
              value={defaultGasBill}
              onChange={(e) => setDefaultGasBill(e.target.value)}
              className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="defaultCondoFee" className="block mb-1 text-sm font-medium text-gray-400">Condomínio (Padrão)</label>
            <input
              id="defaultCondoFee"
              type="number"
              step="0.01"
              value={defaultCondoFee}
              onChange={(e) => setDefaultCondoFee(e.target.value)}
              className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="defaultApartmentFinancing" className="block mb-1 text-sm font-medium text-gray-400">Financiamento Apartamento (Padrão)</label>
            <input
              id="defaultApartmentFinancing"
              type="number"
              step="0.01"
              value={defaultApartmentFinancing}
              onChange={(e) => setDefaultApartmentFinancing(e.target.value)}
              className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="defaultInternetBill" className="block mb-1 text-sm font-medium text-gray-400">Internet (Padrão)</label>
            <input
              id="defaultInternetBill"
              type="number"
              step="0.01"
              value={defaultInternetBill}
              onChange={(e) => setDefaultInternetBill(e.target.value)}
              className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
          <div>
            <label htmlFor="defaultPixAmount" className="block mb-1 text-sm font-medium text-gray-400">Pix (Padrão)</label>
            <input
              id="defaultPixAmount"
              type="number"
              step="0.01"
              value={defaultPixAmount}
              onChange={(e) => setDefaultPixAmount(e.target.value)}
              className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}
        <button type="submit" className="w-full bg-primary text-white p-2 rounded-md hover:bg-blue-700 transition-colors">
          {isEditMode ? 'Salvar Alterações' : 'Criar Período'}
        </button>
      </form>
    </div>
  );
}
