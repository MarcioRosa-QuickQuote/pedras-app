"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

export default function LinksPage() {
  const [descricao, setDescricao] = useState("");
  const [links, setLinks] = useState<Array<{ id: string; token: string; descricao: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  async function generateLink() {
    setLoading(true);
    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ descricao }),
      });
      const link = await response.json();
      setLinks([link, ...links]);
      setDescricao("");
    } catch (error) {
      alert("Erro ao gerar link");
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(token: string) {
    const url = `${window.location.origin}/orcamento/${token}`;
    navigator.clipboard.writeText(url);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Gerar Links para Clientes</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição do Link (opcional)
            </label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Ex: Banheiro suite - Condomínio X"
            />
          </div>

          <button
            onClick={generateLink}
            disabled={loading}
            className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Gerando..." : "Gerar Novo Link"}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {links.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-600">
            Nenhum link gerado ainda
          </div>
        ) : (
          links.map((link) => (
            <div key={link.id} className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold text-gray-900">{link.descricao || "Sem descrição"}</p>
                  <code className="text-sm text-gray-600">
                    /orcamento/{link.token}
                  </code>
                </div>
                <button
                  onClick={() => copyToClipboard(link.token)}
                  className="inline-flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  {copied === link.token ? (
                    <>
                      <Check size={16} />
                      Copiado!
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copiar URL
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
