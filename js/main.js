// Menu, cabecalho sobre o video, video do heroi, reveal, botao flutuante de
// WhatsApp e o bloco de agendar. Progressivo: sem este arquivo a pagina
// continua inteira e legivel.
(function () {
  'use strict';
  var reduzido = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.site-header');

  /* Menu */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('site-nav');
  function abrir(sim) {
    if (!toggle || !nav) { return; }
    nav.setAttribute('data-open', sim ? 'true' : 'false');
    toggle.setAttribute('aria-expanded', sim ? 'true' : 'false');
    toggle.querySelector('.icon--menu').hidden = sim;
    toggle.querySelector('.icon--close').hidden = !sim;
    if (header) { header.classList.toggle('is-aberto', sim); }
  }
  if (toggle && nav) {
    toggle.addEventListener('click', function () { abrir(nav.getAttribute('data-open') !== 'true'); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) { abrir(false); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { abrir(false); } });
  }

  /* Cabecalho transparente enquanto ha video atras dele. O limite e medido
     fora do evento de rolagem, para nao forcar layout a cada quadro. */
  var cena = document.querySelector('.cena');
  if (header && cena) {
    var limite = 0;
    var medir = function () {
      var h = Math.round(header.getBoundingClientRect().height);
      document.documentElement.style.setProperty('--altura-header', h + 'px');
      limite = cena.getBoundingClientRect().bottom + window.scrollY - h;
    };
    var avaliar = function () { header.classList.toggle('is-sobre', window.scrollY < limite - 10); };
    medir(); avaliar();
    window.addEventListener('scroll', avaliar, { passive: true });
    window.addEventListener('resize', function () { medir(); avaliar(); });
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { medir(); avaliar(); }); }
  }

  /* Video do heroi: mudo, em loop, sempre tocando, sem botao. Pausa
     fora da tela. Se a economia de bateria do iPhone recusar o play, troca
     pela mesma cena em webp animado, baixado so nesse caso. */
  var video = document.querySelector('[data-video-el]');
  if (video) {
    var trocado = false;
    var trocar = function () {
      var src = video.getAttribute('data-fallback');
      if (trocado || !src) { return; }
      trocado = true;
      var img = document.createElement('img');
      img.alt = '';
      img.setAttribute('aria-hidden', 'true');
      img.src = src;
      video.pause();
      video.replaceWith(img);
    };
    var tocar = function () {
      if (trocado) { return; }
      var p = video.play();
      if (p) { p.catch(function (e) { if (e && e.name === 'NotAllowedError') { trocar(); } }); }
    };
    tocar();
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          if (!en.isIntersecting) { if (!video.paused) { video.pause(); } } else if (video.paused) { tocar(); }
        });
      }, { threshold: 0.15 }).observe(video);
    }
  }

  /* Reveal ao rolar, com entrada escalonada nas listas. Depois que a entrada
     acaba, o atributo sai, para o hover das linhas voltar a mandar. */
  if (!reduzido && 'IntersectionObserver' in window) {
    var alvos = [].slice.call(document.querySelectorAll('main .section > .container, .topo .container, [data-reveal-filhos]'));
    document.documentElement.classList.add('js-reveal');
    alvos.forEach(function (t) { if (!t.hasAttribute('data-reveal-filhos')) { t.setAttribute('data-reveal', ''); } });
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        var el = en.target;
        el.classList.add('is-visible');
        obs.unobserve(el);
        if (el.hasAttribute('data-reveal-filhos')) {
          setTimeout(function () { el.removeAttribute('data-reveal-filhos'); }, 1400);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    alvos.forEach(function (t) { obs.observe(t); });
  }

  /* Barra de WhatsApp no celular: aparece depois da primeira dobra. */
  var barra = document.querySelector('.barra-wa');
  if (barra) {
    var mostrar = function () { barra.classList.toggle('is-on', window.scrollY > window.innerHeight * 0.6); };
    mostrar();
    window.addEventListener('scroll', mostrar, { passive: true });
  }

  /* Agendar: servico, dia e periodo viram a mensagem pronta do WhatsApp.
     A previa mostra o texto antes de abrir. Sem script, o formulario manda a
     mensagem padrao do campo oculto. */
  var agenda = document.querySelector('form[data-agendar]');
  if (agenda) {
    var texto = agenda.querySelector('[data-texto]');
    var previa = agenda.querySelector('[data-previa]');
    var valor = function (nome) { var el = agenda.querySelector('input[name="' + nome + '"]:checked'); return el ? el.value : ''; };
    var montar = function () {
      var dia = valor('dia'), periodo = valor('periodo');
      var quando = [dia, periodo].filter(Boolean).join(', ');
      var msg = 'Oi Eduardo! Quero marcar ' + valor('servico') + '. Tem horário ' + (quando || 'essa semana') + '?';
      texto.value = msg;
      if (previa) { previa.textContent = msg; }
      return msg;
    };
    montar();
    agenda.addEventListener('change', montar);
    agenda.addEventListener('submit', function (e) {
      e.preventDefault();
      window.open(agenda.getAttribute('action') + '?text=' + encodeURIComponent(montar()), '_blank', 'noopener');
    });
  }

  var ano = document.querySelector('[data-year]');
  if (ano) { ano.textContent = String(new Date().getFullYear()); }
})();
