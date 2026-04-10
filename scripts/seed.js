const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("Iniciando seed...");

  // Criar usuário admin
  const adminEmail = "admin@pedras.com";
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash("admin123", 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        nome: "Admin",
      },
    });
    console.log("✓ Usuário admin criado: admin@pedras.com / admin123");
  } else {
    console.log("✓ Usuário admin já existe");
  }

  // Criar configurações padrão
  const configs = [
    { chave: "desconto_avista_pct", valor: "10" },
    { chave: "parcelas_cartao", valor: "4" },
    { chave: "valor_instalacao_m2", valor: "100" },
    { chave: "desconto_corte_cuba_m2", valor: "0.09" },
    { chave: "nome_empresa", valor: "Sua Empresa de Pedras" },
    { chave: "telefone_whatsapp", valor: "5585999999999" },
  ];

  for (const config of configs) {
    const existing = await prisma.configuracao.findUnique({
      where: { chave: config.chave },
    });
    if (!existing) {
      await prisma.configuracao.create({ data: config });
      console.log(`✓ Configuração criada: ${config.chave}`);
    }
  }

  // Criar algumas pedras de exemplo
  const pedras = [
    {
      nome: "Ônix Translúcido Cristallo",
      descricao: "Bancada elegante com acabamento cristalino",
      precoPorM2: 500,
      imagemUrl:
        "https://via.placeholder.com/400x300?text=Onix+Translucido+Cristallo",
    },
    {
      nome: "Mármore Branco Puro",
      descricao: "Clássico e sofisticado para qualquer ambiente",
      precoPorM2: 350,
      imagemUrl: "https://via.placeholder.com/400x300?text=Marmore+Branco",
    },
    {
      nome: "Granito Preto São Gabriel",
      descricao: "Durável e elegante para cozinhas modernas",
      precoPorM2: 250,
      imagemUrl: "https://via.placeholder.com/400x300?text=Granito+Preto",
    },
  ];

  for (const pedra of pedras) {
    const existing = await prisma.pedra.findFirst({
      where: { nome: pedra.nome },
    });
    if (!existing) {
      await prisma.pedra.create({ data: pedra });
      console.log(`✓ Pedra criada: ${pedra.nome}`);
    }
  }

  console.log("✓ Seed completado!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
