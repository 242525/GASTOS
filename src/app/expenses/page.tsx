'use client';

import ExpenseList from '@/components/ExpenseList';
import Link from 'next/link';

export default function ExpensesPage() {
  // For now, we pass a static refresh key. 
  // This can be updated later if we add functionality that requires a refresh.
  const refreshKey = 0;

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-foreground">Todas as Despesas</h1>
        <Link href="/" className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
          Voltar
        </Link>
      </header>
      <div className="bg-card-background p-6 rounded-lg shadow-md">
        <ExpenseList refreshKey={refreshKey} />
      </div>
    </main>
  );
}
