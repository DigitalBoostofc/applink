# Features Specification — APPlink

> **Documento de handoff pra backend + frontend real.**
> Consolida cada feature implementada nos mockups com: status, UX flow, data model, business rules, API endpoints, eventos, edge cases. Use como source-of-truth quando começar a implementar backend (NestJS) ou frontend real (Next.js).

**Versão:** 2.0 · 2026-05-25
**Last sync com mockups:** commit `20f7d0a`+ (Features 5/6 + mockups parciais resgatados)
**Status legenda:**
- 🟢 **READY** — Mockup completo + spec definida, dá pra começar backend
- 🟡 **PARCIAL** — Mockup existe mas spec precisa refinamento (questões em aberto)
- 🔴 **STUB** — Mockup é placeholder, precisa design adicional antes de spec

---

## Índice

**A — Smart Tracking Pipeline (Hyros-style):**
- [A1. Smart Conversion Tracking (4 tiers)](#a1)
- [A2. Pixel Tracker JS](#a2)
- [A3. Pipeline de Audiências auto-segmentadas](#a3)
- [A4. Multi-touch Journey (6 modelos)](#a4)
- [A5. ROI Dashboard por canal/campanha](#a5)
- [A6. Cohort & LTV Analysis](#a6)

**B — Smart Links (core):**
- [B1. Criação de Link — fluxo principal](#b1)
- [B2. Mutex de Roteamento (4-way)](#b2)
- [B3. Teste A/B com N variantes](#b3)
- [B4. Geolocalização BR (estados + cidades)](#b4)
- [B5. Dispositivos (form factor)](#b5)
- [B6. Sistema Operacional](#b6)
- [B7. Limites & segurança](#b7)
- [B8. Personalização de preview social](#b8)
- [B9. Pixel Library + Modal "Novo Pixel"](#b9)
- [B10. UTM Templates](#b10)
- [B11. Domínio + slug customizado](#b11)
- [B12. Organização (Pasta, Notas, Etiquetas)](#b12)

**C — Dashboard (Lista de Links):**
- [C1. Lista de links + filtros + paginação](#c1)
- [C2. Bulk actions](#c2)
- [C3. Modal de stats por link](#c3)

**D — Analytics:**
- [D1. Visão geral por domínio](#d1)
- [D2. KPIs do domínio + chart temporal](#d2)
- [D3. Breakdown por país, dispositivo, SO, browser](#d3)
- [D4. Top links do domínio](#d4)
- [D5. Pixels attribution](#d5)

**E — Smartpages:**
- [E1. Lista de smartpages](#e1)
- [E2. Editor + Leads capture](#e2)

**F — Pixels (página dedicada):**
- [F1. Biblioteca de Pixels CRUD](#f1)
- [F2. Pixel Tracker JS install flow](#f2)

**G — Audiências:**
- [G1. Audiências auto-segmentadas + Sync](#g1)

**H — Domínios** · [I — Integrações](#i) · [J — Equipe](#j) · [K — Billing](#k) · [L — Settings](#l) · [M — Auth](#m)

**Transversal:**
- [Modelo de eventos](#evt)
- [Webhooks](#wh)
- [Rate limits + multi-tenancy](#mt)
- [Glossário](#gloss)

---

## A — Smart Tracking Pipeline (features Hyros-style)

Conjunto de 4 features que diferenciam o APPlink das ferramentas estrangeiras. Ninguém no mercado BR oferece esse stack.

---

### <a id="a1"></a>A1. Smart Conversion Tracking · 4 tiers (PURE/HOT/WARM/COLD)

**Status:** 🟢 READY
**Mockup:** `mockups/02-criar-link.html` → Opções avançadas → "Modo de disparo de eventos"

**O que faz:**
Em vez de disparar evento Meta CAPI / Google Ads no click do link, o APPlink espera o lead se qualificar na landing page e dispara o evento na qualidade correta. 4 tiers de qualificação:
- **PURE** → lead com sinal de compra forte (Add to Cart, checkout, etc.)
- **HOT** → engagement profundo (>60s na página + scroll 70%)
- **WARM** → engagement médio (>30s na página)
- **COLD** → click simples (default sem critério)

**UX flow:**
1. Card "Pixels" no Criar Link tem botão "Configurar modo de disparo de eventos" (só aparece se ≥1 pixel selecionado)
2. Click abre Opções avançadas + scroll suave + expande accordion "Modo de disparo de eventos"
3. Conteúdo expandido: 2 radios — **Imediato** (default Meta CAPI no click) vs **Smart Tracking** (deferred firing)
4. Smart Tracking revela: 4 tiers em grid 2×2 com:
   - Checkbox de critérios (Add to Cart, Time on page, Scroll %, Form fill, etc.)
   - Event name select (Lead, Contact, AddToCart, Purchase, ViewContent, etc.)
   - Value R$ (configurável por tier)
5. Botão "Salvar configuração" colapsa o accordion + badge ATIVO

**Data model:**
```sql
CREATE TABLE link_tracking_config (
  link_id           UUID PRIMARY KEY REFERENCES links(id),
  mode              VARCHAR(20) DEFAULT 'immediate', -- 'immediate' | 'smart'
  pure_event        VARCHAR(60),   -- ex: 'Purchase'
  pure_value_cents  INT,           -- valor em centavos
  pure_criteria     JSONB,         -- {add_to_cart: true, checkout_start: true}
  hot_event         VARCHAR(60),   -- ex: 'Lead'
  hot_value_cents   INT,
  hot_criteria      JSONB,         -- {time_on_page: 60, scroll_pct: 70}
  warm_event        VARCHAR(60),   -- ex: 'Contact'
  warm_value_cents  INT,
  warm_criteria     JSONB,         -- {time_on_page: 30}
  cold_event        VARCHAR(60),   -- ex: 'ViewContent'
  cold_value_cents  INT,
  cold_criteria     JSONB DEFAULT '{}', -- default trigger no click
  updated_at        TIMESTAMP DEFAULT NOW()
);
```

**Business rules:**
- Smart Tracking só funciona com Pixel Tracker JS instalado na LP (ver A2)
- Auto-mapping per pixel platform: Meta → Lead/Purchase, TikTok → Contact, Google → conversion_action_id, etc. (mapping fica na engine, não exposto na UI)
- Pixels herdam do card "Adicionar Pixels" acima (não duplica seleção)
- Valor configurável por link (não por workspace)
- Quando lead bate PURE, eventos COLD/WARM/HOT inferiores também são disparados (escalada cumulativa)

**API endpoints:**
- `GET /links/{id}/tracking-config` — retorna config
- `PUT /links/{id}/tracking-config` — atualiza config
- Quando o tracker JS dispara: `POST /tracking/{link_id}/qualify` → engine decide qual tier + dispara webhooks Meta/Google/etc.

**Eventos disparados:**
- `link.qualified` → payload `{link_id, tier, event_name, value_cents, user_signals}` (broadcast pra audiences pipeline)

**Edge cases:**
- Pixel JS não instalado → fallback pra modo imediato + alerta no painel
- Lead navega entre LPs → mesmo qualification persiste via click_id cookie
- Smart Tracking + iOS Safari → server-side firing usa first-party data (não cookie 3rd party)

---

### <a id="a2"></a>A2. Pixel Tracker JS · snippet pras LPs

**Status:** 🟢 READY
**Mockup:** `mockups/11-pixels.html` → topo da página

**O que faz:**
Snippet JavaScript que o usuário instala na LP. Faz:
1. Captura `click_id` da URL (parâmetro vindo do redirect)
2. Coleta sinais de engagement (time on page, scroll, clicks, form fills)
3. Envia eventos pro endpoint `tracker.applink.com.br/event` (1st party data)
4. Hash de PII (email, telefone, nome) com SHA-256 antes de enviar
5. Dispara pixel server-side (não depende de cookie 3rd party)

**UX flow:**
1. Card destacado no topo de `/pixels` com:
   - Título "Pixel Tracker JS PRO" + ícone gradient lime→coral
   - 4 bullets explicativos (click_id, eventos, server-side, hash PII)
   - Code block com snippet (~20 linhas JS) + botão "Copiar"
   - 3 KPIs killer: 99.3% Bypass iOS ATT · 9.2/10 Match Quality Meta · 1.247 eventos hoje
2. Lista de domínios autorizados com estados: ✓ Instalado · ⚠ Pendente · ✗ Erro
3. Botão "+ Adicionar domínio" (prompt + nova linha pending)
4. Botões "Testar instalação agora" (auto-check) + "Guia de instalação" (modal 5 etapas)

**Data model:**
```sql
CREATE TABLE workspace_domains (
  id           UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  domain       VARCHAR(255) NOT NULL,
  install_status VARCHAR(20) DEFAULT 'pending', -- 'installed' | 'pending' | 'error'
  last_event_at TIMESTAMP,
  last_check_at TIMESTAMP,
  events_today INT DEFAULT 0,
  match_quality DECIMAL(3,1),
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tracker_events (
  id           UUID PRIMARY KEY,
  click_id     UUID,                 -- vincula ao click original
  domain_id    UUID REFERENCES workspace_domains(id),
  event_type   VARCHAR(40),          -- 'page_view' | 'engagement' | 'form_fill' | 'cart' | 'purchase'
  signals      JSONB,                -- {time_on_page: 45, scroll: 70, clicks: 3}
  user_data    JSONB,                -- hashed PII: {em: sha256, ph: sha256}
  ip_anon      INET,                 -- IP anonimizado (último octeto zerado)
  user_agent   TEXT,
  created_at   TIMESTAMP DEFAULT NOW()
);
```

**Business rules:**
- Snippet deve ser único por workspace (mesmo `workspace_id` no script)
- Domínios precisam ser validados via challenge (DNS TXT ou JS check) antes de "installed"
- Hash de PII obrigatório no client antes de enviar (não permitir email/telefone em claro)
- Match quality calculado pela Meta CAPI (retornado pelo Marketing API)

**API endpoints:**
- `POST /tracker/event` — receive event do JS (rate-limited)
- `GET /workspaces/{id}/domains` — lista
- `POST /workspaces/{id}/domains` — add domain
- `POST /workspaces/{id}/domains/{id}/verify` — trigger verificação
- `GET /workspaces/{id}/tracker-snippet` — retorna JS customizado

**Modal Guia de Instalação (multi-step 5 etapas):**
1. Onde instalar (grid 2×3: HTML/Shopify/WP/GTM/Wix)
2. Copiar snippet (code + botão copiar)
3. Verificar instalação (auto-check — único método)
4. Smart Tracking eventos automáticos + custom events
5. Success card com CTAs Docs e Suporte

**Modal "Conectar Pixel":**
- Botão "+ Conectar pixel" no header abre modal idêntico ao do Criar Link (Selecione plataforma · Nome · ID + "Como encontro meu ID?")
- Validação reativa habilita "Conectar" só com 3 campos preenchidos
- ESC + backdrop + X fecham

**Edge cases:**
- Snippet em iframe / cross-origin → fallback pra postMessage
- LP usa CSP rígido → docs explicam adicionar tracker.applink.com.br à allowlist
- iOS Safari ITP → server-side fingerprinting (não cookie)

---

### <a id="a3"></a>A3. Pipeline de Audiências auto-segmentadas

**Status:** 🟢 READY
**Mockup:** `mockups/12-audiencias.html` → topo da página

**O que faz:**
Audiências auto-segmentadas pela qualidade do lead (vinculada ao A1). Sincroniza automaticamente com Meta/TikTok/Google Ads. Banner sugere criar Lookalike Premium baseado em LTV.

**UX flow:**
1. Card novo no topo (antes de "Suas audiências") com:
   - Header gradient + badge SMART TRACKING PRO
   - 4 tiers em grid (PURE/HOT/WARM/COLD), cada um:
     - Tamanho (127, 845, 2.341, 8.912 pessoas)
     - CPL histórico (R$28, R$12, R$6, R$2)
     - Quality bar + score (8.5/6.8/4.2/2.1 de 10)
     - Borda lateral gradient da cor do tier
   - Sync badges horizontais: Meta ✓ · TikTok ✓ · Google Ads ⏳ (dots pulsantes verdes ou yellow pending)
   - Banner de sugestão actionable:
     - "Sugestão: criar Lookalike só do PURE"
     - "LTV médio R$ 850 vs R$ 230 da média geral" + CPM 35% menor
     - Botão "Criar Lookalike Premium →" → toast lime "Lookalike Premium criado · sincronizando"

**Data model:**
```sql
CREATE TABLE audiences (
  id           UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  name         VARCHAR(120) NOT NULL,
  tier         VARCHAR(10),     -- 'pure' | 'hot' | 'warm' | 'cold' | 'custom' | 'lookalike'
  source       VARCHAR(40),     -- 'smart_tracking' | 'manual' | 'lookalike'
  parent_id    UUID,            -- pra lookalikes
  size         INT,
  quality_score DECIMAL(3,1),   -- 0-10
  avg_cpl_cents INT,            -- R$ * 100
  avg_ltv_cents INT,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE audience_members (
  audience_id  UUID REFERENCES audiences(id),
  user_hash    CHAR(64),        -- sha256(email|phone)
  added_at     TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (audience_id, user_hash)
);

CREATE TABLE audience_syncs (
  id           UUID PRIMARY KEY,
  audience_id  UUID REFERENCES audiences(id),
  platform     VARCHAR(20),     -- 'meta' | 'tiktok' | 'google_ads' | 'linkedin'
  external_id  VARCHAR(80),     -- ID da audiência na plataforma
  status       VARCHAR(20),     -- 'syncing' | 'synced' | 'error'
  last_sync_at TIMESTAMP,
  error_msg    TEXT
);
```

**Business rules:**
- Audiências PURE/HOT/WARM/COLD são auto-criadas pelo workspace quando A1 é configurado
- Sync automático a cada 15min (cron) — adiciona novos qualified leads aos external IDs
- Lookalike Premium = lookalike só do PURE com seed mínimo de 100 pessoas
- Quality score = média ponderada (engagement signals × LTV histórico × tier weight)

**API endpoints:**
- `GET /workspaces/{id}/audiences` — lista
- `POST /workspaces/{id}/audiences` — criar custom
- `POST /workspaces/{id}/audiences/{id}/sync` — force sync agora
- `POST /workspaces/{id}/audiences/{id}/lookalike` — criar lookalike no Meta/Google

**Edge cases:**
- Lookalike < 100 pessoas seed → mostra erro "audience mínimo 100 pra lookalike"
- Sync com Meta falha → retry exponential backoff + alerta após 3 falhas
- LGPD: usuário pediu opt-out → remove de TODAS as audiences + dispara erase nas plataformas

---

### <a id="a4"></a>A4. Multi-touch Journey · 6 modelos de atribuição

**Status:** 🟢 READY
**Mockup:** `mockups/03-analytics-link.html` → card "Jornada multi-touch"

**O que faz:**
Visualização interativa da jornada multi-touch do lead que converteu + comparação de 6 modelos de atribuição lado a lado + insight automático "qual modelo recomendado".

**UX flow:**
1. Card "Jornada multi-touch · atribuição completa" entre o gráfico temporal e o panels-geo
2. Header: ícone gradient + título + badge "Smart Tracking PRO"
3. **Model selector** (6 pills horizontais): First-touch · Last-click (PADRÃO) · Linear · Time-decay · U-shaped · W-shaped
4. **Journey visual** (5 touchpoints + conversão):
   - Cada touchpoint: ícone colorido (Meta/Google/Email/Story/Direct) · label · % atribuído
   - Setas conectando + node final "Conversão" 100%
5. **Tabela comparativa** 5 canais × 6 modelos · célula da coluna ativa destacada lime
6. Coluna "R$ atribuído" calculada dinamicamente (base R$ 12.272)
7. **Insight callout** contextual: headline + body + CTA "Mudar pra X →" encadeia próximo modelo

**Data model:**
```sql
CREATE TABLE click_journeys (
  id              UUID PRIMARY KEY,
  conversion_id   UUID REFERENCES conversions(id),
  link_id         UUID REFERENCES links(id),
  touchpoints     JSONB,    -- [{channel: 'meta_ads', at: ts, click_id: uuid}, ...]
  total_touches   INT,
  window_days     INT,      -- janela de atribuição
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE attribution_models (
  id              VARCHAR(20) PRIMARY KEY,  -- 'first' | 'last' | 'linear' | 'decay' | 'u' | 'w'
  name            VARCHAR(60),
  description     TEXT,
  is_default      BOOLEAN DEFAULT FALSE
);
```

**Business rules:**
- Modelos calculados pela engine no read-time (não persistir credit %, é derivação)
- Janela de atribuição configurável (default 7 dias, editável no plano Pro/Business)
- First-touch = 100% pro primeiro touchpoint
- Last-click = 100% pro último (Google Ads / direct)
- Linear = 1/N pra cada touchpoint
- Time-decay = peso exponencial decrescente do mais antigo
- U-shaped = 40% first + 40% last + 20% distribuído no meio
- W-shaped = 30% first + 30% lead-capture + 30% last + 10% meio
- Money atribuído = (revenue / 100) × model_credit_pct

**API endpoints:**
- `GET /links/{id}/journey?model={model}&window={days}` — retorna jornada média + credit distribution
- `GET /workspaces/{id}/attribution-models` — lista modelos disponíveis

**Engine de cálculo:**
```typescript
function attribute(touchpoints, model) {
  switch(model) {
    case 'first':  return [{ touch: touchpoints[0], credit: 100 }];
    case 'last':   return [{ touch: touchpoints.last, credit: 100 }];
    case 'linear': return touchpoints.map(t => ({ touch: t, credit: 100/touchpoints.length }));
    case 'decay':  return decayedCredit(touchpoints, halfLife=7);
    case 'u':      return uShape(touchpoints, [40, 20, 40]);
    case 'w':      return wShape(touchpoints, [30, 30, 10, 30]);
  }
}
```

**Edge cases:**
- 1 touchpoint só → todos modelos = 100% pra ele
- Touchpoints > 10 → mostra "..." no visual mas conta no cálculo
- Janela expirou → touchpoint não conta na atribuição
- Modelo W-shaped sem lead-capture identificável → cai pra U-shaped

---

### <a id="a5"></a>A5. ROI Dashboard · ROAS por canal/campanha

**Status:** 🟢 READY
**Mockup:** `mockups/03-analytics-link.html` → card "ROAS por canal · revenue vs ad spend"

**O que faz:**
Painel de ROI real (Return on Ad Spend) por canal/campanha. Mostra gasto vs revenue atribuído, ROAS por linha, CPA, status de saúde da campanha, alertas actionable (pausar campanha perdendo, escalar lucrativa, etc.).

**UX flow:**
1. Card destacado entre Multi-touch Journey e panels-geo
2. Header com ícone gradient + badge "Smart Tracking PRO" + **period selector** (7d/30d/90d/YTD)
3. **4 KPI cards:**
   - Ad Spend (com delta vs período anterior)
   - Revenue atribuído (com delta)
   - ROAS médio (destaque verde — KPI principal)
   - CPA médio (com delta down=bom)
4. **Tabela de canais** (6 colunas + total):
   - Canal/Campanha (com dot colorido por plataforma)
   - Spend · Conversões · CPA · Revenue · ROAS · Status
   - Status pills: ★ Star · ✓ Lucrativa · ⚠ Break-even · 🚨 Perdendo · ≈ Pequeno volume
   - Cores: win=verde · loss=vermelho · total=lime highlight
5. **Alertas actionable** (3 tipos):
   - **Critical:** "Campanha queimando R$ X/mês" + CTA "Pausar campanha"
   - **Win:** "Lookalike Premium escalável" + CTA "Aumentar 50%"
   - **Warning:** "Break-even — janela curta de decisão" + CTA "Ver criativos"

**Data model:**
```sql
CREATE TABLE ad_campaigns (
  id              UUID PRIMARY KEY,
  workspace_id    UUID REFERENCES workspaces(id),
  platform        VARCHAR(20),     -- 'meta' | 'google' | 'tiktok' | 'linkedin'
  external_id     VARCHAR(120),    -- ID da campanha na plataforma
  name            VARCHAR(200),
  status          VARCHAR(20),     -- 'active' | 'paused' | 'archived'
  created_at      TIMESTAMP DEFAULT NOW()
);

-- snapshot diário pra cálculo de ROAS histórico
CREATE TABLE campaign_metrics_daily (
  campaign_id     UUID REFERENCES ad_campaigns(id),
  date            DATE,
  spend_cents     INT,
  impressions     INT,
  clicks          INT,
  conversions     INT,
  revenue_cents   INT,
  PRIMARY KEY (campaign_id, date)
);

CREATE TABLE campaign_alerts (
  id              UUID PRIMARY KEY,
  workspace_id    UUID REFERENCES workspaces(id),
  campaign_id     UUID REFERENCES ad_campaigns(id),
  severity        VARCHAR(20),     -- 'critical' | 'warning' | 'win'
  type            VARCHAR(40),     -- 'roas_below_threshold' | 'scale_opportunity' | etc.
  title           VARCHAR(200),
  body            TEXT,
  action          JSONB,           -- {type: 'pause', confirm: true}
  status          VARCHAR(20),     -- 'open' | 'dismissed' | 'acted'
  created_at      TIMESTAMP DEFAULT NOW()
);
```

**Business rules:**
- ROAS = revenue_cents / spend_cents (cuidado com div-by-zero)
- Status thresholds (configurável por workspace):
  - Star: ROAS > 5×
  - Lucrativa: ROAS ≥ break-even threshold (default 2×)
  - Break-even: ROAS entre 1.8× e 2.2×
  - Perdendo: ROAS < 1.5×
  - Pequeno volume: spend < R$ 1.000 (não confiável estatisticamente)
- Alert rules (cron a cada 6h):
  - Critical: campanha com 30 dias rodando + ROAS < 1.5×
  - Win: campanha com ROAS > 4× + spend > R$ 1k (escalável)
  - Warning: ROAS entre 1.8× e 2.2× há ≥14 dias

**API endpoints:**
- `GET /workspaces/{id}/roi?period=30d` — KPIs + breakdown por canal
- `GET /workspaces/{id}/campaigns` — lista de campanhas
- `GET /workspaces/{id}/alerts?open=true` — alertas abertos
- `POST /campaigns/{id}/pause` — pausar via Meta/Google API
- `POST /campaigns/{id}/budget` — aumentar budget via API
- `POST /alerts/{id}/dismiss` — marcar como visto

**Integrações externas:**
- Meta Marketing API (read ads_insights + write campaign budget/status)
- Google Ads API (read + write campaigns)
- TikTok Marketing API
- LinkedIn Ads API

**Edge cases:**
- Workspace sem ads conectados → estado vazio com CTA "Conectar Meta/Google"
- Revenue não atribuído (sem pixel) → fallback "Revenue 0 — instale o tracker"
- API da plataforma indisponível → cache + warning "dados de N horas atrás"
- Multi-currency → converter pra BRL no display (cache de cotação)

---

### <a id="a6"></a>A6. Cohort &amp; LTV Analysis

**Status:** 🟢 READY
**Mockup:** `mockups/03-analytics-link.html` → card "Cohort &amp; LTV"

**O que faz:**
Análise de cohorts (grupos de clientes adquiridos no mesmo mês) com matriz de retenção/LTV/recompra. Mostra LTV médio por canal de aquisição pra responder "qual canal gera cliente mais valioso ao longo do tempo?".

**UX flow:**
1. Card destacado depois do ROI Dashboard
2. Header com ícone gradient violet→lime + badge "Smart Tracking PRO" + **mode selector** (Retenção / LTV $$ / Recompra)
3. **Matriz cohort** 7 meses × 7 colunas M0-M6:
   - Cada linha = cohort de aquisição (Dez 2025 → Jun 2026)
   - Tamanho do cohort (ex: "412 leads") na primeira coluna
   - Heatmap 6 níveis (h0-h5) gradient purple→lime
   - M0 sempre 100% (mês de aquisição) · células vazias pros meses futuros
   - Hover: scale 1.06 + z-index (destaque interativo)
4. **LTV por canal de aquisição** (grid 4 cards):
   - Meta Ads · LAL (R$ 1.247 LTV)
   - Google Ads · Brand (R$ 2.108 LTV)
   - Orgânico · Insta (R$ 1.690 LTV)
   - Tráfego direto (R$ 920 LTV)
   - Cada card: CAC + payback period
5. **Insight callout violet** comparando canais (ex: "Google Brand gera cliente 69% mais valioso vs Meta LAL")

**Data model:**
```sql
CREATE TABLE customer_cohorts (
  user_id         UUID PRIMARY KEY,
  workspace_id    UUID REFERENCES workspaces(id),
  acquisition_month DATE,           -- primeiro dia do mês de aquisição
  acquisition_channel VARCHAR(60),  -- 'meta_lal' | 'google_brand' | 'organic_ig' | 'direct'
  acquisition_cost_cents INT,       -- CAC efetivo
  total_revenue_cents INT DEFAULT 0,
  last_purchase_at TIMESTAMP,
  total_purchases INT DEFAULT 0
);

-- view agregada — refresh cron diário
CREATE MATERIALIZED VIEW cohort_retention AS
SELECT
  workspace_id,
  acquisition_month,
  acquisition_channel,
  date_trunc('month', AGE(NOW(), acquisition_month)) AS months_since,
  COUNT(*) AS cohort_size,
  COUNT(*) FILTER (WHERE last_purchase_at > NOW() - INTERVAL '30 days') AS active_30d,
  SUM(total_revenue_cents) AS revenue_total
FROM customer_cohorts
GROUP BY 1,2,3,4;
```

**Business rules:**
- Modo "Retenção": % do cohort que comprou de novo no mês N (M1, M2…)
- Modo "LTV $$": revenue acumulado médio por cliente do cohort em R$
- Modo "Recompra": % do cohort com 2+ compras no mês N
- Heatmap levels:
  - h0: 0% (vazio/sem dado)
  - h1: 1-30% (purple soft)
  - h2: 31-50% (purple)
  - h3: 51-65% (lime soft)
  - h4: 66-79% (lime)
  - h5: 80-100% (lime+coral gradient)
- LTV por canal = AVG(total_revenue_cents) / 100 dentro do canal de aquisição
- Payback = CAC / (LTV mensal médio) em meses

**API endpoints:**
- `GET /workspaces/{id}/cohorts?mode=retention&months=7` — matriz
- `GET /workspaces/{id}/ltv-by-channel` — breakdown por canal

**Edge cases:**
- Cohort com < 30 customers → não confiável, marcar com asterisco "*"
- Customer sem revenue (lead frio) → entra no cohort mas não conta no LTV
- Multi-touch: customer atribuído ao first-touch (não last) pra cohort de aquisição
- Cancelamento/refund → subtrai do total_revenue_cents

---

## B — Smart Links (core)

### <a id="b1"></a>B1. Criação de Link — fluxo principal

**Status:** 🟢 READY
**Mockup:** `mockups/02-criar-link.html`

**O que faz:**
Formulário completo de criação de smart link com tipo, URL, preview social, domínio, slug, pixels, UTMs, organização (pasta/notas/tags) e opções avançadas (roteamento condicional, agendamento, expiração, senha, etc.).

**UX flow:**
1. **Top bar** com:
   - Dropdown tipo de link (Smart Link · Redirect simples · Deep link · E-mail · WhatsApp · vCard) — 6 opções
   - Input URL com prefixo `https://` (validação na engine)
   - Botão refresh "Regenerar slug" (slug aleatório bonito tipo "neon-pulse-v03")
2. **Coluna esquerda (~58%):**
   - Upload area (drag-drop + click) — preview imagem 1200×630 max 5MB PNG/JPG/WEBP
   - Título do link (placeholder "Promo de inverno — até 40% OFF")
   - Descrição
3. **Coluna direita (~42%):** 3 cards empilhados:
   - **Adicionar Pixels** (B9 — biblioteca + modal)
   - **Tags UTM** (B10 — 5 campos + templates)
   - **Escolher domínio** (B11 — select + slug)
4. **Opções avançadas** (accordion) — abre 5 seções:
   - **Organização:** Pasta (B12) · Notas (B12) · Etiquetas (B12)
   - **Roteamento condicional:** A/B (B3) · Geo (B4) · Dispositivos (B5) · SO (B6) — mutex 4-way (B2)
   - **Limites & segurança:** Agendamento · Expiração & cliques · Senha · Pixels server-side · LGPD popup · Deep linking (B7)
5. **CTA full-width:** "Gerar meu link" → valida → modal de sucesso com link curto + copy button

**Data model:**
```sql
CREATE TABLE links (
  id              UUID PRIMARY KEY,
  workspace_id    UUID REFERENCES workspaces(id),
  type            VARCHAR(20) DEFAULT 'smart',  -- 'smart' | 'redirect' | 'deep' | 'email' | 'whatsapp' | 'vcard'
  destination_url TEXT NOT NULL,
  domain          VARCHAR(120) NOT NULL,
  slug            VARCHAR(80) NOT NULL,
  title           VARCHAR(200),
  description     TEXT,
  og_image_url    TEXT,
  folder_id       UUID REFERENCES folders(id),
  notes           TEXT,                          -- notas internas
  tags            TEXT[],                        -- array de etiquetas
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),
  status          VARCHAR(20) DEFAULT 'active',  -- 'active' | 'paused' | 'archived'
  UNIQUE(domain, slug)
);
```

**Business rules:**
- Slug auto-gerado se vazio · regex `^[a-z0-9\-]{3,80}$` · slugify cliente (remove acentos)
- Title obrigatório (validação no CTA)
- URL obrigatória + validação `URL.canParse()` ou similar
- Domain default = "plnk.to" (custom domains em planos Pro+)
- OG image upload faz upload pra S3/R2/Cloudflare Images + retorna URL final
- Tag max 40 chars · max 20 tags por link

**API endpoints:**
- `POST /links` — criar
- `GET /links/{id}` — detalhe
- `PUT /links/{id}` — editar
- `DELETE /links/{id}` — soft delete
- `POST /links/{id}/regenerate-slug` — random slug
- `POST /og-images/upload` — multipart upload imagem preview

**Edge cases:**
- Slug duplicado no mesmo domínio → erro "slug em uso, tente outro" + sugere alternativa
- URL inválida → mensagem clara, focar no input
- Workspace excedeu limit de links do plano → mensagem upgrade
- OG image > 5MB → toast "Arquivo muito grande. Máximo 5 MB."

---

### <a id="b2"></a>B2. Mutex de Roteamento (4-way)

**Status:** 🟢 READY
**Mockup:** `mockups/02-criar-link.html` → Opções avançadas → Roteamento condicional

**Regras (suas, validadas):**
- Teste A/B · Geolocalização · Dispositivos · Sistema operacional → **só 1 pode estar ativo por link**
- Ativar qualquer um trava os outros 3 (status "Bloqueado" + badge "Conflito" + toggle desabilitado)
- Banner de aviso aparece: "Pause o {nome do modo ativo} para ativar este roteamento"
- Quando ativa um modo, os outros toggles ativos são desligados automaticamente

**Data model:**
```sql
CREATE TABLE link_routing (
  link_id      UUID PRIMARY KEY REFERENCES links(id),
  mode         VARCHAR(20),     -- 'ab' | 'geo' | 'device' | 'os' | NULL
  -- mode-specific configs em colunas separadas pra cada (ou JSONB)
  ab_config    JSONB,           -- {variants: [{url, pct}], total_pct: 100}
  geo_config   JSONB,           -- {rules: [{uf, city, url}]}
  device_config JSONB,          -- {rules: [{type: 'desktop|phone|tablet|unknown', url}]}
  os_config    JSONB,           -- {rules: [{type: 'ios|android|windows|macos|linux', url}]}
  updated_at   TIMESTAMP DEFAULT NOW()
);
```

**Business rules (engine side):**
- Quando user salva link com modo X ativo, persiste apenas a config do modo ativo
- Redirect engine lê `link_routing.mode` e aplica regra correspondente:
  - `ab`: random weighted distribution
  - `geo`: IP geolocation lookup (MaxMind GeoIP2)
  - `device`: User-Agent + UA-CH Form Factors
  - `os`: UA-CH Platform header
- Default fallback: `links.destination_url` se nenhuma regra bater

**API endpoints:**
- `PUT /links/{id}/routing` — atualizar (request body força `mode` único)
- Backend valida: se `mode = 'ab'`, ignora outros configs

**Edge cases:**
- User salva ab_config sem variantes válidas → erro 400 "soma das % deve ser 100"
- IP não geolocalizável → fallback pra default URL
- UA-CH não disponível (browser antigo) → parse via User-Agent regex

---

### <a id="b3"></a>B3. Teste A/B com N variantes

**Status:** 🟢 READY
**Mockup:** `mockups/02-criar-link.html` → expandir card "Teste A/B"

**O que faz:**
Distribui tráfego entre N variantes (A/B/C/D… até 12) com % configurável. Soma deve ser 100%.

**UX flow:**
- Cada variante: tag colorida (A, B, C…) + URL + % + lixeira (mínimo 2 variantes — A e B fixos)
- Botão "+ Adicionar variante" doa 10% da maior variante existente pra a nova
- Botão "Distribuir igualmente" reparte 100/N com resto
- Barra "Soma: X%" mostra ao vivo, vermelha se ≠ 100%
- Hint: "Faltam X% para 100%" ou "Excede em X%"
- Validação no Gerar Link: bloqueia se soma ≠ 100 ou variante sem URL

**Data model:**
```sql
-- dentro de link_routing.ab_config (JSONB)
{
  "variants": [
    {"label": "A", "url": "cliente.com/promo", "pct": 60},
    {"label": "B", "url": "cliente.com/promo-b", "pct": 40}
  ]
}
```

**Business rules:**
- Min 2 variantes · Max 12 (suporte de A a L)
- Soma deve totalizar 100% (validação backend tb)
- URL de cada variante obrigatória (não vazia)
- Distribuição: random weighted no redirect engine

**Edge cases:**
- 1 variante 50% + outra 50% — distribui igualmente
- Variante com 0% — possível mas marcada como "pausada" no redirect

---

### <a id="b4"></a>B4. Geolocalização BR · estados + cidades

**Status:** 🟢 READY
**Mockup:** `mockups/02-criar-link.html` → expandir card "Geolocalização"

**O que faz:**
Roteia visitantes por estado brasileiro + cidade. Opção "Todas as cidades" pra um estado inteiro.

**UX flow:**
- Cada regra: dropdown Estado (UF) + dropdown Cidade + URL + lixeira
- 27 estados BR (26 + DF) · sigla apenas no select ("SP", "RJ", "MG")
- Cidade depende do estado selecionado — opção "Todas as cidades" no topo
- Mudar estado limpa cidade · auto-foca o select de cidade
- "Adicionar redirecionamento" cria nova linha
- Hint: "Visitantes que não baterem nenhuma regra seguem para o destino principal do link"

**Disponibilidade (mutex interno):**
- Selecionar "Todas as cidades" num estado → trava esse estado em outros selects de estado
- Selecionar cidade específica → "Todas" fica disabled nas outras regras desse estado · cidade já escolhida fica disabled · outras cidades do mesmo estado seguem disponíveis (permite múltiplas regras por estado)

**Data model:**
```sql
-- dentro de link_routing.geo_config (JSONB)
{
  "rules": [
    {"uf": "SP", "city": "all",         "url": "meusite.com/sao-paulo"},
    {"uf": "RJ", "city": "Rio de Janeiro", "url": "meusite.com/rio"},
    {"uf": "RJ", "city": "Niterói",     "url": "meusite.com/niteroi"}
  ]
}

-- Tabela de referência (seed):
CREATE TABLE br_states (
  uf VARCHAR(2) PRIMARY KEY,    -- 'SP', 'RJ', etc.
  name VARCHAR(50) NOT NULL,    -- 'São Paulo', 'Rio de Janeiro'
  region VARCHAR(20)            -- 'Sudeste', 'Sul', etc.
);

CREATE TABLE br_cities (
  ibge_code BIGINT PRIMARY KEY,
  uf VARCHAR(2) REFERENCES br_states(uf),
  name VARCHAR(120) NOT NULL,
  is_capital BOOLEAN DEFAULT FALSE
);
```

**Business rules:**
- IP → GeoIP2 lookup retorna {country, state, city}
- Match: state_match && (city == 'all' || city_match)
- Specificity order: city-specific > state-all > default

**Edge cases:**
- IP de fora do Brasil → fallback pra default URL
- City não está no dataset BR (raro) → match só por state
- IP de VPN/Tor → considerar como default (sem certeza geográfica)

---

### <a id="b5"></a>B5. Dispositivos (form factor)

**Status:** 🟢 READY
**Mockup:** `mockups/02-criar-link.html` → expandir card "Dispositivos"

**O que faz:**
Roteia por tipo de aparelho (Desktop, Smartphone, Tablet, Outro/Desconhecido).

**UX flow:**
- Cada regra: dropdown Dispositivo (4 tipos) + URL + lixeira
- Tipos disponíveis: Desktop/PC · Smartphone · Tablet · Outro/Desconhecido
- Cada tipo só pode ter 1 regra (disable em outros selects)

**Data model:**
```sql
-- dentro de link_routing.device_config (JSONB)
{
  "rules": [
    {"type": "phone",   "url": "meusite.com/mobile"},
    {"type": "desktop", "url": "meusite.com/"}
  ]
}
```

**Business rules (engine):**
- Detection via `Sec-CH-UA-Mobile` + `Sec-CH-UA-Form-Factors`
- iPadOS Safari → verificar `navigator.maxTouchPoints > 1` (caso especial)
- Tipos: `desktop`, `phone`, `tablet`, `unknown`

**Edge cases:**
- UA-CH não disponível → fallback pra User-Agent regex (lib `ua-parser-js`)
- Bot/crawler → roteia pra `unknown` ou default

---

### <a id="b6"></a>B6. Sistema Operacional

**Status:** 🟢 READY
**Mockup:** `mockups/02-criar-link.html` → expandir card "Sistema operacional"

**O que faz:**
Roteia por SO: iOS, Android, Windows, macOS, Linux.

**UX flow:** Mesma estrutura do B5 mas com 5 tipos (iOS · Android · Windows · macOS · Linux).

**Data model:**
```sql
-- dentro de link_routing.os_config (JSONB)
{
  "rules": [
    {"type": "ios",     "url": "apps.apple.com/app/sua-app/id123456"},
    {"type": "android", "url": "play.google.com/store/apps/details?id=sua.app"}
  ]
}
```

**Business rules:**
- Detection via `Sec-CH-UA-Platform`
- iPadOS reporta como `macOS` → corrigir com `navigator.maxTouchPoints > 1` → mapear pra `ios`

**Edge cases:**
- ChromeOS / outros SOs → fallback pra default
- SO conhecido sem regra → default

---

### <a id="b7"></a>B7. Limites & segurança

**Status:** 🟡 PARCIAL (UX existe, specs precisam refinar cada subfeature)
**Mockup:** `mockups/02-criar-link.html` → expandir cards em "Limites & segurança"

**Sub-features:**

#### B7.1 Agendamento
Ativa/desativa link em datas específicas.
- UX: 2 datepickers (start + end) + timezone
- Engine: checa `now()` contra range no redirect; fora do range → redirect pra "expired URL" ou 410 Gone

#### B7.2 Expiração & limite de cliques
Redireciona pra URL alternativa após data ou nº cliques.
- UX: condição (data OR cliques) + URL alternativa
- Engine: counter incrementa por click; when limit hit → redirect pra alt URL

#### B7.3 Proteção por senha
Exige senha antes de redirecionar.
- UX: input senha + opção "lembrar de mim"
- Engine: shows interstitial page com form senha · valida bcrypt hash

#### B7.4 Pixels server-side
Disparo via servidor — contorna bloqueadores de anúncio.
- Default ON em todos pixels do A2

#### B7.5 Popup de consentimento (LGPD)
Consentimento antes de ativar pixels.
- UX: toggle ON/OFF · text customizável
- Engine: serve cookie consent banner no interstitial

#### B7.6 Deep linking
Abre app nativo no mobile (+150 apps).
- UX: lista de apps suportados (Instagram, TikTok, Twitter, YouTube, WhatsApp, etc.)
- Engine: gera URL scheme custom (instagram://...) com fallback web

**Data model:**
```sql
CREATE TABLE link_security (
  link_id          UUID PRIMARY KEY REFERENCES links(id),
  schedule_start   TIMESTAMPTZ,
  schedule_end     TIMESTAMPTZ,
  expiry_date      TIMESTAMPTZ,
  click_limit      INT,
  expired_url      TEXT,
  password_hash    VARCHAR(72),       -- bcrypt
  server_side_pixels BOOLEAN DEFAULT TRUE,
  lgpd_consent     BOOLEAN DEFAULT FALSE,
  deep_linking     BOOLEAN DEFAULT TRUE,
  current_clicks   INT DEFAULT 0
);
```

---

### <a id="b8"></a>B8. Personalização de preview social (OG tags)

**Status:** 🟢 READY
**Mockup:** `mockups/02-criar-link.html` → coluna esquerda

**O que faz:**
Customiza meta tags Open Graph que aparecem quando o link é compartilhado em WhatsApp/Facebook/Twitter/LinkedIn.

**UX flow:**
- Upload area: PNG/JPG/WEBP, max 5MB, recommended 1200×630
- Drag-drop ou click pra file picker
- Preview da imagem inline com botão X pra remover
- Title input + Description textarea

**Data model:** já incluído em `links` table (`og_image_url`, `title`, `description`)

**Business rules:**
- Image upload → R2/S3 + retorna CDN URL
- OG image servida pelo redirect server: `GET /og/{link_id}.jpg`
- Meta tags injetadas no HTML do interstitial (se necessário) ou na primeira response

---

### <a id="b9"></a>B9. Pixel Library + Modal "Novo Pixel"

**Status:** 🟢 READY
**Mockup:** `mockups/02-criar-link.html` → card "Pixels"

**O que faz:**
Biblioteca de pixels reutilizáveis no workspace. Dropdown lista pixels já cadastrados; modal cria novo.

**UX flow:**
1. Card "Pixels" com chips ativos no topo (chip = pixel aplicado a este link)
2. Dropdown "Adicionar pixel cadastrado" lista pixels da biblioteca não-aplicados
3. Selecionar → vira chip + some do dropdown
4. X no chip → remove + retorna ao dropdown
5. Link "+ Adicionar novo pixel" → abre modal com:
   - Ícone gradient + título "Adicione um novo Pixel"
   - Select plataforma (7 opções: Facebook · LinkedIn · GA · GA4 · Google Ads · GTM · Twitter)
   - Input "Dê um nome ao seu pixel *"
   - Input "ID do pixel *"
   - Link "Como encontro meu ID de pixel?" (toast)
   - Botões "Fechar" / "Criar" (Criar desabilitado até 3 campos preenchidos)
6. Ao criar: insere na biblioteca + aplica como chip no link atual + toast

**Data model:**
```sql
CREATE TABLE pixel_library (
  id           UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  platform     VARCHAR(20),     -- 'facebook' | 'linkedin' | 'ga' | 'ga4' | 'gads' | 'gtm' | 'twitter'
  name         VARCHAR(120) NOT NULL,
  external_id  VARCHAR(120) NOT NULL,
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE link_pixels (
  link_id   UUID REFERENCES links(id),
  pixel_id  UUID REFERENCES pixel_library(id),
  PRIMARY KEY (link_id, pixel_id)
);
```

**Business rules:**
- Pixel pode ser usado em N links · biblioteca compartilhada no workspace
- ID validation depende da plataforma:
  - Meta: regex `^\d{15,16}$`
  - Google Ads: regex `^AW-\d+$` ou similar
  - GA4: regex `^G-[A-Z0-9]+$`
  - GTM: regex `^GTM-[A-Z0-9]+$`

**API endpoints:**
- `GET /workspaces/{id}/pixels` — lista
- `POST /workspaces/{id}/pixels` — criar
- `DELETE /pixels/{id}` — remover (cascata em link_pixels)
- `POST /links/{id}/pixels` — vincular pixel ao link
- `DELETE /links/{id}/pixels/{pixel_id}` — desvincular

---

### <a id="b10"></a>B10. UTM Templates

**Status:** 🟢 READY
**Mockup:** `mockups/02-criar-link.html` → card "Tags UTM"

**O que faz:**
5 campos UTM (campaign, medium, source, term, content) + biblioteca de templates pré-configurados.

**UX flow:**
- Grid 2-col: UTM Campaign · UTM Medium · UTM Source · UTM Term · UTM Content (full-width)
- Dropdown "Do template" lista templates salvos
- Link "+ Adicionar novo template" → prompt nome → salva valores atuais
- Selecionar template aplica valores em todos os 5 campos

**Data model:**
```sql
CREATE TABLE utm_templates (
  id           UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  name         VARCHAR(80) NOT NULL,
  campaign     VARCHAR(120),
  medium       VARCHAR(120),
  source       VARCHAR(120),
  term         VARCHAR(120),
  content      VARCHAR(120),
  created_at   TIMESTAMP DEFAULT NOW()
);

-- valores aplicados ao link ficam em links table (campos utm_*)
ALTER TABLE links ADD COLUMN utm_campaign VARCHAR(120);
ALTER TABLE links ADD COLUMN utm_medium VARCHAR(120);
ALTER TABLE links ADD COLUMN utm_source VARCHAR(120);
ALTER TABLE links ADD COLUMN utm_term VARCHAR(120);
ALTER TABLE links ADD COLUMN utm_content VARCHAR(120);
```

**Business rules:**
- UTMs aplicados ao link são appendados à `destination_url` no redirect
- Templates são por workspace (não global)
- Nome do template único por workspace

---

### <a id="b11"></a>B11. Domínio + slug customizado

**Status:** 🟢 READY
**Mockup:** `mockups/02-criar-link.html` → card "Escolher domínio"

**O que faz:**
Permite escolher domínio (default `plnk.to` ou custom) + customizar slug.

**UX flow:**
- Select domínio (default = `plnk.to`, custom domains do workspace)
- Input slug — slugify cliente (lowercase, sem acento, hífen)

**Custom domains:** ver página `mockups/13-dominios.html` (separada — seção H deste doc)

---

### <a id="b12"></a>B12. Organização (Pasta · Notas · Etiquetas)

**Status:** 🟢 READY
**Mockup:** `mockups/02-criar-link.html` → Opções avançadas → Organização

**O que faz:**
Organização interna dos links — pasta pra agrupar, notas internas (não-públicas), etiquetas (tags) pra filtrar no dashboard.

**UX flow:**

#### Pasta
- Select com pastas existentes do workspace
- Última opção "+ Criar nova pasta..." abre prompt → cria + auto-seleciona
- Default: "Sem pasta"

#### Notas
- Textarea "Descrição interna do seu link" — não aparece em OG tags
- Para uso interno (briefing, observações, etc.)

#### Etiquetas
- Chip input: digitar + Enter/vírgula/ponto-e-vírgula cria chip
- Backspace no input vazio remove último chip
- Paste com vírgulas/linhas quebra em múltiplos chips
- Click no fundo do card foca o input
- Validação: max 40 chars · sem duplicatas (case-insensitive)
- Max 20 etiquetas por link

**Data model:**
```sql
CREATE TABLE folders (
  id           UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  name         VARCHAR(60) NOT NULL,
  parent_id    UUID REFERENCES folders(id),
  created_at   TIMESTAMP DEFAULT NOW()
);

-- links.folder_id já tem FK; links.notes (TEXT) e links.tags (TEXT[]) tb
CREATE INDEX idx_links_tags ON links USING GIN(tags);
```

---

## C — Dashboard (Lista de Links)

### <a id="c1"></a>C1. Lista de links + filtros + paginação

**Status:** 🟢 READY
**Mockup:** `mockups/01-dashboard.html`

**O que faz:**
Lista todos os links do workspace com filtros, busca, ordenação, paginação.

**UX flow:**
- **Filter chips topo:** Folders (Todos · Campanhas · Podcast · Afiliados · Loja Demo · Nova pasta)
- **Filter pills no header da tabela (dropdown):**
  - Período (Todo · Hoje · 7d · 30d · Este mês · Mês passado · 90d · Este ano)
  - Tags (multi-select com checkbox)
  - Pixels (multi-select)
  - Columns (mostrar/esconder colunas)
- **Search input** no header (busca por título/slug/URL)
- **Bulk import** button → modal
- **Table** com colunas:
  - Checkbox (bulk)
  - Título (com folder badge embaixo)
  - Cliques (num mono)
  - Pixels (badges)
  - Link (URL original truncada)
  - Link curto (slug mono)
  - Criado (data)
  - Ações (gráfico, copiar, QR, mais)
- **Paginação Material-style:** "Menu por página" + range "1–20 de 40" + setas prev/next

**Data model:**
```sql
-- já tem em links table + folders
-- Materialized view pra performance:
CREATE MATERIALIZED VIEW link_stats AS
SELECT 
  l.id,
  l.title,
  l.slug,
  l.domain,
  l.destination_url,
  l.folder_id,
  l.tags,
  l.created_at,
  COUNT(c.id) AS clicks_count,
  COUNT(DISTINCT c.visitor_hash) AS unique_clicks,
  MAX(c.created_at) AS last_click_at
FROM links l
LEFT JOIN clicks c ON c.link_id = l.id
GROUP BY l.id;

CREATE UNIQUE INDEX ON link_stats(id);
-- refresh: every 5min (cron)
```

**API endpoints:**
- `GET /workspaces/{id}/links?folder=X&tags=Y&pixels=Z&period=30d&search=foo&page=1&per_page=20`
- `GET /workspaces/{id}/links/count` — total count (pra paginação)

---

### <a id="c2"></a>C2. Bulk actions

**Status:** 🟢 READY
**Mockup:** Dashboard → bulk-bar lime aparece quando ≥1 linha selecionada

**O que faz:**
Selecionar múltiplos links via checkbox → bar aparece com ações:
- Mover pra pasta
- Tag (adicionar/remover tags em batch)
- Pausar
- Excluir
- Exportar CSV

**API endpoints:**
- `POST /workspaces/{id}/links/bulk` — body `{ids: [...], action: 'move|tag|pause|delete', params: {...}}`
- `GET /workspaces/{id}/links/export.csv?ids=...` — download

---

### <a id="c3"></a>C3. Modal de stats por link

**Status:** 🟢 READY
**Mockup:** Dashboard → ícone de gráfico (1ª ação) em cada linha

**O que faz:**
Modal preview com stats específicas do link (sem precisar ir até página de Analytics).

**UX flow:**
- Click no ícone gráfico → modal abre
- Header: thumbnail + nome do link + URL curta + destino
- **4 KPIs:** Cliques · Únicos (com % unicidade) · Referrers · Países (com share BR)
- **Mini chart** 12 semanas
- **Top países** (BR/EUA/PT/Outros com %)
- **Dispositivos** (Celular/Computador/Tablet com %)
- Footer: "Ver analytics completo →" (link pra `03-analytics-link.html?link_id=X`)

**API endpoints:**
- `GET /links/{id}/stats-quick` — retorna o JSON completo do modal

---

## D — Analytics

### <a id="d1"></a>D1. Visão geral por domínio

**Status:** 🟢 READY
**Mockup:** `mockups/03-analytics-link.html`

**O que faz:**
Analytics agregadas por domínio (não por link individual). Dropdown selector escolhe domínio.

**UX flow:**
- Dropdown selector top: "Todos os domínios" · "plnk.to" · "meusite.com.br" · "links.marca.io"
- Card de domínio com 3 chips de resumo (Links, Cliques, Únicos)
- Trocar domínio re-renderiza tudo (KPIs, chart, países, devices, tabela top links)

---

### <a id="d2"></a>D2. KPIs do domínio + chart temporal

**Status:** 🟢 READY

**UX:**
- **4 KPI cards:**
  - Cliques totais + delta vs período anterior
  - Visitantes únicos (com ring % unicidade)
  - Referrers count + leader
  - Países alcançados (com ring count)
- **Chart "Cliques no tempo":** 12 barras semanais + axis Mai 1/8/15/22/Hoje · tabs Dia/Semana/Mês

**Data model:** click events agregados em `clicks` table com timeseries indexes.

---

### <a id="d3"></a>D3. Breakdown por país, dispositivo, SO, browser

**Status:** 🟢 READY

**Panels:**
- **Países** (60% width): mapa-múndi placeholder + table com país/visitas/únicos/% bar · tabs País/Cidade
- **Dispositivos** (40% width): donut + table Celular/Tablet/Computador
- **Referrers:** table com origem/visitas/% bar
- **Sistema operacional:** table iOS/Android/Windows + bars
- **Tags UTM:** table campanha/visitas/% bar
- **Browsers & Apps:** table com Instagram In-App/Safari/Chrome (importante pra deep linking analytics)

---

### <a id="d4"></a>D4. Top links do domínio

**Status:** 🟢 READY

**UX:** Tabela com top N links do domínio selecionado, ordenado por cliques. Mostra slug + destino + cliques + share %.

---

### <a id="d5"></a>D5. Pixels attribution

**Status:** 🟢 READY (full-width card no fim da página)

**UX:**
- 2 cards lado a lado: Meta Pixel (9.207 pessoas pixeladas) · TikTok Pixel (9.207)
- Cada card: nome + dot colorido + count + "pessoas pixeladas"
- Botão "Ver audiências" → linka pra `12-audiencias.html`

---

## E — Smartpages

### <a id="e1"></a>E1. Lista de smartpages

**Status:** 🟢 READY
**Mockup:** `mockups/06-smartpages.html`

**O que faz:**
Lista smartpages do workspace em formato tabela (mesmo do Painel).

**UX flow:**
- Header com 3 KPI cards (Total · Visitas no mês · Leads capturados)
- Filter chips: Todas · Publicadas · Rascunhos · Arquivadas · Ordenar
- Tabela: Checkbox · Smartpage (thumb + nome + tipo) · Visitas · Leads · Conversão % · Link curto · Status pill · Criada · Ações
- Ações por linha: Editar · Leads · Analytics · Copiar · Mais
- Footer: paginação

**Data model:**
```sql
CREATE TABLE smartpages (
  id           UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  name         VARCHAR(120) NOT NULL,
  type         VARCHAR(40),    -- 'bio_page' | 'podcast' | 'workshop' | 'ebook' | 'mentoria' | 'newsletter' | 'custom'
  slug         VARCHAR(80),
  domain       VARCHAR(120),
  template_id  UUID,
  config       JSONB,           -- estrutura da página (blocks, styles, etc.)
  status       VARCHAR(20),     -- 'live' | 'draft' | 'archived'
  visits       INT DEFAULT 0,
  leads        INT DEFAULT 0,
  created_at   TIMESTAMP DEFAULT NOW(),
  updated_at   TIMESTAMP DEFAULT NOW(),
  UNIQUE(domain, slug)
);
```

---

### <a id="e2"></a>E2. Editor de Smartpage

**Status:** 🟢 READY
**Mockup:** `mockups/07-editor-smartpage.html`

**O que faz:**
Editor visual de smartpages com sistema de blocks no estilo Linktree/Notion. 3 painéis: lateral esquerda (blocks library) · centro (preview mobile) · lateral direita (config do bloco selecionado).

**UX flow:**
1. **Topbar:** breadcrumb + nome smartpage + tabs (Design/Compartilhar/Analytics/Leads) + status "Salvo" + ícone "Visualizar" + botão "Publicar" lime
2. **Sidebar esquerda — Blocks library:**
   - Tabs: Tema / Blocos / Config
   - Buscar bloco (search)
   - Categorias com ~25 blocks:
     - **Conteúdo:** Botão · Texto · Avatar · Card · Carrossel
     - **Mídia:** Vídeo · Áudio · Música · RSS
     - **Interativos:** Form · Contador · Q&A · Calendário · Messenger · vCard
     - **Social & Contato:** Social icons · Mapa
     - **Lojas:** (Shopify, WooCommerce embed)
3. **Centro — Preview mobile (390×844):**
   - Mockup do telefone com smartpage em tempo real
   - Avatar circular + nome + bio + social icons + lista de botões
   - Botão lime "Ouvir o podcast", "Baixar o ebook grátis", "Agendar mentoria"
   - Botão coral "Cupom de parceiros"
   - Label "PREVIEW · Bio da Maria"
4. **Sidebar direita — Config do bloco selecionado** (ex: Botão):
   - Conteúdo: Texto do botão · Link de destino
   - Aparência: toggle Customizada · Estilo (Sólido/Contorno/Suave) · Ícone (Nenhum/Emoji/SVG)
   - Comportamento: Animação (pulsar) · Agendar exibição · Abrir em nova aba
   - Rastreamento: toggles Registrar conversão · Disparar pixel · Capturar lead ao clicar

**Data model:**
```sql
-- já tem smartpages com config JSONB
-- config esperada:
{
  "theme": {"primary": "#BFFF00", "bg": "#0A0A0A", "font": "satoshi"},
  "blocks": [
    {
      "id": "uuid",
      "type": "avatar",
      "props": {"image_url": "...", "name": "Maria Silva", "bio": "..."}
    },
    {
      "id": "uuid",
      "type": "button",
      "props": {
        "text": "+ Baixar o ebook grátis",
        "url": "plnk.to/fibras-ebook",
        "style": "solid",
        "color": "lime",
        "icon": {"type": "emoji", "value": "📥"},
        "pulse": true,
        "open_new_tab": true,
        "track": {"conversion": true, "pixel_fire": true, "capture_lead": false}
      }
    },
    // ... outros blocks
  ]
}

CREATE TABLE smartpage_block_types (
  id           VARCHAR(30) PRIMARY KEY,
  category     VARCHAR(30),
  name         VARCHAR(60),
  icon         VARCHAR(60),
  default_props JSONB,
  schema       JSONB  -- pra validar props (JSON Schema)
);
```

**Business rules:**
- Block types validados contra schema antes de salvar
- Reorder de blocks via drag-drop (atualiza `order` no array)
- Block "Form" tem subconfig: fields + lead destinations
- Preview atualiza em tempo real (debounced 200ms)
- Save automático a cada 5s (após mudança)
- "Publicar" gera versão live + invalida cache CDN

**API endpoints:**
- `GET /smartpages/{id}/edit` — config completa pra editor
- `PUT /smartpages/{id}/config` — autosave
- `POST /smartpages/{id}/publish` — published_version = current
- `GET /smartpage-blocks` — catálogo de tipos

---

### E2b. Leads da Smartpage

**Status:** 🟢 READY
**Mockup:** `mockups/08-leads-smartpage.html`

**O que faz:**
Lista de leads capturados via forms da smartpage. Filtros, exportar CSV, ver no CRM externo.

**UX flow:**
- Tabs: Analytics / Leads (active) / Analytics por bloco
- 4 KPI cards:
  - Leads capturados (312)
  - Visitas (14.207)
  - Taxa de conversão (2,2%)
  - Sincronizados com CRM (311)
- Banner verde: "Todos os leads do formulário caem direto no AppexCRM"
- Tabela: Nome · Telefone · Último Lead · Origem · Smartpage · Buscar input
- Cada linha: avatar + nome + telefone formatado · data · origem (WhatsApp/Direto/Instagram/Webform) · pill smartpage
- Filter pills topo direita: Buscar Lead
- Ações por linha: ver detalhes + enviar pro CRM novamente

**Data model:**
```sql
CREATE TABLE smartpage_leads (
  id           UUID PRIMARY KEY,
  smartpage_id UUID REFERENCES smartpages(id),
  workspace_id UUID REFERENCES workspaces(id),
  block_id     UUID,                -- form block que capturou
  fields       JSONB,               -- {name: 'Maria', email: '...', phone: '...'}
  source       VARCHAR(40),         -- 'direct' | 'instagram' | 'whatsapp' | 'webform'
  click_id     UUID,                -- linka ao click_journey
  utm_data     JSONB,
  ip_anon      INET,
  user_agent   TEXT,
  synced_at    TIMESTAMP,           -- quando foi pro CRM
  synced_to    VARCHAR(40),         -- 'appexcrm' | 'hubspot' | 'rd_station' | etc.
  created_at   TIMESTAMP DEFAULT NOW()
);
```

**Lead destinations (configurável por workspace):**
- AppexCRM (default — módulo plugável)
- Hubspot
- RD Station
- Active Campaign
- Mailchimp
- Email (envia notification)
- Webhook customizado
- Google Sheets

**API endpoints:**
- `GET /smartpages/{id}/leads?source=X&period=30d&search=Y`
- `GET /smartpages/{id}/leads.csv` — export
- `POST /leads/{id}/resync` — re-enviar pro CRM
- `POST /workspaces/{id}/lead-destinations` — configurar destinations

---

## F — Pixels (página dedicada)

### <a id="f1"></a>F1. Biblioteca de Pixels CRUD

**Status:** 🟢 READY (mesma data model do B9)
**Mockup:** `mockups/11-pixels.html`

**O que faz:**
Gerenciamento da biblioteca de pixels do workspace. Listagem, criação, edição, exclusão.

---

### <a id="f2"></a>F2. Pixel Tracker JS install flow

**Status:** 🟢 READY (igual ao A2 acima)

---

## G — Audiências

### <a id="g1"></a>G1. Audiências auto-segmentadas + Sync

**Status:** 🟢 READY (igual ao A3 acima)
**Mockup:** `mockups/12-audiencias.html`

**Sub-features adicionais:**
- Lista de audiências custom (não-tier) + criação manual
- Sync history (logs de cada sync com Meta/TikTok/Google)
- Exportar CSV de uma audiência

---

## <a id="h"></a>H — Domínios

**Status:** 🟢 READY
**Mockup:** `mockups/13-dominios.html`

**O que faz:**
CRUD de custom domains com verificação DNS (CNAME) + SSL automático Let's Encrypt + propagação real-time.

**UX flow:**
- Filter pills: Seus Domínios · Configuração · Subdomínios
- Sub-tabs por domínio: cada domínio tem card expandido com:
  - DNS records (CNAME, A, TXT) visíveis em monoespaçada
  - Status: "SSL Configurado" verde / "Propagando DNS" amarelo / "Erro" vermelho
  - Detalhes do certificado: provider (Let's Encrypt), expiration, last renewal
  - Banner Cloudflare: "Faça o registro como CNAME flexible — a propagação leva 24h"
- Botão "+ Adicionar domínio" gradient lime→coral
- Footer guide: "Como conectar um domínio" 3 passos (Crie CNAME · Aguarde propagação · Pronto pra usar)

**Data model:**
```sql
CREATE TABLE custom_domains (
  id              UUID PRIMARY KEY,
  workspace_id    UUID REFERENCES workspaces(id),
  domain          VARCHAR(255) NOT NULL UNIQUE,
  status          VARCHAR(20),   -- 'pending' | 'dns_propagating' | 'ssl_issuing' | 'live' | 'error'
  verification_method VARCHAR(20), -- 'cname' | 'txt' | 'a_record'
  verification_token VARCHAR(80),
  cname_target    VARCHAR(255),  -- ex: 'cname.applink.io'
  ssl_provider    VARCHAR(40),   -- 'lets_encrypt' | 'cloudflare'
  ssl_cert_id     VARCHAR(120),
  ssl_expires_at  TIMESTAMP,
  ssl_renewed_at  TIMESTAMP,
  last_dns_check  TIMESTAMP,
  error_msg       TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);
```

**Business rules:**
- Validação DNS via cron 5min nos primeiros 2h após adição, depois 1h
- SSL provisionado automaticamente via Let's Encrypt assim que DNS valida
- Renew automático SSL 30 dias antes de expirar
- Cloudflare proxied: detectar e instruir flexible mode

**API endpoints:**
- `GET /workspaces/{id}/domains` — lista
- `POST /workspaces/{id}/domains` — adicionar
- `POST /domains/{id}/verify` — force re-check
- `DELETE /domains/{id}` — remover (warning sobre links que param de funcionar)

---

## <a id="i"></a>I — Integrações

**Status:** 🟢 READY
**Mockup:** `mockups/14-integracoes.html`

**O que faz:**
Catálogo de integrações nativas + API REST + webhooks. Modal full-config por integração com triggers, mapping e auth.

**UX flow:**
- Hero "Conecte seu ecossistema"
- 3 abas: **Automação · CRM & E-mail Marketing · API REST**
- **Automação:**
  - Cards: Zapier (config triggers) · Make · n8n · Webhook customizado
  - Click no Zapier abre modal com:
    - Triggers configuráveis (toggles): "Link clicado" · "Smartpage form enviado" · "Action: usar link" · "Incluir metadata de UTM"
    - Webhook URL gerada (mono)
    - Stats: "12 zaps · 8.4k execuções"
    - Botões "Fechar" / "Salvar configuração"
- **CRM & E-mail Marketing:**
  - Cards: AppexCRM (Nativo) · RD Station · ActiveCampaign · Mailchimp · Hubspot
  - Status pill: "Conectado" verde / "Conectar" lime
  - Click "Conectar" abre modal OAuth flow
- **API REST:**
  - Card com endpoint base, gerar nova chave + ver documentação
  - Code block com `apk_live_8tQz…3uVc`

**Data model:**
```sql
CREATE TABLE integrations (
  id              UUID PRIMARY KEY,
  workspace_id    UUID REFERENCES workspaces(id),
  type            VARCHAR(40),     -- 'zapier' | 'appexcrm' | 'rd_station' | 'hubspot' | etc.
  status          VARCHAR(20),     -- 'active' | 'disconnected' | 'error'
  config          JSONB,           -- {webhook_url, triggers, mapping, etc.}
  oauth_token     TEXT,            -- encrypted
  oauth_refresh   TEXT,
  oauth_expires_at TIMESTAMP,
  last_sync_at    TIMESTAMP,
  events_count    INT DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE api_keys (
  id              UUID PRIMARY KEY,
  workspace_id    UUID REFERENCES workspaces(id),
  key_hash        VARCHAR(80) UNIQUE,  -- só hash, mostra prefixo apenas
  prefix          VARCHAR(20),         -- 'apk_live_8tQz'
  scopes          TEXT[],              -- ['links:read', 'leads:write', etc.]
  last_used_at    TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW(),
  revoked_at      TIMESTAMP
);
```

**Integrações com priority:**
1. **AppexCRM** (nativo, prioridade alta — usar skill `criar-modulo-appexcrm`)
2. **Zapier** (Triggers + Actions oficiais no marketplace)
3. **Meta CAPI** (já coberto em A1/A2)
4. **Google Ads conversion API** (ad-side)
5. **RD Station / ActiveCampaign / Hubspot / Mailchimp** (CRM/email)
6. **Webhooks customizados** (já especificado em [Webhooks](#wh))

**API REST endpoints exemplo:**
- `POST /api/v1/links` — criar link
- `GET /api/v1/links/{slug}/stats` — stats
- `POST /api/v1/leads` — push lead manual
- Auth: Bearer token (API key)
- Rate limit: ver seção Multi-tenancy

---

## <a id="j"></a>J — Equipe

**Status:** 🟢 READY
**Mockup:** `mockups/15-equipe.html`

**O que faz:**
Multi-workspace + members com 4 papéis + permissões granulares por papel.

**UX flow:**
- Hero "Equipe &amp; workspaces"
- **Workspaces cards** topo (lado a lado):
  - Cada card: nome + papel (OWNER/ADMIN/EDITOR/VIEWER) + plano + counts (links · usuários · domínios)
  - Botão "Acessar →" ou "Convidar membro"
- **Membros do workspace** (tabela):
  - Avatar + nome + papel pill + último acesso (relativo: "agora", "1h", "ontem")
  - Ações: editar permissão · remover
  - Botão "+ Convidar membro" topbar
- **Permissões granulares** (matriz):
  - 6 ações × 4 papéis (OWNER ✓✓✓ · ADMIN ✓✓ · EDITOR ✓ · VIEWER —)
  - Ações: Criar e editar links · Ver analytics · Gerenciar domínios · Gerenciar membros · Ver cobrança

**Data model:**
```sql
CREATE TABLE workspaces (
  id           UUID PRIMARY KEY,
  name         VARCHAR(120) NOT NULL,
  plan         VARCHAR(20),    -- 'free' | 'starter' | 'pro' | 'business'
  owner_id     UUID REFERENCES users(id),
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE workspace_members (
  workspace_id UUID REFERENCES workspaces(id),
  user_id      UUID REFERENCES users(id),
  role         VARCHAR(20),    -- 'owner' | 'admin' | 'editor' | 'viewer'
  invited_at   TIMESTAMP,
  joined_at    TIMESTAMP,
  last_seen_at TIMESTAMP,
  PRIMARY KEY (workspace_id, user_id)
);

CREATE TABLE workspace_invites (
  id           UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  email        VARCHAR(255),
  role         VARCHAR(20),
  invited_by   UUID REFERENCES users(id),
  token        VARCHAR(80) UNIQUE,
  expires_at   TIMESTAMP,
  accepted_at  TIMESTAMP,
  created_at   TIMESTAMP DEFAULT NOW()
);
```

**Permissions matrix:**

| Action | OWNER | ADMIN | EDITOR | VIEWER |
|--------|-------|-------|--------|--------|
| Criar e editar links | ✓ | ✓ | ✓ | — |
| Ver analytics | ✓ | ✓ | ✓ | ✓ |
| Gerenciar domínios | ✓ | ✓ | — | — |
| Gerenciar membros | ✓ | ✓ | — | — |
| Ver cobrança | ✓ | ✓ | — | — |
| Excluir workspace | ✓ | — | — | — |

**Business rules:**
- Owner é único · não removível (transfer ownership pra deletar)
- Convite por email → token único 7 dias de validade
- User pode estar em N workspaces simultâneos
- Cota de membros por plano (Free: 1 · Starter: 3 · Pro: 10 · Business: ilimitado)

**API endpoints:**
- `GET /workspaces` — workspaces do user logado
- `POST /workspaces` — criar
- `POST /workspaces/{id}/invite` — convidar member
- `PUT /workspaces/{id}/members/{user_id}` — mudar role
- `DELETE /workspaces/{id}/members/{user_id}` — remover

---

## <a id="k"></a>K — Billing

**Status:** 🟢 READY
**Mockup:** `mockups/16-billing.html`

**O que faz:**
Plano atual + uso de cota + 4 tiers comparativos + histórico de faturas + gerenciar pagamento.

**UX flow:**
- Hero "Planos &amp; cobrança"
- **Plano atual card** (Pro highlight lime):
  - Nome do plano + R$ 89 /mês
  - Próxima fatura: data + valor
  - Cota usada: barra lime "12.480 / 50.000 cliques" (~25%)
  - Ações: Gerenciar pagamento · Upgrade pra Business
- **Comparativo de planos** (4 cards lado a lado):
  - Free R$ 0 · Starter R$ 39 · Pro R$ 89 (PLANO ATIVO) · Business R$ 199 (POPULAR pill)
  - Cada card: feature checklist · botão "Fazer downgrade/upgrade"
- **Histórico de faturas** (tabela):
  - Período · Plano · Valor · Status (PAGO/PENDENTE) · Botão PDF download

**Data model:**
```sql
CREATE TABLE subscriptions (
  id              UUID PRIMARY KEY,
  workspace_id    UUID REFERENCES workspaces(id),
  plan            VARCHAR(20),  -- 'free' | 'starter' | 'pro' | 'business'
  status          VARCHAR(20),  -- 'active' | 'past_due' | 'canceled' | 'trialing'
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  stripe_subscription_id VARCHAR(80),  -- ou pagar_me_id
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE invoices (
  id              UUID PRIMARY KEY,
  workspace_id    UUID REFERENCES workspaces(id),
  subscription_id UUID REFERENCES subscriptions(id),
  amount_cents    INT,
  status          VARCHAR(20),  -- 'paid' | 'pending' | 'failed' | 'refunded'
  period_start    DATE,
  period_end      DATE,
  pdf_url         TEXT,
  paid_at         TIMESTAMP,
  created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE plan_limits (
  plan            VARCHAR(20) PRIMARY KEY,
  monthly_clicks  INT,          -- -1 = ilimitado
  links_max       INT,
  smartpages_max  INT,
  pixels_max      INT,
  members_max     INT,
  smart_tracking  BOOLEAN,
  multi_touch     BOOLEAN,
  lookalike_premium BOOLEAN,
  custom_domains  INT,
  api_access      BOOLEAN
);

-- seed:
INSERT INTO plan_limits VALUES
  ('free',     1000,    20,  1,   3,   1,   FALSE, FALSE, FALSE, 0, FALSE),
  ('starter',  10000,  100,  5,  10,   3,   FALSE, FALSE, FALSE, 1, FALSE),
  ('pro',      50000,  500, 25,  30,  10,   TRUE,  TRUE,  FALSE, 5, TRUE),
  ('business',   -1, -1, -1, -1,  -1,   TRUE,  TRUE,  TRUE, -1, TRUE);
```

**Tabela de planos (preços BR):**

| Feature | Free | Starter | Pro | Business |
|---------|------|---------|-----|----------|
| **Preço** | R$ 0 | R$ 39/mês | R$ 89/mês | R$ 199/mês |
| Cliques/mês | 1k | 10k | 50k | ilimitado |
| Links | 20 | 100 | 500 | ilimitado |
| Smartpages | 1 | 5 | 25 | ilimitado |
| Pixels | 3 | 10 | 30 | ilimitado |
| Membros | 1 | 3 | 10 | ilimitado |
| Smart Tracking | — | — | ✓ | ✓ |
| Multi-touch | — | — | ✓ | ✓ |
| Lookalike Premium | — | — | — | ✓ |
| Domínios custom | 0 | 1 | 5 | ilimitado |
| API access | — | — | ✓ | ✓ |
| Suporte | comunidade | email | email priority | dedicado |

**Integração de pagamento:**
- Brasil: **Pagar.me** (BR-first, suporta cartão + pix + boleto)
- Internacional opcional: Stripe

**API endpoints:**
- `GET /workspaces/{id}/subscription` — plano atual + cota
- `POST /workspaces/{id}/subscription/upgrade` — checkout flow
- `POST /workspaces/{id}/subscription/cancel` — cancel at period end
- `GET /workspaces/{id}/invoices` — histórico

---

## <a id="l"></a>L — Settings

**Status:** 🟢 READY (Perfil) · 🟡 PARCIAL (outras tabs visuais mas backend a definir)
**Mockup:** `mockups/09-settings.html`

**Tabs:** Perfil (active) · Conta · Segurança · Notificações · Privacidade LGPD · Avançado · **Tipos de link** (linka pra `02c-tipos-de-link.html`)

**O que cada tab faz:**

### L1 — Perfil 🟢
Avatar upload + nome + email (read-only com confirmar via email pra mudar) + bio + timezone + idioma + assinatura (signature pra emails).

### L2 — Conta 🟡
- Plano atual (info + link pra Billing)
- Workspace switch (se em múltiplos)
- Deletar conta (com confirm)

### L3 — Segurança 🟡
- Mudar senha
- 2FA TOTP (toggle + QR code + backup codes)
- Active sessions list (device + IP + revogar)
- API keys (ver/criar/revogar)

### L4 — Notificações 🟡
- Email: weekly summary · alerts críticos (ROI) · new lead · new member
- In-app: toggle por tipo
- Slack webhook (Pro+)

### L5 — Privacidade LGPD 🟡
- Cookie consent default (settings global)
- Data retention policy (90 dias / 1 ano / forever)
- Export my data (LGPD right)
- Delete my data (com 30 dias de grace period)

### L6 — Avançado 🟡
- Custom CSS no smartpage editor (Business plan)
- IP whitelist pro tracker JS
- Debug mode (logs detalhados)
- Webhooks outbound (ver Webhooks transversal)

### L7 — Tipos de link 🟢
Catálogo de 12 tipos disponíveis com docs. Link externo pra `02c-tipos-de-link.html` (página dedicada).

---

## <a id="m"></a>M — Auth

**Status:** 🟢 READY (UI completa) · 🔴 backend pendente
**Mockup:** `mockups/04-login.html` · `mockups/05-signup.html`

**UX flow:**

### M1 — Login (`04-login.html`)
- Card centralizado dark
- Logo grande topo
- Inputs: E-mail + Senha (com toggle olho show/hide)
- Link "Esqueci a senha" (coral)
- Checkbox "Manter conectado"
- Botão "ENTRAR" gradient + ícone seta
- Divider "ou continue com"
- 2 botões OAuth: Google · Microsoft (ícones oficiais)
- Botão destacado lime "ENTRAR COM APPEXCRM" (SSO)
- Footer: "Novo por aqui? Criar conta grátis"

### M2 — Signup (`05-signup.html`)
- Card maior com badge "7 dias grátis · sem cartão"
- Inputs: Nome · E-mail · Senha (com strength meter)
- Checkbox aceite ToS + Privacy
- Botão "CRIAR CONTA" gradient
- OAuth signup: Google · Microsoft · AppexCRM
- Footer: "Já tem conta? Entrar"

**Data model:**
```sql
CREATE TABLE users (
  id           UUID PRIMARY KEY,
  email        VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(72),         -- nullable se OAuth-only
  name         VARCHAR(120),
  avatar_url   TEXT,
  bio          TEXT,
  timezone     VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  locale       VARCHAR(10) DEFAULT 'pt-BR',
  email_verified_at TIMESTAMP,
  totp_secret  VARCHAR(80),           -- nullable se 2FA desligado
  totp_backup_codes TEXT[],
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_oauth (
  user_id      UUID REFERENCES users(id),
  provider     VARCHAR(20),    -- 'google' | 'microsoft' | 'appexcrm'
  external_id  VARCHAR(120),
  PRIMARY KEY (user_id, provider)
);

CREATE TABLE sessions (
  id           UUID PRIMARY KEY,
  user_id      UUID REFERENCES users(id),
  token_hash   VARCHAR(80) UNIQUE,
  ip_address   INET,
  user_agent   TEXT,
  device_name  VARCHAR(120),   -- inferido (iPhone, Chrome on Windows)
  last_seen_at TIMESTAMP,
  expires_at   TIMESTAMP,
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE password_resets (
  token        VARCHAR(80) PRIMARY KEY,
  user_id      UUID REFERENCES users(id),
  expires_at   TIMESTAMP,
  used_at      TIMESTAMP
);
```

**Auth flow:**

1. **Email + senha:**
   - `POST /auth/login` → valida bcrypt · cria session · retorna JWT/cookie
   - Rate limit: 5 tentativas / 15min por IP+email
2. **OAuth (Google/Microsoft):**
   - `GET /auth/oauth/{provider}` → redirect pra provider
   - `GET /auth/oauth/{provider}/callback?code=X` → exchange · cria user se primeira vez · login
3. **SSO AppexCRM:**
   - Ver skill `criar-modulo-appexcrm` — identidade via CRM
   - Token JWT compartilhado entre AppexCRM e APPlink
4. **2FA:**
   - Setup: `POST /auth/2fa/setup` → retorna QR + secret + 8 backup codes
   - Login: após password, pede TOTP code (6 dígitos)
5. **Password recovery:**
   - `POST /auth/forgot` → email com link `/reset?token=X`
   - `POST /auth/reset` → nova senha + invalida token

**Edge cases:**
- Email já existe + OAuth tentativa → link automático (mesma conta)
- 2FA backup code usado → remove da lista, gera warning de baixa
- Session expirou → refresh silent ou redirect pra login

---

## <a id="evt"></a>Modelo de eventos

**Eventos do sistema (broadcast interno + pra integrações):**

| Event | Disparado quando | Payload |
|-------|------------------|---------|
| `link.created` | Link criado | `{link_id, workspace_id, type, url}` |
| `link.clicked` | Click no link | `{link_id, click_id, visitor_hash, ua, ip_anon, geo, referrer}` |
| `link.qualified` | Smart Tracking dispara qualificação | `{link_id, tier, event_name, value_cents, signals}` |
| `audience.member_added` | Lead entra em audience | `{audience_id, user_hash, tier}` |
| `audience.synced` | Sync com Meta/Google/etc completou | `{audience_id, platform, members_count}` |
| `smartpage.lead_captured` | Form em smartpage submetido | `{smartpage_id, lead_id, fields}` |
| `domain.verified` | Custom domain DNS OK | `{domain_id, domain}` |
| `pixel.installed` | Pixel Tracker JS detectado no domínio | `{domain_id, domain}` |

**Tech:** PostgreSQL LISTEN/NOTIFY + Redis Streams (alta vazão) + outbound queue pra webhooks.

---

## <a id="wh"></a>Webhooks (outbound)

**Para que sirvam:**
- Notificar CRM externo de nova conversão
- Trigger Zapier/Make
- Push pra Slack/Discord

**Data model:**
```sql
CREATE TABLE webhooks (
  id           UUID PRIMARY KEY,
  workspace_id UUID REFERENCES workspaces(id),
  url          TEXT NOT NULL,
  events       TEXT[],          -- ['link.qualified', 'smartpage.lead_captured']
  secret       VARCHAR(60),     -- HMAC signature
  enabled      BOOLEAN DEFAULT TRUE,
  last_fired_at TIMESTAMP,
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE webhook_deliveries (
  id           UUID PRIMARY KEY,
  webhook_id   UUID REFERENCES webhooks(id),
  event_type   VARCHAR(60),
  payload      JSONB,
  response_code INT,
  response_body TEXT,
  attempts     INT DEFAULT 1,
  delivered_at TIMESTAMP,
  next_retry_at TIMESTAMP,
  created_at   TIMESTAMP DEFAULT NOW()
);
```

**Retry:** exponential backoff (1m, 5m, 30m, 2h, 12h, 24h) — max 6 tentativas.

---

## <a id="mt"></a>Rate limits + multi-tenancy

**Multi-tenancy:** workspace_id como tenant boundary. Todo query filtrado por `workspace_id` no app layer + RLS no PostgreSQL (defense in depth).

**Rate limits (por plano):**

| Endpoint | Free | Pro | Business |
|----------|------|-----|----------|
| Redirect (`/{domain}/{slug}`) | 1k/s | 10k/s | 100k/s |
| `POST /tracker/event` | 100/s | 1k/s | 10k/s |
| `POST /links` | 10/min | 100/min | 1k/min |
| API geral | 100/min | 1k/min | 10k/min |

**Implementação:** Redis cell (sliding window) + middleware NestJS.

---

## <a id="gloss"></a>Glossário

| Termo | Significado |
|-------|-------------|
| **Smart link** | Link encurtado com tracking + roteamento condicional |
| **Smartpage** | Página link-in-bio do APPlink |
| **Pixel** | Pixel de retargeting (Meta, Google Ads, TikTok, etc.) |
| **Click ID** | UUID único gerado no redirect, persistido como cookie/param pra atribuição cross-page |
| **Tracker JS** | Snippet JavaScript instalado nas LPs (1st party data) |
| **Tier (PURE/HOT/WARM/COLD)** | Qualidade do lead baseada em sinais de engajamento |
| **Deferred firing** | Disparar pixel server-side quando lead se qualifica, não no click |
| **Multi-touch attribution** | Distribuir crédito de conversão entre múltiplos touchpoints |
| **Audience** | Grupo de visitantes pixelados (pra retargeting) |
| **Lookalike Premium** | Lookalike no Meta/Google baseado só na audience PURE |
| **Domain** | Custom domain do workspace (CNAME + SSL) |
| **Workspace** | Tenant — agrupa users, links, smartpages, pixels, etc. |
| **Redirect engine** | Microserviço que faz o redirect (28ms p95 target) |
| **OG image** | Imagem que aparece quando o link é compartilhado em rede social |

---

## Próximos passos pra backend

Quando começar a implementar:

1. **Stack:** NestJS (TypeScript) + PostgreSQL 16 + Redis 7 + S3/R2/Cloudflare R2
2. **Microserviços:**
   - **Origin** (NestJS): CRUD principal + auth + API REST
   - **Redirect engine** (Cloudflare Workers ou Fastify edge): hot path do redirect (target 28ms p95)
   - **Tracker** (Fastify): receive events do JS, dedup, dispatch pra audiences pipeline
   - **Audience sync worker** (NestJS background): cron 15min, sync Meta/Google/TikTok
   - **Webhook delivery worker** (BullMQ): retry com backoff
3. **Ordem sugerida:**
   - Sprint 1: Auth + workspaces + links CRUD básico + redirect engine simples
   - Sprint 2: Pixel library + tracker JS + first-touch attribution
   - Sprint 3: Routing engine (A/B + Geo + Device + OS) — features B2-B6
   - Sprint 4: Smart Tracking (A1) + Pipeline Audiências (A3)
   - Sprint 5: Multi-touch Journey (A4) + Analytics dashboards (D1-D5)
   - Sprint 6: Smartpages + Leads + Domain management + Billing

4. **Não pular:**
   - LGPD compliance (B7.5 + tabela de consents)
   - Rate limiting desde dia 1
   - Materialized views pra performance de queries agregadas
   - Tests E2E pelo menos pra flows críticos (redirect + tracker + qualification)

---

*Versionar este doc junto com mudanças nos mockups. Sempre que adicionar feature nova, atualizar a seção correspondente.*

— APPlink Features Spec · v1.0 · 2026-05-25
