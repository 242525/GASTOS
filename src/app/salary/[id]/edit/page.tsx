'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import SalaryForm from '@/components/SalaryForm';
import { Salary } from '@prisma/client';

const EditSalaryPage = () => {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  const [salary, setSalary] = useState<Salary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchSalary = async () => {
        try {
          setIsLoading(true);
          const response = await fetch(`/api/salaries/${id}`);
          if (!response.ok) {
            throw new Error('Falha ao buscar dados do salário.');
          }
          const data = await response.json();
          setSalary(data);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Ocorreu um erro desconhecido.');
        } finally {
          setIsLoading(false);
        }
      };
      fetchSalary();
    }
  }, [id]);

  const handleUpdate = async (formData: Omit<Salary, 'id'>) => {
    if (!id) return;

    try {
      const response = await fetch(`/api/salaries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Falha ao atualizar o salário.');
      }

      router.push('/salary'); // Redireciona para a página de salários após a atualização
      router.refresh(); // Atualiza os dados da página de salários
    } catch (error) {
      console.error('Erro:', error);
      alert('Não foi possível atualizar o salário.');
    }
  };

  if (isLoading) return <p className="text-center">Carregando...</p>;
  if (error) return <p className="text-center text-red-500">Erro: {error}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Salário</h1>
      {salary && (
        <SalaryForm
          onSubmit={handleUpdate}
          initialData={salary}
        />
      )}
    </div>
  );
};

export default EditSalaryPage;