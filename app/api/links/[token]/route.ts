import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    const link = await prisma.linkCliente.findUnique({
      where: { token },
      include: { orcamento: true, vendedor: true },
    });

    if (!link) {
      return NextResponse.json({ error: "Link não encontrado" }, { status: 404 });
    }

    // Verificar se expirou
    if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: "Link expirado" },
        { status: 410 }
      );
    }

    return NextResponse.json(link);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar link" },
      { status: 500 }
    );
  }
}
