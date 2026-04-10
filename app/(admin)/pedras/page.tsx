"use client";

import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import Link from "next/link";

interface Pedra {
  id: string;
  nome: string;
  descricao: string;
  precoPorM2: number;
  imagemUrl: string;
  ativa: boolean;
}

export default function PedrasPage() {
  const [pedras, setPedras] = useState<Pedra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPedras();
  }, []);

  async function fetchPedras() {
    try {
      setLoading(true);
      const response = await fetch("/api/pedras");
      const data = await response.json();
      setPedras(data);
    } catch (err) {
      setError("Erro ao carregar pedras");
    } finally {
      setLoading(false);
    }
  }

  async function deletePedra(id: string) {
    if (!confirm("Tem certeza que deseja deletar esta pedra?")) return;

    try {
      await fetch(`/api/pedras/${id}`, { method: "DELETE" });
      setPedras(pedras.filter((p) => p.id !== id));
    } catch (err) {
      setError("Erro ao deletar pedra");
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Pedras</h1>
        <Link
          href="/admin/pedras/nova"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          <Plus size={20} />
          Nova Pedra
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Carregando...</div>
      ) : pedras.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">Nenhuma pedra cadastrada</p>
          <Link
            href="/admin/pedras/nova"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Cadastrar Primeira Pedra
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pedras.map((pedra) => (
            <div
              key={pedra.id}
              className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
            >
              {pedra.imagemUrl && (
                <img
                  src={pedra.imagemUrl}
                  alt={pedra.nome}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1">
                  {pedra.nome}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {pedra.descricao}
                </p>
                <p className="text-xl font-bold text-indigo-600 mb-4">
                  R$ {pedra.precoPorM2.toFixed(2)}/m²
                </p>
                <div className="flex gap-2">
                  <Link
                    href={`/admin/pedras/${pedra.id}/editar`}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
                  >
                    <Pencil size={16} />
                    Editar
                  </Link>
                  <button
                    onClick={() => deletePedra(pedra.id)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
                  >
                    <Trash2 size={16} />
                    Deletar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
