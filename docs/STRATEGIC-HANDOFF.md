# Strategic Brand Handoff — APPlink

> Camada estratégica da identidade. Complementa o brandbook visual (`brandbook/index.html`) e o handoff técnico (`docs/identidade-visual-applink.md`). Produzido pelo brand-squad em 2026-05-25.

---

## Entregáveis

### 1) Manifesto · [`docs/manifesto.md`](manifesto.md)
**Em uma linha:** A voz institucional da marca em ~300 palavras — pronto pra uso em landing, pitch deck, e-mail de boas-vindas, descrição de marketplace e bio de redes sociais.

**Tese central:** "Marketing de resultado exige rastreabilidade. Não achismo." Posiciona o APPlink como infraestrutura de atribuição, não como encurtador. Justificativa do "agora" passa pela quebra do tracking pós-iOS, encarecimento de tráfego e dependência de cookies de terceiros — argumentos que profissionais BR de growth reconhecem na pele.

**Frase-síntese:** "O link deixa de ser apenas um atalho. Vira o ponto de controle da sua operação de marketing."

---

### 2) Arquétipo · [`docs/arquetipo.md`](arquetipo.md)
**Em uma linha:** O Mago (Magician) com tensão produtiva com o Governante (Ruler).

**Por que Mago:** transforma dados invisíveis em decisões visíveis, entrega poder técnico sem exigir skill técnico, e a metáfora visual (corrente + seta lime) já é literalmente do arquétipo — poder latente sendo ativado. **Por que a tensão com Ruler:** o usuário quer controle (Governante) alcançado por mecanismos inteligentes (Mago). Equilíbrio: somos o Mago que devolve o controle, não o Mago que esconde o que faz.

**Marcas-irmãs analógicas:** Segment (infraestrutura invisível de dados), Hyros (revela o que o Facebook esconde), Zapier (democratiza capacidade técnica).

**Frases-modelo:**
- "O mesmo link. Destinos diferentes. Atribuição perfeita."
- "Seu pixel dispara antes do redirect. Sempre."
- "Cada clique deixa uma trilha. Agora você consegue ler."

---

### 3) Brand Story · [`docs/brand-story.md`](brand-story.md)
**Em uma linha:** Narrativa StoryBrand em 6 partes com personagem nomeado e dor financeira quantificada.

**Personagem:** Lucas, 31 anos, infoprodutor lançando mensalmente. Gasta R$ 8k/mês em tráfego sem saber qual parte converte. **Persona expandida:** gestora de tráfego com 12 clientes, agência de funis, time de growth testando criativos.

**Estrutura completa:** Personagem → Problema (externo/interno/filosófico) → Guia (empatia + autoridade) → Plano (3 passos: criar, configurar, decidir) → Sucesso (decide com dado, não intuição) → Falha (sem rastreamento, crescimento é ruído).

**Frase-síntese:** "APPlink não vai fazer o marketing por você. Vai fazer o tracking parar de mentir."

---

## Coerência entre as 3 peças

| Eixo | Manifesto | Arquétipo | Brand Story |
|------|-----------|-----------|-------------|
| **Verbo dominante** | rejeitar / prometer | revelar / transformar | mostrar / decidir |
| **Inimigo** | desigualdade operacional, métrica vaidosa | escuridão / opacidade | achismo, otimização no chute |
| **Promessa** | infraestrutura de atribuição BR | poder latente ativado | tracking que não mente |
| **Tom** | combativo + institucional | técnico + assertivo | empático + diagnóstico |

As 3 peças têm a mesma DNA mas falam pra contextos diferentes:
- **Manifesto** = institucional, defesa de posicionamento
- **Arquétipo** = guideline interna (orienta copy futura)
- **Brand Story** = conteúdo de vendas / onboarding

---

## Como integrar no Brandbook Visual

Sugestão de **nova seção** em `brandbook/index.html`, posicionada **entre Voz (08) e Checklist (09)** — uma seção "09 · Camada Estratégica" que sirva de ponte:

```html
<section id="estrategia">
  <div class="eye">09 · Camada Estratégica</div>
  <h2 class="bb-h2">Por trás do <em>visual.</em></h2>
  <p class="lead">Toda decisão visual nasce de uma posição estratégica. Aqui ficam os 3 documentos que sustentam a marca por baixo do sistema visual.</p>

  <div class="strat-grid">  <!-- novo grid 3 cols -->
    <div class="strat-card">
      <span class="strat-badge">Manifesto</span>
      <h3>"Dado é poder. Poder não deveria custar em dólar."</h3>
      <p>Voz institucional da marca. ~300 palavras pra usar em landing, pitch deck, e-mail.</p>
      <a href="../docs/manifesto.md">Ler completo →</a>
    </div>
    <div class="strat-card">
      <span class="strat-badge">Arquétipo</span>
      <h3>Mago + Tensão com Governante</h3>
      <p>Transforma dados invisíveis em decisões visíveis. Marcas-irmãs: Segment, Hyros, Zapier.</p>
      <a href="../docs/arquetipo.md">Ler completo →</a>
    </div>
    <div class="strat-card">
      <span class="strat-badge">Brand Story</span>
      <h3>Lucas, 31 — gasta R$ 8k/mês sem saber o que converte</h3>
      <p>Narrativa StoryBrand 6 partes. Personagem → Plano → Sucesso → Falha.</p>
      <a href="../docs/brand-story.md">Ler completo →</a>
    </div>
  </div>
</section>
```

CSS sugerido (~30 linhas extras):

```css
.strat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:24px}
.strat-card{background:var(--surface);border:1px solid rgba(255,255,255,0.05);
  border-radius:24px;padding:32px;box-shadow:var(--sh-card);
  display:flex;flex-direction:column;gap:14px;
  transition:.3s var(--ease)}
.strat-card:hover{transform:translateY(-3px);border-color:rgba(191,255,0,0.2)}
.strat-badge{align-self:flex-start;background:rgba(191,255,0,0.12);color:var(--lime);
  font-family:'Satoshi',sans-serif;font-weight:800;font-size:11px;
  text-transform:uppercase;letter-spacing:0.14em;padding:6px 12px;border-radius:8px}
.strat-card h3{font-family:'General Sans',sans-serif;font-weight:600;
  font-size:22px;line-height:1.2;letter-spacing:-0.02em;color:#fff}
.strat-card p{font-family:'Satoshi',sans-serif;font-size:14px;
  color:var(--ink2);line-height:1.55}
.strat-card a{color:var(--lime);font-family:'Satoshi',sans-serif;
  font-weight:700;font-size:13px;text-transform:uppercase;
  letter-spacing:0.12em;margin-top:auto;border-bottom:1px dotted rgba(191,255,0,0.4);
  padding-bottom:2px;align-self:flex-start}
.strat-card a:hover{color:#fff}
@media (max-width:1024px){ .strat-grid{grid-template-columns:1fr 1fr} }
@media (max-width:600px){ .strat-grid{grid-template-columns:1fr} }
```

E na navegação superior, adicionar `<a href="#estrategia">Estratégia</a>` entre `#voz` e `#arquivos`.

---

## Próximos Passos Sugeridos

### Curto prazo (1-2 dias)
- [ ] **Integrar a seção "Estratégia" no brandbook visual** (snippet acima — ~30 min de trabalho)
- [ ] **Validar o arquétipo Mago contra a copy atual dos mockups** — checar se as labels e CTAs do produto refletem o tom
- [ ] **Tagline-test:** rodar "Conecte. Personalize. Acompanhe. Cresça." vs outras opções com 5 usuários-alvo

### Médio prazo (1-2 semanas)
- [ ] **Reescrever copy de onboarding** usando voz do manifesto + plano da brand story
- [ ] **Criar 3 variações de pitch curto** (15s, 60s, 3min) derivados da brand story
- [ ] **Auditar landing page** contra as frases-modelo do arquétipo

### Médio-longo prazo (1 mês+)
- [ ] **Brand voice guide v2** — documento separado expandindo voz para 10+ contextos (e-mail transacional, in-app messaging, push, postmortems públicos)
- [ ] **Content pillars** baseados no inimigo declarado no manifesto (desigualdade operacional, tracking quebrado, métrica vaidosa)
- [ ] **Anti-personas** — quem NÃO é cliente APPlink (afiliados black-hat, encurtadores recreativos)

---

## Glossário Estratégico (referência cruzada)

| Termo interno | Significado | Onde aparece |
|---|---|---|
| **Tracking que não mente** | Promessa central do produto | Manifesto · Brand Story |
| **Mago funcional** | Equilíbrio entre arquétipo + utilidade | Arquétipo |
| **Desigualdade operacional** | Inimigo declarado | Manifesto |
| **Decidir com dado, não intuição** | Sucesso da brand story | Brand Story |
| **Atribuição BR sem dólar** | Diferencial competitivo vs Hyros | Manifesto · Arquétipo |
| **Ponto de controle de marketing** | Categoria que ocupamos | Manifesto |

---

*Brand-squad · APPlink Brand Identity · v1.0 · 2026-05-25*
