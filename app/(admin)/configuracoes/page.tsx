"use client";

import { useEffect, useState } from "react";

export default function ConfiguracoesPage() {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchConfigs();
  }, []);

  async function fetchConfigs() {
    try {
      const response = await fetch("/api/configuracoes");
      const data = await response.json();
      setConfigs(data);
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    try {
      await fetch("/api/configuracoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configs),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      alert("Erro ao salvar configurações");
    }
  }

  if (loading) return <div className="text-center py-8">Carregando...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Configurações</h1>

      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          ✓ Configurações salvas com sucesso!
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome da Empresa
          </label>
          <input
            type="text"
            value={configs["nome_empresa"] || ""}
            onChange={(e) =>
              setConfigs({ ...configs, nome_empresa: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone WhatsApp (com código +55)
          </label>
          <input
            type="tel"
            value={configs["telefone_whatsapp"] || ""}
            onChange={(e) =>
              setConfigs({ ...configs, telefone_whatsapp: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="5585999999999"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Desconto à Vista (%)
          </label>
          <input
            type="number"
            step="0.01"
            value={configs["desconto_avista_pct"] || ""}
            onChange={(e) =>
              setConfigs({ ...configs, desconto_avista_pct: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="10"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de Parcelas (cartão)
          </label>
          <input
            type="number"
            value={configs["parcelas_cartao"] || ""}
            onChange={(e) =>
              setConfigs({ ...configs, parcelas_cartao: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Valor de Instalação (R$/m²)
          </label>
          <input
            type="number"
            step="0.01"
            value={configs["valor_instalacao_m2"] || ""}
            onChange={(e) =>
              setConfigs({ ...configs, valor_instalacao_m2: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Área Desconto por Cuba (m²)
          </label>
          <input
            type="number"
            step="0.01"
            value={configs["desconto_corte_cuba_m2"] || ""}
            onChange={(e) =>
              setConfigs({
                ...configs,
                desconto_corte_cuba_m2: e.target.value,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="0.09"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Salvar Configurações
        </button>
      </div>
    </div>
  );
}
