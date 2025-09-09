'use client';

import { useState } from 'react';

export default function CategoryForm({ onCategoryAdded }: { onCategoryAdded: () => void }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const response = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    if (response.ok) {
      setName('');
      onCategoryAdded();
    } else {
      const { error } = await response.json();
      setError(error || 'Failed to create category');
    }
  };

  return (
    <div className="bg-card-background p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Criar Nova Categoria</h2>
        <form onSubmit={handleSubmit}>
            <div className="mb-4">
                <label htmlFor="name" className="block mb-1 text-sm font-medium text-gray-400">Nome da Categoria</label>
                <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-2 bg-background border border-border-color rounded-md focus:ring-primary focus:border-primary"
                    required
                />
            </div>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button type="submit" className="w-full bg-primary text-foreground p-2 rounded-md hover:bg-blue-700 transition-colors">
                Criar Categoria
            </button>
        </form>
    </div>
  );
}
