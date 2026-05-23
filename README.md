# AppLink

Smart links + link-in-bio (smartpages) + analytics + pixels de retargeting.
Vendido avulso **e** como módulo white-label do **AppexCRM** — uma única estrutura de telas com duas identidades, trocadas por design tokens.

> Codinome **AppLink**. Estágio atual: protótipo de telas (mockups HTML) + documentação funcional. Sem código de produto ainda.

## O que tem aqui

```
mockups/                  Protótipo navegável (HTML/CSS estático)
  index.html              Índice de todas as telas
  00-design-system.html   Style guide
  01-17 ...               18 telas do produto
  assets/                 tokens.css · ui.css · theme.js
  BUILD-SPEC.md           Convenções de construção das telas

docs/
  analise-switchy.md         Análise funcional de referência (Switchy.io)
  mapeamento-frontend.md     Mapeamento das telas/funcionalidades
  naming-applink.md          Processo de naming (em aberto)
  acessibilidade-audit.md    Auditoria WCAG 2.1 AA + fixes aplicados
  plano-implementacao.md     Plano técnico: arquitetura, stack, fases, equipe
```

## Identidades

| | AppLink avulso | Módulo AppexCRM |
|---|---|---|
| Estilo | Dark-first premium · lime + coral + cream | Minimalista — herda a marca do CRM |
| Accent | Lime `#BFFF00` + Coral `#FF7777` + Yellow `#FFD400` + Cream `#FFE2C0` | Roxo Stripe `#635BFF` |
| Fundo | Jet Black `#0D0D0D` sólido | Dark `#0C0C0F` ou light `#F6F9FC` |
| Tipografia | Space Grotesk + Inter | Inter |
| Tagline | *"Conecte. Personalize. Acompanhe. Cresça."* | — |

O seletor flutuante (canto inferior direito de cada mockup) alterna identidade e modo claro/escuro ao vivo.

## Como rodar os mockups

São arquivos estáticos — qualquer servidor local resolve. Da raiz do repo:

```bash
cd mockups
python3 -m http.server 8000
# abra http://localhost:8000/
```

## Lista de telas

| # | Tela |
|---|---|
| 00 | Sistema de Design |
| 01 | Painel de Links |
| 02 | Criar / Editar Link |
| 03 | Analytics do Link |
| 04 | Login |
| 05 | Cadastro |
| 06 | Smartpages |
| 07 | Editor de Smartpage |
| 08 | Leads & Analytics da Smartpage |
| 09 | Configurações |
| 10 | QR Code |
| 11 | Pixels de Retargeting |
| 12 | Audiências |
| 13 | Domínios |
| 14 | Integrações |
| 15 | Equipe & Workspaces |
| 16 | Planos & Cobrança |
| 17 | Módulo no AppexCRM |
| 18 | Estados & edge cases (handoff) |

## Próximos passos

1. Naming final (ver `docs/naming-applink.md`).
2. Validação com usuários do conjunto de telas.
3. Especificação técnica do serviço de redirect e do builder de smartpages.
4. Implementação do MVP.

---

Dados em mockups e exemplos são fictícios (persona "Maria Silva").
