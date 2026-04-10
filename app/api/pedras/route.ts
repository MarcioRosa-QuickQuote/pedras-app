import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const pedras = await prisma.pedra.findMany({
      where: { ativa: true },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(pedras);
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar pedras" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { nome, descricao, precoPorM2, imagemUrl } = body;

    if (!nome || !precoPorM2 || !imagemUrl) {
      return NextResponse.json(
        { error: "Campos obrigatórios: nome, precoPorM2, imagemUrl" },
        { status: 400 }
      );
    }

    const pedra = await prisma.pedra.create({
      data: {
        nome,
        descricao: descricao || "",
        precoPorM2: parseFloat(precoPorM2),
        imagemUrl,
      },
    });

    return NextResponse.json(pedra, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pedra:", error);
    return NextResponse.json(
      { error: "Erro ao criar pedra" },
      { status: 500 }
    );
  }
}
