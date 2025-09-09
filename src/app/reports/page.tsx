import ConsolidatedReport from '@/components/ConsolidatedReport';
import Link from 'next/link';

const ReportsPage = () => {
  return (
    <div className="container mx-auto p-4">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios</h1>
          <p className="text-md text-gray-600">Visualize um resumo de suas finanças.</p>
        </div>
        <Link href="/" className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded">
          Voltar
        </Link>
      </header>
      <main>
        <ConsolidatedReport />
      </main>
    </div>
  );
};

export default ReportsPage;
