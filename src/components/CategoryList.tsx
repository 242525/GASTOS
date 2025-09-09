'use client';

import { useState, useEffect } from 'react';
import { Category } from '@prisma/client';

export default function CategoryList({ refreshKey }: { refreshKey: number }) {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then((res) => res.json())
      .then(setCategories);
  }, [refreshKey]);

  return (
    <div className="bg-card-background p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4 text-foreground">Categorias Existentes</h2>
        <ul className="space-y-2">
            {categories.map((cat) => (
                <li key={cat.id} className="p-3 bg-background rounded-md text-foreground">
                    {cat.name}
                </li>
            ))}
        </ul>
    </div>
  );
}
