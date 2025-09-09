'use client';

import { useState, useEffect } from 'react';
import { formatCurrencyBRL } from '@/utils/formatting';
import { Doughnut, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title
);

interface ReportData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  expensesByCategory: Record<string, number>;
}

interface BillingPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

const ConsolidatedReport = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [billingPeriods, setBillingPeriods] = useState<BillingPeriod[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillingPeriods = async () => {
      try {
        const response = await fetch('/api/billing-periods');
        if (!response.ok) {
          throw new Error('Falha ao buscar os períodos de faturamento.');
        }
        const data = await response.json();
        setBillingPeriods(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.'
        );
      }
    };

    fetchBillingPeriods();
  }, []);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setIsLoading(true);
        let url = '/api/reports/consolidated';
        const params = new URLSearchParams();
        if (selectedPeriod !== 'all') {
          params.append('billingPeriodId', selectedPeriod);
        } else if (selectedYear !== 'all') {
          params.append('year', selectedYear);
        }

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Falha ao buscar os dados do relatório.');
        }
        const data = await response.json();
        setReportData(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchReportData();
  }, [selectedPeriod, selectedYear]);

  const availableYears = Array.from(
    new Set(billingPeriods.map((p) => new Date(p.startDate).getFullYear()))
  ).sort((a, b) => b - a);

  if (isLoading) {
    return <p className="text-center text-gray-400">Carregando...</p>;
  }

  if (error) {
    return <p className="text-center text-red-400">Erro: {error}</p>;
  }

  if (!reportData) {
    return <p className="text-center text-gray-400">Nenhum dado disponível.</p>;
  }

  const { totalIncome, totalExpenses, balance, expensesByCategory } =
    reportData;

  const doughnutData = {
    labels: Object.keys(expensesByCategory),
    datasets: [
      {
        data: Object.values(expensesByCategory),
        backgroundColor: [
          '#4c51bf',
          '#667eea',
          '#7f9cf5',
          '#a3bffa',
          '#c3dafe',
          '#eeb4b4',
          '#f5d0d0',
        ],
        hoverBackgroundColor: [
          '#4c51bf',
          '#667eea',
          '#7f9cf5',
          '#a3bffa',
          '#c3dafe',
          '#eeb4b4',
          '#f5d0d0',
        ],
      },
    ],
  };

  const barData = {
    labels: ['Receitas vs Despesas'],
    datasets: [
      {
        label: 'Receitas',
        data: [totalIncome],
        backgroundColor: '#48bb78',
      },
      {
        label: 'Despesas',
        data: [totalExpenses],
        backgroundColor: '#f56565',
      },
    ],
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">
          Relatório Consolidado
        </h2>
        <div className="flex space-x-4">
          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value);
              setSelectedPeriod('all');
            }}
            className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
          >
            <option value="all">Todos os Anos</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
          <select
            value={selectedPeriod}
            onChange={(e) => {
              setSelectedPeriod(e.target.value);
              setSelectedYear('all');
            }}
            className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
          >
            <option value="all">Todos os Períodos</option>
            {billingPeriods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-900 p-4 rounded-lg shadow-lg">
          <h3 className="text-md font-semibold text-green-300">
            Total de Receitas
          </h3>
          <p className="text-2xl font-bold text-green-100">
            {formatCurrencyBRL(totalIncome)}
          </p>
        </div>
        <div className="bg-red-900 p-4 rounded-lg shadow-lg">
          <h3 className="text-md font-semibold text-red-300">
            Total de Despesas
          </h3>
          <p className="text-2xl font-bold text-red-100">
            {formatCurrencyBRL(totalExpenses)}
          </p>
        </div>
        <div
          className={`p-4 rounded-lg shadow-lg ${
            balance >= 0 ? 'bg-blue-900' : 'bg-yellow-900'
          }`}
        >
          <h3
            className={`text-md font-semibold ${
              balance >= 0 ? 'text-blue-300' : 'text-yellow-300'
            }`}
          >
            Saldo
          </h3>
          <p
            className={`text-2xl font-bold ${
              balance >= 0 ? 'text-blue-100' : 'text-yellow-100'
            }`}
          >
            {formatCurrencyBRL(balance)}
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <div className="bg-card-background p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold text-foreground mb-4">
            Despesas por Categoria
          </h3>
          <Doughnut data={doughnutData} />
        </div>
        <div className="bg-card-background p-4 rounded-lg shadow">
          <h3 className="text-xl font-bold text-foreground mb-4">
            Receitas vs Despesas
          </h3>
          <Bar data={barData} />
        </div>
      </div>

      {/* Despesas por Categoria (Tabela) */}
      <div>
        <h3 className="text-xl font-bold text-foreground mb-4">
          Detalhes das Despesas por Categoria
        </h3>
        <div className="bg-card-background p-4 rounded-lg shadow">
          <ul className="space-y-3">
            {Object.entries(expensesByCategory).map(([category, amount]) => (
              <li
                key={category}
                className="flex justify-between items-center border-b border-border-color pb-2"
              >
                <span className="text-gray-400">{category}</span>
                <span className="font-semibold text-foreground">
                  {formatCurrencyBRL(amount)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ConsolidatedReport;