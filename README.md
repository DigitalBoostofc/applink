# AppLink

Smart links + link-in-bio (smartpages) + analytics + pixels de retargeting.
Vendido avulso **e** como módulo white-label do **AppexCRM**.

> Estágio atual: protótipo de telas (mockups HTML/CSS) + documentação funcional. Sem código de produto ainda.

## Identidade visual — V3 Configuration Engine

Identidade única, sem switching:

- **Canvas:** Jet Black `#0A0A0A` core + camadas `#141414` / `#1A1A1A`
- **Accent:** Lime neon `#BFFF00` + Coral `#FF7777` (gradient + glow)
- **Tipografia:** General Sans + Satoshi · uppercase tracking 0.15–0.22em em labels
- **Sombras:** Dual neumórfico (outward escuro + inward branco sutil) + inset em inputs
- **Motion:** Spring physics `cubic-bezier(0.34, 1.56, 0.64, 1)`
- **Vocabulário:** accordion neumórfico · floating labels · sticky save footer · progress ring lime→coral · pulse dot · chips spring

## Como rodar os mockups

São arquivos estáticos. Da raiz do repo:

```bash
cd mockups
python3 -m http.server 8000
# abra http://localhost:8000/
```

Ao abrir o index, o navegador é redirecionado para o **Dashboard** (`01-dashboard.html`). A partir dele, toda a navegação ocorre pela sidebar.

## Estrutura

```
mockups/
  index.html                  Redirect → Dashboard
  01-dashboard.html           Painel de links (entrada principal)
  02-criar-link.html          Criar / editar link
  02c-tipos-de-link.html      Spec dos 12 tipos de link
  03-analytics-link.html      Analytics do link
  04-login.html               Login (sem sidebar)
  05-signup.html              Cadastro (sem sidebar)
  06-smartpages.html          Dashboard das smartpages
  07-editor-smartpage.html    Editor drag-drop com 23 blocos em 6 seções
  08-leads-smartpage.html     Leads capturados via formulários
  09-settings.html            Configurações (perfil, segurança, LGPD)
  10-qrcode.html              Builder de QR code
  11-pixels.html              Pixels de retargeting
  12-audiencias.html          Audiências derivadas dos cliques
  13-dominios.html            Domínios customizados
  14-integracoes.html         Zapier, Make, Webhook, AppexCRM, etc
  15-equipe.html              Equipe & workspaces
  16-billing.html             Planos & cobrança
  18-states.html              Catálogo de estados (loading, vazio, erro)
  assets/
    tokens.css                Tokens V3 (cores, tipografia, sombras, easing)
    ui.css                    Componentes base

docs/
  analise-switchy.md          Análise funcional do Switchy.io (referência)
  mapeamento-frontend.md      Mapeamento telas → features
  audit-conformidade.md       Auditoria docs vs telas (cobertura ~89%)
  acessibilidade-audit.md     Auditoria WCAG 2.1 AA
  naming-applink.md           Processo de naming (em aberto)
  plano-implementacao.md      Plano técnico: arquitetura, stack, fases
```

## Lista de telas

| # | Tela | Sidebar |
|---|---|---|
| 01 | Painel de Links | ✅ |
| 02 | Criar / Editar Link | ✅ |
| 02c | Tipos de Link (spec) | ✅ |
| 03 | Analytics do Link | ✅ |
| 04 | Login | — (auth full-screen) |
| 05 | Cadastro | — (auth full-screen) |
| 06 | Smartpages | ✅ |
| 07 | Editor de Smartpage | ✅ |
| 08 | Leads & Analytics da Smartpage | ✅ |
| 09 | Configurações (Perfil/LGPD) | ✅ |
| 10 | QR Code | ✅ |
| 11 | Pixels de Retargeting | ✅ |
| 12 | Audiências | ✅ |
| 13 | Domínios | ✅ |
| 14 | Integrações | ✅ |
| 15 | Equipe & Workspaces | ✅ |
| 16 | Planos & Cobrança | ✅ |
| 18 | Estados & edge cases (handoff) | acesso direto |

## Próximos passos

1. **Mobile responsive** — adaptar a estrutura 256px+main para breakpoints mobile/tablet.
2. **Naming final** (ver `docs/naming-applink.md`).
3. **Validação com usuários** do conjunto de telas.
4. **Especificação técnica** do serviço de redirect e do builder de smartpages.
5. **Implementação do MVP.**

---

Dados em mockups e exemplos são fictícios (persona "Maria Silva").
