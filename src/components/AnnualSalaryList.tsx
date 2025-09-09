'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Salary } from '@prisma/client';
import { formatCurrencyBRL } from '@/utils/formatting';

const monthNames = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export default function AnnualSalaryList({ refreshKey }: { refreshKey: number }) {
  const [year, setYear] = useState(new Date().getFullYear());
  const [salaries, setSalaries] = useState<Salary[]>([]);

  useEffect(() => {
    fetch(`/api/salaries?year=${year}`)
      .then((res) => res.json())
      .then(setSalaries);
  }, [year, refreshKey]);

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este salário?')) {
      await fetch(`/api/salaries/${id}`, { method: 'DELETE' });
      // Atualiza a lista removendo o item deletado
      setSalaries(salaries.filter(s => s.id !== id));
    }
  };

  const totalAnnualSalary = salaries.reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="bg-card-background p-6 rounded-lg shadow-md border border-border-color mt-8">
      <h2 className="text-2xl font-semibold mb-4 text-foreground">Resumo Anual de Salários</h2>
      <div className="mb-4">
        <label htmlFor="salary-year" className="block mb-2 text-sm font-medium text-gray-400">Selecione o Ano</label>
        <input
          id="salary-year"
          type="number"
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border-color">
          <thead className="bg-background">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Mês</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Valor</th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-card-background divide-y divide-border-color">
            {salaries.map((salary) => (
              <tr key={salary.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{monthNames[salary.month - 1]}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{formatCurrencyBRL(salary.amount)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  <Link href={`/salary/${salary.id}/edit`} className="text-blue-400 hover:text-blue-300">
                    Editar
                  </Link>
                  <button onClick={() => handleDelete(salary.id)} className="text-red-400 hover:text-red-300">
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <hr className="my-4 border-border-color" />
      <div className="flex justify-between font-bold text-lg text-foreground">
        <span>Total Anual:</span>
        <span className="text-green-400">{formatCurrencyBRL(totalAnnualSalary)}</span>
      </div>
    </div>
  );
}
