# SCRUB | CIEE Rio

Sistema web para gerenciamento de ideias, projetos, tarefas, reuniões e colaboração com fluxo inspirado em Scrum e metodologia ágil.

## Estrutura

```text
Scrum-ciee/
  Frontend/   Aplicação Next.js pronta para Vercel
  Backend/    API Express/Prisma separada, opcional para uma próxima etapa
```

O deploy principal do sistema deve usar a pasta `Frontend`, que contém a interface atual do SCRUB.

## Rodar Localmente

```powershell
cd Frontend
npm install
npm run dev
```

Acesse:

```text
http://localhost:3000
```

## Validar Antes do Deploy

```powershell
cd Frontend
npm run typecheck
npm run build
```

## Deploy na Vercel

1. Suba este repositório para o GitHub.
2. Na Vercel, clique em `Add New Project`.
3. Importe o repositório.
4. Configure:
   - `Framework Preset`: Next.js
   - `Root Directory`: `Frontend`
   - `Install Command`: `npm install`
   - `Build Command`: `npm run build`
   - `Output Directory`: deixe vazio, a Vercel detecta o Next.js
5. Clique em `Deploy`.

O arquivo `Frontend/vercel.json` já registra os comandos principais para a Vercel.

## Variáveis de Ambiente

A interface atual não depende de variáveis obrigatórias para abrir na Vercel.

O arquivo `Frontend/.env.example` mantém `DATABASE_URL` apenas para scripts Prisma locais ou uma futura integração com banco. Se você for ativar persistência com Prisma, configure uma URL PostgreSQL real na Vercel.

## Backend

A pasta `Backend` contém uma API Express já compilada em `dist`, mas ela não é necessária para o frontend atual funcionar. Para produção completa com API e banco, recomenda-se hospedar o backend separadamente, por exemplo em Render, Railway, Fly.io ou outro serviço Node, e depois conectar o frontend por uma variável `NEXT_PUBLIC_API_URL`.

## Scripts do Frontend

```text
npm run dev        inicia o Next.js localmente
npm run build      gera o build de produção
npm run start      executa o build de produção
npm run lint       valida TypeScript
npm run typecheck  valida TypeScript
```
