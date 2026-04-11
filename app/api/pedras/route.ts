import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export async function GET() {
  const { data, error } = await supabase
    .from("Pedra")
    .select("*")
    .eq("ativa", true)
    .order("createdAt", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  const { nome, descricao, precoPorM2, imagemUrl } = await request.json();
  if (!nome || !precoPorM2 || !imagemUrl)
    return NextResponse.json({ error: "Campos obrigatórios: nome, precoPorM2, imagemUrl" }, { status: 400 });

  const { data, error } = await supabase
    .from("Pedra")
    .insert({ nome, descricao: descricao || "", precoPorM2: parseFloat(precoPorM2), imagemUrl })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
