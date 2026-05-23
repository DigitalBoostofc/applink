# BUILD-SPEC — Mockups AppLink

Brief para construir as telas (mockups HTML estáticos) do produto AppLink:
encurtador + smart links + link-in-bio (smartpages) + analytics + pixels,
vendido avulso e como módulo white-label do AppexCRM.

## Regra de ouro

A tela-referência **`01-dashboard-links.html`** já está pronta e aprovada.
**Abra, leia e copie a estrutura dela.** Toda tela nova segue o mesmo padrão:
mesmo `<head>`, mesmo app-shell (sidebar + topbar), mesmas classes de componente.

Spec funcional do produto: `../docs/analise-switchy.md` (o que cada função faz).

## Sistema de temas — NÃO quebrar

- Existem 2 identidades no mesmo HTML: `data-brand="applink"` (NeonSpace
  neobrutalista) e `data-brand="appex"` (módulo CRM minimalista). O usuário
  alterna pelo seletor flutuante (`theme.js`).
- **Nunca** use cor/fonte/sombra/borda hardcoded. Use SEMPRE as classes de
  `ui.css` e as variáveis de `tokens.css` (`var(--accent)`, `var(--surface)`,
  `var(--ink-1)`, `var(--sh-card)`, etc.).
- Se precisar de CSS específico da tela, use `<style>` no `<head>` referenciando
  só tokens — e teste mentalmente nos 2 temas.
- Não edite `assets/tokens.css`, `assets/ui.css` nem `assets/theme.js`.

## Boilerplate do `<head>` (copiar igual)

```html
<!doctype html>
<html lang="pt-BR" data-brand="applink" data-mode="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>AppLink — {Nome da tela}</title>
<link rel="preconnect" href="https://api.fontshare.com">
<link href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@800,900&f[]=satoshi@400,500,700,900&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/tokens.css">
<link rel="stylesheet" href="assets/ui.css">
</head>
<body>
 ... conteúdo ...
<script src="assets/theme.js"></script>
</body>
</html>
```

## App-shell (telas internas do app)

Copiar de `01-dashboard-links.html`: `<div class="app">` com `<aside class="sidebar">`
(logo + nav-groups Principal / Crescimento / Configuração + bloco do usuário) e
`<div class="main">` com `<header class="topbar">` + `<main class="content">`.
Marcar o `nav-item` correspondente à tela com a classe `active`.
Telas de auth (login/signup) NÃO usam app-shell — são telas centralizadas.

## Componentes disponíveis (ui.css)

`.btn` (`.btn-primary/-secondary/-ghost/-danger`, `.btn-sm/-lg`, `.btn-icon`),
`.card` (`.card-pad`, `.card-head`), `.glass`, `.input/.select/.textarea`,
`.field`+`.label`, `.input-group`+`.addon`, `.toggle`, `.checkbox`, `.kpi-row`+`.kpi`,
`.badge` (`-accent/-success/-danger/-warning/-neutral`), `.table`, `.tabs`+`.tab`,
`.chip`, `.segmented`, `.search`, `.bar`, `.banner`, `.empty`, `.note`, `.avatar`,
`.thumb`, `.section-title`, `.page-title`, `.page-sub`, `.eyebrow`.
Ícones: SVG inline estilo Lucide (stroke, 24x24 viewBox) — copiar os de `01`.
Conteúdo em **português BR**, dados fictícios realistas (criadora "Maria Silva").

## Lista de telas e o que cada uma contém

Use número-prefixo no nome do arquivo. App-shell salvo onde indicado.

- **02-criar-link.html** — Form de criação/edição de link. Topo: seletor de tipo
  (Link, WhatsApp, Email, etc.) + campo de URL. Bloco "Personalizar" (imagem
  1200x630, título, descrição). Blocos: Pixels, UTMs (5 campos), Domínio+slug.
  Seção "Opções avançadas" expansível com: Pasta, Notas, Deep linking, Cloaking,
  Tags, A/B Rotator, Geolocalização, Dispositivos, Sistema operacional, Expiração,
  Limite de cliques, Senha, Favicon, Popup LGPD. Preview do link à direita. Botão
  "Gerar meu link".
- **03-analytics-link.html** — Analytics de um link. Cabeçalho do link + filtro de
  período. 5 KPIs (Cliques, Únicos, Referrers, Dispositivos, Países). Gráfico de
  cliques no tempo. Painéis: Países (mapa + tabela), Navegadores, SO, Referrers,
  Dispositivos, UTMs, Pixels. Tabelas no formato Item/Visitas/Únicos/%.
- **04-login.html** — Tela de login centralizada (sem app-shell). Card com logo,
  e-mail, senha, botão entrar, "esqueci a senha", link p/ cadastro. Lado/baixo:
  nota de que dá pra entrar com a conta AppexCRM.
- **05-signup.html** — Cadastro centralizado. Nome, e-mail, senha. Selo "7 dias
  grátis. Sem cartão." Link p/ login.
- **06-smartpages.html** — Dashboard de Smartpages (link-in-bio). Igual ao dashboard
  de links mas listando smartpages: thumbnail, título, cliques, domínio, ações
  (analytics, abrir, editar, QR, duplicar, excluir). Botão "Criar smartpage".
- **07-editor-smartpage.html** — Editor/builder da Smartpage. Layout 3 colunas:
  esquerda = painéis (Tema, Blocos, Config); centro = preview do celular com
  blocos; direita = edição do bloco selecionado. Abas no topo: Design, Compartilhar,
  Analytics da página, Leads. Paleta de blocos (Botão, Texto, Card, Carrossel,
  Vídeo, Form, Social, etc.).
- **08-leads-smartpage.html** — Aba de Leads + Analytics da Smartpage. KPIs da
  página, tabela de leads capturados (nome, e-mail, telefone, data, origem),
  botão exportar CSV, e destaque: "Leads sincronizados com o AppexCRM".
- **09-settings.html** — Configurações da conta. Abas: Perfil, Conta, Privacidade
  (LGPD/perfil de privacidade), Notificações. Campos de perfil, foto, idioma.
- **10-qrcode.html** — Builder de QR Code dinâmico. Preview do QR à direita;
  esquerda com Designer (forma, olhos, logo no centro), Templates, Cores.
  Botões baixar (PNG/SVG), salvar template.
- **11-pixels.html** — Gerenciar pixels de retargeting. Lista de pixels conectados
  (Meta, Google Ads, TikTok, LinkedIn, etc. — cada um com ícone, ID, status).
  Botão "Adicionar pixel" → escolher plataforma + colar ID. Estado vazio amigável.
- **12-audiencias.html** — Audiências de retargeting. Lista de audiências criadas
  a partir dos links pixelados, com tamanho estimado, plataforma, links incluídos.
  Explicação do fluxo de retargeting.
- **13-dominios.html** — Domínios customizados. Lista de domínios (status DNS:
  verificado / propagando / erro), instrução de CNAME → `links.applink.io`,
  botão "Adicionar domínio". Card explicando propagação 24-48h.
- **14-integracoes.html** — Integrações. Cards: Zapier, Make, Pabbly, Webhook,
  API REST (com API Key mascarada + botão copiar/gerar). Cada card com status
  conectado/desconectado e ação.
- **15-equipe.html** — Workspaces e equipe. Seletor/lista de workspaces; tabela de
  membros (nome, e-mail, papel, status); botão "Convidar membro". Nota sobre
  billing por workspace.
- **16-billing.html** — Planos e cobrança. 3 cards de plano (Starter, Pro,
  Business) com preço/limites (cliques/mês, domínios, smartpages, membros);
  plano atual destacado; medidor de uso de cliques do mês; histórico de faturas.
- **17-modulo-crm.html** — AppLink embarcado no AppexCRM. Mostrar o app dentro
  do shell do CRM: força `data-brand="appex"`. Topo com migalha "AppexCRM ›
  Módulos › AppLink". Conteúdo = mini-dashboard de links + destaque de que os
  leads caem direto no CRM e a identidade é unificada (SSO). Banner explicando
  o modo módulo.

## Qualidade

- Layout largura ~1280px, responsivo o suficiente para abrir em desktop.
- Densidade e capricho do nível de `01-dashboard-links.html`.
- Dados realistas, sem "lorem ipsum".
- Cada tela deve ficar boa nos 2 temas — testar alternando o seletor.
- Sempre incluir `<script src="assets/theme.js"></script>` antes de `</body>`.
