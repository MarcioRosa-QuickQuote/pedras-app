"use client";

import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Links Gerados
          </h3>
          <p className="text-3xl font-bold text-indigo-600">0</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Orçamentos Recebidos
          </h3>
          <p className="text-3xl font-bold text-green-600">0</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600 mb-2">
            Valor Total Orçado
          </h3>
          <p className="text-3xl font-bold text-blue-600">R$ 0,00</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Orçamentos Recentes</h2>
        <p className="text-gray-600">Nenhum orçamento recebido ainda.</p>
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">Bem-vindo, {session?.user?.email}!</h3>
        <p className="text-blue-800 mb-4">
          Comece cadastrando as pedras que sua empresa oferece.
        </p>
        <a
          href="/admin/pedras"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Cadastrar Pedra
        </a>
      </div>
    </div>
  );
}
