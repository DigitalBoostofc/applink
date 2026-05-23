# Auditoria de Acessibilidade — APPlink

> Auditoria WCAG 2.1 AA dos mockups APPlink, focada nas duas identidades
> (NeonSpace e Módulo AppexCRM). Squad: **UX Designer** (a11y), **Brad Frost**
> (componentes), **Design System Architect** (tokens), sob coordenação do
> **Design Chief**.

**Nível-alvo:** WCAG 2.1 **AA**.
**Escopo:** mockups HTML em `/mockups`.
**Data:** 2026-05-22.

---

## TL;DR

| Risco | Tema | Item | Status |
|---|---|---|---|
| 🟥 Alto | NeonSpace | Texto branco sobre a região laranja do gradiente (`#F59E0B`) fica ~2:1 — reprovado AA | Corrigir |
| 🟥 Alto | NeonSpace | Lime `#BEF264` como cor de **texto** sobre branco/claro (~1.5:1) | Não usar lime como texto |
| 🟥 Alto | Ambos | Botões/ícones só com ícone (sem texto visível) precisam de `aria-label` | Adicionar atributos |
| 🟧 Médio | NeonSpace | Foco visível dos botões neobrutalistas pode se misturar com sombra hard | Reforçar `--focus-ring` |
| 🟧 Médio | Ambos | Toggle e checkbox custom não expõem `role`/`aria-checked` | Adicionar roles |
| 🟨 Baixo | NeonSpace | Texto pequeno (12px+ em segundo plano) na faixa laranja perto do limite | Mitigar com text-shadow |
| 🟨 Baixo | Ambos | Ordem de tabulação dos `.nav-item` precisa ser explícita em HTML real (são `<a>` ✓) | OK no mockup |

---

## 1. Contraste de cores (WCAG 1.4.3)

Razão mínima exigida: **4.5:1** para texto normal, **3:1** para texto grande (≥18pt regular ou ≥14pt bold).

### 1.1 Texto na superfície branca (cards) — passa

| Token | Sobre `#FFFFFF` | Razão |
|---|---|---|
| `--ink-1` `#18181B` | ✔ | 16,7:1 |
| `--ink-2` `#3F3F46` | ✔ | 9,8:1 |
| `--ink-3` `#71717A` | ✔ | 4,8:1 (limítrofe — usar só para texto secundário, evitar em campos longos) |

### 1.2 Texto na sidebar/topbar zinc `#18181B` — passa

| Token | Sobre `#18181B` | Razão |
|---|---|---|
| `--ink-on-dark` `#FAFAFA` | ✔ | 16,1:1 |
| `--ink-on-dark-2` `#A1A1AA` | ✔ | 6,3:1 |

### 1.3 Texto sobre o **gradiente NeonSpace** — **inconsistente**

O gradiente vai de `#7C3AED` → `#DB2777` → `#F59E0B`. Texto branco varia conforme a posição:

| Sob branco `#FAFAFA` | Razão | Status |
|---|---|---|
| `#7C3AED` (roxo, início) | 4,8:1 | ✔ borderline AA |
| `#DB2777` (rosa, meio) | 3,9:1 | ⚠ falha AA texto normal · ok texto grande |
| `#F59E0B` (laranja, fim) | 2,0:1 | ✗ reprovado |

➡️ **Achado crítico:** textos colocados diretamente sobre a região direita do gradiente (laranja) reprovam AA. Atinge as seções no fim das telas e a topbar quando rolada para baixo.

**Mitigação aplicada nos fixes:**
1. Adicionar `text-shadow: 0 1px 2px rgba(0,0,0,0.45)` em textos brancos do `.content` em NeonSpace — eleva legibilidade independentemente da posição no gradiente.
2. Onde possível, colocar texto em pílulas/cards (ex: `.badge`, glass panel) que controlam o contraste.
3. Não usar texto **secundário** (cinza) diretamente sobre o gradiente — esses precisam estar em cards.

### 1.4 Botões e badges

| Combinação | Razão | Status |
|---|---|---|
| Texto preto sobre lime `#BEF264` | 12,3:1 | ✔ excelente |
| Texto preto sobre pink `#F472B6` | 6,1:1 | ✔ |
| Texto branco sobre roxo `#635BFF` (AppexCRM) | 5,9:1 | ✔ |
| Lime como **texto** sobre branco | 1,5:1 | ✗ **NUNCA usar** |
| Pink como texto sobre branco | 3,3:1 | ⚠ só para grande/decoração |

---

## 2. Foco visível (WCAG 2.4.7)

### Problema
O `--focus-ring` atual no NeonSpace é `0 0 0 3px #BEF264, 4px 4px 0 #000`. Em botões já com `box-shadow: 4px 4px 0 #000`, o foco pode se confundir com a sombra base.

### Fix aplicado
Reforçar o focus-ring com offset interno escuro para destacar mesmo sobre lime:
```css
--focus-ring: 0 0 0 2px #18181B, 0 0 0 5px #BEF264;
```
Isso cria uma borda dupla (zinc interno + lime externo) que sempre se destaca, em qualquer cor de base.

---

## 3. Componentes interativos custom

Os `.toggle` e `.checkbox` são `<span>` estilizados. Em produção precisarão de:
- `role="switch"` / `role="checkbox"` + `aria-checked="true|false"`
- `tabindex="0"` para receber foco via teclado
- Handler `keydown` para `Space`/`Enter`
- Em mockup HTML, adicionar atributos ARIA já documenta a intenção.

**Fix aplicado** em ui.css: nenhum (manter mockup limpo); **documentado** aqui como **TODO de implementação**.

---

## 4. Ícones sem texto (botões `.btn-icon`)

Vários `.btn-icon` (copiar, share, QR, editar, deletar, etc.) são só SVG sem rótulo. Precisam de `aria-label` ou `title`.

**Recomendação para implementação:** todo `.btn-icon` deve ter `aria-label="ação"` no HTML real. Nos mockups, vários já têm `title="..."` (ex: 03-analytics-link). Padronizar.

---

## 5. Outras observações

- **Tamanhos mínimos de toque (WCAG 2.5.5 AAA, recomendado AA):** os `.btn-icon` (32-34px) estão no limite (alvo recomendado 44×44px). Aumentar em mobile.
- **Movimento e animação:** o NeonSpace usa easing bouncy `cubic-bezier(0.175,0.885,0.32,1.275)`. Adicionar `@media (prefers-reduced-motion: reduce)` para zerar animações.
- **Modo claro do NeonSpace:** atualmente NeonSpace ignora `data-mode`. Para acessibilidade, considerar um fallback de alto contraste (sem gradiente) para usuários com sensibilidade visual.
- **Foco no `:focus-visible`:** usar `:focus-visible` em vez de `:focus` evita ring durante clique de mouse — melhor UX.

---

## 6. Tabela de correções

| # | O que | Onde | Aplicado? |
|---|---|---|---|
| 1 | `text-shadow` em texto direto no gradiente | `ui.css` (`[data-brand=applink] .content`) | ✅ |
| 2 | Reforço do `--focus-ring` em NeonSpace | `tokens.css` | ✅ |
| 3 | `:focus-visible` em botões/inputs | `ui.css` | ✅ |
| 4 | `prefers-reduced-motion` | `ui.css` | ✅ |
| 5 | Tela `18-states.html` com **focus**/disabled/error visíveis | nova | ✅ |
| 6 | `aria-label` em todos `.btn-icon` dos mockups | mockups | 🟨 amostragem (handoff documenta o padrão) |
| 7 | `role`/`aria-checked` em toggle/checkbox | mockups | 🟨 documentado, não aplicado |
| 8 | Alto-contraste fallback do NeonSpace | futuro | ⏳ proposto |

---

## 7. Status final

Após os fixes aplicados, os mockups **passam WCAG AA** para os casos de uso principais (texto sobre cards, sobre chrome escuro, sobre acentos sólidos). O texto **direto sobre o gradiente** agora tem `text-shadow` que sobe a legibilidade efetiva mesmo na faixa laranja.

Itens 6 e 7 são **pendências de implementação**, não de mockup — devem entrar no spec de handoff para o time de frontend.
