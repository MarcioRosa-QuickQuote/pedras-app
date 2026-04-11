export type FormatoBancada = "reta" | "l" | "u" | "ilha";

export interface ModeloBancada {
  id: string;
  nome: string;
  tipo: "banheiro" | "cozinha";
  descricao: string;
  formato: FormatoBancada;
  numCubasDefault: number;
  campos: {
    comprimento: { label: string; default: number };
    largura: { label: string; default: number };
    comprimento2?: { label: string; default: number };
    largura2?: { label: string; default: number };
  };
}

export const MODELOS_BANCADA: ModeloBancada[] = [
  // ── BANHEIRO ──────────────────────────────────────────────
  {
    id: "banheiro-simples",
    nome: "Pia Simples",
    tipo: "banheiro",
    descricao: "Bancada reta com 1 cuba embutida",
    formato: "reta",
    numCubasDefault: 1,
    campos: {
      comprimento: { label: "Comprimento (m)", default: 1.0 },
      largura: { label: "Largura (m)", default: 0.55 },
    },
  },
  {
    id: "banheiro-dupla",
    nome: "Pia Dupla",
    tipo: "banheiro",
    descricao: "Bancada reta com 2 cubas embutidas",
    formato: "reta",
    numCubasDefault: 2,
    campos: {
      comprimento: { label: "Comprimento (m)", default: 1.6 },
      largura: { label: "Largura (m)", default: 0.55 },
    },
  },
  {
    id: "banheiro-cuba-apoio",
    nome: "Cuba de Apoio",
    tipo: "banheiro",
    descricao: "Bancada sem recorte — cuba fica sobre a pedra",
    formato: "reta",
    numCubasDefault: 0,
    campos: {
      comprimento: { label: "Comprimento (m)", default: 0.8 },
      largura: { label: "Largura (m)", default: 0.5 },
    },
  },
  {
    id: "banheiro-l",
    nome: "Bancada em L",
    tipo: "banheiro",
    descricao: "Bancada em formato L com cuba no trecho principal",
    formato: "l",
    numCubasDefault: 1,
    campos: {
      comprimento: { label: "Comprimento principal (m)", default: 1.2 },
      largura: { label: "Largura (m)", default: 0.55 },
      comprimento2: { label: "Comprimento lateral (m)", default: 0.8 },
    },
  },
  {
    id: "banheiro-esculpida",
    nome: "Cuba Esculpida",
    tipo: "banheiro",
    descricao: "Cuba esculpida na própria pedra",
    formato: "reta",
    numCubasDefault: 1,
    campos: {
      comprimento: { label: "Comprimento (m)", default: 1.0 },
      largura: { label: "Largura (m)", default: 0.55 },
    },
  },
  {
    id: "banheiro-pequeno",
    nome: "Lavabo / WC",
    tipo: "banheiro",
    descricao: "Bancada pequena para lavabo ou WC",
    formato: "reta",
    numCubasDefault: 1,
    campos: {
      comprimento: { label: "Comprimento (m)", default: 0.5 },
      largura: { label: "Largura (m)", default: 0.4 },
    },
  },

  // ── COZINHA ───────────────────────────────────────────────
  {
    id: "cozinha-reta-1cuba",
    nome: "Bancada Reta — 1 Cuba",
    tipo: "cozinha",
    descricao: "Bancada simples com 1 cuba e escorredor",
    formato: "reta",
    numCubasDefault: 1,
    campos: {
      comprimento: { label: "Comprimento (m)", default: 2.0 },
      largura: { label: "Largura (m)", default: 0.6 },
    },
  },
  {
    id: "cozinha-reta-2cubas",
    nome: "Bancada Reta — 2 Cubas",
    tipo: "cozinha",
    descricao: "Bancada com cuba dupla",
    formato: "reta",
    numCubasDefault: 2,
    campos: {
      comprimento: { label: "Comprimento (m)", default: 2.4 },
      largura: { label: "Largura (m)", default: 0.6 },
    },
  },
  {
    id: "cozinha-cooktop",
    nome: "Bancada com Cooktop",
    tipo: "cozinha",
    descricao: "Bancada com recorte para cooktop e cuba",
    formato: "reta",
    numCubasDefault: 1,
    campos: {
      comprimento: { label: "Comprimento (m)", default: 2.6 },
      largura: { label: "Largura (m)", default: 0.6 },
    },
  },
  {
    id: "cozinha-l",
    nome: "Bancada em L",
    tipo: "cozinha",
    descricao: "Bancada em L — ideal para cantos",
    formato: "l",
    numCubasDefault: 1,
    campos: {
      comprimento: { label: "Comprimento principal (m)", default: 2.4 },
      largura: { label: "Largura (m)", default: 0.6 },
      comprimento2: { label: "Comprimento lateral (m)", default: 1.5 },
    },
  },
  {
    id: "cozinha-u",
    nome: "Bancada em U",
    tipo: "cozinha",
    descricao: "Bancada em U — 3 trechos",
    formato: "u",
    numCubasDefault: 1,
    campos: {
      comprimento: { label: "Trecho principal (m)", default: 2.4 },
      largura: { label: "Largura (m)", default: 0.6 },
      comprimento2: { label: "Trechos laterais (m)", default: 1.2 },
    },
  },
  {
    id: "cozinha-ilha",
    nome: "Ilha de Cozinha",
    tipo: "cozinha",
    descricao: "Bancada central — sem cuba ou com cuba opcional",
    formato: "ilha",
    numCubasDefault: 0,
    campos: {
      comprimento: { label: "Comprimento (m)", default: 2.0 },
      largura: { label: "Largura (m)", default: 1.0 },
    },
  },
];
