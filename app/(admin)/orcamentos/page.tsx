"use client";

import { useEffect, useState } from "react";

interface Orcamento {
  id: string;
  clienteNome: string;
  pedraNome: string;
  valorTotal: number;
  status: string;
  createdAt: string;
}

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  async function fetchOrcamentos() {
    try {
      const response = await fetch("/api/orcamentos");
      const data = await response.json();
      setOrcamentos(data);
    } catch (error) {
      console.error("Erro ao carregar orçamentos:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Orçamentos Recebidos</h1>

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : orcamentos.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-600">
          Nenhum orçamento recebido ainda
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Pedra
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {orcamentos.map((orcamento) => (
                <tr key={orcamento.id}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {orcamento.clienteNome || "-"}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {orcamento.pedraNome}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                    R$ {orcamento.valorTotal.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      orcamento.status === "pendente"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-100 text-green-800"
                    }`}>
                      {orcamento.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(orcamento.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
