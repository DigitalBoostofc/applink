# APPlink — Mapeamento do Frontend

Documento vivo. Mapeia todas as telas e funcionalidades do APPlink conforme o
dono do produto apresenta as referências. Base para o plano de implementação.

## O produto

**APPlink** = link-in-bio profissional (ref: selfme.bio) + encurtador inteligente
de links (ref: Switchy.io), numa plataforma única.

Vendido em dois modos:
- **Avulso** — marca APPlink, página de venda própria, planos Free/Pro próprios.
- **Módulo do AppexCRM** — roda dentro do CRM via iframe, painel **white-label**
  (sem marca APPlink). Página pública pode manter a marca.

White-label some no painel quando rodando no CRM: logo, selo de plano,
"Renova em", "Gerenciar assinatura", "Faturas", aba "Indicações" + banner Stripe.

---

## Telas mapeadas

### Tela 1 — Editor de página (aba "Blocos")

- **Topo:** logo · slug editável `/usuario` · selo de plano · "Renova em DATA" ·
  Gerenciar assinatura · Faturas · Visualizar · Salvar · menu (⋮) · Sair
- **Banner "Indique e ganhe":** afiliados via Stripe.
- **Abas do editor:** Blocos · Tema · Analytics · Pixels · Domínio · Indicações
- **Corpo:** toggle Edição/Visualização · contador de blocos · seletor de Layout
  (Lista / Bento Grid) · preview da página (avatar, nome, descrição, links
  sociais no perfil) · botão "+ Adicionar bloco".

### Tela 2 — Modo Visualização

Mostra a página renderizada: perfil à esquerda (avatar, nome, selo de
verificado, cargo/descrição) e os blocos à direita.

### Menu (⋮) do topo do editor

Opções: "Editar URL da página" · "Excluir página" · "Excluir conta".

Nota white-label: "Excluir conta" não deve aparecer no modo CRM (a conta
pertence ao CRM). "Excluir página" e "Editar URL" continuam.

### Tela 3 — Aba Tema

- **Preview ao vivo** à esquerda (card atualiza em tempo real).
- **Temas prontos:** toggle Light/Dark. 8 temas Light (Classic, Ocean, Forest,
  Rose, Sand, Lavender, Brutalist, Minimal) + variantes Dark = 16+.
- **Cores personalizadas:** Fundo · Texto principal · Destaque · Botões/Ação ·
  Texto dos botões (cada uma com hex editável).
- **Fonte:** DM Sans, Inter, Poppins, Playfair Display, Space Grotesk, System UI,
  Georgia, Monospace.
- **Arredondamento:** 5 níveis de cantos.

### Tela 4 — Aba Domínio (domínio personalizado) — MODELO ESCOLHIDO

O dono prefere o fluxo do selfme.bio (mais intuitivo) ao do Switchy.

- **Estado inicial:** texto explicativo + campo "Domínio" (ex:
  `links.seudominio.com`) + botão "Salvar domínio". A URL padrão
  `APPlink/usuario` continua funcionando.
- **Após salvar:** carrega e aparece o bloco "Como ativar":
  - Passo 1: criar registro **CNAME** no provedor de DNS, com Nome (host) e
    Alvo (valor) indicados na tela.
  - Passo 2: após propagação do DNS (até 48h), a página fica disponível no
    domínio com **SSL ativo**.
  - Botões: "Verificar novamente" · "Remover domínio".

### Aba Indicações (afiliados) — ADIADA

Programa de afiliados via Stripe. Decisão do dono: deixar por último.
Funcionalidade só do modo avulso (some no modo CRM — ver white-label).

## Melhorias do APPlink sobre o selfme.bio (requisitos do dono)

1. **Preview mobile e desktop** — toggle pra ver a página nos dois formatos.
2. **Blocos redimensionáveis** — usuário ajusta o tamanho de cada bloco.
3. **Blocos com posição livre** — arrastar/mover blocos livremente na página
   (editor estilo canvas/grade, não só lista fixa).
4. **Layout responsivo por breakpoint** — a pessoa monta no desktop e o mobile
   é gerado automaticamente como ponto de partida. A partir daí, tamanho,
   posição e visibilidade de cada bloco são salvos SEPARADAMENTE por formato:
   - Redimensionar/mover no desktop não afeta o mobile, e vice-versa.
   - Cada bloco tem toggle de visibilidade independente: ocultar só no mobile,
     só no desktop, ou exibir nos dois.
   - Mesmo conteúdo do bloco; o que varia por breakpoint é tamanho, posição e
     visibilidade (modelo estilo Webflow/Framer).

---

## PARTE 2 — Encurtador de links (ref: Switchy)

### Tela 5 — Encurtador: lista de links

- **Topo:** título · seletor de espaço de trabalho · menu (⋮).
- **Sidebar:** "Todos os links" · Pastas (organização de links) · "Nova pasta".
- **Criar link rápido:** campo de URL + botão de encurtar.
- **Barra de ações:** busca por título/domínio · Exportar dados · Importação em
  massa · "Criar um novo link".
- **Contador** de links · **filtros** (período, tags, colunas configuráveis).
- **Tabela de links** — colunas: Título · Cliques · Data · Pixels · Notas · URL
  destino · Link para compartilhar · Ações.
- **Ações por link:** ver analytics · copiar · compartilhar · QR/preview ·
  editar · QR code · duplicar · excluir · reordenar (arrastar).

### Tela 6 — Criar / configurar link

**Topo:** seletor de tipo · campo da URL de destino · botão "Obtenha meu novo
link".

**Configurações principais:**
- **Personalizar preview (Open Graph):** imagem 1200×630, título, descrição —
  controla o cartão exibido ao compartilhar o link.
- **Pixels:** adicionar IDs de pixels ao link; criar novo pixel.
- **Tags UTM:** Campanha, Meio, Fonte, Termo, Conteúdo; salvar/reusar como
  modelo.
- **Domínio + slug:** escolher domínio personalizado e personalizar o slug.

**Opções avançadas:**
- Pasta · Notas · Etiquetas (tags).
- **Widget incorporado:** script de embed.
- **Links diretos:** deep linking (abrir no app nativo).
- **Camuflagem de link (cloaking):** esconde a URL real de destino.
- **Favicon** personalizado.

**Redirecionamento inteligente:**
- **Rotator / Teste A/B:** divide o tráfego entre destinos por porcentagem.
- **Geolocalização:** destino por país/região.
- **Dispositivos:** destino por aparelho.
- **Sistema operacional:** destino por SO.
- **Expiração do link:** troca o destino após data/hora.
- **Limite de cliques:** troca o destino após X cliques.
- **Senha:** protege o link com senha.

### Tela 6 — detalhamento das opções avançadas

**Widget incorporado → "Adicionar um novo script de incorporação"** (modal):
- Aviso: scripts de incorporação só funcionam em domínios personalizados.
- Campo "Nome*".
- **JavaScript personalizado** — área de código (cola o embed script).
- **HTML personalizado** — área de código (cola o HTML).
- Botões: Fechar · Criar.

**Expiração do link** (toggle ativado):
- "End at" — data/hora de expiração.
- "Timezone" — fuso horário (ex: GMT-3 Brazil).
- "Redirection link*" — destino para onde o link passa a apontar após expirar.

**Sistema operacional** (regras): cada regra = "Redirection link*" + seletor de
"Operating system*" + lixeira. Botão "Adicionar um redirecionamento" para mais
regras.

**Limite de cliques** (toggle ativado): campo "Clicks limit*" (número) +
"Redirection link*" — destino após atingir o limite de cliques.

## Catálogo de blocos (botão "+ Adicionar bloco")

### Conteúdo
Título · Parágrafo · Botão · Imagem · Galeria · Curso/Produto · Divisor ·
Depoimento · Apoie/Doação · FAQ · Captura de E-mail · Achadinhos (buscar
produto) · Contagem regressiva · Agendar · Calendly · Cal.com · Vakinha

### Mídia
Mapa · Embed · Spotify · YouTube · SoundCloud · Apple Music · Twitch

### Redes sociais
Ícones Sociais · LinkedIn · Pinterest · WhatsApp · Telegram · Discord ·
Instagram · TikTok · Twitter/X · GitHub · Behance

Total: ~35 tipos de bloco.
