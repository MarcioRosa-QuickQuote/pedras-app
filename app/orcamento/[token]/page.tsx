"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { calcularOrcamento, formatarMoeda } from "@/lib/calculos";
import { MODELOS_BANCADA, ModeloBancada } from "@/lib/bancadas";
import BancadaSVG from "@/components/BancadaSVG";
import { Send, ChevronRight, ChevronLeft, CheckCircle } from "lucide-react";

interface Pedra {
  id: string;
  nome: string;
  descricao: string;
  precoPorM2: number;
  imagemUrl: string;
}

const STEPS = [
  { num: 1, label: "Bancada" },
  { num: 2, label: "Medidas" },
  { num: 3, label: "Seus Dados" },
];

export default function OrcamentoPage() {
  const params = useParams();
  const token = params.token as string;

  const [step, setStep] = useState(1);
  const [animDir, setAnimDir] = useState<"in" | "out">("in");

  const [pedras, setPedras] = useState<Pedra[]>([]);
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [linkData, setLinkData] = useState<any>(null);
  const [selectedPedra, setSelectedPedra] = useState<Pedra | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // Step 1
  const [tipoAmbiente, setTipoAmbiente] = useState<"banheiro" | "cozinha">("banheiro");
  const [modeloId, setModeloId] = useState("banheiro-simples");
  const modelo = MODELOS_BANCADA.find((m) => m.id === modeloId)!;

  // Step 2
  const [comprimento, setComprimento] = useState(modelo.campos.comprimento.default);
  const [largura, setLargura] = useState(modelo.campos.largura.default);
  const [comprimento2, setComprimento2] = useState(modelo.campos.comprimento2?.default ?? 0.8);
  const [numCubas, setNumCubas] = useState(modelo.numCubasDefault);
  const [incluiInstalacao, setIncluiInstalacao] = useState(false);

  // Step 3
  const [clienteNome, setClienteNome] = useState("");
  const [clienteEmail, setClienteEmail] = useState("");
  const [clienteTel, setClienteTel] = useState("");

  function selecionarModelo(id: string) {
    const m = MODELOS_BANCADA.find((x) => x.id === id)!;
    setModeloId(id);
    setComprimento(m.campos.comprimento.default);
    setLargura(m.campos.largura.default);
    setComprimento2(m.campos.comprimento2?.default ?? 0.8);
    setNumCubas(m.numCubasDefault);
  }

  const resultado =
    selectedPedra && comprimento > 0 && largura > 0
      ? calcularOrcamento(
          { comprimento, largura, alturaRodabancada: 0.1, alturaTesteira: 0.2, numeroUbas: numCubas, incluiInstalacao },
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

  function goTo(next: number) {
    setAnimDir("out");
    setTimeout(() => {
      setStep(next);
      setAnimDir("in");
    }, 200);
  }

  async function handleSubmit() {
    if (!clienteNome.trim()) { alert("Digite seu nome."); return; }
    setSubmitting(true);
    try {
      await fetch("/api/orcamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkId: linkData?.id,
          vendedorId: linkData?.vendedorId,
          clienteNome, clienteEmail, clienteTel,
          pedraId: selectedPedra!.id,
          pedraNome: selectedPedra!.nome,
          dados: JSON.stringify({ comprimento, largura, comprimento2, numCubas, modelo: modeloId, incluiInstalacao }),
          valorTotal: resultado?.valorTotal ?? 0,
          valorAvista: resultado?.valorAvista ?? 0,
          incluiInstalacao,
        }),
      });

      const msg = `Olá! Sou ${clienteNome} e gostaria de um orçamento:\n\n🏠 Ambiente: ${tipoAmbiente === "banheiro" ? "Banheiro" : "Cozinha"}\n📐 Modelo: ${modelo.nome}\n🪨 Pedra: ${selectedPedra!.nome}\n📏 Medidas: ${comprimento.toFixed(2)}m x ${largura.toFixed(2)}m${modelo.campos.comprimento2 ? ` + lateral ${comprimento2.toFixed(2)}m` : ""}\n🔲 Cubas: ${numCubas}\n${incluiInstalacao ? "✅ Com instalação" : "❌ Sem instalação"}\n\n💰 À Vista: ${formatarMoeda(resultado?.valorAvista ?? 0)}\n💳 ${resultado?.numeroParcelas}x de ${formatarMoeda(resultado?.valorParcela ?? 0)}`;

      setEnviado(true);
      window.open(`https://wa.me/${configs.telefone_whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
    } catch {
      alert("Erro ao processar. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center">
      <div className="text-white text-center">
        <div className="w-16 h-16 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-lg">Carregando...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur rounded-2xl p-8 text-center text-white">
        <p className="text-red-400 text-lg">{error}</p>
      </div>
    </div>
  );

  if (enviado) return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex items-center justify-center px-4">
      <div className="text-center text-white space-y-6 max-w-sm">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-3xl font-bold">Orçamento enviado!</h2>
        <p className="text-slate-300">O WhatsApp foi aberto com seu orçamento. Em breve entraremos em contato, {clienteNome.split(" ")[0]}!</p>
        <div className="bg-white/10 rounded-xl p-4 space-y-1">
          <p className="text-sm text-slate-400">Resumo</p>
          <p className="font-semibold">{modelo.nome} · {selectedPedra?.nome}</p>
          <p className="text-2xl font-bold text-green-400">{formatarMoeda(resultado?.valorAvista ?? 0)} à vista</p>
          <p className="text-slate-300">{resultado?.numeroParcelas}x de {formatarMoeda(resultado?.valorParcela ?? 0)}</p>
        </div>
      </div>
    </div>
  );

  const modelosFiltrados = MODELOS_BANCADA.filter((m) => m.tipo === tipoAmbiente);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-indigo-950 flex flex-col">
      {/* Header com progresso */}
      <div className="px-4 pt-6 pb-4 max-w-xl mx-auto w-full">
        <div className="flex items-center justify-between mb-4">
          {STEPS.map((s, i) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                  step > s.num ? "bg-green-500 border-green-500 text-white" :
                  step === s.num ? "bg-indigo-500 border-indigo-400 text-white scale-110 shadow-lg shadow-indigo-500/40" :
                  "bg-white/10 border-white/20 text-white/40"
                }`}>
                  {step > s.num ? <CheckCircle size={18} /> : s.num}
                </div>
                <span className={`text-xs mt-1 font-medium ${step === s.num ? "text-indigo-300" : "text-white/30"}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 mb-5 transition-all duration-500 ${step > s.num ? "bg-green-500" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Card principal */}
      <div className="flex-1 px-4 pb-6 max-w-xl mx-auto w-full">
        <div
          key={step}
          className={`bg-white rounded-3xl shadow-2xl overflow-hidden transition-all duration-200 ${
            animDir === "in" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
          style={{ transform: animDir === "out" ? "translateY(16px)" : "translateY(0)", opacity: animDir === "out" ? 0 : 1 }}
        >

          {/* ── STEP 1: Tipo de bancada ── */}
          {step === 1 && (
            <div>
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
                <p className="text-indigo-200 text-sm font-medium mb-1">Passo 1 de 3</p>
                <h2 className="text-2xl font-bold">Qual o tipo de bancada?</h2>
                <p className="text-indigo-200 mt-1 text-sm">Escolha o ambiente e o modelo mais parecido com o seu</p>
              </div>
              <div className="p-6 space-y-5">
                {/* Toggle ambiente */}
                <div className="flex gap-3">
                  {(["banheiro", "cozinha"] as const).map((t) => (
                    <button key={t}
                      onClick={() => { setTipoAmbiente(t); selecionarModelo(MODELOS_BANCADA.find((m) => m.tipo === t)!.id); }}
                      className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                        tipoAmbiente === t ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200" : "border-gray-200 text-gray-500 hover:border-indigo-300"
                      }`}>
                      {t === "banheiro" ? "🚿 Banheiro" : "🍳 Cozinha"}
                    </button>
                  ))}
                </div>

                {/* Modelos */}
                <div className="grid grid-cols-2 gap-3">
                  {modelosFiltrados.map((m) => (
                    <button key={m.id} onClick={() => selecionarModelo(m.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        modeloId === m.id
                          ? "border-indigo-500 bg-indigo-50 shadow-md"
                          : "border-gray-100 hover:border-indigo-200 bg-gray-50"
                      }`}>
                      <p className="font-bold text-sm text-gray-900">{m.nome}</p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-tight">{m.descricao}</p>
                    </button>
                  ))}
                </div>

                {/* Preview mini */}
                <div className="bg-gray-50 rounded-2xl p-3 flex justify-center border border-gray-100">
                  <BancadaSVG modelo={modelo} comprimento={comprimento} largura={largura} comprimento2={comprimento2} numCubas={numCubas} />
                </div>

                <button onClick={() => goTo(2)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-200">
                  Próximo <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Medidas + Pedra ── */}
          {step === 2 && (
            <div>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-8 text-white">
                <p className="text-purple-200 text-sm font-medium mb-1">Passo 2 de 3</p>
                <h2 className="text-2xl font-bold">Medidas da bancada</h2>
                <p className="text-purple-200 mt-1 text-sm">Digite as medidas — a planta atualiza em tempo real</p>
              </div>
              <div className="p-6 space-y-5">
                {/* SVG ao vivo */}
                <div className="bg-slate-50 rounded-2xl p-3 flex justify-center border border-slate-100">
                  <BancadaSVG modelo={modelo} comprimento={comprimento} largura={largura} comprimento2={comprimento2} numCubas={numCubas} />
                </div>

                {/* Campos */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{modelo.campos.comprimento.label}</label>
                    <div className="flex items-center gap-2">
                      <input type="number" step="0.01" min="0.1" value={comprimento}
                        onChange={(e) => setComprimento(parseFloat(e.target.value) || 0)}
                        className="flex-1 border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-3 text-lg font-bold outline-none transition" />
                      <span className="text-gray-400 font-medium">m</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{modelo.campos.largura.label}</label>
                    <div className="flex items-center gap-2">
                      <input type="number" step="0.01" min="0.1" value={largura}
                        onChange={(e) => setLargura(parseFloat(e.target.value) || 0)}
                        className="flex-1 border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-3 text-lg font-bold outline-none transition" />
                      <span className="text-gray-400 font-medium">m</span>
                    </div>
                  </div>
                  {modelo.campos.comprimento2 && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">{modelo.campos.comprimento2.label}</label>
                      <div className="flex items-center gap-2">
                        <input type="number" step="0.01" min="0.1" value={comprimento2}
                          onChange={(e) => setComprimento2(parseFloat(e.target.value) || 0)}
                          className="flex-1 border-2 border-gray-200 focus:border-indigo-400 rounded-xl px-4 py-3 text-lg font-bold outline-none transition" />
                        <span className="text-gray-400 font-medium">m</span>
                      </div>
                    </div>
                  )}

                  {/* Cubas */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Número de cubas</label>
                    <div className="flex items-center gap-4">
                      <button onClick={() => setNumCubas(Math.max(0, numCubas - 1))}
                        className="w-11 h-11 rounded-xl border-2 border-gray-200 text-xl font-bold text-gray-600 hover:border-indigo-400 transition">−</button>
                      <span className="text-2xl font-bold w-8 text-center">{numCubas}</span>
                      <button onClick={() => setNumCubas(Math.min(4, numCubas + 1))}
                        className="w-11 h-11 rounded-xl border-2 border-gray-200 text-xl font-bold text-gray-600 hover:border-indigo-400 transition">+</button>
                    </div>
                  </div>

                  {/* Instalação */}
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border-2 border-gray-100 hover:border-indigo-200 transition">
                    <input type="checkbox" checked={incluiInstalacao} onChange={(e) => setIncluiInstalacao(e.target.checked)}
                      className="w-5 h-5 rounded accent-indigo-600" />
                    <div>
                      <p className="font-semibold text-gray-800">Incluir instalação</p>
                      <p className="text-xs text-gray-500">Adiciona o serviço de instalação ao orçamento</p>
                    </div>
                  </label>
                </div>

                {/* Escolha da pedra */}
                <div>
                  <p className="text-sm font-semibold text-gray-700 mb-2">Tipo de pedra</p>
                  <div className="grid grid-cols-1 gap-2">
                    {pedras.map((p) => (
                      <button key={p.id} onClick={() => setSelectedPedra(p)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                          selectedPedra?.id === p.id ? "border-indigo-500 bg-indigo-50" : "border-gray-100 hover:border-indigo-200"
                        }`}>
                        <img src={p.imagemUrl} alt={p.nome} className="w-14 h-14 object-cover rounded-lg flex-shrink-0" />
                        <div className="flex-1">
                          <p className="font-bold text-sm text-gray-900">{p.nome}</p>
                          <p className="text-xs text-gray-500">{p.descricao}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-bold text-indigo-600 text-sm">R$ {p.precoPorM2.toFixed(0)}/m²</p>
                          {resultado && selectedPedra?.id === p.id && (
                            <p className="text-xs text-green-600 font-semibold mt-0.5">{formatarMoeda(resultado.valorAvista)}</p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => goTo(1)}
                    className="flex items-center gap-1 px-5 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:border-gray-300 transition">
                    <ChevronLeft size={18} /> Voltar
                  </button>
                  <button onClick={() => goTo(3)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-purple-200">
                    Próximo <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── STEP 3: Dados do cliente + resumo ── */}
          {step === 3 && (
            <div>
              <div className="bg-gradient-to-r from-pink-600 to-rose-600 px-6 py-8 text-white">
                <p className="text-pink-200 text-sm font-medium mb-1">Passo 3 de 3</p>
                <h2 className="text-2xl font-bold">Quase lá! 🎉</h2>
                <p className="text-pink-200 mt-1 text-sm">Preencha seus dados para receber o orçamento</p>
              </div>
              <div className="p-6 space-y-5">
                {/* Resumo */}
                {resultado && (
                  <div className="bg-slate-50 rounded-2xl p-4 space-y-3 border border-slate-100">
                    <div className="flex items-center gap-3">
                      <img src={selectedPedra?.imagemUrl} alt="" className="w-14 h-14 rounded-xl object-cover" />
                      <div>
                        <p className="font-bold text-gray-900">{modelo.nome}</p>
                        <p className="text-sm text-gray-500">{selectedPedra?.nome} · {comprimento.toFixed(2)}m × {largura.toFixed(2)}m</p>
                        <p className="text-xs text-gray-400">{resultado.areaTotal.toFixed(2)} m²</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                        <p className="text-xs text-green-600 font-medium">💵 À Vista</p>
                        <p className="text-xl font-bold text-green-700">{formatarMoeda(resultado.valorAvista)}</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center">
                        <p className="text-xs text-blue-600 font-medium">💳 Cartão</p>
                        <p className="text-xl font-bold text-blue-700">{formatarMoeda(resultado.valorTotal)}</p>
                        <p className="text-xs text-blue-500">{resultado.numeroParcelas}x de {formatarMoeda(resultado.valorParcela)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dados */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Seu nome *</label>
                    <input value={clienteNome} onChange={(e) => setClienteNome(e.target.value)}
                      placeholder="Como você se chama?"
                      className="w-full border-2 border-gray-200 focus:border-pink-400 rounded-xl px-4 py-3 font-medium outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">WhatsApp / Telefone</label>
                    <input type="tel" value={clienteTel} onChange={(e) => setClienteTel(e.target.value)}
                      placeholder="(85) 99999-9999"
                      className="w-full border-2 border-gray-200 focus:border-pink-400 rounded-xl px-4 py-3 font-medium outline-none transition" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                    <input type="email" value={clienteEmail} onChange={(e) => setClienteEmail(e.target.value)}
                      placeholder="email@exemplo.com"
                      className="w-full border-2 border-gray-200 focus:border-pink-400 rounded-xl px-4 py-3 font-medium outline-none transition" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => goTo(2)}
                    className="flex items-center gap-1 px-5 py-4 rounded-xl border-2 border-gray-200 text-gray-600 font-bold hover:border-gray-300 transition">
                    <ChevronLeft size={18} /> Voltar
                  </button>
                  <button onClick={handleSubmit} disabled={submitting || !clienteNome.trim()}
                    className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition shadow-lg shadow-green-200">
                    <Send size={20} />
                    {submitting ? "Enviando..." : "Enviar pelo WhatsApp"}
                  </button>
                </div>
                <p className="text-center text-xs text-gray-400">Orçamento válido por 15 dias · Sem compromisso</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
