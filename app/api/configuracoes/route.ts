import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase.from("Configuracao").select("*");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const configMap: Record<string, string> = {};
  data.forEach((c: any) => { configMap[c.chave] = c.valor; });
  return NextResponse.json(configMap);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const body = await request.json();

  for (const [chave, valor] of Object.entries(body)) {
    await supabase
      .from("Configuracao")
      .upsert({ chave, valor: String(valor) }, { onConflict: "chave" });
  }

  return NextResponse.json({ success: true });
}
