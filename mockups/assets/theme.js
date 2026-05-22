/* Seletor de tema flutuante — compartilhado por todas as telas.
   Brand: applink (avulso) | appex (módulo white-label)
   Mode:  dark | light
   Persiste em localStorage para navegar entre telas mantendo o tema. */
(function () {
  var root = document.documentElement;
  var brand = localStorage.getItem('ap-brand') || 'applink';
  var mode  = localStorage.getItem('ap-mode')  || 'dark';
  root.setAttribute('data-brand', brand);
  root.setAttribute('data-mode', mode);

  function apply() {
    root.setAttribute('data-brand', brand);
    root.setAttribute('data-mode', mode);
    localStorage.setItem('ap-brand', brand);
    localStorage.setItem('ap-mode', mode);
    document.querySelectorAll('[data-brand-name]').forEach(function (el) {
      el.textContent = brand === 'applink' ? 'APPlink' : 'AppexCRM';
    });
    var b1 = document.getElementById('sw-applink'), b2 = document.getElementById('sw-appex');
    if (b1) { b1.className = brand === 'applink' ? 'on' : ''; b2.className = brand === 'appex' ? 'on' : ''; }
    var m1 = document.getElementById('sw-dark'), m2 = document.getElementById('sw-light');
    if (m1) { m1.className = mode === 'dark' ? 'on' : ''; m2.className = mode === 'light' ? 'on' : ''; }
  }

  function build() {
    var css = '\
.theme-sw{position:fixed;right:16px;bottom:16px;z-index:90;background:var(--surface);\
border:1px solid var(--edge-strong);border-radius:12px;box-shadow:var(--shadow-xl);\
padding:8px;display:flex;flex-direction:column;gap:6px;font-family:var(--font-sans)}\
.theme-sw .grp{display:flex;gap:3px;background:var(--surface-hover);border-radius:7px;padding:3px}\
.theme-sw .grp>*{padding:5px 9px;font-size:11px;font-weight:500;border-radius:5px;\
cursor:pointer;color:var(--ink-2);white-space:nowrap}\
.theme-sw .grp>*.on{background:var(--accent);color:var(--on-accent)}\
.theme-sw .cap{font-size:9px;letter-spacing:.08em;text-transform:uppercase;\
color:var(--ink-3);padding:0 4px}';
    var s = document.createElement('style'); s.textContent = css; document.head.appendChild(s);

    var box = document.createElement('div');
    box.className = 'theme-sw';
    box.innerHTML = '\
<div class="cap">Identidade</div>\
<div class="grp"><div id="sw-applink">APPlink avulso</div><div id="sw-appex">Módulo CRM</div></div>\
<div class="cap">Modo</div>\
<div class="grp"><div id="sw-dark">Escuro</div><div id="sw-light">Claro</div></div>';
    document.body.appendChild(box);

    document.getElementById('sw-applink').onclick = function () { brand = 'applink'; apply(); };
    document.getElementById('sw-appex').onclick   = function () { brand = 'appex';   apply(); };
    document.getElementById('sw-dark').onclick    = function () { mode  = 'dark';    apply(); };
    document.getElementById('sw-light').onclick   = function () { mode  = 'light';   apply(); };
    apply();
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', build);
  else build();
})();
