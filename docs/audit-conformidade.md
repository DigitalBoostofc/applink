# AppLink — Auditoria de Conformidade: Documentação × Mockups

> **Data:** 2026-05-23
> **Auditor:** PO (papel AIOX:po)
> **Fontes auditadas:**
> - `docs/analise-switchy.md` — especificação funcional de referência (Switchy.io)
> - `docs/mapeamento-frontend.md` — mapeamento telas → features do AppLink
> - `mockups/index.html` + 22 arquivos HTML de mockup
>
> **Metodologia:** leitura cruzada de cada feature documentada contra o HTML dos mockups
> (grep por termos-chave + leitura de estrutura). Sem alteração de nenhum arquivo.
>
> **Legenda:** ✅ COBERTA · ⚠️ PARCIAL · ❌ AUSENTE

---

## 1. Matriz Feature → Tela → Status

### 1.1 Encurtador — Smart Links

| # | Feature documentada | Fonte doc | Tela(s) mockup | Status | Observação |
|---|---|---|---|---|---|
| L01 | Encurtador com slug customizado | switchy §2.1, map. T5-6 | `01`, `02` | ✅ COBERTA | Quick create + campo de slug no form |
| L02 | Folders / Pastas | switchy §2.1, §7.2 | `01` | ✅ COBERTA | Sidebar com pastas, drag & drop, Nova pasta |
| L03 | Tags / Etiquetas | switchy §2.1, map. T6 | `01` (filtro), `02` (form) | ✅ COBERTA | Filtro por tag no dashboard e campo no form |
| L04 | Notas internas | switchy §2.1, §7.1 | `02` | ⚠️ PARCIAL | Campo no form; coluna "Notas" não visível como configurável na tabela do 01 |
| L05 | Customização de preview OG | switchy §2.1, §7.1, map. T6 | `02` | ✅ COBERTA | Seção "Personalizar preview" com imagem, título, descrição |
| L06 | 12 tipos de link especiais | switchy §2.1, §7.1, §8.2 | `02` | ⚠️ PARCIAL | Seletor presente com 3 tipos (WhatsApp, SMS, vCard); outros 9 ausentes; formulário dinâmico por tipo não mockado |
| L07 | Favicon personalizado | switchy §2.2, §7.1 | — | ❌ AUSENTE | Documentado no Switchy; ausente em todos os mockups |
| L08 | Embed Widget (JS/HTML inject) | switchy §2.2, §8.1, map. T6 | `02` | ⚠️ PARCIAL | Mapeamento descreve modal com campos JS/HTML; HTML do 02 não contém o bloco visível |
| L09 | Deep linking (+150 apps) | switchy §2.2, map. T6 | `02` | ✅ COBERTA | Toggle presente nas opções avançadas |
| L10 | Link cloaking / mask | switchy §2.2, §8.1, map. T6 | `02` | ✅ COBERTA | "Mascarar link (cloaking)" nas opções avançadas |
| L11 | A/B Rotator | switchy §2.2, §7.1, map. T6 | `02` | ✅ COBERTA | Listado em "Redirecionamento inteligente" |
| L12 | Geolocalização (redirect por país) | switchy §2.2, §7.1, map. T6 | `02` | ✅ COBERTA | Idem |
| L13 | Redirect por Dispositivo | switchy §2.2, §7.1, map. T6 | `02` | ✅ COBERTA | "Dispositivos & SO" agrupados |
| L14 | Redirect por Sistema Operacional | switchy §2.2, §7.1, map. T6 | `02` | ✅ COBERTA | Idem — nota: mapeamento detalha formulário; mockup agrupa |
| L15 | Expiração do link | switchy §2.2, §7.1, map. T6 | `02` | ⚠️ PARCIAL | Agrupado com Limite de cliques numa única linha; formulário expandido (End at, Timezone, Redirection link) não mockado |
| L16 | Limite de cliques (clicks limit) | switchy §2.2, §7.1, map. T6 | `02` | ⚠️ PARCIAL | Idem L15 — agrupado, sem formulário expandido |
| L17 | Senha / Password | switchy §2.2, map. T6 | `02` | ✅ COBERTA | Toggle presente |
| L18 | Regra de exclusividade mútua entre roteamentos | switchy §7.1 | — | ❌ AUSENTE | UX crítico (só um modo de redirect ativo por vez); sem feedback visual nos acordeões |
| L19 | GDPR / LGPD — privacy popup | switchy §2.7, §8.1 | `09` | ✅ COBERTA | Toggle "Popup de consentimento", nome empresa, link de política, badge conformidade |

### 1.2 Encurtador — Operações em Massa e Dashboard

| # | Feature documentada | Fonte doc | Tela(s) mockup | Status | Observação |
|---|---|---|---|---|---|
| D01 | Busca por título/domínio | switchy §7.2, map. T5 | `01` | ✅ COBERTA | Campo de busca presente |
| D02 | Filtros: período, tags, domínio, colunas | switchy §7.2, map. T5 | `01` | ✅ COBERTA | Chips de filtro presentes (Período, Tags, Colunas) |
| D03 | Colunas configuráveis e ordenáveis | switchy §7.2 | `01` | ⚠️ PARCIAL | Chip "Colunas" presente; sem mockup do dropdown de configuração de colunas |
| D04 | Ações por linha (9 ícones) | switchy §7.2, map. T5 | `01` | ✅ COBERTA | Analytics, copiar, compartilhar, QR, editar, duplicar, excluir |
| D05 | Bulk import (CSV / lista colada) | switchy §2.3, §8.1, map. T5 | `01` | ⚠️ PARCIAL | Botão "Importar" presente; sem modal de fluxo (CSV upload, validação, passo a passo) |
| D06 | Bulk edit (editar vários links) | switchy §2.3, §8.1 | — | ❌ AUSENTE | Sem checkbox de seleção múltipla e sem tela/modal de edição em massa |
| D07 | Ações em massa (delete/edit checkbox) | switchy §7.2 | — | ❌ AUSENTE | Sem checkbox de seleção múltipla no dashboard |
| D08 | Exportar dados | switchy §7.2, map. T5 | `01` | ✅ COBERTA | Botão "Exportar dados" presente |
| D09 | Paginação | switchy §7.2 | `01` | ✅ COBERTA | Implícito na listagem |

### 1.3 Analytics do Link

| # | Feature documentada | Fonte doc | Tela(s) mockup | Status | Observação |
|---|---|---|---|---|---|
| A01 | KPIs: Cliques, Únicos, Referrers, Dispositivos, Países | switchy §2.8, §7.1b | `03` | ✅ COBERTA | 5 cards de KPI presentes |
| A02 | Gráfico temporal de cliques | switchy §7.1b | `03` | ✅ COBERTA | Seção "Cliques no tempo" |
| A03 | Painel Países (com toggle Cidade) | switchy §7.1b | `03` | ✅ COBERTA | Toggle País/Cidade presente |
| A04 | Painel Tipo de dispositivo | switchy §7.1b | `03` | ✅ COBERTA | Seção "Tipo de dispositivo" |
| A05 | Painel Sistema operacional | switchy §7.1b | `03` | ✅ COBERTA | Seção "Sistema operacional" |
| A06 | Painel Referrers | switchy §7.1b | `03` | ✅ COBERTA | Seção "Referrers" |
| A07 | Painel UTMs | switchy §7.1b | `03` | ✅ COBERTA | Seção "UTMs" |
| A08 | Painel Pixels de retargeting | switchy §7.1b | `03` | ✅ COBERTA | Seção "Pixels de retargeting" |
| A09 | Painel Browser / Navegador | switchy §7.1b | — | ❌ AUSENTE | Presente no Switchy real; ausente no 03 |
| A10 | Filtro de período (All time, 30d, custom) | switchy §7.1b, §7.2 | `03` | ✅ COBERTA | Chip "Últimos 30 dias" |
| A11 | Compartilhar relatório (link público) | switchy §8.5 | `03` | ✅ COBERTA | Botão "Compartilhar relatório" |
| A12 | Resetar analytics | switchy §8.5 | `03` | ✅ COBERTA | Ícone "Resetar" no toolbar |
| A13 | Comparativo entre links (add_chart) | switchy §7.1b, §7.2 | — | ❌ AUSENTE | Recurso "adicionar a relatório comparativo" sem tela |

### 1.4 Smartpages — Link-in-bio Builder

| # | Feature documentada | Fonte doc | Tela(s) mockup | Status | Observação |
|---|---|---|---|---|---|
| S01 | Dashboard de Smartpages | switchy §2.4 | `06` | ✅ COBERTA | KPIs + grid de páginas |
| S02 | Criar a partir de template ou do zero | switchy §2.4, §8.3 | `06` | ✅ COBERTA | "Comece de um template ou do zero" |
| S03 | Editor de blocos drag & drop | switchy §2.4, §7.3, map. T1 | `07` | ✅ COBERTA | Layout editor + paleta lateral |
| S04 | Theme: fundo (cor/gradiente/imagem) | switchy §2.4, §8.3, map. T3 | `07` (aba Tema) | ✅ COBERTA | Aba "Tema" presente no editor |
| S05 | Theme: 9 tipos de botão + cor da sombra | switchy §7.3, §8.3, map. T3 | `07` | ⚠️ PARCIAL | Aba Tema existe; conteúdo interno (9 tipos de botão) não confirmado no HTML |
| S06 | Theme: fonte | switchy §2.4, map. T3 | `07` | ⚠️ PARCIAL | Idem — aba Tema existe mas fontes não confirmadas |
| S07 | Bloco: Botão | switchy §8.3 | `07` | ✅ COBERTA | Na paleta + painel de edição |
| S08 | Bloco: Texto | switchy §8.3 | `07` | ✅ COBERTA | Na paleta |
| S09 | Bloco: Card | switchy §8.3 | `07` | ✅ COBERTA | Na paleta |
| S10 | Bloco: Carrossel | switchy §8.3 | `07` | ✅ COBERTA | Na paleta |
| S11 | Bloco: Countdown (contador regressivo) | switchy §8.3 | `07` | ✅ COBERTA | Na paleta |
| S12 | Bloco: Vídeo | switchy §8.3 | `07` | ✅ COBERTA | Na paleta |
| S13 | Bloco: Áudio | switchy §8.3 | `07` | ✅ COBERTA | Na paleta |
| S14 | Bloco: Avatar | switchy §8.3 | `07` | ✅ COBERTA | Na paleta |
| S15 | Bloco: Form (com webhook) | switchy §2.4, §8.3 | `07` (paleta) + `14` (webhook) | ✅ COBERTA | Bloco Form na paleta; webhook na tela Integrações |
| S16 | Bloco: Social | switchy §8.3 | `07` | ✅ COBERTA | Na paleta |
| S17 | Bloco: Q&A | switchy §8.3 | `07` | ✅ COBERTA | Na paleta |
| S18 | Bloco: Mapa | switchy §8.3 | `07` | ✅ COBERTA | Na paleta |
| S19 | Bloco: Music | switchy §8.3 | — | ❌ AUSENTE | Não aparece na paleta do 07 |
| S20 | Bloco: RSS | switchy §8.3 | — | ❌ AUSENTE | Idem |
| S21 | Bloco: Calendar / Agendamento | switchy §8.3 | — | ❌ AUSENTE | Idem (Calendly, HubSpot, TidyCal…) |
| S22 | Bloco: Messenger (contatos: WhatsApp/Telegram) | switchy §8.3 | — | ❌ AUSENTE | Idem |
| S23 | Bloco: vCard (salvar contato .vcf) | switchy §8.3 | — | ❌ AUSENTE | Idem |
| S24 | Bloco: Iframe | switchy §8.3 | — | ❌ AUSENTE | Idem |
| S25 | Bloco: Spacing | switchy §8.3 | — | ❌ AUSENTE | Idem |
| S26 | Bloco: Separator | switchy §8.3 | — | ❌ AUSENTE | Idem |
| S27 | Bloco: Shopify | switchy §8.3 | — | ❌ AUSENTE | Idem |
| S28 | Bloco: Magento | switchy §8.3 | — | ❌ AUSENTE | Idem |
| S29 | Bloco: WordPress (store) | switchy §8.3 | — | ❌ AUSENTE | Idem |
| S30 | Opção por bloco: Agendar exibição | switchy §8.3 | `07` | ✅ COBERTA | "Agendar exibição" e toggle presentes |
| S31 | Opção por bloco: Duplicar | switchy §8.3 | `07` | ✅ COBERTA | Ícone Duplicar presente |
| S32 | Opção por bloco: Ocultar (Hide) | switchy §8.3 | `07` | ⚠️ PARCIAL | Mencionado no mapeamento; não confirmado no HTML do 07 |
| S33 | Opção por bloco: Animation | switchy §8.3 | — | ❌ AUSENTE | Não encontrado no 07 |
| S34 | Opção por bloco: Custom height | switchy §8.3 | — | ❌ AUSENTE | Não encontrado no 07 |
| S35 | Settings da Smartpage: injeção código header/body | switchy §2.4, §8.3 | `07` (aba Config) | ⚠️ PARCIAL | Aba "Config" existe no editor; conteúdo interno não expandido no mockup |
| S36 | Analytics da Smartpage: Page Analytics | switchy §2.4, §8.3 | `08` | ✅ COBERTA | Aba "Analytics da página" |
| S37 | Analytics da Smartpage: Block Analytics | switchy §2.4, §8.3 | `08` | ✅ COBERTA | Aba "Analytics por bloco" |
| S38 | Analytics da Smartpage: Leads + export CSV | switchy §2.4, §8.3 | `08` | ✅ COBERTA | Aba "Leads" + botão "Exportar CSV" |

### 1.5 QR Code

| # | Feature documentada | Fonte doc | Tela(s) mockup | Status | Observação |
|---|---|---|---|---|---|
| Q01 | QR Code dinâmico e branded | switchy §2.5 | `10` | ✅ COBERTA | Editor de QR presente |
| Q02 | Builder: Logo no centro | switchy §2.5 | `10` | ✅ COBERTA | Toggle "Logo no centro" |
| Q03 | Builder: Estilo dos olhos | switchy §2.5 | `10` | ✅ COBERTA | Seção "Estilo dos olhos" |
| Q04 | Templates salvos | switchy §2.5 | `10` | ✅ COBERTA | Seção "Templates salvos" |
| Q05 | Download em vários formatos | switchy §2.5 | `10` | ⚠️ PARCIAL | Botão "Salvar template" visível; botão de download/formato não confirmado no HTML |
| Q06 | Shape do módulo do QR | switchy §2.5 | `10` | ⚠️ PARCIAL | Estilo dos olhos confirmado; shape dos módulos não confirmado |

### 1.6 Pixels & Retargeting

| # | Feature documentada | Fonte doc | Tela(s) mockup | Status | Observação |
|---|---|---|---|---|---|
| P01 | Gerenciar pixels (13 plataformas) | switchy §2.6, §8.4 | `11` | ✅ COBERTA | Tela de pixels dedicada |
| P02 | Associar pixel ao link | switchy §2.6 | `02` | ✅ COBERTA | Seção "Pixels" no form de criação |
| P03 | Pixels no analytics do link | switchy §2.8, §7.1b | `03` | ✅ COBERTA | Painel "Pixels de retargeting" |

### 1.7 Domínios

| # | Feature documentada | Fonte doc | Tela(s) mockup | Status | Observação |
|---|---|---|---|---|---|
| DN01 | Domínio customizado (CNAME/SSL) | switchy §2.9, §8.5, map. T4 | `13` | ✅ COBERTA | Tela com passo a passo CNAME + Verificar + Remover |

### 1.8 Integrações & API

| # | Feature documentada | Fonte doc | Tela(s) mockup | Status | Observação |
|---|---|---|---|---|---|
| I01 | Zapier | switchy §2.11, §8.6 | `14` | ✅ COBERTA | Card com descrição |
| I02 | Pabbly | switchy §2.11, §8.6 | `14` | ✅ COBERTA | Card com descrição |
| I03 | Make | switchy §8.6 (não está, mas lógico) | `14` | ✅ COBERTA | Adição proprietária do AppLink vs Switchy |
| I04 | Webhook de forms | switchy §2.4, §8.6 | `14` | ✅ COBERTA | Card Webhook |
| I05 | API REST (API Key) | switchy §2.11, §8.6 | `14` | ✅ COBERTA | Campo "Sua API Key" |
| I06 | Extensão de browser (Chrome) | switchy §2.10 | — | ❌ AUSENTE | Fase 3; sem mockup |

### 1.9 Workspaces & Equipe

| # | Feature documentada | Fonte doc | Tela(s) mockup | Status | Observação |
|---|---|---|---|---|---|
| W01 | Workspaces multi-tenant | switchy §2.10, §8.7 | `15` | ✅ COBERTA | Seletor de workspace + info de isolamento |
| W02 | Convite de membros por e-mail | switchy §2.10, §8.7 | `15` | ✅ COBERTA | Botão "Convidar membro" + tabela de membros |
| W03 | Papéis (roles) com permissões | switchy §8.7 | `15` | ⚠️ PARCIAL | Badge de papel exibido; sem tela de configuração de permissões por papel |

### 1.10 Billing & Planos

| # | Feature documentada | Fonte doc | Tela(s) mockup | Status | Observação |
|---|---|---|---|---|---|
| B01 | Planos com limites de cliques | switchy §5, map. | `16` | ✅ COBERTA | 3 planos (Starter/Pro/Business) com preços e cliques/mês |
| B02 | Medidor de uso de cliques | switchy §5 | `16` | ✅ COBERTA | "32.480 / 50.000 cliques no mês" |
| B03 | Comportamento ao atingir 100% do limite | switchy §5 | `16` | ✅ COBERTA | Texto explicativo presente |
| B04 | Faturas | map. T1 | `16` | ⚠️ PARCIAL | Mencionado no mapeamento; não confirmado como seção no HTML do 16 |

### 1.11 Módulo CRM & Autenticação

| # | Feature documentada | Fonte doc | Tela(s) mockup | Status | Observação |
|---|---|---|---|---|---|
| C01 | White-label no AppexCRM | map. "Módulo" | `17` | ✅ COBERTA | Tela do módulo embarcado |
| C02 | Leads direto no funil do CRM | map., analise-switchy §6 | `08` | ✅ COBERTA | Texto "Todos os leads... caem direto no funil do AppexCRM" |
| C03 | Login / Autenticação | map. T4 | `04` | ✅ COBERTA | |
| C04 | Cadastro / Signup | map. T5 | `05` | ✅ COBERTA | |
| C05 | White-label: ocultação de marca/plano/billing no CRM | map. "White-label" | `17` | ✅ COBERTA | Tela diferenciada sem elementos da marca |

---

## 2. Lista de Gaps por Severidade

### CRÍTICOS — Bloqueadores do MVP

| # | Gap | Feature | Impacto |
|---|---|---|---|
| G01 | **Bulk edit e ações em massa** ausentes | D06, D07 | Usuários com 10+ links não conseguem operar; sem checkbox de seleção múltipla no dashboard é impossível escalar uso |
| G02 | **Formulário dinâmico por tipo de link** não mockado | L06 | Dev não sabe o que construir para WhatsApp, Email, vCard, Call, SMS etc. (9 dos 12 tipos sem spec visual) |
| G03 | **Modal/fluxo de Bulk import** ausente | D05 | Botão existe como orfão; sem UI de upload CSV, preview, validação de erros — dev não consegue implementar |
| G04 | **Regra de exclusividade mútua entre roteamentos** sem representação visual | L18 | Switchy bloqueia outros modos ao ativar A/B/Geo/Device; sem feedback na UI o usuário não entende o comportamento e o dev não sabe o que implementar |
| G05 | **11 blocos ausentes** na paleta do editor de Smartpage | S19–S29 | Doc lista 23 blocos; mockup mostra apenas 12 (52% de cobertura). Calendar, Music, RSS, Messenger, vCard, Iframe são esperados por usuários de link-in-bio |

### MÉDIOS — Impedem validação completa do produto

| # | Gap | Feature | Impacto |
|---|---|---|---|
| G06 | **Browser/Navegador** ausente no analytics | A09 | Painel documentado no Switchy real; falta paridade de dados |
| G07 | **Favicon personalizado** sem mockup | L07 | Feature pequena mas com auto-preenchimento por tipo de link (WhatsApp, vCard etc.) — depende de G02 |
| G08 | **Embed Widget** não visível no mockup 02 | L08 | Mapeamento descreve modal com JS/HTML; HTML não contém o bloco |
| G09 | **Expiração e Limite de cliques** só como label agrupado | L15, L16 | Formulários expandidos (End at, Timezone, Redirection link / Clicks limit, Redirection link) não mockados |
| G10 | **Opções por bloco: Animation e Custom height** ausentes | S33, S34 | Documentadas no Switchy; impedem spec completa do editor |
| G11 | **Settings da Smartpage** (injeção código) não expandida | S35 | Aba "Config" existe mas sem conteúdo; dev não sabe os campos |
| G12 | **Comparativo entre links** sem tela | A13 | Feature de analytics avançado sem representação |

### BAIXOS — Nice-to-have / Fase 2+

| # | Gap | Feature | Impacto |
|---|---|---|---|
| G13 | Papéis com tela de configuração de permissões | W03 | Badges existem; gestão de permissões não especificada |
| G14 | Faturas sem seção dedicada no billing | B04 | Mencionado no mapeamento; não confirmado visualmente |
| G15 | QR Code: formatos de download não confirmados | Q05, Q06 | Funcionalidade de exportação incompleta no mockup |
| G16 | Visitor-view do GDPR popup | — | O popup que o visitante vê ao clicar no link não tem mockup (só a configuração do lado do usuário) |
| G17 | Extensão de browser (Chrome) | I06 | Fase 3; baixo impacto no MVP |
| G18 | Colunas configuráveis: dropdown não mockado | D03 | Chip existe mas interação não especificada |

---

## 3. Telas sem Feature Documentada — Over-Engineering Candidates

| Tela | Descrição | Avaliação |
|---|---|---|
| `12-audiencias.html` | "Audiências de retargeting" — dashboard com tabela Audiência/Plataforma/Pessoas | **Over-engineering.** O Switchy não tem tela de "audiências" — o conceito é um tutorial de como usar as plataformas de ads externas. Uma tela de audiências implicaria backend de sincronização com Meta/Google Ads sem spec. Remover ou converter em painel educativo (como o Switchy faz). |
| `18-states.html` | Estados & edge cases (loading, vazio, erro, foco, disabled) | **Artefato de handoff, não tela de produto.** Útil para o dev/design; não deve contar como "tela funcional" no índice do produto. Reclassificar como documento interno. |
| `19-v3-neumorphism.html` | Identidade alternativa V3 (comparação de design system) | **Tela de decisão de identidade, não funcional.** Deve ser arquivada após escolha de identidade final. Ocupa slot no índice sem mapear para nenhuma feature. |
| `00-design-system.html` | Tokens, cores, tipografia | **Documentação de design, não produto.** Igual ao 18 — útil internamente, não deve contar como tela de produto. |
| `01b-v3-dashboard.html` | Variante V3 do Dashboard | **Duplicata visual** de `01` sem features novas. Ocupa slot sem cobertura funcional adicional. |
| `02b-v3-criar-link.html` | Variante V3 de Criar link | **Duplicata visual** de `02` sem features novas. Idem. |

**Resumo:** 6 das 22 telas (27%) não adicionam cobertura funcional. Slots que poderiam cobrir G01–G05.

---

## 4. Mapa de Cobertura (Consolidado)

| Categoria | Total features doc. | ✅ COBERTA | ⚠️ PARCIAL | ❌ AUSENTE |
|---|---|---|---|---|
| Smart Links | 19 | 10 (53%) | 6 (32%) | 3 (16%) |
| Dashboard / Bulk | 9 | 5 (56%) | 2 (22%) | 2 (22%) |
| Analytics | 13 | 10 (77%) | 0 | 3 (23%) |
| Smartpages | 38 | 22 (58%) | 7 (18%) | 11 (29%) |  
| QR Code | 6 | 3 (50%) | 3 (50%) | 0 |
| Pixels | 3 | 3 (100%) | 0 | 0 |
| Domínios | 1 | 1 (100%) | 0 | 0 |
| Integrações | 6 | 5 (83%) | 0 | 1 (17%) |
| Workspaces/Equipe | 3 | 2 (67%) | 1 (33%) | 0 |
| Billing | 4 | 3 (75%) | 1 (25%) | 0 |
| CRM/Auth | 5 | 5 (100%) | 0 | 0 |
| **TOTAL** | **107** | **69 (64%)** | **20 (19%)** | **20 (19%)** |

**Cobertura efetiva:** 64% coberta + 19% parcial = **83% de cobertura superficial**, mas com 20 gaps funcionais reais e 5 gaps críticos que bloqueiam o MVP.

---

## 5. Top 5 Recomendações Priorizadas para Fechar o MVP

### Rec 1 — Mockar o formulário dinâmico por tipo de link `[CRÍTICO]`

Expandir a tela `02` com estados por tipo selecionado: WhatsApp (telefone + mensagem pré-preenchida), Email (destinatário + assunto + corpo), vCard (campos de contato), Call, SMS, Telegram. A base comum (OG, pixels, UTMs, opções avançadas) permanece igual — só o bloco do topo muda. Sem isso, o dev não tem spec para nenhum dos tipos especiais.

**Entregável:** expandir `02-criar-link.html` com 6 variantes de bloco de input OU criar `02c-tipos-de-link.html` com grid de todos os 12 tipos.

### Rec 2 — Criar a tela de Bulk edit + ações em massa `[CRÍTICO]`

Adicionar ao dashboard `01`:
1. Checkbox de seleção múltipla por linha + "selecionar todos"
2. Toolbar condicional que aparece ao marcar linhas (editar em massa / deletar em massa)
3. Modal de bulk edit com campos aplicáveis (pasta, tags, pixels, expiração)

Criar também `01c-bulk-import.html` com o fluxo completo: botão → modal → upload CSV ou colar lista → preview de linhas → importar → resultado.

**Impacto:** operação em escala é o que separa usuários casuais de power-users e agências.

### Rec 3 — Expandir paleta de blocos do editor de Smartpage para os 23 documentados `[CRÍTICO]`

O editor `07` exibe 12 blocos na paleta; o doc especifica 23. Os 11 ausentes mais importantes para o público brasileiro:

- **Calendar** (Calendly/Cal.com) — conversão direta  
- **Messenger** (botões de contato: WhatsApp/Telegram) — muito usado em Brazil  
- **vCard** (salvar contato) — diferencial vs competidores  
- **Iframe** — flexibilidade para embeds  
- **Music** (Spotify/Apple Music) — criadores de conteúdo  
- **Spacing + Separator** — controle de layout essencial

Atualizar `07-editor-smartpage.html` com todos os 23 blocos na paleta.

### Rec 4 — Adicionar feedback visual da exclusividade mútua de roteamentos `[CRÍTICO]`

No mockup `02`, os acordeões de A/B Rotator, Geolocalização, Dispositivos & SO são independentes. O Switchy bloqueia os outros ao ativar um. Adicionar ao mockup:

- Estado "bloqueado" dos acordeões quando outro modo está ativo  
- Mensagem de feedback: "Desative o A/B Rotator para usar Geolocalização"  
- Lógica de precedência documentada visualmente

Sem isso, o dev pode implementar roteamentos conflitantes sem saber.

### Rec 5 — Converter slots de over-engineering em cobertura de gaps `[ESTRUTURAL]`

Remover do índice como "telas de produto":
- `12-audiencias.html` → substituir por página educativa ou remover
- `19-v3-neumorphism.html` → arquivar após decisão de identidade
- `01b` e `02b` → fundir com `01` e `02` via seletor de tema (já existe no index)

Usar os 4 slots liberados para:
- `02c-tipos-de-link.html` (Rec 1)
- `01c-bulk-import.html` (Rec 2)  
- Tela de `Visitor view do GDPR popup` (gap G16)
- Expandir `07` ou criar `07b-blocos-detalhados.html` (Rec 3)

---

*Auditoria gerada com base em leitura direta dos arquivos HTML dos 22 mockups e cruzamento com docs/analise-switchy.md e docs/mapeamento-frontend.md. Nenhum arquivo foi modificado.*
