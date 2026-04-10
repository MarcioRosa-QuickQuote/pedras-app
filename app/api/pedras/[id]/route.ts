import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.pedra.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao deletar pedra" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { nome, descricao, precoPorM2, imagemUrl } = body;

    const pedra = await prisma.pedra.update({
      where: { id },
      data: {
        nome,
        descricao,
        precoPorM2: parseFloat(precoPorM2),
        imagemUrl,
      },
    });

    return NextResponse.json(pedra);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar pedra" },
      { status: 500 }
    );
  }
}
