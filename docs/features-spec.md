# Features Specification — APPlink

> **Documento de handoff pra backend + frontend real.**
> Consolida cada feature implementada nos mockups com: status, UX flow, data model, business rules, API endpoints, eventos, edge cases. Use como source-of-truth quando começar a implementar backend (NestJS) ou frontend real (Next.js).

**Versão:** 1.0 · 2026-05-25
**Last sync com mockups:** commit `9c8715f`
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

### <a id="e2"></a>E2. Editor + Leads capture

**Status:** 🟡 PARCIAL (editor existe mas precisa specs detalhadas)
**Mockup:** `mockups/07-editor-smartpage.html` e `mockups/08-leads-smartpage.html`

**O que falta especificar:**
- Sistema de blocks (Hero · CTA · Form · Embed · Image · Text · Social)
- Form fields configuration
- Lead destinations (CRM webhook, email, sheet, Zapier)
- A/B test em smartpage inteira

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

**Status:** 🟡 PARCIAL
**Mockup:** `mockups/13-dominios.html`

**O que faz:**
CRUD de custom domains. Verificação via DNS (CNAME ou TXT). SSL automático (Let's Encrypt).

**Data model:**
```sql
CREATE TABLE custom_domains (
  id            UUID PRIMARY KEY,
  workspace_id  UUID REFERENCES workspaces(id),
  domain        VARCHAR(255) NOT NULL UNIQUE,
  status        VARCHAR(20),   -- 'pending' | 'verified' | 'ssl_issuing' | 'live' | 'error'
  verification_token VARCHAR(80),
  ssl_cert_id   VARCHAR(120),  -- referência ao cert provisionado
  created_at    TIMESTAMP DEFAULT NOW()
);
```

---

## <a id="i"></a>I — Integrações

**Status:** 🔴 STUB (mockup é placeholder)
**Mockup:** `mockups/14-integracoes.html`

**A definir:**
- Integrações nativas: Meta CAPI, Google Ads API, TikTok Events API, LinkedIn Insight, Zapier, Make
- CRMs: AppexCRM (prioridade — módulo plugável, ver skill `criar-modulo-appexcrm`), Hubspot, Pipedrive, RD Station
- Webhooks customizados outbound

---

## <a id="j"></a>J — Equipe

**Status:** 🟡 PARCIAL
**Mockup:** `mockups/15-equipe.html`

**Roles esperadas:**
- Owner · Admin · Editor · Viewer
- Per-workspace permissions

---

## <a id="k"></a>K — Billing

**Status:** 🟡 PARCIAL
**Mockup:** `mockups/16-billing.html`

**Planos sugeridos (do commit Smart Tracking):**
- Free: features básicas, limit baixo
- Pro (R$ 197/mês): Smart Tracking + Pipeline Audiências
- Business (R$ 497/mês): + Multi-touch Journey + Lookalike Premium + sem limit

**Integração:** Stripe ou Pagar.me (BR-first preferred)

---

## <a id="l"></a>L — Settings

**Status:** 🟡 PARCIAL
**Mockup:** `mockups/09-settings.html`

**Tabs:**
- Perfil · Conta · Segurança · Notificações · Privacidade LGPD · Avançado · **Tipos de link** (linka pra `02c-tipos-de-link.html`)

---

## <a id="m"></a>M — Auth

**Status:** 🟡 PARCIAL (UI pronta, falta backend)
**Mockup:** `mockups/04-login.html` · `mockups/05-signup.html`

**O que precisa:**
- Email/senha (bcrypt + JWT/session)
- OAuth: Google + Microsoft (Microsoft Graph)
- **SSO AppexCRM** (módulo plugável — ver skill)
- Recovery por email
- 2FA (TOTP) — adicional

**Data model:**
```sql
CREATE TABLE users (
  id           UUID PRIMARY KEY,
  email        VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(72),         -- nullable se OAuth-only
  name         VARCHAR(120),
  avatar_url   TEXT,
  email_verified_at TIMESTAMP,
  created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE user_oauth (
  user_id      UUID REFERENCES users(id),
  provider     VARCHAR(20),    -- 'google' | 'microsoft' | 'appexcrm'
  external_id  VARCHAR(120),
  PRIMARY KEY (user_id, provider)
);
```

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
