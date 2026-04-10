export interface DadosMedidas {
  comprimento: number; // metros
  largura: number; // metros
  alturaRodabancada: number; // metros (default 0.10)
  alturaTesteira: number; // metros (default 0.15)
  numeroUbas: number; // número de cubas
  incluiInstalacao: boolean;
}

export interface ConfigCalculos {
  precoPorM2: number;
  descontoCorteUba: number; // m² (default 0.09)
  descontoAvistaPct: number; // % (default 10)
  valorInstalacaoM2: number; // R$/m² (default 100)
  numeroParcelas: number; // (default 4)
}

export interface ResultadoOrcamento {
  areaBancada: number;
  areaRodabancada: number;
  areaTesteira: number;
  descontoUbas: number;
  areaTotal: number;
  valorMaterial: number;
  valorInstalacao: number;
  valorTotal: number;
  valorAvista: number;
  valorParcela: number;
  numeroParcelas: number;
}

export function calcularOrcamento(
  medidas: DadosMedidas,
  config: ConfigCalculos
): ResultadoOrcamento {
  // Cálculo de áreas
  const areaBancada = medidas.comprimento * medidas.largura;
  const areaRodabancada = medidas.comprimento * medidas.alturaRodabancada;
  const areaTesteira = medidas.comprimento * medidas.alturaTesteira;
  const descontoUbas = medidas.numeroUbas * config.descontoCorteUba;

  const areaTotal = areaBancada + areaRodabancada + areaTesteira - descontoUbas;

  // Valores
  const valorMaterial = areaTotal * config.precoPorM2;
  const valorInstalacao = medidas.incluiInstalacao
    ? areaBancada * config.valorInstalacaoM2
    : 0;
  const valorTotal = valorMaterial + valorInstalacao;
  const valorAvista = valorTotal * (1 - config.descontoAvistaPct / 100);
  const valorParcela = valorTotal / config.numeroParcelas;

  return {
    areaBancada,
    areaRodabancada,
    areaTesteira,
    descontoUbas,
    areaTotal,
    valorMaterial,
    valorInstalacao,
    valorTotal,
    valorAvista,
    valorParcela,
    numeroParcelas: config.numeroParcelas,
  };
}

export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}
