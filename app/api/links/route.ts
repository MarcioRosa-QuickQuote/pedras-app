import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { descricao } = body;

    const link = await prisma.linkCliente.create({
      data: {
        descricao: descricao || "",
        vendedorId: session.user.id,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar link:", error);
    return NextResponse.json(
      { error: "Erro ao criar link" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const links = await prisma.linkCliente.findMany({
      where: { vendedorId: session.user.id },
      include: { orcamento: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(links);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar links" },
      { status: 500 }
    );
  }
}
