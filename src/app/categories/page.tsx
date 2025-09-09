'use client';

import { useState } from 'react';
import Link from 'next/link';
import CategoryForm from '@/components/CategoryForm';
import CategoryList from '@/components/CategoryList';

export default function CategoriesPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCategoryAdded = () => {
    setRefreshKey((oldKey) => oldKey + 1);
  };

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Gerenciar Categorias</h1>
        <Link href="/" className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          Voltar para o Início
        </Link>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <CategoryForm onCategoryAdded={handleCategoryAdded} />
        <CategoryList refreshKey={refreshKey} />
      </div>
    </main>
  );
}
