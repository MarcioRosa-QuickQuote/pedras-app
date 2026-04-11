import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { data, error } = await supabase
    .from("Orcamento")
    .select("*")
    .eq("vendedorId", session.user.id)
    .order("createdAt", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { linkId, vendedorId, clienteNome, clienteEmail, clienteTel, pedraId, pedraNome, dados, valorTotal, valorAvista, incluiInstalacao } = body;

  const { data: link } = await supabase.from("LinkCliente").select("id").eq("id", linkId).single();
  if (!link) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });

  const { data, error } = await supabase
    .from("Orcamento")
    .insert({ linkId, vendedorId, clienteNome, clienteEmail, clienteTel, pedraId, pedraNome, dados, valorTotal, valorAvista, incluiInstalacao })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
