# Contexto de Infraestrutura AWS (Batoni Plataforma)

Este documento centraliza informações cruciais sobre a infraestrutura em nuvem, comandos de CI/CD e credenciais de acesso para a plataforma Batoni. Ele deve ser lido por modelos de Inteligência Artificial para entender as regras do projeto ao lidar com o servidor.

## 1. Arquitetura Geral

O projeto em produção roda majoritariamente no ecossistema de contêineres e banco de dados gerenciado da região \`us-east-2\` da **Amanzon Web Services (AWS)**.

*   **Cluster (ECS / Fargate):** \`balance-cluster1\`
*   **Serviço App (ECS):** \`batoni-platform-svc\`
*   **Repositório de Contêineres (ECR):** \`068795512734.dkr.ecr.us-east-2.amazonaws.com/batoni-platform:latest\`
*   **Banco de Dados (RDS / PostgreSQL):** Instância identificada como \`balance-postgres\`.

## 2. Processo de Deploy (CI/CD Local)

O processo de envio da aplicação local para o ambiente produtivo da nuvem é manual, executado via AWS CLI e Docker no terminal local do desenvolvedor. A ordem padrão adotada é:

1.  **Build** a imagem na máquina:
    \`docker build -t batoni-platform .\`
2.  **Autenticação** no ECR:
    \`aws ecr get-login-password --region us-east-2 | docker login --username AWS --password-stdin 068795512734.dkr.ecr.us-east-2.amazonaws.com\`
3.  **Tag e Push** para o repositório da Amazon:
    \`docker tag batoni-platform:latest 068795512734.dkr.ecr.us-east-2.amazonaws.com/batoni-platform:latest\`
    \`docker push 068795512734.dkr.ecr.us-east-2.amazonaws.com/batoni-platform:latest\`
4.  **Atualização e Substituição (Force New Deployment)** do container nos servidores:
    \`aws ecs update-service --cluster balance-cluster1 --service batoni-platform-svc --force-new-deployment --region us-east-2\`

## 3. Gestão de Banco de Dados

### 3.1 ORM e Variáveis
O projeto usa **Prisma ORM**. Todas as interações com o banco (migrações e pulls) utilizam a variável de ambiente \`DATABASE_URL\`.

*   **Local (\`.env\` / \`.env.local\`):** A ponta local da string de conexão do desenvolvedor aponta para \`postgresql://postgres:postgres@localhost:5432/batoni?schema=public\`.
*   **Produção (ECS):** A variável \`DATABASE_URL\` é mapeada diretamente na Task Definition da instância \`batoni-platform-svc\` nas variáveis de ambiente, apontando para o EndPoint exposto da instância RDS \`balance-postgres\`.
    *   **DATABASE_URL Atual:** \`postgresql://batoni_app:********@balance-postgres.cxqk8gmeutr2.us-east-2.rds.amazonaws.com:5432/batoni_platform?schema=public\`
    *   *Nota para as IAs:* **Você NÃO PRECISA de role temporária ou External ID**. O ambiente de terminal local ("C:\\DEV\\Cursor\\Batoni") onde você executa comandos já está logado com a AWS CLI na região \`us-east-2\` com a role/permissão administrativa necessária (\`arn:aws:iam::068795512734:user/pedro-cli\`). Para investigar recursos na nuvem, basta rodar comandos AWS CLI diretos.

### 3.2 Regras Estritas de Mutabilidade
> [!WARNING]
> O banco de dados **\`balance-postgres\`** (Produção) pode ser compartilhado com outras plataformas (como a Balance API, n8n webhook, etc).

**Ao lidar com o Banco de Dados em Produção, observe as seguintes restrições rigorosas:**

1.  **Nunca alterar senhas do banco (Modify-DB-Instance) via AWS CLI**, a não ser que expressamente solicitado, pois isso derrubará os microserviços compartilhados que ainda operam com a senha legada.
2.  **Cuidado com Comandos do Prisma em containers:** Se \`npx prisma db push\` for forçado nos scripts de \`package.json\` do projeto atual rodando na nuvem, ele pode **destruir ou subscrever** esquemas de tabelas que uma "Plataforma Irmã" precise, visto que ambas correm na mesma RDS.
3.  **Downtimes pós Deploy:** Após um \`force-new-deployment\`, o pool connection do Prisma do container antigo pode demorar a desalocar, esgotando o limite de conexões simultâneas da Máquina RDS para a 2ª plataforma, dando "timeout" por breves minutos.

## 4. Troubleshooting Compartilhado

Caso ocorra um incidente onde um Update (Deploy) nesta Plataforma do Batoni derrube o serviço em outra aplicação simultaneamente conectada, as causas primárias a auditar são:
1. Pool de conexões (Esgotamento na camada db).
2. Tabela reescrita (Prisma Migration / Push via docker build override).
3. ECS Resource Starvation nas instâncias subjacentes do cluster, caso rodem nos mesmos nodes.
4. (Menos provável se não houver comando claro) Modificação das "Secrets" ou Regras de SecGroup (Security Group Ingress) da VPC que barram o tráfego legímo do outro app.
