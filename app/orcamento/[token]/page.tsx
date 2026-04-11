"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { calcularOrcamento, formatarMoeda } from "@/lib/calculos";
import { MODELOS_BANCADA, ModeloBancada } from "@/lib/bancadas";
import BancadaSVG from "@/components/BancadaSVG";
import { Send } from "lucide-react";

interface Pedra {
  id: string;
  nome: string;
  descricao: string;
  precoPorM2: number;
  imagemUrl: string;
}

export default function OrcamentoPage() {
  const params = useParams();
  const token = params.token as string;

  const [pedras, setPedras] = useState<Pedra[]>([]);
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [linkData, setLinkData] = useState<any>(null);
  const [selectedPedra, setSelectedPedra] = useState<Pedra | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Modelo de bancada
  const [tipoAmbiente, setTipoAmbiente] = useState<"banheiro" | "cozinha">("banheiro");
  const [modeloId, setModeloId] = useState("banheiro-simples");
  const modelo = MODELOS_BANCADA.find((m) => m.id === modeloId)!;

  // Medidas
  const [comprimento, setComprimento] = useState(modelo.campos.comprimento.default);
  const [largura, setLargura] = useState(modelo.campos.largura.default);
  const [comprimento2, setComprimento2] = useState(modelo.campos.comprimento2?.default ?? 0.8);
  const [numCubas, setNumCubas] = useState(modelo.numCubasDefault);
  const [incluiInstalacao, setIncluiInstalacao] = useState(false);

  // Cliente
  const [clienteNome, setClienteNome] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteTel, setClienteTel] = useState("");

  // ao trocar modelo, resetar medidas
  function selecionarModelo(id: string) {
    const m = MODELOS_BANCADA.find((x) => x.id === id)!;
    setModeloId(id);
    setComprimento(m.campos.comprimento.default);
    setLargura(m.campos.largura.default);
    setComprimento2(m.campos.comprimento2?.default ?? 0.8);
    setNumCubas(m.numCubasDefault);
  }

  // cálculo em tempo real
  const resultado = selectedPedra
    ? calcularOrcamento(
        {
          comprimento,
          largura,
          alturaRodabancada: 0.1,
          alturaTesteira: 0.2,
          numeroUbas: numCubas,
          incluiInstalacao,
        },
        {
          precoPorM2: selectedPedra.precoPorM2,
          descontoCorteUba: parseFloat(configs.desconto_corte_cuba_m2) || 0.09,
          descontoAvistaPct: parseFloat(configs.desconto_avista_pct) || 10,
          valorInstalacaoM2: parseFloat(configs.valor_instalacao_m2) || 100,
          numeroParcelas: parseInt(configs.parcelas_cartao) || 4,
        }
      )
    : null;

  useEffect(() => {
    async function load() {
      try {
        const [linkRes, pedrasRes, configsRes] = await Promise.all([
          fetch(`/api/links/${token}`),
          fetch("/api/pedras"),
          fetch("/api/configuracoes"),
        ]);
        if (!linkRes.ok) throw new Error("Link inválido");
        setLinkData(await linkRes.json());
        const p = await pedrasRes.json();
        setPedras(p);
        if (p.length > 0) setSelectedPedra(p[0]);
        setConfigs(await configsRes.json());
      } catch {
        setError("Link inválido ou expirado.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function handleSubmit() {
    if (!selectedPedra || !clienteNome) {
      alert("Preencha seu nome e escolha uma pedra.");
      return;
    }
    setSubmitting(true);
    try {
      await fetch("/api/orcamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkId: linkData?.id,
          vendedorId: linkData?.vendedorId,
          clienteNome, clienteEmail, clienteTel,
          pedraId: selectedPedra.id,
          pedraNome: selectedPedra.nome,
          dados: JSON.stringify({ comprimento, largura, comprimento2, numCubas, modelo: modeloId, incluiInstalacao }),
          valorTotal: resultado?.valorTotal ?? 0,
          valorAvista: resultado?.valorAvista ?? 0,
          incluiInstalacao,
        }),
      });

      const msg = `Olá! Sou ${clienteNome} e gostaria de um orçamento:

🚿 Ambiente: ${tipoAmbiente === "banheiro" ? "Banheiro" : "Cozinha"}
📐 Modelo: ${modelo.nome}
🪨 Pedra: ${selectedPedra.nome}
📏 Medidas: ${comprimento.toFixed(2)}m x ${largura.toFixed(2)}m${modelo.campos.comprimento2 ? ` + lateral ${comprimento2.toFixed(2)}m` : ""}
🔲 Cubas: ${numCubas}
${incluiInstalacao ? "✅ Com instalação" : "❌ Sem instalação"}

💰 À Vista: ${formatarMoeda(resultado?.valorAvista ?? 0)}
💳 Cartão: ${resultado?.numeroParcelas}x de ${formatarMoeda(resultado?.valorParcela ?? 0)}`;

      window.open(
        `https://wa.me/${configs.telefone_whatsapp}?text=${encodeURIComponent(msg)}`,
        "_blank"
      );
    } catch {
      alert("Erro ao processar orçamento.");
    } finally {
      setSubmitting(false);
    }
  }

  const modelosFiltrados = MODELOS_BANCADA.filter((m) => m.tipo === tipoAmbiente);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Carregando...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Orçamento de Bancada</h1>
          <p className="text-gray-500 mt-1">Escolha o modelo e insira as medidas para receber seu orçamento</p>
        </div>

        {/* ── Seus dados ── */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">Seus dados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input value={clienteNome} onChange={(e) => setClienteNome(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="Seu nome" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={clienteEmail} onChange={(e) => setClienteEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="email@exemplo.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input type="tel" value={clienteTel} onChange={(e) => setClienteTel(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2" placeholder="(85) 99999-9999" />
            </div>
          </div>
        </div>

        {/* ── Ambiente + Modelo ── */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">Tipo de bancada</h2>

          {/* Toggle Banheiro / Cozinha */}
          <div className="flex gap-3 mb-5">
            {(["banheiro", "cozinha"] as const).map((t) => (
              <button key={t} onClick={() => { setTipoAmbiente(t); selecionarModelo(MODELOS_BANCADA.find((m) => m.tipo === t)!.id); }}
                className={`flex-1 py-2 rounded-lg font-semibold border-2 transition ${tipoAmbiente === t ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-gray-200 text-gray-600 hover:border-gray-300"}`}>
                {t === "banheiro" ? "🚿 Banheiro" : "🍳 Cozinha"}
              </button>
            ))}
          </div>

          {/* Grid de modelos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            {modelosFiltrados.map((m) => (
              <button key={m.id} onClick={() => selecionarModelo(m.id)}
                className={`border-2 rounded-lg p-3 text-left transition ${modeloId === m.id ? "border-indigo-600 bg-indigo-50" : "border-gray-200 hover:border-indigo-300"}`}>
                <p className="font-semibold text-sm text-gray-900">{m.nome}</p>
                <p className="text-xs text-gray-500 mt-0.5">{m.descricao}</p>
              </button>
            ))}
          </div>

          {/* Preview SVG + campos lado a lado */}
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* SVG planta */}
            <div className="flex-shrink-0 bg-gray-50 border border-gray-200 rounded-xl p-2">
              <BancadaSVG
                modelo={modelo}
                comprimento={comprimento}
                largura={largura}
                comprimento2={comprimento2}
                numCubas={numCubas}
              />
            </div>

            {/* Campos de medida */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {modelo.campos.comprimento.label}
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" step="0.01" min="0.1" value={comprimento}
                    onChange={(e) => setComprimento(parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  <span className="text-gray-500 text-sm whitespace-nowrap">metros</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {modelo.campos.largura.label}
                </label>
                <div className="flex items-center gap-2">
                  <input type="number" step="0.01" min="0.1" value={largura}
                    onChange={(e) => setLargura(parseFloat(e.target.value) || 0)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  <span className="text-gray-500 text-sm whitespace-nowrap">metros</span>
                </div>
              </div>

              {modelo.campos.comprimento2 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {modelo.campos.comprimento2.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input type="number" step="0.01" min="0.1" value={comprimento2}
                      onChange={(e) => setComprimento2(parseFloat(e.target.value) || 0)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                    <span className="text-gray-500 text-sm whitespace-nowrap">metros</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Número de cubas</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setNumCubas(Math.max(0, numCubas - 1))}
                    className="w-9 h-9 rounded-full border-2 border-gray-300 font-bold text-gray-600 hover:border-indigo-400">−</button>
                  <span className="text-xl font-bold w-6 text-center">{numCubas}</span>
                  <button onClick={() => setNumCubas(Math.min(4, numCubas + 1))}
                    className="w-9 h-9 rounded-full border-2 border-gray-300 font-bold text-gray-600 hover:border-indigo-400">+</button>
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer mt-2">
                <input type="checkbox" checked={incluiInstalacao}
                  onChange={(e) => setIncluiInstalacao(e.target.checked)}
                  className="w-5 h-5 rounded accent-indigo-600" />
                <span className="font-medium text-gray-700">Incluir instalação</span>
              </label>
            </div>
          </div>
        </div>

        {/* ── Escolha a Pedra ── */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">Escolha o tipo de pedra</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {pedras.map((pedra) => (
              <button key={pedra.id} onClick={() => setSelectedPedra(pedra)}
                className={`border-2 rounded-lg overflow-hidden text-left transition ${selectedPedra?.id === pedra.id ? "border-indigo-600 ring-2 ring-indigo-200" : "border-gray-200 hover:border-indigo-300"}`}>
                <img src={pedra.imagemUrl} alt={pedra.nome} className="w-full h-28 object-cover" />
                <div className="p-3">
                  <p className="font-semibold text-gray-900 text-sm">{pedra.nome}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{pedra.descricao}</p>
                  <p className="text-indigo-600 font-bold text-sm mt-1">R$ {pedra.precoPorM2.toFixed(0)}/m²</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Resumo do orçamento ── */}
        {resultado && selectedPedra && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-lg font-bold mb-4">Resumo do orçamento</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 text-sm text-gray-600">
              <div>Modelo: <span className="font-semibold text-gray-900">{modelo.nome}</span></div>
              <div>Pedra: <span className="font-semibold text-gray-900">{selectedPedra.nome}</span></div>
              <div>Área calculada: <span className="font-semibold text-gray-900">{resultado.areaTotal.toFixed(2)} m²</span></div>
              <div>Valor material: <span className="font-semibold text-gray-900">{formatarMoeda(resultado.valorMaterial)}</span></div>
              {incluiInstalacao && (
                <div>Instalação: <span className="font-semibold text-gray-900">{formatarMoeda(resultado.valorInstalacao)}</span></div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-xs text-green-700 font-medium mb-1">💵 À Vista</p>
                <p className="text-2xl font-bold text-green-700">{formatarMoeda(resultado.valorAvista)}</p>
                <p className="text-xs text-green-600 mt-1">{configs.desconto_avista_pct || 10}% de desconto</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                <p className="text-xs text-blue-700 font-medium mb-1">💳 Cartão</p>
                <p className="text-2xl font-bold text-blue-700">{formatarMoeda(resultado.valorTotal)}</p>
                <p className="text-xs text-blue-600 mt-1">{resultado.numeroParcelas}x de {formatarMoeda(resultado.valorParcela)}</p>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={submitting || !clienteNome}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl text-lg transition">
              <Send size={20} />
              {submitting ? "Enviando..." : "Enviar por WhatsApp"}
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">Orçamento válido por 15 dias</p>
          </div>
        )}
      </div>
    </div>
  );
}
