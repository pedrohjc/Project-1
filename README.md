# Balance Studio

Uma plataforma web moderna onde clientes podem se cadastrar, fazer login e usar assistentes de Inteligência Artificial da Balance Solutions.

## 🚀 Tecnologias

- **Next.js 14** - Framework React com App Router
- **TypeScript** - Tipagem estática
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados (pode ser migrado para PostgreSQL/MySQL)
- **JWT** - Autenticação com tokens
- **bcryptjs** - Hash de senhas
- **Google Gemini API** - Integração com assistentes de IA (Gem: Balance Tradutor de Juridiquês)

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

## 🛠️ Instalação

1. Instale as dependências:
```bash
npm install
```

2. Configure o banco de dados:
```bash
npx prisma generate
npx prisma migrate dev --name init
```

3. Crie um arquivo `.env.local` na raiz do projeto:
```
DATABASE_URL="file:./dev.db"
JWT_SECRET="seu-secret-key-aqui-mude-em-producao"
NEXT_PUBLIC_API_URL="http://localhost:3000"
GEMINI_API_KEY="sua-chave-gemini-aqui"
```

**Importante:** 
- Você precisa de uma chave de API do Google Gemini. Obtenha em: https://aistudio.google.com/app/apikey
- O produto "Balance Tradutor de Juridiquês" usa a Gem configurada via `systemInstruction` no código

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

5. Acesse [http://localhost:3000](http://localhost:3000)

## 📁 Estrutura do Projeto

```
├── app/
│   ├── api/
│   │   ├── auth/          # Rotas de autenticação
│   │   └── ai/            # Rotas de produtos de IA
│   ├── dashboard/         # Página do dashboard
│   ├── login/             # Página de login
│   ├── register/          # Página de registro
│   └── page.tsx           # Página inicial
├── lib/
│   ├── auth.ts           # Funções de autenticação
│   ├── middleware.ts     # Middleware de autenticação
│   └── prisma.ts         # Cliente Prisma
└── prisma/
    └── schema.prisma     # Schema do banco de dados
```

## 🔐 Funcionalidades

- ✅ Registro de usuários
- ✅ Login e autenticação
- ✅ Dashboard protegido
- ✅ Assistente de IA integrado com Google Gemini:
  - Interface de conversa em tempo real
  - Suporte a textos longos e documentos (PDF, DOCX, imagens)
  - Histórico de conversa mantido
  - Processamento inteligente de conteúdo
  - Upload direto de arquivos para processamento

## 🔧 Personalização

### Configurar Google Gemini

1. Obtenha sua API key em https://aistudio.google.com/app/apikey
2. Adicione `GEMINI_API_KEY` no arquivo `.env.local`
3. O produto "Balance Tradutor de Juridiquês" usa o modelo `gemini-2.0-flash-exp` por padrão
   - Modelos disponíveis: `gemini-2.0-flash-exp`, `gemini-1.5-pro`, `gemini-1.5-flash`
   - Para mudar o modelo, edite `PRODUCT_CONFIGS` em `app/api/ai/assistant/route.ts`

### Adicionar Novos Produtos de IA

1. Edite `app/dashboard/page.tsx` para adicionar novos produtos
2. Crie novas rotas em `app/api/ai/` para processamento
3. Integre com outras APIs de IA conforme necessário

### Migrar para PostgreSQL/MySQL

1. Altere o `provider` em `prisma/schema.prisma` para `postgresql` ou `mysql`
2. Atualize a `DATABASE_URL` no `.env`
3. Execute `npx prisma migrate dev`

## 📝 Notas

- **Google Gemini API Key:** É necessário configurar a chave do Gemini para usar o assistente.
- **Custos:** O uso da API do Gemini gera custos. Monitore seu uso em https://aistudio.google.com/
- **Segurança:** O JWT_SECRET deve ser alterado em produção.
- **Produção:** Use HTTPS e configure adequadamente os cookies e variáveis de ambiente.
- **Upload de Arquivos:** A funcionalidade de upload de arquivos (PDF, DOCX, imagens) está totalmente integrada. Os arquivos são enviados diretamente para o Gemini como base64 para processamento.
- **Gem "Balance Tradutor de Juridiquês":** Configurada via `systemInstruction` no código para traduzir textos jurídicos complexos para linguagem simples.

## 📄 Licença

Este projeto é de código aberto e está disponível para uso pessoal e comercial.

