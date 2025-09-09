'use client';

import { useState, useEffect } from 'react';
import { formatCurrencyBRL } from '@/utils/formatting';
import Link from 'next/link';
import ExpenseForm from '@/components/ExpenseForm';
import WeeklySummary from '@/components/WeeklySummary';
import { BillingPeriod, FixedExpense } from '@prisma/client';

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState<number | null>(null);
  const [isLoadingTotalExpenses, setIsLoadingTotalExpenses] = useState(true);
  const [errorTotalExpenses, setErrorTotalExpenses] = useState<string | null>(null);
  const [currentBillingPeriod, setCurrentBillingPeriod] = useState<BillingPeriod | null>(null);
  const [isLoadingBillingPeriod, setIsLoadingBillingPeriod] = useState(true);
  const [errorBillingPeriod, setErrorBillingPeriod] = useState<string | null>(null);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [isLoadingFixedExpenses, setIsLoadingFixedExpenses] = useState(true);
  const [errorFixedExpenses, setErrorFixedExpenses] = useState<string | null>(null);
  const [totalDefaultMonthlyExpenses, setTotalDefaultMonthlyExpenses] = useState<number | null>(null);
  const [totalFixedExpenses, setTotalFixedExpenses] = useState<number | null>(null);

  const handleExpenseAdded = () => {
    setRefreshKey((oldKey) => oldKey + 1);
  };

  useEffect(() => {
    const fetchTotalExpenses = async () => {
      try {
        setIsLoadingTotalExpenses(true);
        const response = await fetch('/api/reports/consolidated');
        if (!response.ok) {
          throw new Error('Falha ao buscar o total de despesas.');
        }
        const data = await response.json();
        setTotalExpenses(data.totalExpenses);
      } catch (err) {
        setErrorTotalExpenses(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      } finally {
        setIsLoadingTotalExpenses(false);
      }
    };

    const fetchCurrentBillingPeriod = async () => {
      try {
        setIsLoadingBillingPeriod(true);
        const response = await fetch('/api/billing-periods/current');
        if (!response.ok) {
          if (response.status === 404) {
            setCurrentBillingPeriod(null);
            return;
          }
          throw new Error('Falha ao buscar o período de faturamento atual.');
        }
        const data = await response.json();
        setCurrentBillingPeriod(data);
      } catch (err) {
        setErrorBillingPeriod(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      } finally {
        setIsLoadingBillingPeriod(false);
      }
    };

    fetchTotalExpenses();
    fetchCurrentBillingPeriod();
  }, [refreshKey]);

  useEffect(() => {
    const fetchFixedExpenses = async (billingPeriodId: number) => {
      try {
        setIsLoadingFixedExpenses(true);
        const response = await fetch(`/api/fixed-expenses?billingPeriodId=${billingPeriodId}`);
        if (!response.ok) {
          throw new Error('Falha ao buscar gastos fixos.');
        }
        const data = await response.json();
        setFixedExpenses(data);
      } catch (err) {
        setErrorFixedExpenses(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
      } finally {
        setIsLoadingFixedExpenses(false);
      }
    };

    if (currentBillingPeriod) {
      fetchFixedExpenses(currentBillingPeriod.id);

      const totalDefaults = (
        (currentBillingPeriod.defaultElectricityBill || 0) +
        (currentBillingPeriod.defaultGasBill || 0) +
        (currentBillingPeriod.defaultCondoFee || 0) +
        (currentBillingPeriod.defaultApartmentFinancing || 0) +
        (currentBillingPeriod.defaultInternetBill || 0) +
        (currentBillingPeriod.defaultPixAmount || 0)
      );
      setTotalDefaultMonthlyExpenses(totalDefaults);
    } else {
      setFixedExpenses([]);
      setTotalDefaultMonthlyExpenses(null);
      setTotalFixedExpenses(null);
    }
  }, [currentBillingPeriod]);

  useEffect(() => {
    if (fixedExpenses.length > 0) {
      const totalFixed = fixedExpenses.reduce((acc, exp) => acc + exp.amount, 0);
      setTotalFixedExpenses(totalFixed);
    } else {
      setTotalFixedExpenses(0);
    }
  }, [fixedExpenses]);

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-foreground">Painel Financeiro</h1>
        <nav className="flex gap-4">
          <Link href="/categories" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Categorias
          </Link>
          <Link href="/billing-periods" className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
            Períodos
          </Link>
          <Link href="/expenses" className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Todas as Despesas
          </Link>
          <Link href="/salary" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            Gerenciar Salário
          </Link>
          <Link href="/reports" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Ver Relatórios
          </Link>
        </nav>
      </header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 flex flex-col gap-8">
          <div className="bg-card-background p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Adicionar Despesa</h2>
            <ExpenseForm onExpenseAdded={handleExpenseAdded} />
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-card-background p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Total de Despesas (Variáveis + Fixas)</h2>
            {isLoadingTotalExpenses && <p className="text-center text-gray-400">Carregando total de despesas...</p>}
            {errorTotalExpenses && <p className="text-center text-red-400">Erro: {errorTotalExpenses}</p>}
            {totalExpenses !== null && !isLoadingTotalExpenses && (
              <p className="text-3xl font-bold text-red-400">{formatCurrencyBRL(totalExpenses)}</p>
            )}
          </div>

          <WeeklySummary currentBillingPeriod={currentBillingPeriod} />

          <div className="bg-card-background p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Gastos Fixos</h2>
            {isLoadingFixedExpenses && <p className="text-center text-gray-400">Carregando gastos fixos...</p>}
            {errorFixedExpenses && <p className="text-center text-red-400">Erro: {errorFixedExpenses}</p>}
            {fixedExpenses.length > 0 && !isLoadingFixedExpenses && (
              <>
                <div className="space-y-2">
                  {fixedExpenses.map((expense) => (
                    <div key={expense.id} className="flex justify-between items-center">
                      <span className="text-gray-400">{expense.description} ({expense.installmentNumber}/{expense.totalInstallments ?? '?'})</span>
                      <span className="font-medium text-red-400">{formatCurrencyBRL(expense.amount)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border-color my-4"></div>
                <div className="flex justify-between items-center font-bold text-lg">
                  <span className="text-orange-400">Total Fixo:</span>
                  <span className="text-orange-400">{formatCurrencyBRL(totalFixedExpenses ?? 0)}</span>
                </div>
              </>
            )}
            {fixedExpenses.length === 0 && !isLoadingFixedExpenses && !errorFixedExpenses && (
              <p className="text-center text-gray-400">Nenhum gasto fixo para este período.</p>
            )}
          </div>

          <div className="bg-card-background p-6 rounded-lg shadow-md mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-foreground">Gastos Mensais Padrão</h2>
            {isLoadingBillingPeriod && <p className="text-center text-gray-400">Carregando gastos...</p>}
            {errorBillingPeriod && <p className="text-center text-red-400">Erro: {errorBillingPeriod}</p>}
            {currentBillingPeriod && !isLoadingBillingPeriod && (
              <>
                <div className="space-y-2">
                  {currentBillingPeriod.defaultElectricityBill !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Conta de Luz:</span>
                      <span className="font-medium text-foreground">{formatCurrencyBRL(currentBillingPeriod.defaultElectricityBill)}</span>
                    </div>
                  )}
                   {currentBillingPeriod.defaultGasBill !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Conta de Gás:</span>
                      <span className="font-medium text-foreground">{formatCurrencyBRL(currentBillingPeriod.defaultGasBill)}</span>
                    </div>
                  )}
                  {currentBillingPeriod.defaultCondoFee !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Condomínio:</span>
                      <span className="font-medium text-foreground">{formatCurrencyBRL(currentBillingPeriod.defaultCondoFee)}</span>
                    </div>
                  )}
                  {currentBillingPeriod.defaultApartmentFinancing !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Financiamento Apartamento:</span>
                      <span className="font-medium text-foreground">{formatCurrencyBRL(currentBillingPeriod.defaultApartmentFinancing)}</span>
                    </div>
                  )}
                  {currentBillingPeriod.defaultInternetBill !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Internet:</span>
                      <span className="font-medium text-foreground">{formatCurrencyBRL(currentBillingPeriod.defaultInternetBill)}</span>
                    </div>
                  )}
                  {currentBillingPeriod.defaultPixAmount !== null && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Pix:</span>
                      <span className="font-medium text-foreground">{formatCurrencyBRL(currentBillingPeriod.defaultPixAmount)}</span>
                    </div>
                  )}
                </div>
                <div className="border-t border-border-color my-4"></div>
                <div className="flex justify-between items-center font-bold text-lg">
                  <span className="text-blue-400">Total Padrão:</span>
                  <span className="text-blue-400">{formatCurrencyBRL(totalDefaultMonthlyExpenses ?? 0)}</span>
                </div>
              </>
            )}
            {!currentBillingPeriod && !isLoadingBillingPeriod && !errorBillingPeriod && (
              <p className="text-center text-gray-400">Nenhum período de faturamento ativo.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
