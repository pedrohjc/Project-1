# Contexto Geral do Projeto (Balance + Batoni)
Este arquivo consolida o contexto necessário para continuar o trabalho sem depender do histórico do chat.

## 1) Projetos e objetivos
- **Balance**: app Next.js com autenticação (email/senha + social), assinatura, uso de tokens e assistente de IA.
- **Batoni**: outro projeto que também usa o banco RDS `balance-postgres`.
- **Região AWS**: `us-east-2`.

## 1.1) Stack e padrões gerais
- **Framework**: Next.js (App Router), API routes em `app/api/*`.
- **ORM**: Prisma.
- **Autenticação**: JWT via cookie `token` (httpOnly).
- **Estilo**: UI simples em páginas `app/*` com CSS local e `app/globals.css`.

## 2) Infra AWS (produção)
- **ECS/Fargate**
  - Cluster: `balance-cluster1`
  - Service Balance: `balance-app-svc`
  - Service Batoni: `batoni-platform-svc`
  - Task definitions: `balance-app-task` e `batoni-platform-task` (ver revisions)
- **RDS PostgreSQL**: `balance-postgres`
  - Master username: `balance`
  - Endpoint: `balance-postgres.cxqk8gmeutr2.us-east-2.rds.amazonaws.com`
  - Banco usado pelo Balance: `postgres` (com `schema=public`)

## 2.1) Variáveis de ambiente (sem valores)
- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `OPENAI_API_KEY`, `OPENAI_MODEL`
- `GEMINI_API_KEY`
- `MERCADOPAGO_ACCESS_TOKEN`
- `GOOGLE_CLIENT_ID`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `ADMIN_EMAILS`
- `N8N_WEBHOOK_URL`

## 3) Regras críticas de segurança
**NUNCA** colocar credenciais reais neste arquivo.  
As credenciais ficam no ECS (Environment variables / Secrets).  
Se precisar consultar, use AWS CLI ou Console.  

**Não alterar senha do RDS** sem autorização explícita do dono (impacta outros serviços).

**Não rodar** `prisma db push` em produção — risco de sobrescrever schema compartilhado.

## 3.1) Regras do banco compartilhado
- O RDS `balance-postgres` é compartilhado por múltiplas plataformas.
- Alterações de schema devem ser feitas com migrações controladas (nunca `db push`).

## 4) Diagnose rápido de login (produção)
Se o login 500, checar logs do CloudWatch no grupo:
- `/ecs/balance-app-task`

Erros comuns e causa:
- **P1000**: credenciais inválidas no `DATABASE_URL` (usuário/senha errados).
- **Database `=public` does not exist**: `DATABASE_URL` mal formado (query quebrou).

## 5) Formato correto do DATABASE_URL
**Exato formato esperado**:
```
postgresql://<USER>:<PASS>@balance-postgres.cxqk8gmeutr2.us-east-2.rds.amazonaws.com:5432/postgres?schema=public
```
Notas:
- Senha deve estar **URL-encoded** se tiver caracteres especiais.
- A query precisa ser **`?schema=public`** (não virar parte do path).

## 5.1) Como validar rapidamente o DATABASE_URL
- **Path** precisa ser `/postgres`.
- **Query** precisa ser `?schema=public`.
- Se a senha tiver caracteres especiais, **URL‑encode** obrigatório.

## 6) Deploy manual (padrão)
```
docker build -t balance-app .
aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 068795512734.dkr.ecr.us-east-2.amazonaws.com
docker tag balance-app:latest 068795512734.dkr.ecr.us-east-2.amazonaws.com/balance-app:latest
docker push 068795512734.dkr.ecr.us-east-2.amazonaws.com/balance-app:latest
aws ecs update-service --cluster balance-cluster1 --service balance-app-svc --force-new-deployment --region us-east-2
```

## 7) Autenticação e usuários (app)
- Prisma usa `User.passwordHash` (não `password`).
- Usuários OAuth podem ter `passwordHash` nulo.
- Login social cria usuário sem senha (OAuth).

## 7.1) Fluxo de login
- **Email/senha**: `POST /api/auth/login`
- **Social**: `POST /api/auth/social` (Google/Facebook/LinkedIn)
- **Registro**: `POST /api/auth/register`
- **Perfil**: `GET/PUT /api/auth/profile`

## 8) Pastas importantes (repo)
- API auth: `app/api/auth/*`
- API IA: `app/api/ai/*`
- API conversas: `app/api/conversations/*`
- API subscriptions: `app/api/subscriptions/*`
- Prisma schema: `prisma/schema.prisma`
- Prisma migrations: `prisma/migrations/*`
- Cliente Prisma: `lib/prisma.ts`
 - Auth helpers: `lib/auth.ts`

## 9) Diagnóstico AWS via CLI
CLI autenticado localmente como:
```
arn:aws:iam::068795512734:user/pedro-cli
```
Use comandos diretos para ECS/Logs/RDS:
- `aws ecs describe-services ...`
- `aws ecs describe-task-definition ...`
- `aws logs get-log-events ...`
- `aws rds describe-db-instances ...`

## 10) Incidentes anteriores
- Em produção, o login falhou por:
  - senha do `DATABASE_URL` desatualizada em ECS
  - URL mal formada (query virou path)
- Correção: ajustar `DATABASE_URL` no task definition do Balance.

## 11) Telas principais (Balance)
- `/login` (login + social)
- `/register`
- `/dashboard`
- `/subscription` (status/upgrade)

## 12) Observações úteis para próxima IA
- **Nunca** gravar credenciais reais em arquivos do repo.
- Sempre validar logs no CloudWatch antes de mexer em env vars.
- Mudanças em ECS devem ser feitas criando **nova revision** e atualizando o service.

