# APPlink — Plano de Implementação Técnica

> Plano para tirar o APPlink do papel até um MVP em produção, vendido avulso E
> embarcado no AppexCRM. Documento de arquitetura e roadmap — não código.
>
> Pré-requisitos: protótipo de telas (✅), análise funcional (✅),
> auditoria a11y (✅), sistema de design tokenizado (✅).

---

## 0. Resumo executivo

**O produto.** Encurtador inteligente de links + link-in-bio (smartpages) +
pixels de retargeting + captura de leads. Vendido de forma autônoma e como
**módulo white-label** do AppexCRM.

**O coração técnico.** O **serviço de redirect** com motor de roteamento
condicional (geolocalização, dispositivo, SO, A/B, expiração, limite de
cliques). Esse serviço determina o sucesso do produto: precisa ser **rápido
(<50 ms p95 globalmente), confiável (99,95 %), e auditável**.

**Stack ancorada no AppexCRM.** Para o módulo embarcar bem, frontend e backend
seguem a mesma stack do CRM: **React + Vite + Tailwind** no front, **NestJS +
PostgreSQL** no back. O redirect engine é uma **peça à parte, na edge**.

**Prazo realista do MVP.** 10–12 semanas com 1 PM, 2 engs full-stack, 1 eng
focado em performance/edge, 1 designer part-time. Lançamento avulso primeiro;
módulo do CRM em sprint dedicada após o MVP estabilizar.

---

## 1. Visão arquitetural

```
┌─────────────────────────────────────────────────────────────────┐
│  Domínios públicos do cliente   (vai.cliente.com.br, plnk.to)   │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTPS
        ┌────────▼─────────┐                       ┌──────────────┐
        │  REDIRECT EDGE   │ ◄────── KV cache ─────│ Origin API   │
        │  (Workers/Edge)  │                       │ NestJS       │
        │                  │                       │              │
        │  resolve slug,   │                       │ - CRUD       │
        │  aplica regras,  │                       │ - Analytics  │
        │  dispara pixels, │                       │ - Builder    │
        │  302 ao destino  │                       │ - Forms      │
        └────────┬─────────┘                       │ - Billing    │
                 │ evento de clique                │ - Webhooks   │
                 ▼                                 └─────┬────────┘
        ┌──────────────────┐                             │
        │  Analytics queue │                             │
        │  (Kafka/PubSub)  │                             │
        └────────┬─────────┘                             ▼
                 ▼                              ┌──────────────┐
        ┌──────────────────┐                    │ PostgreSQL   │
        │  Analytics store │                    │ (operacional)│
        │  ClickHouse      │                    └──────────────┘
        └──────────────────┘
                                                  ┌──────────────┐
                                                  │  Redis cache │
                                                  └──────────────┘
                                                  ┌──────────────┐
                                                  │  Object store│
                                                  │  (R2/S3)     │
                                                  └──────────────┘

        ┌─────────────────────────────┐    ┌─────────────────────┐
        │ Painel APPlink (React)      │    │ AppexCRM (módulo)   │
        │ - identidade NeonSpace      │    │ - iframe + SSO      │
        │ - tokens próprios           │    │ - tokens do CRM     │
        │ - billing próprio           │    │ - leads → funil CRM │
        └─────────────────────────────┘    └─────────────────────┘
```

**Três planos de execução, ortogonais:**

1. **Edge (redirect + tracking)** — caminho quente. Resolve sub-50 ms global.
2. **Origin (API + builder)** — caminho frio. Lida com CRUD, analytics agregadas, builder de smartpages, billing, integrações.
3. **Painel (frontend)** — duas peles do mesmo app, theming via tokens (avulso × módulo).

---

## 2. Stack recomendada

### 2.1 Frontend (painel + smartpage runtime)

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **React 18 + Vite** | Mesma do AppexCRM — o módulo precisa rodar dentro dele sem fricção |
| Estilo | **Tailwind + CSS variables (tokens)** | Sistema de tokens dos mockups (`tokens.css`) vira a fonte da verdade |
| Componentes | Sem lib externa pesada | `ui.css` dos mockups vira o ponto de partida; promover para componentes React |
| Roteamento | **React Router** ou **TanStack Router** | Padrão SPA |
| State | **TanStack Query** (server) + **Zustand** (UI) | Server cache + UI state local — sem Redux |
| Forms | **React Hook Form + Zod** | Validação tipada compartilhada front/back |
| Builder (smartpages) | **dnd-kit** | Drag & drop acessível, leve, ativo |
| Charts (analytics) | **Recharts** ou **visx** | Componíveis, leves |
| Fontes | Cabinet Grotesk + Satoshi (Fontshare) + Inter (Google) | Já definido nos mockups |
| Tipagem | **TypeScript strict** | Compartilha tipos do schema com o back |

### 2.2 Backend (origin)

| Camada | Escolha | Por quê |
|---|---|---|
| Framework | **NestJS** | Mesmo do AppexCRM — facilita o módulo e reuso de auth |
| Linguagem | **TypeScript** | Tipos compartilhados com o front |
| Banco operacional | **PostgreSQL 16** | Confiável, JSON nativo (smartpage schema), full-text para busca |
| ORM | **Prisma** ou **Drizzle** | Migrations versionadas + tipos automáticos |
| Cache quente | **Redis (Upstash)** | Slug→destino, sessões, rate-limit |
| Filas | **BullMQ** sobre Redis | Webhooks, exportações, processamento de leads |
| Storage | **Cloudflare R2** ou **AWS S3** | Imagens das smartpages, CSVs, QR codes |
| Auth | **NextAuth-style** ou **Auth.js** + JWT | Compatível com o SSO do AppexCRM |
| API | **REST + OpenAPI** + **GraphQL** opcional | REST cobre 95 %; OpenAPI gera SDK |
| Validação | **Zod** | Mesmo schema do front |
| Email | **Resend** | Convites, recuperação de senha, OTP |
| Pagamentos | **Stripe** + **Pagar.me** (BR) | Stripe global, Pagar.me para PIX/cartão BR |

### 2.3 Edge (redirect engine)

| Camada | Escolha | Por quê |
|---|---|---|
| Runtime | **Cloudflare Workers** | Latência <50 ms global, free tier generoso, KV embutido |
| Cache | **Cloudflare KV** + **Cache API** | Slug→regras em memória da edge |
| Geo / device | Request headers do Cloudflare | `cf-ipcountry`, `user-agent`, sem libs |
| Pixel injection | HTML intersticial leve quando GDPR popup ativo, redirect 302 direto caso contrário | |
| Logs | **Cloudflare Logpush** → ClickHouse | Stream de cliques sem perda |

**Alternativa**: Fly.io ou Vercel Edge se houver razão para fugir da Cloudflare.
A escolha Workers é por custo+latência+KV no mesmo lugar.

### 2.4 Analytics

| Camada | Escolha | Por quê |
|---|---|---|
| Armazenamento | **ClickHouse** (Tinybird ou self-hosted) | OLAP, ingestão de milhões de cliques, queries sub-segundo |
| Ingestão | Logpush → Kafka/Redpanda → ClickHouse | Buffer + replay se a ingestão cair |
| Deduplicação visit/unique | Cookie de 1ª parte + fingerprint leve | Vista no Switchy — distingue `visits` vs `unique` |

### 2.5 Infra & observabilidade

| Camada | Escolha |
|---|---|
| Hospedagem origin | **Railway**, **Fly.io** ou **AWS ECS** |
| CDN/edge | Cloudflare |
| Domínios customizados | Cloudflare for SaaS (auto-TLS) |
| CI/CD | GitHub Actions |
| IaC | Terraform (Cloudflare + AWS/Fly) |
| Logs | Better Stack ou Grafana Cloud |
| Erros | Sentry |
| Métricas | Grafana / Prometheus ou Datadog |
| Status público | BetterStack Status |

---

## 3. Domínios do produto (bounded contexts)

Os módulos do backend NestJS, com fronteiras bem definidas:

1. **Identity & Workspaces** — usuários, workspaces, papéis, convites, SSO com AppexCRM.
2. **Links** — CRUD de smart links, slug, regras (geo/device/OS/A/B/expiração).
3. **Smartpages** — páginas, blocos (JSON), publicação, versionamento.
4. **Domains** — domínios customizados, verificação DNS, TLS.
5. **Pixels** — IDs cadastrados por workspace.
6. **Analytics** — leitura agregada do ClickHouse, exportação.
7. **Forms & Leads** — submissões de form, webhook, sync com CRM.
8. **Integrations** — Zapier/webhook/API pública, API key.
9. **Billing** — planos, uso de cliques, faturas, Stripe/Pagar.me.
10. **Notifications** — email, in-app, alertas de limite.

Edge é um único worker que conhece **apenas** Links + Pixels + Domains
(em cache). Tudo o mais fica no origin.

---

## 4. Modelo de dados (resumo, PostgreSQL)

Tabelas principais (estilo). FK e índices implícitos. Sem campos de UI.

```
workspaces        id, owner_id, name, plan, billing_provider, created_at
users             id, email, password_hash, name, locale, two_factor
memberships       workspace_id, user_id, role            (papéis: owner|admin|editor|analyst)
oauth_links       user_id, provider (appex_crm|google), provider_user_id

domains           id, workspace_id, host, type (subdomain|root),
                  cname_target, status (pending|verified|error),
                  tls_status, last_check_at

links             id, workspace_id, folder_id, domain_id, slug,
                  type (link|whatsapp|email|...), title, description,
                  og_image_url, destination_url,
                  rules JSONB,                  ← geo/device/OS/AB/expiration/click_limit
                  expires_at, password_hash, cloaking, embed_widget_id,
                  utms JSONB, tags TEXT[], notes,
                  pixel_ids INT[],
                  created_at, updated_at, archived_at, click_count_cache

folders           id, workspace_id, name, position
tags              id, workspace_id, name
embed_widgets     id, workspace_id, name, html, js, position_rules JSONB

pixels            id, workspace_id, platform (meta|google_ads|tiktok|...), pixel_id, label

smartpages        id, workspace_id, slug, domain_id, title, theme JSONB,
                  blocks JSONB,                 ← array de blocos com props
                  published_version_id, draft_blocks JSONB, settings JSONB,
                  created_at, updated_at
smartpage_versions id, smartpage_id, version, blocks JSONB, created_at

forms             id, smartpage_id, name, fields JSONB,
                  webhook_url, terms_text, thank_you JSONB
leads             id, form_id, workspace_id, payload JSONB,
                  source, utms JSONB, crm_contact_id,    ← sync com AppexCRM
                  created_at

api_keys          id, workspace_id, hashed_key, label, scopes, last_used_at, revoked_at
webhooks          id, workspace_id, target_url, secret, events
audit_log         id, workspace_id, actor_id, action, target, before/after, at
billing_events    id, workspace_id, type, amount_cents, ref, at
usage_clicks      workspace_id, year_month, count, last_aggregated_at
```

**ClickHouse — eventos de clique (denormalizado, append-only)**

```
clicks  ts DateTime  workspace_id  link_id  slug  domain
        country  city  device  os  browser
        referer  utm_*  visitor_id (cookie fp)  is_unique
        pixel_ids Array(UInt32)  ab_variant  applied_rule
```

Partições por mês + ordenação por `link_id, ts`.

---

## 5. Serviço de redirect (engine condicional)

**Onde:** Cloudflare Worker.
**O que faz, na ordem:**

1. **Parse**: extrai `domain + slug` da URL.
2. **Resolve**: lê o link do KV (cache distribuído).
3. **Auth/lock**: se `password_hash` setado e cookie de auth ausente, serve a tela de senha (intersticial leve).
4. **Expiração**: se `expires_at < now` → redireciona à URL alternativa.
5. **Limite de cliques**: se ultrapassado → redireciona à URL alternativa.
6. **Roteamento condicional** (apenas UM tipo por vez, conforme mapeado na análise):
   - Geolocation: usa `cf-ipcountry`
   - Devices: parse de user-agent → PC | Phone | Tablet
   - Operating system: parse de user-agent
   - A/B Rotator: sorteio determinístico por `visitor_id` (sticky)
7. **Cloaking**: se habilitado, serve um HTML com iframe do destino (não 302).
8. **Pixels + UTM + GDPR popup**:
   - Sem GDPR popup: monta URL com UTMs e dispara 302; pixels disparam via tag no HTML do destino (impossível direto no 302) → **serve uma página de bridge mínima de ~80 ms quando há pixels** (similar ao que o Switchy faz na prática).
   - Com GDPR popup: intersticial com Continue/Decline → registra escolha em cookie.
9. **Tracking**: enfileira o evento `clicks` (não bloqueante) e responde.
10. **Cookie**: define `visitor_id` (uuid + httpOnly) para deduplicação `unique`.

**Latência alvo** p95: 25 ms sem bridge, 90 ms com bridge de pixel, 200 ms com cloaking iframe.

**Cache invalidation**: quando o usuário atualiza o link no painel, o origin
publica um evento em uma fila Cloudflare Queues que o Worker consome e atualiza
o KV. Janela de invalidação: ~5 s globalmente.

**Pré-requisitos críticos no MVP**: este motor + analytics ingest devem estar
em produção **na Sprint 4 no mais tardar**. É o caminho crítico.

---

## 6. Smartpages — editor + runtime

### 6.1 Schema de bloco (JSON, versionado)

```json
{
  "id": "uuid",
  "type": "button|text|card|carousel|form|video|audio|...",
  "props": { ... específico do tipo ... },
  "appearance": { "customColor": "...", "buttonType": "...", "height": 64 },
  "animation": { "enabled": true, "type": "pulse" },
  "schedule": { "from": "...", "to": "...", "timezone": "..." },
  "hidden": false
}
```

Lista de tipos no MVP: **Button, Text, Card, Form, Social, Video, Image, Avatar, Spacing, Separator, vCard, Messenger**. Demais (Shopify, Magento, WordPress, Music, Calendar, Q&A, Carousel, RSS, Audio, Iframe) ficam para Fase 2.

### 6.2 Editor

- 3 colunas (igual ao mockup `07-editor-smartpage.html`).
- `dnd-kit` para reordenar + arrastar da paleta.
- Histórico de undo/redo em memória (Zustand + immer).
- Auto-save em rascunho a cada N segundos; publicação cria nova `smartpage_versions`.
- Renderer compartilhado: o mesmo componente que pinta no editor pinta no runtime.

### 6.3 Runtime (página publicada)

- Static-first: ao publicar, o origin gera HTML pré-renderizado + JSON dos blocos.
- Servido pelo edge: HTML estático em KV; assets em R2.
- Form submission vai para `POST /api/forms/:id/submit` → cria lead → webhook + CRM sync.
- Privacy/GDPR popup respeitado antes de pixelar.

---

## 7. Analytics

### 7.1 Pipeline

```
Worker (clique) → Cloudflare Queues → Consumer (NestJS worker)
   → ClickHouse insert (batch 100ms ou 100 rows)
   → Trigger de agregados diários (materialized views)
```

### 7.2 Métricas no painel

- KPIs por link: Cliques, Únicos, Referrers, Devices, Países, Conversões (form submit).
- Painéis: clicks over time, países (mapa), browsers, OS, referrers, devices, UTMs, pixels.
- Por smartpage: visitas, leads, conversão, performance por bloco.

### 7.3 "Visits vs Unique"

`visitor_id` em cookie httpOnly (1ª parte) + fingerprint leve (UA hash + IP /24)
para o caso de cookie ausente. Janela: 30 dias. Replica o comportamento observado
no Switchy.

### 7.4 Compartilhar relatório

URL pública assinada (signed link) → renderiza um subset read-only dos dados.

---

## 8. Multi-tenancy & billing

### 8.1 Isolamento

- Toda query carrega `workspace_id` como tenant key.
- Linhas com tenant key são particionadas em ClickHouse.
- Limites por plano (cliques/mês, smartpages, domínios, membros) validados no
  serviço de Billing antes de executar a ação.

### 8.2 Planos (espelham a análise)

| Plano | Cliques/mês | Domínios | Smartpages | Membros |
|---|---|---|---|---|
| Starter | 10 000 | 2 | 2 (com logo) | 1 |
| Pro | 50 000 | 5 | 10 | 10 |
| Business | 150 000 | 15 | ilimitado | 15 |

### 8.3 Comportamento ao estourar

- 90 % do limite → email de aviso.
- 100 % → links continuam redirecionando, **pixels e tracking pausam**, criação
  de novos links bloqueada. Banner persistente no painel até resolver.

### 8.4 Stripe + Pagar.me

- Stripe para internacional / cartão.
- Pagar.me para BR (PIX, cartão BR, boleto).
- Webhook handler unificado normaliza eventos.

---

## 9. Modo módulo do AppexCRM

### 9.1 Identidade unificada (SSO)

- Usuário do AppexCRM faz login no APPlink **sem segundo cadastro**.
- Implementação: OAuth2 client interno do CRM → APPlink troca por sessão própria.
- `oauth_links` armazena o link entre `user_id` APPlink ↔ `crm_user_id`.

### 9.2 Theming white-label

- `data-brand` = `appex` carrega tokens do CRM (`#635BFF` etc.).
- O usuário não vê seletor de tema no modo módulo.
- Logo e wordmark são fornecidos pelo host (CRM) via header de identidade.
- Configurável por tenant: o CRM pode ter seus próprios clientes com marca
  própria (super-white-label).

### 9.3 Embed

- Iframe `<iframe src="https://applink.com/embed?token=..." />` dentro do CRM.
- Token JWT assinado pelo CRM, validado pelo APPlink. Expira em N min, refresh.
- Postmessage bridge para navegação cross-frame (breadcrumbs, deeplink).

### 9.4 Fluxo de dados — lead → funil do CRM

```
Form da Smartpage submetida
  → APPlink salva lead em `leads`
  → publica evento `lead.created` na fila
  → consumer chama a API do AppexCRM com o token do workspace
  → CRM cria contato + atividade no funil
  → APPlink atualiza `leads.crm_contact_id` com o id retornado
```

Idempotência por `lead.id`. Retry com backoff exponencial em falhas do CRM.

### 9.5 Eventos enviados ao CRM

| Evento | Quando |
|---|---|
| `applink.lead.created` | Submissão de form em smartpage |
| `applink.click.qualified` | Clique em link com tag de campanha relevante |
| `applink.link.shared` | Usuário do CRM cria um link no módulo |

O CRM cuida do que fazer com cada evento (timeline, atribuição, etc.).

---

## 10. Custom domains + TLS

- Usuário aponta CNAME para `links.applink.io`.
- API `POST /domains` cria o registro e inicia verificação:
  - Loop verifica DNS a cada 30 s por até 48 h.
  - Quando OK, chama Cloudflare for SaaS `POST /custom_hostnames` para emitir TLS.
  - Estado: `pending → verified → tls_pending → active`.
- A tela `13-domínios.html` reflete esses estados.

---

## 11. Pixels & retargeting

- Pixels são **dados configuráveis**, não código injetado pelo usuário.
- 13 plataformas suportadas no MVP (Meta, Google Ads, TikTok, LinkedIn,
  Pinterest, Snapchat, Twitter, Quora, Bing, GTM, AdRoll, GA4, VK).
- Renderização do tag de cada plataforma é responsabilidade do **bridge HTML do
  Worker** (item 5.8).
- Catálogo das tags em `worker/pixels/<platform>.ts` (uma função por plataforma,
  testável isoladamente).

---

## 12. Integrações

### 12.1 API REST pública

- Versão 1: `POST /v1/links`, `PATCH /v1/links/:id`, `GET /v1/links/:id`,
  `GET /v1/analytics/links/:id`.
- Autenticação: API Key (Bearer) com escopos (`links:write`, `analytics:read`).
- Rate limit: **1500 links/dia**, **100 links/hora** (espelha o Switchy).
- OpenAPI gerado → SDK TypeScript publicado em npm (`@applink/sdk`).

### 12.2 Webhook genérico

- Por form (saída no painel da smartpage).
- Por workspace (eventos globais: `link.created`, `lead.created`).
- HMAC SHA-256 assinatura no header `X-APPlink-Signature`.

### 12.3 Zapier + Make

- App publicada na marketplace de cada um.
- Triggers: `lead created`, `link clicked` (com filtros).
- Actions: `create link`, `update link`.

---

## 13. Segurança, LGPD, observabilidade

- **Autenticação**: bcrypt p/ senha, 2FA opcional via TOTP.
- **Rate limit** por API key + IP (Workers + Redis).
- **CSP/HSTS** em todos os domínios servidos.
- **CSRF** com tokens em mutations do painel.
- **Audit log** de tudo que muta link/smartpage/domínio (já no schema).
- **LGPD**:
  - Privacy popup pixelando só com consentimento (já no fluxo do Worker).
  - "Perfil de privacidade" do workspace exigido para ativar pixels.
  - DPA assinado com fornecedores (Cloudflare, Stripe, Resend).
  - DPO interno + canal `dpo@applink.com`.
  - Direito ao esquecimento: rota de exclusão de dados de visitante (`visitor_id`).
- **Observabilidade**: Sentry (erros), Prometheus (métricas), Grafana
  (dashboards), Loki (logs), Better Uptime (heartbeat + status page).
- **Backups**: PostgreSQL com PITR; ClickHouse com replicação 3 nós; R2 com
  versionamento ativado.

---

## 14. Roadmap por fases

### Fase 0 — Fundação (semana 0)

- Setup do monorepo (`turbo` ou `nx`), CI, ambientes.
- Provisionamento de infra (Terraform): Cloudflare, banco, edge, R2.
- Design system migrado para componentes React (a partir de `ui.css`/`tokens.css`).
- Pipeline de tokens (Style Dictionary) → publica para front + docs.

### Fase 1 — MVP avulso (semanas 1 a 10)

| Sprint | Entrega |
|---|---|
| 1 | Auth, workspaces, papéis, convites. Onboarding mínimo. |
| 2 | CRUD de links (form da tela 02), domínios padrão (`plnk.to`). Redirect Worker básico (sem regras). |
| 3 | Tracking de cliques no Worker, ingest p/ ClickHouse. Painel de links (tela 01). |
| 4 | Motor condicional: geo + device + OS + A/B + expiração + click limit. UTMs + pixels (sem GDPR popup ainda). |
| 5 | Pixels: cadastrar IDs + injeção via bridge HTML. Analytics por link (tela 03). |
| 6 | QR Code dinâmico (tela 10). Custom domains + verificação DNS + TLS (tela 13). |
| 7 | Smartpages: editor com 6 blocos (Button, Text, Card, Image, Social, Avatar). Runtime estático. |
| 8 | Form block + leads (sem CRM ainda). Webhook genérico. Privacy popup LGPD. |
| 9 | Billing: planos, limites, Stripe + Pagar.me, faturas. Cobrança real. |
| 10 | Hardening: a11y final, performance budget, segurança (pentest leve), observability. Lançamento avulso. |

### Fase 2 — Módulo AppexCRM + diferenciação (semanas 11 a 18)

| Sprint | Entrega |
|---|---|
| 11 | SSO com AppexCRM. Tema white-label travado em modo módulo. Tela 17 funcional. |
| 12 | Lead → CRM (sync de contato, atividade na timeline). Eventos `applink.*` no CRM. |
| 13 | Mais 6 tipos de bloco (Video, Form avançado, Q&A, Calendar, Maps, Messenger). |
| 14 | Deep linking — catálogo dos 20 principais apps BR. |
| 15 | A/B avançado (sticky por usuário, métricas comparativas). Audiências (tela 12) com export para plataformas. |
| 16 | API REST pública v1 + OpenAPI + SDK TypeScript. |
| 17 | Zapier + Make. Webhook form completo. |
| 18 | Performance: redirect <25 ms p95. Bulk import/edit. Equipes e papéis avançados. |

### Fase 3 — Escala (após semana 18)

- Cloaking, embed widgets, link expiration avançada.
- Resto dos blocos (Shopify, Magento, WordPress, Music, Audio, etc.).
- White-label por cliente do CRM (super-white-label).
- API Partner Plans (rate limits maiores, branding).
- Multi-região do Worker (já é edge, mas painel/origin em multi-região).

---

## 15. Riscos & mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Latência do redirect ultrapassa 100 ms p95 | Média | Alto | Edge cache agressivo; bridge HTML <80 ms; medir desde sprint 2 |
| Pixels disparam fora do consentimento (LGPD) | Baixa | Crítico | Privacy popup obrigatório por tenant antes de ativar pixels; auditoria automática |
| TLS de domínios customizados falha | Média | Médio | Cloudflare for SaaS faz o pesado; status visível na UI (tela 13) |
| Detecção de device/OS imprecisa | Média | Baixo | Usar UA-CH + fallback de parsing; testes em devices reais |
| AppexCRM muda contrato de SSO | Baixa | Alto | Manter cliente OAuth versionado; comunicação direta com time do CRM |
| Spam/abuso de criação de links | Alta | Médio | Rate limit + reputação por workspace + verificação de URL via Google Safe Browsing |
| Custo da edge cresce com sucesso | Média | Médio | Cache hit ratio >95 %; revisar plano Workers; alternativa Fly Edge |

---

## 16. Equipe e estimativas

### 16.1 Equipe mínima para MVP (10 semanas)

| Papel | FTE | Foco |
|---|---|---|
| Product Manager | 1.0 | Roadmap, prioridade, write specs |
| Eng Full-Stack senior | 1.0 | Origin (NestJS) + features verticais |
| Eng Full-Stack pleno | 1.0 | Painel (React) + builder de smartpages |
| Eng Performance/Edge | 0.5 | Worker, KV, ClickHouse, observability |
| Designer | 0.5 | Polimento UI + handoff (já tem o protótipo) |
| QA / Suporte | 0.3 | Testes manuais + canal de cliente |

**Total ≈ 4.3 FTE × 10 semanas.**

### 16.2 Custos de infra (estimativa MVP, mensal)

| Item | Custo |
|---|---|
| Cloudflare Workers + KV + Cache + for SaaS | $20–60 |
| PostgreSQL (Railway/Supabase) | $25–50 |
| Redis (Upstash) | $0–25 |
| ClickHouse (Tinybird ou self-hosted) | $50–150 |
| R2 (storage) | $5–20 |
| Resend | $20 |
| Sentry + observability | $26 |
| **Total** | **~$150–350/mês** |

Com tráfego sério (1 M cliques/mês), o ClickHouse cresce primeiro.

### 16.3 Custos de software/SaaS de produto

- Stripe: 2,9 % + R$0,39 por transação cartão internacional.
- Pagar.me: ~3,99 % cartão BR, R$ 3,49 PIX.
- Fontshare: grátis para Cabinet Grotesk + Satoshi.

---

## 17. O que NÃO vai estar no MVP

- Deep linking (Fase 2).
- Cloaking, embed widgets, A/B avançado (Fase 2/3).
- Audiências exportáveis (Fase 2).
- API pública (Fase 2).
- Bulk import/edit (Fase 2).
- White-label por cliente do CRM (Fase 3).
- Workspaces múltiplos por usuário em produção (Fase 2 — MVP terá 1 workspace por conta).

---

## 18. Checklist de prontidão pré-código

- [ ] Plano aprovado pelo PO.
- [ ] Time formado e onboarding feito.
- [ ] Contas criadas: Cloudflare, AWS/Railway, Stripe, Pagar.me, Resend, Sentry, GitHub org.
- [ ] Repos criados: `applink-web`, `applink-api`, `applink-edge`, `applink-tokens`.
- [ ] Domínios: `applink.io` (institucional), `app.applink.io` (painel), `links.applink.io` (CNAME target), `plnk.to` (shortener padrão).
- [ ] DPO e contrato LGPD pronto.
- [ ] Acordo de SSO com time do AppexCRM (mesmo que módulo seja Fase 2, o contrato precisa estar no radar).
- [ ] Naming final definido (atualmente APPlink é placeholder).

---

## 19. Decisões deixadas em aberto

Estas exigem alinhamento de produto/negócio antes de partir para o código:

1. **Naming final** — APPlink é codinome.
2. **Domínio de shortener padrão** — `plnk.to` é apenas exemplo nos mockups; precisa registrar / negociar.
3. **Métrica de cobrança** — confirmar "cliques/mês" como medidor de valor
   (vs links criados ou leads capturados). Impacta UX e schema.
4. **Modelo white-label** — o CRM cobra do cliente final ou o cliente final
   compra direto? Quem é o billing-of-record no modo módulo?
5. **Política de retenção de dados de visitante** — quanto tempo guardar
   `clicks` e `leads` por padrão (sugiro 24 meses, configurável).
