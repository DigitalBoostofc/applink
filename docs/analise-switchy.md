# Análise do Switchy.io — Base para réplica no APPlink

> Estudo feito a partir da Central de Ajuda oficial (help.switchy.io) em 2026-05-22.
> Objetivo: entender como o Switchy funciona para replicar funcionalidades semelhantes
> no **APPlink** (link-in-bio + encurtador, vendido avulso e como módulo do AppexCRM).

---

## 1. O que é o Switchy

Switchy.io se posiciona como **muito mais que um encurtador de links**. A proposta central:

> "Customize, gerencie e rastreie links de retargeting para aumentar conversões."

Três pilares de valor:

1. **Smart links** — encurtar + customizar a aparência do link (título, descrição, imagem de preview) + injetar pixels e UTMs.
2. **Smartpages** — mini landing pages / link-in-bio criadas num builder de blocos drag & drop.
3. **Retargeting** — todo clique num link Switchy "pixela" o usuário, alimentando audiências de anúncios (Facebook, Google, TikTok, etc.) sem o usuário precisar de skill técnico.

O diferencial declarado é o **deep linking** (+150 apps) e o foco em **conversão por anúncios**, não só encurtamento.

---

## 2. Funcionalidades de produto

### 2.1 Smart links ("Switch a link")

Fluxo base de criação de um link:

1. Colar a URL de destino.
2. Editar o **preview social** (Open Graph): título, descrição, imagem (recomendado 1200×630).
3. Adicionar pixels de retargeting, UTMs, domínio customizado e/ou slug.
4. Clicar em "Get my link" → link encurtado gerado.

**Recursos do link:**

| Recurso | Como funciona |
|---|---|
| Custom preview (OG) | Sobrescreve título/descrição/imagem mostrados ao compartilhar em redes sociais |
| Slug customizado | Define o caminho final do link (`dominio.com/meu-slug`) |
| UTMs | Builder de tags UTM (source/medium/campaign) anexadas à URL de destino |
| Tags | Marcadores internos para organizar/filtrar links |
| Folders | Pastas para organizar links no dashboard |
| Notes | Anotações internas no link |
| Favicon | Exibir favicon customizado |

**Tipos de link especiais** (dropdown ao criar):

- **Link** padrão (URL)
- **Email** — abre app de email com destinatário/assunto/corpo pré-preenchidos
- **WhatsApp** — abre WhatsApp com número + mensagem pré-preenchida (`+5511...`)
- **Messenger** — abre conversa no Facebook Messenger (`m.me`)
- **Call** — disca um número
- **SMS** — abre app de SMS com número + texto
- **Telegram** — abre conversa no Telegram
- **Skype** — abre conversa no Skype
- **vCard** — ao clicar, baixa um contato (.vcf) pré-preenchido (nome, telefone, email, endereço). Combina muito bem com QR code impresso em cartão de visita.

### 2.2 Opções avançadas do link

Acessíveis em "Advanced options" na edição do link:

| Opção | Comportamento |
|---|---|
| **A/B Testing (Rotator)** | Múltiplos destinos, cada um com % de tráfego. Distribui cliques proporcionalmente |
| **Geolocation** | Redireciona para destinos diferentes conforme o país do clique |
| **Deep linking** | Detecta o dispositivo e abre o app nativo (in-app) em vez do navegador. +150 apps suportados. Aumenta engajamento mobile ~+44% |
| **Link cloaking / mask** | Esconde o destino real exibindo-o dentro de um iframe. **Só funciona com domínio próprio** |
| **Link expiration** | Após data/hora (com timezone), redireciona para uma URL alternativa (campo obrigatório) |
| **Password** | Protege o destino com senha; mostra tela de senha (com logo Switchy, removível em planos pagos) |
| **Embed widget** | Injeta script/widget de terceiros; requer domínio próprio para alguns casos |

### 2.3 Operações em massa

- **Bulk import**: até 500 links por vez, via CSV (permite slug customizado) ou colar lista (1 link por linha). Um domínio branded por importação.
- **Bulk edit**: editar vários links de uma vez.
- **API**: para volumes maiores que o bulk.

### 2.4 Smartpages (link-in-bio builder)

Mini landing pages criadas num **editor de blocos drag & drop**.

**Criação:** a partir de template (por indústria/caso de uso) ou "start from scratch".

**Theme (aparência global):** cor de fundo (sólida ou gradiente), imagem de fundo, cor padrão de botão, tipo de botão (arredondado, quadrado, outline, inline, com/sem sombra — cor da sombra editável), fonte.

**Blocos disponíveis** (até **50 blocos por Smartpage**):

- Conteúdo: Button, Text, Card, Carousel, Image/GIF, Video, Audio, Music, Avatar
- Interativos: Form, Countdown, Q&A, Calendar, Messenger, Social, vCard (Save to contact)
- Integrações/embeds: RSS, Shopify, Magento, WordPress, Maps, iframe
- Layout: Spacing, Separator

**Por bloco é possível:** customizar aparência, animar, **agendar** (aparece/some em data definida), esconder, duplicar, mover, ajustar altura.

**Form block** — coleta de leads:
- Campos tipados (email, nome, website, título-texto, etc.), com Column ID, placeholder, obrigatório (toggle), ordenáveis por drag & drop.
- Checkbox de Termos com link para política.
- Botão de submit e mensagem de "thank you" customizáveis.
- **Webhook**: dispara ao submeter — integra com Zapier, Make/Integromat, Pabbly, MailChimp, ActiveCampaign, Hubspot, Slack, etc.

**Settings da Smartpage:** injeção de **código customizado** em `Header code` e `Body code` (analytics, pixels, scripts).

**Leads tab:** centraliza todos os dados coletados pelos forms; exporta CSV; permite deletar dados (irreversível).

### 2.5 QR Code dinâmico

- QR codes **dinâmicos** (destino editável a qualquer momento) e **branded** para links e Smartpages.
- Builder com: Designer (Shape, Logo), Templates (salvos pelo usuário) e Pré-definidos.
- Preview ao vivo, undo/redo, salvar como template, download em vários formatos.
- Casos de uso: cardápio de restaurante, cupons, QR de WiFi, cartão de visita.

### 2.6 Pixels de retargeting

Pixels suportados (cola-se apenas o **ID**, sem código):

Facebook/Instagram, Twitter/X, LinkedIn, TikTok, Google Ads, Snapchat, Pinterest, Quora, Bing, Google Tag Manager, AdRoll, Google Analytics, VK.

Todo clique no link dispara os pixels configurados → o usuário entra na audiência da plataforma de ads. Depois, no Ads Manager de cada plataforma, cria-se uma **Custom Audience** do tipo "pessoas que visitaram páginas específicas", colando as URLs Switchy.

### 2.7 Privacidade (GDPR / CCPA)

- **Privacy popup** opcional em links pixelizados: usuário escolhe "Continue" (entra na audiência) ou "Decline" (pixels não recebem dados).
- Configurável com nome da empresa + link da política de privacidade.

### 2.8 Analytics

**Por link:** curva de crescimento de cliques (dia/mês/ano), usuários únicos, referers, países únicos, detalhe de pixels e UTMs disparados. Tempo real.

**Por Smartpage:** volume de cliques, visitantes únicos, dados dos visitantes; **analytics por bloco**.

Extras: compartilhar relatório do link (link público de report), resetar analytics de um link.

### 2.9 Domínios customizados

- Recomendado: **subdomínio próprio** (`links.suaempresa.com`).
- Domínio raiz: criar registro ANAME/ALIAS apontando para `links.switchy.io.` (ou subdomínio via CNAME).
- Propagação DNS de 24–48h. Guias dedicados para Cloudflare, Namecheap, GoDaddy, Google Domains.
- Domínio próprio é **pré-requisito** para cloaking e alguns embeds.

### 2.10 Workspaces, Team, Chrome extension

- **Workspace**: para agências/empresas — multi-conta. Cada workspace é totalmente independente: dashboard, links, pixels, domínios, equipe e **billing próprios**. Deletar é irreversível.
- **Team members**: convite por email; quantidade depende do plano.
- **Chrome extension**: cria smart links direto da página de destino, com acesso a todos os recursos (preview, domínio, pixels, UTMs, folders, deep linking, A/B, geo, GDPR, etc.).

### 2.11 Integrações & API

- **Integrações nativas no-code**: Zapier e Pabbly — criar links, atualizar links, e webhook de forms.
- **Webhook genérico** nos forms das Smartpages.
- **API REST**: aberta mediante solicitação. Rate limits: **1.500 links/dia, 100 links/hora**. API "para uso pessoal na própria conta".
- **API Partner / white-label**: planos específicos para integrar o Switchy dentro de outro SaaS (ex.: ferramenta de email/SMS/social que quer oferecer encurtamento aos seus clientes). Limites maiores negociados.

---

## 3. UX e fluxos principais

| Fluxo | Passos resumidos |
|---|---|
| Criar smart link | Colar URL → editar preview → pixels/UTMs/domínio/slug → "Get my link" |
| Criar Smartpage | Dashboard Smartpage → template ou scratch → editor de blocos → publicar |
| Adicionar bloco | Editor → seção "Block" na barra lateral → drag & drop no preview |
| Ver analytics | Dashboard → coluna "Actions" → ícone "Stats" |
| Ver leads | Dashboard Smartpage → "Stats" → aba "Leads" → Download CSV |
| Importar em massa | Dashboard → "Bulk import" → CSV ou lista → parâmetros → importar |
| QR code | Dashboard → ícone "Download QR code" → builder → download |

Padrões de UX observados:
- **Dashboard central** com links organizados em **folders**, coluna "Actions" por linha.
- **Editor lateral** (barra de blocos à esquerda, preview à direita) para Smartpages.
- Tom de voz lúdico ("Well done Switcher 🧙‍♂️") — gamificação leve do onboarding.
- Recursos avançados escondidos atrás de "Advanced options" para não poluir o fluxo básico.

---

## 4. Arquitetura técnica (inferida)

O help center não expõe a stack, mas o comportamento permite inferir:

- **Serviço de redirect**: resolve slug → aplica regras (geo, A/B rotator, expiração, senha, cloaking) → dispara pixels → redireciona. É o coração do sistema; precisa ser rápido e altamente disponível.
- **Camada de tracking**: registra clique (timestamp, IP→país, referer, user-agent→device) e injeta scripts de pixel antes do redirect. Provavelmente uma página intersticial leve (especialmente quando há GDPR popup ou cloaking via iframe).
- **Deep linking**: detecção de device/app via user-agent + esquemas de URL/Universal Links/App Links por app — mantêm um catálogo de +150 apps com os padrões de deep link de cada um.
- **Custom domains**: clientes apontam DNS (ANAME/ALIAS/CNAME) para o host do Switchy; o edge resolve qual workspace/conta o domínio pertence e serve TLS.
- **Smartpages**: páginas renderizadas a partir de um JSON de blocos; servidas em domínio próprio ou subdomínio Switchy. Suportam injeção de código header/body.
- **Forms/Leads**: submissões gravadas + opcionalmente disparadas via webhook (fire-and-forget).
- **Modelo multi-tenant**: Workspace é o tenant de topo (billing, domínios, pixels, team isolados).
- **API REST** com rate limiting por conta/chave.

Pontos críticos de engenharia para uma réplica:
1. **Latência do redirect** — cache de slug→destino, edge/CDN.
2. **Contagem de cliques confiável** — deduplicação de unique users, processamento assíncrono de analytics.
3. **Catálogo de deep links** — manutenção contínua dos padrões por app.
4. **Roteamento de domínios customizados** + emissão automática de TLS.
5. **Conformidade** — GDPR/CCPA por design (consentimento antes de pixelar).

---

## 5. Planos e limites (modelo de negócio)

Cobrança por **cliques/mês** + caps de recursos:

| Plano | Cliques/mês | Domínios | Smartpages | Team |
|---|---|---|---|---|
| Team | 10.000 | 2 | 2 (com logo) | 1 |
| Pro | 50.000 | 5 | 10 | 10 |
| Business | 100.000 | 15 | 15 | 15 |

(Há também "AS codes" — códigos do AppSumo lifetime — com escalas próprias até 350.000 cliques/mês.) Limite fixo: **até 50 blocos por Smartpage**.

**Estouro de limite de cliques:** aos 90% → email de aviso; ao atingir 100% → links continuam redirecionando **mas sem tracking/pixels** e não é possível criar novos links até upgrade ou renovação.

Insight para o APPlink: o medidor de valor é **clique**, não link criado. Recursos premium (remover logo, cloaking, mais domínios/Smartpages/team) são os gates de upgrade.

---

## 6. Mapa de réplica para o APPlink

Sugestão de priorização para o produto APPlink (encurtador + link-in-bio, avulso e módulo do AppexCRM):

### MVP (núcleo)
- [ ] Encurtador com slug customizado + folders + tags
- [ ] Customização de preview social (Open Graph)
- [ ] Serviço de redirect rápido (cache/edge)
- [ ] Analytics por link (cliques, únicos, país, referer, device) em tempo real
- [ ] Link-in-bio builder de blocos (subset: Button, Text, Image, Video, Social, Form)
- [ ] QR code dinâmico
- [ ] Domínio customizado (subdomínio via CNAME)

### Fase 2 (diferenciação)
- [ ] Pixels de retargeting (Meta, Google, TikTok no mínimo) — sinergia com o squad de tráfego
- [ ] UTMs builder
- [ ] Motor de roteamento condicional: A/B rotator, geolocation, **device**, **SO**, **clicks limit**, expiração, senha
- [ ] Form blocks + captura de leads + webhook
- [ ] Privacy popup GDPR/CCPA
- [ ] Tipos especiais: WhatsApp, vCard, Email, Call (alto valor no Brasil)

### Fase 3 (escala / agência / CRM)
- [ ] Workspaces multi-tenant com billing isolado
- [ ] Team members + papéis
- [ ] Deep linking (catálogo de apps)
- [ ] Link cloaking
- [ ] Bulk import/edit
- [ ] API REST + webhooks
- [ ] Extensão de browser

### Integração com AppexCRM (vantagem competitiva sobre o Switchy)
- Leads capturados nos forms da página devem cair **direto no CRM** (não só num CSV).
- Identidade via CRM (conta em modo duplo: CRM-linkada ou avulsa) — ver skill `criar-modulo-appexcrm`.
- Eventos de clique/conversão enviados de volta ao CRM como atividades/timeline do contato.
- Pixels + audiências conectados ao módulo de tráfego pago.

> Observação: o Switchy cobra por **clique**; vale decidir cedo o medidor de valor do APPlink
> (clique, link, lead capturado ou contato no CRM) pois isso molda toda a arquitetura de billing.

---

## 7. Achados da exploração do painel real (2026-05-22)

> Navegação feita dentro de uma conta de produção real do Switchy (apenas leitura).
> Estes itens **complementam ou corrigem** a documentação pública.

### 7.1 Tela de criação de link — opções completas

A tela `/create` confirma e **expande** o que a documentação mostrava. Estrutura:

- **Bloco principal**: campo de URL + tipo de link (dropdown), botão de regenerar.
- **Custom your link**: upload de imagem (1200×630), título (obrigatório), descrição.
- **Add Pixels ID**: dropdown multi-seleção + "Add a new pixel".
- **Add UTMs tags**: 5 campos — Campaign, Medium, Source, Term, Content — com
  sistema de **templates** ("From template" / "Add a new template").
- **Choose domain name**: seletor de domínio customizado + campo de slug.

**Advanced options** (lista real, na ordem da UI):

| Opção | Observação |
|---|---|
| Folder | Organização |
| Add Notes | Anotação interna |
| Embed Widget | Toggle + "Add a new embed widget" |
| Deep linking | Toggle |
| Link cloaking | Toggle |
| Tags | Campo de tags |
| Rotator - AB Testing | Múltiplos destinos com % |
| Geolocation | Redirect por país |
| **Devices** ⚠️ | **Redirect por dispositivo — não estava na documentação** |
| **Operating system** ⚠️ | **Redirect por SO — não estava na documentação** |
| Link Expiration | Toggle + data |
| **Clicks limit** ⚠️ | **Muda destino após X cliques — não estava na documentação** |
| Password | Toggle |
| Favicon | Link ou upload (16×16) |
| GDPR popup | Bloqueado até preencher o "privacy profile" da conta |

➡️ **3 recursos novos descobertos**: redirecionamento condicional por **dispositivo**,
por **sistema operacional** e por **limite de cliques**. Juntos com geo e A/B, o
Switchy tem na prática um **motor de roteamento de redirect bem completo** — esse é
o coração técnico do produto e o ponto mais valioso a replicar bem.

#### Detalhamento dos campos (exploração clicando item a item)

- **Tipo de link** (dropdown): 12 opções — Link, Email, WhatsApp, Messenger, Call,
  SMS, Telegram, Skype, **WeChat**, **Line**, **Viber**, vCard. (A doc só citava 8.)

#### Formulário dinâmico por tipo de link

O **bloco de input do topo muda conforme o tipo** escolhido; todo o resto da tela
(Custom your link, Pixels, UTMs, domínio, Advanced options) permanece **idêntico**
para qualquer tipo. Exemplo verificado — tipo **WhatsApp**:

- O campo de URL é substituído por **Phone number** (placeholder
  `Phone number (eg +33 6 XX XX XX XX)`).
- Surge abaixo uma textarea **Pre-filled message** (mensagem pré-preenchida).
- O **Título** é auto-preenchido ("Connect on Whatsapp").
- O **Favicon** é auto-preenchido com o ícone do WhatsApp — Switchy hospeda um
  conjunto de favicons por tipo de link (URL observada em
  `firebasestorage.googleapis.com/.../links-types-prview/WhatsApp.ico`).

➡️ Pista de stack: o backend usa **Firebase** (Firebase Storage; bucket
`urlshortener-f1125.appspot.com`). Provável Firestore + Firebase Storage por trás.

Para o APPlink: o formulário de criação deve ser **um schema por tipo de link** —
um bloco de input específico (telefone+mensagem para WhatsApp, e-mail+assunto+corpo
para Email, etc.) montado sobre uma base comum de customização/tracking.
- **A/B Rotator**: o destino principal entra fixo a 100%; cada "Add a destination"
  cria linha com URL + percentual editável. Distribui o tráfego pelos percentuais.
- **Geolocation**: cada regra = URL + país (combobox com a lista ISO completa,
  ~250 países).
- **Devices**: cada regra = URL + dispositivo (PC / Phone / Tablet / Unknown).
- **Operating system**: cada regra = URL + SO (Android / Linux / Mac / Ubuntu /
  Windows / iOS / Unknown).
- **Clicks limit**: nº de cliques (number) + URL de redirecionamento alternativa.
- **Link Expiration**: data/hora final + timezone (padrão GMT-3 Brasil) + URL alternativa.
- **Password**: campo único de senha.
- **UTMs**: 5 comboboxes (Campaign, Medium, Source, Term, Content) + sistema de
  **templates** ("Add a new template" / "From template").
- **Pixels**: combobox multi-seleção + "Add a new pixel".
- **Domínio**: combobox de domínios customizados + campo de slug ("Customize").

⚠️ **Regra de exclusividade mútua descoberta**: ao ativar A/B testing, Geolocation
ou Devices, as demais seções de roteamento exibem
*"You can't add a redirection if AB testing, Geolocation or Device redirect are activated"*.
Ou seja, **só um modo de roteamento condicional por vez**. Importante para o design
do motor de redirect do APPlink — define a precedência das regras.

#### Criação do link — resultado

Ao clicar "Get my new link" abre um modal *"Well done Switcher 🧙 — Your link is
ready to be shared"* com o link encurtado (ex.: `link.cliente.com.br/v-Is` — slug
curto auto-gerado de ~4 chars), botão Copy, e CTAs "Create a new link" / "Go to dashboard".

### 7.1b Tela de Analytics por link

Acessada pelo ícone de estatísticas (`bar_chart`) na linha do link →
URL `/{conta}/stat/{dominio}/{slug}`.

**Layout (de cima para baixo):**

1. **Cabeçalho do link** — ícone/favicon, URL curta, título, data de criação,
   URL de destino, e toolbar de ações: copiar, compartilhar, preview, QR code,
   editar, add_chart, duplicar, **restart_alt (resetar analytics)**, deletar.
2. **Filtro de período** — bloco "⌚ Filters" com dropdown "All time".
3. **Faixa de 5 cartões de KPI** (números grandes, ícone emoji):
   🚀 Clicks · 🧙 Users · 🧭 Referrers · 💻 Devices · 🌎 Countries.
4. **Gráfico 📊 Clicks** — gráfico de área/barras temporal (eixo X por mês).
5. **Grade de painéis** em 2 colunas, cada um com gráfico + **tabela**.

**Formato padrão de cada painel de detalhe** — tabela com 4 colunas:
`Item | Visits | Unique | % Visits` (barra de % visual). Exemplo real do link
"Episódio 114" (315 cliques / 275 usuários únicos):

| Painel | Conteúdo observado |
|---|---|
| 🌎 Countries | Toggle **Country/City** + **mapa-múndi com zoom** + tabela. Ex.: Brazil 218 (69%), USA 36 (11%), Portugal 36 (11%)… "Show more" |
| 🔎 Browsers | Tabela. Ex.: Unknown 312 (99%), Chrome 2, Edge 1 |
| 🧰 Operating system | Tabela. Ex.: iOS 201 (64%), Android 111 (35%), Windows 3 |
| 🧭 Referers | Donut/destaque ("instagram.com 98.1%") + tabela. Ex.: instagram.com 309, unknown 5, facebook.com 1 |
| 💻 Device type | **Gráfico de barras horizontais** + tabela. Ex.: Phone 308 (98%), Tablet 4, Pc 3 |
| 🎫 UTMs tags | Vazio → CTA "Want to add UTMs tags?" |
| 🎯 Retargeting Pixels | Vazio → CTA "Want to add Retargeting pixels?" |

Observações úteis para o APPlink:
- Toda métrica distingue **Visits (cliques) vs Unique (usuários únicos)** — exige
  deduplicação de visitante (cookie/fingerprint) no tracking.
- "Unknown" aparece muito em Browser/Referer — tráfego in-app (Instagram/Facebook)
  não expõe user-agent/referer completos. Realidade do tráfego social no Brasil.
- Painéis sem dado mostram CTA convidando a configurar o recurso (bom para ativação).
- `add_chart` adiciona o link a um **relatório comparativo** entre vários links;
  há também "Share link report" (relatório público compartilhável) e
  "restart_alt" para **zerar** as métricas do link.

### 7.2 Dashboard de links — mapeamento completo

URL `/{conta}/list`. É a tela inicial da função Link. Layout:

**Barra lateral esquerda — Folders:**
- Aba "🔗 All links" + seção "📂 Folders".
- Pasta "Default" + pastas customizadas (drag & drop para reordenar; cada uma
  com menu `more_vert`: renomear/deletar).
- Botão "New folder".

**Topo — criação rápida:** caixa "Create a new link" com campo de URL +
botão "Switch it" (atalho que leva à tela de criação).

**Barra de ferramentas:**
- Campo de busca: "Search a link by title, domain…".
- Botões: **Export datas**, **Bulk Import**, **Create a new link**.
- Contador de links (ex.: "40 links").

**4 filtros (chips com dropdown):**
| Filtro | Opções |
|---|---|
| 📅 Período | All time · Today · Last 7 days · Last 30 days · This month · Last month · **Custom Range** |
| 🏷️ Tag | All Tags + tags existentes |
| 🌐 Domínio | All Domains + lista dos **domínios de destino** dos links (filtra por destino, não pelo domínio curto) |
| ☰ Colunas | All Columns + 8 colunas liga/desliga e **reordenáveis** (drag): Title, Clicks, Date, Pixels, Note, Tags, Url, Id |

**Tabela de links:**
- Colunas padrão: Title · Clicks · Date · Pixels · Notes · Url · Link to share · Actions.
- Cada cabeçalho é **clicável para ordenar**.
- Cada linha tem: `drag_indicator` (reordenar manualmente), checkbox de seleção,
  favicon, e os dados.
- **Ações por linha** (9 ícones): `bar_chart` (analytics), `link` (copiar),
  `share`, `remove_red_eye` (preview), `qr_code_2`, `edit`, `add_chart`
  (add a relatório comparativo), `filter_none` (duplicar — vai para
  `/create?duplicate={id}`), `delete`.
- IDs internos numéricos sequenciais (ex.: `duplicate=12579481`).

**Ações em massa:** ao marcar checkboxes de linhas, surgem no topo os botões
**edit** (edição em massa) e **delete** (exclusão em massa). Há checkbox
"selecionar todos" no cabeçalho.

**Rodapé:** paginação — "Items per page" (padrão 20) + navegação
(primeira/anterior/próxima/última) + contador "1–20 de N".

> Nota: o app alterna idioma da UI (PT/EN) conforme a preferência da conta —
> os mesmos elementos aparecem como "Criar um novo link"/"Create a new link" etc.

### 7.3 Editor de Smartpage

URL do editor: `/{conta}/smartpage/create/{dominio}/{slug}`.

**Abas do editor**: Design · Share settings · Page Analytics · Leads · Block Analytics.

**Painel lateral (4 ícones):**
1. **brush** — Theme: temas pré-definidos, background (cor/gradiente/imagem),
   cor de botão (cor + cor da sombra), **9 tipos de botão**, fonte (dropdown).
2. **style** — Blocks: paleta de blocos drag & drop.
3. **settings** — configurações da página (código header/body, etc.).
4. **favorite** — favoritos/salvos.

**Paleta de blocos (23 tipos confirmados na UI):**
Button, Text, Countdown, Card, Carousel, RSS, Audio, Video, Calendar, Shopify,
Magento, Wordpress, Maps, Music, Q&A, Messenger, Form, Social, Vcard, Iframe,
Spacing, Separator, Avatar.

Preview ao vivo da página à direita, editável por clique em cada bloco.

### 7.4 Pistas de arquitetura observadas

- **Domínios de serviço**: links curtos em `swiy.co`, Smartpages em `smartpa.ge`,
  além dos domínios customizados do cliente (ex.: `link.cliente.com.br`).
- **Roteamento por conta**: todas as rotas do app começam com o ID numérico da
  conta (`/54656/...`) — sinal de multi-tenancy por conta/workspace.
- **SPA**: app single-page; o editor de Smartpage usa **Web Components**
  (elemento `sently-editor-layout` no DOM — "Sently" provável codinome interno do builder).
- **Help** servido via Intercom (`intercom.help/switchy`).
- IDs internos de link/smartpage são numéricos sequenciais (ex.: `duplicate=12578817`).

---

## 8. Catálogo completo de funcionalidades (leitura de todos os ~120 artigos)

> Esta seção consolida a leitura artigo a artigo de toda a Central de Ajuda.
> Serve como **especificação funcional de referência** para replicar no APPlink.

### 8.1 Switch a link — funções

| Função | Como funciona | Notas para o APPlink |
|---|---|---|
| Customizar aparência | Edita título, descrição e imagem (1200×630) do preview Open Graph | Metadata é auto-buscada da URL; usuário sobrescreve |
| Issue de aparência | Se o preview não atualiza, usar o **debugger** da rede (Facebook/Twitter/LinkedIn) para forçar refresh do cache OG | Cache de OG é problema conhecido — prever invalidação |
| Pixels de retargeting | Seleciona pixel já cadastrado (combobox) ou cria novo | Pixels ficam em Settings > Pixels, reutilizáveis entre links |
| UTMs | 5 campos + templates salvos | Anexados à URL de destino |
| Tags | Marcadores livres para classificar/buscar links | |
| Folders | Pastas; link entra numa pasta na criação ou via drag&drop no dashboard | |
| Notes | Texto interno livre no link | |
| Deep link | Detecta device/app e abre versão in-app (+150 apps) | |
| A/B Rotator | Múltiplos destinos com %; principal fixo a 100% | Exclusivo com geo/device/OS |
| Geolocation | Redireciona por país (lista ISO ~250) | Exclusivo |
| Devices | Redireciona por PC/Phone/Tablet/Unknown | Exclusivo |
| Operating system | Redireciona por Android/Linux/Mac/Ubuntu/Windows/iOS/Unknown | Exclusivo |
| Link Expiration | Após data/hora+timezone → URL alternativa | |
| Clicks limit | Após N cliques → URL alternativa | |
| Password | Senha protege o destino (tela com logo, removível em plano pago) | |
| Link cloaking | Esconde destino exibindo-o em iframe — **exige domínio próprio** | Para afiliados |
| Embed Widget | Injeta JS/HTML de terceiros (chat, quiz, form, vídeo) sobre a página de destino via iframe; regras de exibição (on landing / delay / exit-intent) — **exige domínio próprio** | ~3% dos sites bloqueiam iframe (bancos, Amazon, PayPal…) |
| Favicon | Link ou upload (16×16) | Auto-preenchido por tipo de link |
| GDPR popup | Consentimento antes de pixelar — exige "privacy profile" preenchido | |
| Bulk import | Até 500 links via CSV (colunas `link,slug`) ou colar lista; 1 domínio por import; metadata auto-buscada | Slug vazio = auto-gerado |
| Bulk edit | Seleciona links → aplica parâmetros em massa. ⚠️ Campo ativado e vazio **apaga** o valor anterior | |

### 8.2 Tipos de link especiais

12 tipos. Cada um troca só o bloco de input do topo:
Link (URL) · Email (destinatário+assunto+corpo) · WhatsApp (telefone+mensagem) ·
Messenger (m.me) · Call (telefone) · SMS (telefone+texto) · Telegram (usuário) ·
Skype · WeChat · Line · Viber · vCard (dados de contato → baixa .vcf).

### 8.3 Smartpage — builder

- **Criação**: template por indústria ou "from scratch".
- **Theme**: fundo (cor/gradiente/imagem), cor de botão (+ cor da sombra),
  9 tipos de botão, fonte.
- **Edição de bloco**: cada bloco tem opções avançadas comuns —
  **Hide** (desativar sem deletar), **Duplicate**, **Move** (drag&drop),
  **Custom appearance** (cor+tipo de botão próprios), **Animation** (toca a cada 5s),
  **Schedule** (exibe entre data início/fim + timezone), **Custom height**.
- **Imagens**: upload (≤5MB JPG/GIF/PNG), via URL, **screenshot de página**, ou **Giphy**.
- **Fix error**: não publica/atualiza com erros pendentes (sinal vermelho lista os blocos com erro).
- **Settings**: injeção de código no Header e Body.

**23 tipos de bloco** e o que cada um faz:

| Bloco | Função |
|---|---|
| Button | Botão com link de destino + texto CTA + ícone |
| Text | Texto livre + fonte |
| Card | Imagem clicável + título/descrição (auto da URL) + estilo |
| Countdown | Card com contagem regressiva (data+timezone) |
| Carousel | Vários cards num bloco; formato de visualização |
| Avatar | Foto + título + descrição (recomendado no topo) |
| RSS | Renderiza feed RSS (nº de itens, estilo) |
| Audio | Player de Spotify/Apple/Amazon/Deezer/Tidal/Soundcloud/Acast/Anchor… |
| Video | YouTube/Vimeo/Twitch/TikTok/Loom/Dailymotion/Wistia… (~20 plataformas) |
| Music | Botões para perfis em várias plataformas de música |
| Calendar | Agendamento — Calendly/HubSpot/TidyCal/TimeTap/Vectera… |
| Maps | Localização do Google Maps |
| Shopify | Mostra produtos de uma `/collection` Shopify (título/preço/desc/img) |
| Magento | Idem para loja Magento |
| Wordpress | Idem para loja WordPress |
| Q&A | Lista de perguntas/respostas em acordeão |
| Messenger | Botões de contato (WhatsApp/Skype/Telegram…) com mensagem pré-preenchida |
| Social | Ícones para redes sociais (inline ou redondo) |
| Form | Coleta de leads — campos tipados, obrigatórios, termos, thank you, **webhook** |
| vCard | Botão "salvar contato" → baixa .vcf |
| Iframe | Embute qualquer widget que suporte iframe |
| Spacing | Espaçamento (controle de layout) |
| Separator | Linha divisória (sólida/tracejada/pontilhada) |

**Analytics da Smartpage**: abas **Page Analytics** (cliques, visitantes),
**Block Analytics** (desempenho por bloco), **Leads** (dados dos forms, export CSV).

### 8.4 Pixels & Retargeting Ads

- **13 pixels**: Facebook/Instagram, Twitter, LinkedIn, TikTok, Google Ads,
  Snapchat, Pinterest, Quora, Bing, Google Tag Manager, AdRoll, Google Analytics, VK.
- Padrão de uso: copiar o **ID** do pixel na plataforma → colar em Settings > Pixels
  no Switchy → anexar o pixel ao link.
- **Retargeting**: em cada plataforma de ads, cria-se uma **Custom Audience** do tipo
  "visitantes de páginas específicas" e cola-se os links Switchy. Aí roda-se a campanha.
- ⚠️ Google Ads exige audiência mínima de ~1.000 usuários.

### 8.5 Dashboard, Domínio, Analytics

- **Dashboard**: folders, busca, filtros, colunas configuráveis, ações por linha,
  ações em massa (ver seção 7.2).
- **Domínio customizado**: registro **CNAME** apontando para `links.switchy.io.`
  Guias por provedor (Cloudflare — atenção ao **desligar o proxy/laranja → "DNS only"**;
  Namecheap, GoDaddy, Google Domains). Propagação 24–48h.
- **Analytics do link**: ver seção 7.1b. Recursos extras:
  **Share link report** (URL pública do relatório) e **Reset analytics** (zera dados — irreversível).

### 8.6 Integrações & API

- **Pabbly** e **Zapier**: 3 ações cada — **Create link**, **Update link**,
  **Form Submission (webhook)**. Conexão via **API Key** do Switchy.
  No Zapier o app aparece como "Switchy"; no webhook de form, copia-se a URL do
  webhook e cola-se no Form Block.
- **API REST**: liberada sob pedido. Limites: 1.500 links/dia, 100/hora. Uso pessoal;
  white-label exige "API Partner Plan".

### 8.7 Workspace, Team, Conta

- **Workspace**: até **100 por conta**; cada um totalmente isolado (links, domínios,
  pixels, equipe, **billing**). Deletar é irreversível (perde tudo dentro).
- **Team**: convite por e-mail (Settings > Team); quantidade conforme o plano;
  convidado recebe e-mail com link e precisa ter/criar conta Switchy.
- **Conta**: billing/limites, privacy profile (GDPR), API Key.

---

## 9. Próximos passos de pesquisa sugeridos

- Mapear os padrões de deep link de pelo menos os 20 apps mais usados no Brasil.
- Detalhar o editor de cada bloco (abrir um a um) e o schema JSON resultante.
- Explorar abas Page Analytics / Leads / Block Analytics com dados reais.
- Definir arquitetura do serviço de redirect (latência-alvo, edge, cache) — incluir
  desde já o motor de roteamento condicional (geo + device + SO + A/B + clicks limit).
- Especificar o schema de blocos das Smartpages (JSON) — base do builder.
