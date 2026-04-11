import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "bcryptjs";

// Rota de inicialização — só funciona se a chave secreta for passada
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");

  if (secret !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    // Criar admin
    const adminEmail = "admin@pedras.com";
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

    if (!existing) {
      const hashed = await hash("admin123", 10);
      await prisma.user.create({
        data: { email: adminEmail, password: hashed, nome: "Admin" },
      });
    }

    // Configurações padrão
    const configs = [
      { chave: "desconto_avista_pct", valor: "10" },
      { chave: "parcelas_cartao", valor: "4" },
      { chave: "valor_instalacao_m2", valor: "100" },
      { chave: "desconto_corte_cuba_m2", valor: "0.09" },
      { chave: "nome_empresa", valor: "Sua Empresa de Pedras" },
      { chave: "telefone_whatsapp", valor: "5585999999999" },
    ];

    for (const config of configs) {
      await prisma.configuracao.upsert({
        where: { chave: config.chave },
        update: {},
        create: config,
      });
    }

    // Pedras de exemplo
    const pedras = [
      { nome: "Ônix Translúcido Cristallo", descricao: "Bancada elegante com acabamento cristalino", precoPorM2: 500, imagemUrl: "https://via.placeholder.com/400x300?text=Onix" },
      { nome: "Mármore Branco Puro", descricao: "Clássico e sofisticado para qualquer ambiente", precoPorM2: 350, imagemUrl: "https://via.placeholder.com/400x300?text=Marmore" },
      { nome: "Granito Preto São Gabriel", descricao: "Durável e elegante para cozinhas modernas", precoPorM2: 250, imagemUrl: "https://via.placeholder.com/400x300?text=Granito" },
    ];

    for (const pedra of pedras) {
      const exists = await prisma.pedra.findFirst({ where: { nome: pedra.nome } });
      if (!exists) {
        await prisma.pedra.create({ data: pedra });
      }
    }

    return NextResponse.json({ ok: true, message: "Banco inicializado com sucesso!" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
