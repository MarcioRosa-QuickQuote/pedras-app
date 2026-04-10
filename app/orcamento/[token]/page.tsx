"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { calcularOrcamento, formatarMoeda } from "@/lib/calculos";
import { Download, Send } from "lucide-react";
import Link from "next/link";

interface Pedra {
  id: string;
  nome: string;
  descricao: string;
  precoPorM2: number;
  imagemUrl: string;
}

interface OrcamentoData {
  comprimento: number;
  largura: number;
  alturaRodabancada: number;
  alturaTesteira: number;
  numeroUbas: number;
  incluiInstalacao: boolean;
  clienteNome: string;
  clienteEmail: string;
  clienteTel: string;
}

export default function OrcamentoPage() {
  const params = useParams();
  const token = params.token as string;

  const [pedras, setPedras] = useState<Pedra[]>([]);
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [selectedPedra, setSelectedPedra] = useState<Pedra | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dados, setDados] = useState<OrcamentoData>({
    comprimento: 1.4,
    largura: 0.45,
    alturaRodabancada: 0.1,
    alturaTesteira: 0.2,
    numeroUbas: 1,
    incluiInstalacao: false,
    clienteNome: "",
    clienteEmail: "",
    clienteTel: "",
  });

  const [resultado, setResultado] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedPedra && configs) {
      const config = {
        precoPorM2: selectedPedra.precoPorM2,
        descontoCorteUba: parseFloat(configs.desconto_corte_cuba_m2) || 0.09,
        descontoAvistaPct: parseFloat(configs.desconto_avista_pct) || 10,
        valorInstalacaoM2: parseFloat(configs.valor_instalacao_m2) || 100,
        numeroParcelas: parseInt(configs.parcelas_cartao) || 4,
      };

      const result = calcularOrcamento(dados, config);
      setResultado(result);
    }
  }, [selectedPedra, dados, configs]);

  async function fetchInitialData() {
    try {
      setLoading(true);
      // Buscar link
      const linkResponse = await fetch(`/api/links/${token}`);
      if (!linkResponse.ok) throw new Error("Link não encontrado");

      // Buscar pedras
      const pedrasResponse = await fetch("/api/pedras");
      const pedrasData = await pedrasResponse.json();
      setPedras(pedrasData);

      // Buscar configurações
      const configsResponse = await fetch("/api/configuracoes");
      const configsData = await configsResponse.json();
      setConfigs(configsData);

      if (pedrasData.length > 0) {
        setSelectedPedra(pedrasData[0]);
      }
    } catch (err) {
      setError("Erro ao carregar dados. Link inválido ou expirado.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    if (!selectedPedra || !dados.clienteNome) {
      alert("Preencha todos os campos obrigatórios");
      return;
    }

    setSubmitting(true);

    try {
      // Salvar orçamento
      const vendedorId = selectedPedra.id; // placeholder
      const response = await fetch("/api/orcamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkId: token,
          vendedorId: "clr1", // TODO: pegar do link
          clienteNome: dados.clienteNome,
          clienteEmail: dados.clienteEmail,
          clienteTel: dados.clienteTel,
          pedraId: selectedPedra.id,
          pedraNome: selectedPedra.nome,
          dados: JSON.stringify(dados),
          valorTotal: resultado.valorTotal,
          valorAvista: resultado.valorAvista,
          incluiInstalacao: dados.incluiInstalacao,
        }),
      });

      if (!response.ok) throw new Error("Erro ao salvar orçamento");

      // Gerar WhatsApp
      const mensagem = gerarMensagemWhatsApp();
      const urlWhatsApp = `https://wa.me/${configs.telefone_whatsapp}?text=${encodeURIComponent(
        mensagem
      )}`;

      window.open(urlWhatsApp, "_blank");
    } catch (err) {
      alert("Erro ao processar orçamento");
    } finally {
      setSubmitting(false);
    }
  }

  function gerarMensagemWhatsApp(): string {
    return `Olá! Meu nome é ${dados.clienteNome}.

Gostaria de fazer um orçamento com os seguintes dados:

📦 Tipo de Pedra: ${selectedPedra?.nome}
📏 Bancada: ${dados.comprimento}m x ${dados.largura}m
📐 Rodabancada: ${dados.alturaRodabancada}m de altura
📐 Testeira: ${dados.alturaTesteira}m de altura
🔲 Número de Cubas: ${dados.numeroUbas}

💰 Valor Total: ${formatarMoeda(resultado?.valorTotal || 0)}
✨ Valor à Vista: ${formatarMoeda(resultado?.valorAvista || 0)}
💳 Parcelado: ${resultado?.numeroParcelas}x de ${formatarMoeda(
      resultado?.valorParcela || 0
    )}

${dados.incluiInstalacao ? "✅ Inclui instalação" : "❌ Sem instalação"}

Aguardo retorno!`;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/" className="text-indigo-600 hover:underline">
            Voltar
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Orçamento de Bancadas
          </h1>
          <p className="text-gray-600">
            Preencha os dados abaixo para gerar seu orçamento
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna esquerda: Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dados Pessoais */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Seus Dados</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <input
                    type="text"
                    required
                    value={dados.clienteNome}
                    onChange={(e) =>
                      setDados({ ...dados, clienteNome: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={dados.clienteEmail}
                    onChange={(e) =>
                      setDados({ ...dados, clienteEmail: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    type="tel"
                    value={dados.clienteTel}
                    onChange={(e) =>
                      setDados({ ...dados, clienteTel: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>

            {/* Seleção de Pedra */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Escolha a Pedra</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pedras.map((pedra) => (
                  <button
                    key={pedra.id}
                    onClick={() => setSelectedPedra(pedra)}
                    className={`border-2 rounded-lg p-3 text-left transition ${
                      selectedPedra?.id === pedra.id
                        ? "border-indigo-600 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {pedra.imagemUrl && (
                      <img
                        src={pedra.imagemUrl}
                        alt={pedra.nome}
                        className="w-full h-24 object-cover rounded mb-2"
                      />
                    )}
                    <p className="font-semibold text-gray-900">{pedra.nome}</p>
                    <p className="text-sm text-gray-600">
                      R$ {pedra.precoPorM2.toFixed(2)}/m²
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Medidas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Medidas</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Comprimento (m)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dados.comprimento}
                    onChange={(e) =>
                      setDados({
                        ...dados,
                        comprimento: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Largura (m)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dados.largura}
                    onChange={(e) =>
                      setDados({
                        ...dados,
                        largura: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Altura Rodabancada (m)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dados.alturaRodabancada}
                    onChange={(e) =>
                      setDados({
                        ...dados,
                        alturaRodabancada: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Altura Testeira (m)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={dados.alturaTesteira}
                    onChange={(e) =>
                      setDados({
                        ...dados,
                        alturaTesteira: parseFloat(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Cubas
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    value={dados.numeroUbas}
                    onChange={(e) =>
                      setDados({
                        ...dados,
                        numeroUbas: parseInt(e.target.value),
                      })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Toggle Instalação */}
              <div className="mt-4 flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dados.incluiInstalacao}
                    onChange={(e) =>
                      setDados({
                        ...dados,
                        incluiInstalacao: e.target.checked,
                      })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Incluir Instalação
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Coluna direita: Preview */}
          <div className="lg:col-span-1">
            {/* Card do Orçamento */}
            <div className="bg-white rounded-lg shadow sticky top-8 overflow-hidden">
              {selectedPedra?.imagemUrl && (
                <img
                  src={selectedPedra.imagemUrl}
                  alt={selectedPedra.nome}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6 space-y-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedPedra?.nome}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {selectedPedra?.descricao}
                  </p>
                </div>

                {resultado && (
                  <>
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Área Total:</span>
                        <span className="font-semibold">
                          {resultado.areaTotal.toFixed(2)} m²
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Valor Material:</span>
                        <span className="font-semibold">
                          {formatarMoeda(resultado.valorMaterial)}
                        </span>
                      </div>
                      {dados.incluiInstalacao && (
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>+ Instalação:</span>
                          <span className="font-semibold">
                            {formatarMoeda(resultado.valorInstalacao)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="border-t pt-4 space-y-2">
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-xs text-green-700 mb-1">À Vista</p>
                        <p className="text-2xl font-bold text-green-700">
                          {formatarMoeda(resultado.valorAvista)}
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          Desconto {configs.desconto_avista_pct || 10}%
                        </p>
                      </div>

                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-xs text-blue-700 mb-1">No Cartão</p>
                        <p className="text-lg font-bold text-blue-700">
                          {formatarMoeda(resultado.valorTotal)}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          {resultado.numeroParcelas}x de{" "}
                          {formatarMoeda(resultado.valorParcela)}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 text-center pt-2">
                      Válido por 15 dias
                    </div>
                  </>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting || !selectedPedra}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  <Send size={18} />
                  {submitting ? "Enviando..." : "Enviar por WhatsApp"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
