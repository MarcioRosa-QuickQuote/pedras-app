# 🪨 Pedras & Bancadas - App de Orçamento

Um aplicativo web completo para gerenciar e gerar orçamentos de bancadas de pedra (mármore, ônix, granito, etc.) para banheiros, cozinhas e áreas comuns.

## ✨ Funcionalidades

### 👨‍💼 Painel do Vendedor
- **Autenticação segura** com email/senha
- **Gerenciamento de Pedras**: Cadastro, edição e exclusão de tipos de pedra
- **Geração de Links**: Criar links únicos para enviar aos clientes
- **Dashboard**: Visualizar orçamentos recebidos e métricas
- **Configurações**: Ajustar desconto à vista, parcelamento, valor de instalação

### 👥 Portal do Cliente
- **Formulário de Orçamento**: Preencher medidas da bancada
- **Seleção Visual**: Escolher tipo de pedra com imagem
- **Cálculo em Tempo Real**: Visualizar preços à vista e parcelados
- **Toggle de Instalação**: Incluir ou não o serviço de instalação
- **Envio por WhatsApp**: Botão direto para enviar orçamento via WhatsApp

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **ORM**: Prisma 7
- **Autenticação**: NextAuth.js v4

## 🚀 Começando

### Instalação

```bash
git clone https://github.com/seu-usuario/pedras-app.git
cd pedras-app
npm install
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run dev
```

Acesse: **http://localhost:3000**

### Credenciais de Teste
- **Email**: admin@pedras.com
- **Senha**: admin123

## 📁 Estrutura

```
pedras-app/
├── app/
│   ├── (admin)/          # Painel do vendedor
│   ├── (auth)/           # Autenticação
│   ├── orcamento/        # Portal do cliente
│   └── api/              # API Routes
├── lib/
│   ├── auth.ts
│   ├── db.ts
│   └── calculos.ts
└── prisma/               # Database schemas
```

## 📊 Fluxo

1. **Vendedor** cadastra pedras em `/admin/pedras`
2. **Vendedor** gera link em `/admin/links`
3. **Vendedor** envia link ao cliente
4. **Cliente** acessa `/orcamento/[token]`
5. **Cliente** preenche medidas e recebe orçamento
6. **Cliente** envia por WhatsApp
7. **Vendedor** acompanha em `/admin/orcamentos`

## 🧮 Cálculo

```
Área Total = (Comprimento × Largura) + (Rodabancada) + (Testeira) - (Corte Cubas)
Valor = Área Total × Preço/m² + Instalação (se selecionado)
```

## 🚢 Deploy no Vercel

1. Push para GitHub
2. Conectar no Vercel
3. Adicionar variáveis de ambiente:
   ```
   DATABASE_URL=postgresql://...  (Neon)
   NEXTAUTH_SECRET=seu-secret
   NEXTAUTH_URL=https://seu-app.vercel.app
   ```
4. Deploy automático

## 📝 Scripts

```bash
npm run dev       # Desenvolvimento
npm run build     # Build produção
npm start         # Iniciar produção
npm run seed      # Popular banco
```

## 🔒 Segurança

- ✅ Senhas criptografadas (bcryptjs)
- ✅ JWT com NextAuth
- ✅ Routes protegidas
- ✅ CSRF protection
- ✅ SQL injection prevention (Prisma)

## 📄 Licença

MIT

---

**Desenvolvido com Claude Code** 🤖
