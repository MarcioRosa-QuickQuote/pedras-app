import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const orcamentos = await prisma.orcamento.findMany({
      where: { vendedorId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orcamentos);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar orçamentos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      linkId,
      vendedorId,
      clienteNome,
      clienteEmail,
      clienteTel,
      pedraId,
      pedraNome,
      dados,
      valorTotal,
      valorAvista,
      incluiInstalacao,
    } = body;

    // Verificar se link existe
    const link = await prisma.linkCliente.findUnique({
      where: { id: linkId },
    });

    if (!link) {
      return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });
    }

    const orcamento = await prisma.orcamento.create({
      data: {
        linkId,
        vendedorId,
        clienteNome,
        clienteEmail,
        clienteTel,
        pedraId,
        pedraNome,
        dados,
        valorTotal,
        valorAvista,
        incluiInstalacao,
      },
    });

    return NextResponse.json(orcamento, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar orçamento:", error);
    return NextResponse.json(
      { error: "Erro ao criar orçamento" },
      { status: 500 }
    );
  }
}
