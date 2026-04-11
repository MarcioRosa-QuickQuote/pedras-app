import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { hash } from "bcryptjs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== process.env.NEXTAUTH_SECRET)
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

  try {
    const hashed = await hash("admin123", 10);
    await supabase.from("User").upsert({ email: "admin@pedras.com", password: hashed, nome: "Admin" }, { onConflict: "email" });

    const configs = [
      { chave: "desconto_avista_pct", valor: "10" },
      { chave: "parcelas_cartao", valor: "4" },
      { chave: "valor_instalacao_m2", valor: "100" },
      { chave: "desconto_corte_cuba_m2", valor: "0.09" },
      { chave: "nome_empresa", valor: "Sua Empresa de Pedras" },
      { chave: "telefone_whatsapp", valor: "5585999999999" },
    ];
    await supabase.from("Configuracao").upsert(configs, { onConflict: "chave" });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
