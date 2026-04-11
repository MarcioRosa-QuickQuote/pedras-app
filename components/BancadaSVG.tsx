"use client";

import { ModeloBancada } from "@/lib/bancadas";

interface Props {
  modelo: ModeloBancada;
  comprimento: number;
  largura: number;
  comprimento2?: number;
  numCubas: number;
}

const W = 320; // largura total do SVG
const H = 260;
const PAD = 40; // espaço para cotas

// converte metros → pixels mantendo proporção
function escala(comprimento: number, largura: number) {
  const maxW = W - PAD * 2;
  const maxH = H - PAD * 2;
  const ratio = Math.min(maxW / comprimento, maxH / largura);
  return Math.min(ratio, 160); // cap para não ficar gigante
}

function fmt(v: number) {
  return v > 0 ? `${v.toFixed(2)}m` : "";
}

// Linha de cota com setas
function Cota({
  x1, y1, x2, y2, label, pos = "center",
}: {
  x1: number; y1: number; x2: number; y2: number; label: string; pos?: "center" | "side";
}) {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const isH = Math.abs(y2 - y1) < 2;
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#3b82f6" strokeWidth={1} markerEnd="url(#arr)" markerStart="url(#arr)" />
      <text
        x={isH ? mx : mx - 6}
        y={isH ? my - 6 : my}
        textAnchor="middle"
        fontSize={11}
        fontWeight="600"
        fill="#1d4ed8"
        dominantBaseline={isH ? "auto" : "middle"}
      >
        {label}
      </text>
    </g>
  );
}

function ArrowDefs() {
  return (
    <defs>
      <marker id="arr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
        <path d="M0,0 L0,6 L6,3 z" fill="#3b82f6" />
      </marker>
    </defs>
  );
}

// ── Bancada Reta ─────────────────────────────────────────────
function RetangularSVG({ comprimento, largura, numCubas, esculpida }: { comprimento: number; largura: number; numCubas: number; esculpida?: boolean }) {
  const sc = escala(comprimento, largura);
  const bW = comprimento * sc;
  const bH = largura * sc;
  const ox = PAD + (W - PAD * 2 - bW) / 2;
  const oy = PAD + (H - PAD * 2 - bH) / 2;

  // cubas: distribui uniformemente
  const cubas = Array.from({ length: numCubas }, (_, i) => {
    const cubaW = Math.min(bW * 0.28, 60);
    const cubaH = Math.min(bH * 0.55, 40);
    const spacing = bW / (numCubas + 1);
    return { cx: ox + spacing * (i + 1), cy: oy + bH / 2, w: cubaW, h: cubaH };
  });

  return (
    <svg width={W} height={H}>
      <ArrowDefs />
      {/* Bancada */}
      <rect x={ox} y={oy} width={bW} height={bH} fill="#e8e0d0" stroke="#7c6e5a" strokeWidth={2} rx={2} />
      {/* Rodabancada (frente) */}
      <rect x={ox} y={oy + bH - 6} width={bW} height={6} fill="#c8b89a" rx={1} />
      {/* Cubas */}
      {cubas.map((c, i) =>
        esculpida ? (
          <ellipse key={i} cx={c.cx} cy={c.cy} rx={c.w / 2} ry={c.h / 2} fill="#a0c4d8" stroke="#5a90a8" strokeWidth={1.5} />
        ) : (
          <rect key={i} x={c.cx - c.w / 2} y={c.cy - c.h / 2} width={c.w} height={c.h} fill="#a0c4d8" stroke="#5a90a8" strokeWidth={1.5} rx={3} />
        )
      )}
      {/* Cotas */}
      <Cota x1={ox} y1={oy - 18} x2={ox + bW} y2={oy - 18} label={fmt(comprimento)} />
      <Cota x1={ox + bW + 18} y1={oy} x2={ox + bW + 18} y2={oy + bH} label={fmt(largura)} />
    </svg>
  );
}

// ── Bancada em L ─────────────────────────────────────────────
function LSvg({ comprimento, largura, comprimento2, numCubas }: { comprimento: number; largura: number; comprimento2: number; numCubas: number }) {
  const sc = Math.min(
    (W - PAD * 2) / (comprimento + largura * 0.5),
    (H - PAD * 2) / (largura + comprimento2 * 0.3),
    90
  );
  const bW = comprimento * sc;
  const bH = largura * sc;
  const b2W = largura * sc;
  const b2H = comprimento2 * sc;
  const ox = PAD;
  const oy = PAD + b2H;

  const cubaW = Math.min(bW * 0.2, 50);
  const cubaH = Math.min(bH * 0.55, 35);

  return (
    <svg width={W} height={H}>
      <ArrowDefs />
      {/* Trecho principal (horizontal) */}
      <rect x={ox} y={oy} width={bW} height={bH} fill="#e8e0d0" stroke="#7c6e5a" strokeWidth={2} rx={2} />
      {/* Trecho lateral (vertical) */}
      <rect x={ox + bW - b2W} y={oy - b2H} width={b2W} height={b2H} fill="#e8e0d0" stroke="#7c6e5a" strokeWidth={2} rx={2} />
      {/* Cuba no principal */}
      {numCubas > 0 && (
        <rect x={ox + bW * 0.2} y={oy + bH * 0.2} width={cubaW} height={cubaH} fill="#a0c4d8" stroke="#5a90a8" strokeWidth={1.5} rx={3} />
      )}
      {/* Cotas */}
      <Cota x1={ox} y1={oy - 18} x2={ox + bW} y2={oy - 18} label={fmt(comprimento)} />
      <Cota x1={ox + bW + 14} y1={oy} x2={ox + bW + 14} y2={oy + bH} label={fmt(largura)} />
      <Cota x1={ox + bW - b2W - 14} y1={oy - b2H} x2={ox + bW - b2W - 14} y2={oy} label={fmt(comprimento2)} />
    </svg>
  );
}

// ── Bancada em U ─────────────────────────────────────────────
function USvg({ comprimento, largura, comprimento2 }: { comprimento: number; largura: number; comprimento2: number }) {
  const sc = Math.min((W - PAD * 2) / (comprimento + largura), (H - PAD * 2) / (comprimento2 + largura), 70);
  const bW = comprimento * sc;
  const bH = largura * sc;
  const sH = comprimento2 * sc;
  const ox = PAD;
  const oy = PAD + sH;

  return (
    <svg width={W} height={H}>
      <ArrowDefs />
      {/* Principal */}
      <rect x={ox} y={oy} width={bW} height={bH} fill="#e8e0d0" stroke="#7c6e5a" strokeWidth={2} rx={2} />
      {/* Lateral esquerda */}
      <rect x={ox} y={oy - sH} width={bH} height={sH} fill="#e8e0d0" stroke="#7c6e5a" strokeWidth={2} rx={2} />
      {/* Lateral direita */}
      <rect x={ox + bW - bH} y={oy - sH} width={bH} height={sH} fill="#e8e0d0" stroke="#7c6e5a" strokeWidth={2} rx={2} />
      {/* Cuba */}
      <rect x={ox + bW * 0.15} y={oy + bH * 0.2} width={Math.min(bW * 0.22, 50)} height={Math.min(bH * 0.6, 36)} fill="#a0c4d8" stroke="#5a90a8" strokeWidth={1.5} rx={3} />
      {/* Cotas */}
      <Cota x1={ox} y1={oy + bH + 18} x2={ox + bW} y2={oy + bH + 18} label={fmt(comprimento)} />
      <Cota x1={ox + bW + 14} y1={oy} x2={ox + bW + 14} y2={oy + bH} label={fmt(largura)} />
      <Cota x1={ox + bW + 14} y1={oy - sH} x2={ox + bW + 14} y2={oy} label={fmt(comprimento2)} />
    </svg>
  );
}

// ── Ilha ─────────────────────────────────────────────────────
function IlhaSVG({ comprimento, largura, numCubas }: { comprimento: number; largura: number; numCubas: number }) {
  const sc = escala(comprimento, largura);
  const bW = comprimento * sc;
  const bH = largura * sc;
  const ox = PAD + (W - PAD * 2 - bW) / 2;
  const oy = PAD + (H - PAD * 2 - bH) / 2;
  return (
    <svg width={W} height={H}>
      <ArrowDefs />
      <rect x={ox} y={oy} width={bW} height={bH} fill="#e8e0d0" stroke="#7c6e5a" strokeWidth={2} rx={4} />
      {numCubas > 0 && (
        <rect x={ox + bW * 0.1} y={oy + bH * 0.2} width={Math.min(bW * 0.22, 55)} height={Math.min(bH * 0.55, 38)} fill="#a0c4d8" stroke="#5a90a8" strokeWidth={1.5} rx={3} />
      )}
      <Cota x1={ox} y1={oy - 18} x2={ox + bW} y2={oy - 18} label={fmt(comprimento)} />
      <Cota x1={ox + bW + 18} y1={oy} x2={ox + bW + 18} y2={oy + bH} label={fmt(largura)} />
    </svg>
  );
}

// ── Export principal ──────────────────────────────────────────
export default function BancadaSVG({ modelo, comprimento, largura, comprimento2, numCubas }: Props) {
  const c = comprimento || 0.01;
  const l = largura || 0.01;
  const c2 = comprimento2 || 0.8;

  if (modelo.formato === "l") return <LSvg comprimento={c} largura={l} comprimento2={c2} numCubas={numCubas} />;
  if (modelo.formato === "u") return <USvg comprimento={c} largura={l} comprimento2={c2} />;
  if (modelo.formato === "ilha") return <IlhaSVG comprimento={c} largura={l} numCubas={numCubas} />;
  return <RetangularSVG comprimento={c} largura={l} numCubas={numCubas} esculpida={modelo.id === "banheiro-esculpida"} />;
}
