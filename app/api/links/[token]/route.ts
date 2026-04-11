import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;

  const { data: link, error } = await supabase
    .from("LinkCliente")
    .select("*, orcamento:Orcamento(*)")
    .eq("token", token)
    .single();

  if (error || !link) return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });

  if (link.expiresAt && new Date(link.expiresAt) < new Date())
    return NextResponse.json({ error: "Link expirado" }, { status: 410 });

  return NextResponse.json(link);
}
