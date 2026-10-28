/* Square Luxury Apartments – shared motion runtime (preloader, page curtain, cursor, Lenis, scroll animations) */
(function () {
  if (window.SQ) return;
  var d = document, html = d.documentElement;
  var R = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = matchMedia('(hover: none)').matches;
  var SERIF = '"Instrument Serif", Georgia, serif';
  html.dataset.lang = localStorage.getItem('sq-lang-mk') || 'sr';

  var SQ = window.SQ = {};
  var introDone = false, introQ = [];
  SQ.onIntro = function (fn) { introDone ? fn() : introQ.push(fn); };
  function fireIntro() { if (introDone) return; introDone = true; introQ.splice(0).forEach(function (f) { f(); }); }
  SQ.ready = function (fn) { (function t() { window.gsap && window.ScrollTrigger ? fn() : setTimeout(t, 30); })(); };
  SQ.setLang = function (l) {
    html.dataset.lang = l; localStorage.setItem('sq-lang-mk', l);
    dispatchEvent(new CustomEvent('sq-lang', { detail: l }));
    if (window.ScrollTrigger) setTimeout(function () { ScrollTrigger.refresh(); }, 50);
  };

  var first = !sessionStorage.getItem('sq-seen');
  var next = sessionStorage.getItem('sq-next');
  sessionStorage.setItem('sq-seen', '1');
  sessionStorage.removeItem('sq-next');

  function el(tag, css, parent) { var e = d.createElement(tag); e.style.cssText = css; (parent || d.body).appendChild(e); return e; }

  var curtain, curtainLabel;
  function boot() {
    // film grain
    el('div', 'position:fixed;inset:-50%;width:200%;height:200%;pointer-events:none;z-index:9998;opacity:.05;background-image:url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%27160%27 height=%27160%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%27.85%27 numOctaves=%273%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")');

    // page curtain
    curtain = el('div', 'position:fixed;inset:0;z-index:9999;background:#0C1820;display:flex;align-items:center;justify-content:center;pointer-events:none;transform:translateY(' + (next ? '0' : '100%') + ');will-change:transform');
    curtainLabel = el('div', 'font-family:' + SERIF + ';font-style:italic;color:#F4F1EA;font-size:clamp(48px,8vw,120px);letter-spacing:-.02em', curtain);
    curtainLabel.textContent = next || '';

    if (next) {
      setTimeout(function () {
        curtain.style.transition = 'transform 1.1s cubic-bezier(.76,0,.24,1)';
        curtain.style.transform = 'translateY(-100%)';
        setTimeout(fireIntro, 350);
      }, R ? 0 : 280);
    } else if (first && !R) {
      var pre = el('div', 'position:fixed;inset:0;z-index:10000;background:#0C1820;color:#F4F1EA;display:flex;flex-direction:column;justify-content:space-between;padding:clamp(20px,4vw,48px);transition:transform 1.2s cubic-bezier(.76,0,.24,1)');
      var top = el('div', 'display:flex;justify-content:space-between;font:500 12px/1 "Inter Tight",sans-serif;letter-spacing:.2em;text-transform:uppercase;opacity:.7', pre);
      top.innerHTML = '<span>Square Luxury Apartments</span><span>Berovo</span>';
      var num = el('div', 'font-family:' + SERIF + ';font-size:clamp(120px,26vw,360px);line-height:.8;letter-spacing:-.04em', pre);
      num.textContent = '0';
      var t0 = performance.now(), dur = 1800;
      (function tick(now) {
        var p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        num.textContent = Math.round(e * 100);
        if (p < 1) return requestAnimationFrame(tick);
        setTimeout(function () {
          pre.style.transform = 'translateY(-100%)';
          setTimeout(fireIntro, 300);
          setTimeout(function () { pre.remove(); }, 1300);
        }, 200);
      })(t0);
    } else {
      setTimeout(fireIntro, 60);
    }

    // cursor
    if (!touch && !R) {
      var cur = el('div', 'position:fixed;left:0;top:0;width:12px;height:12px;margin:-6px 0 0 -6px;border-radius:50%;background:#0C1820;z-index:9997;pointer-events:none;display:flex;align-items:center;justify-content:center;transition:width .5s cubic-bezier(.16,1,.3,1),height .5s cubic-bezier(.16,1,.3,1),margin .5s cubic-bezier(.16,1,.3,1),background .3s;opacity:0');
      var curT = el('span', 'font:500 12px/1 "Inter Tight",sans-serif;letter-spacing:.08em;color:#F4F1EA;opacity:0;transition:opacity .3s', cur);
      curT.textContent = 'View';
      var setSize = function (s, label) {
        cur.style.width = cur.style.height = s + 'px'; cur.style.margin = (-s / 2) + 'px 0 0 ' + (-s / 2) + 'px';
        curT.style.opacity = label ? 1 : 0;
        cur.style.background = label ? 'rgba(12,24,32,.82)' : '#0C1820';
      };
      SQ.ready(function () {
        var qx = gsap.quickTo(cur, 'x', { duration: .5, ease: 'power3.out' }), qy = gsap.quickTo(cur, 'y', { duration: .5, ease: 'power3.out' });
        addEventListener('mousemove', function (e) { cur.style.opacity = 1; qx(e.clientX); qy(e.clientY); });
      });
      d.addEventListener('mouseover', function (e) {
        var t = e.target;
        if (t.closest('[data-cursor="view"]')) setSize(84, true);
        else if (t.closest('a,button,input,select,textarea,label')) setSize(6);
        else setSize(12);
      });
    }
  }
  d.body ? boot() : d.addEventListener('DOMContentLoaded', boot);

  // page transitions
  var NAMES = { home: 'Home', apartments: 'The Apartments', location: 'Location', gallery: 'Gallery', book: 'Book your stay' };
  SQ.go = function (url, label) {
    if (!curtain || R) { location.href = url; return; }
    curtainLabel.textContent = label || '';
    curtain.style.transition = 'none'; curtain.style.transform = 'translateY(100%)';
    void curtain.offsetHeight;
    curtain.style.transition = 'transform .9s cubic-bezier(.76,0,.24,1)'; curtain.style.transform = 'translateY(0)';
    sessionStorage.setItem('sq-next', label || '');
    setTimeout(function () { location.href = url; }, 900);
  };
  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.metaKey || e.ctrlKey || a.target === '_blank') return;
    var href = a.getAttribute('href');
    if (!href || href[0] === '#' || /^(mailto|tel|viber|https?):/i.test(href)) return;
    var m = href.match(/([a-z]+)\.html/i); if (!m) return;
    e.preventDefault();
    SQ.go(href, a.dataset.to || NAMES[m[1].toLowerCase() === 'index' ? 'home' : m[1].toLowerCase()] || '');
  });
  addEventListener('pageshow', function (e) { if (e.persisted && curtain) { curtain.style.transition = 'none'; curtain.style.transform = 'translateY(100%)'; } });

  // split helpers
  function split(node, chars) {
    if (node._w) return node._w;
    var out = [];
    (function walk(n) {
      Array.prototype.slice.call(n.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var frag = d.createDocumentFragment();
          c.textContent.split(/(\s+)/).forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(d.createTextNode(p)); return; }
            var w = d.createElement('span'); w.style.display = 'inline-block';
            if (chars) p.split('').forEach(function (ch) { var s = d.createElement('span'); s.style.display = 'inline-block'; s.textContent = ch; w.appendChild(s); out.push(s); });
            else { w.textContent = p; out.push(w); }
            frag.appendChild(w);
          });
          c.parentNode.replaceChild(frag, c);
        } else if (c.nodeType === 1) walk(c);
      });
    })(node);
    node._w = out; return out;
  }
  SQ.split = split;

  // lenis + nav
  var lenis, lastY = 0;
  SQ.ready(function () {
    gsap.registerPlugin(ScrollTrigger);
    if (window.Flip) gsap.registerPlugin(Flip);
    if (window.Lenis && !R) {
      lenis = SQ.lenis = new Lenis({ lerp: .09, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
    addEventListener('scroll', function () {
      var y = scrollY, nav = d.querySelector('[data-nav]');
      if (nav && !nav.dataset.lock) gsap.to(nav, { yPercent: y > lastY && y > 120 ? -160 : 0, duration: .8, ease: 'power3.out', overwrite: true });
      lastY = y;
    }, { passive: true });
    addEventListener('load', function () { ScrollTrigger.refresh(); });
  });
  SQ.lock = function (on) { if (lenis) on ? lenis.stop() : lenis.start(); d.body.style.overflow = on ? 'hidden' : ''; };

  // scroll animations
  var scanT;
  SQ.scan = function () { clearTimeout(scanT); scanT = setTimeout(function () { SQ.ready(run); }, 60); };
  function each(sel, fn) { d.querySelectorAll(sel).forEach(function (n) { if (n._sq && n._sq[sel]) return; (n._sq = n._sq || {})[sel] = 1; fn(n); }); }
  var E = 'expo.out', P = 'power3.out';

  function run() {
    if (R) {
      each('[data-zoom]', function (n) { n.style.transform = 'none'; });
      ScrollTrigger.refresh(); return;
    }
    each('[data-zoom]', function (n) { SQ.onIntro(function () { gsap.fromTo(n, { scale: 1.15 }, { scale: 1, duration: 2.4, ease: E }); }); });
    each('[data-split]', function (n) {
      var w = split(n);
      gsap.set(w, { opacity: 0, filter: 'blur(14px)', y: '0.25em' });
      var play = function () { gsap.to(w, { opacity: 1, filter: 'blur(0px)', y: 0, duration: 1.3, ease: E, stagger: .07, delay: n.dataset.split === 'hero' ? .15 : 0 }); };
      if (n.dataset.split === 'hero') SQ.onIntro(play);
      else ScrollTrigger.create({ trigger: n, start: 'top 88%', once: true, onEnter: play });
    });
    each('[data-reveal]', function (n) {
      var hero = n.dataset.reveal === 'hero';
      gsap.set(n, { opacity: 0, y: 36 });
      var play = function () { gsap.to(n, { opacity: 1, y: 0, duration: 1.2, ease: E, delay: parseFloat(n.dataset.delay || 0) }); };
      hero ? SQ.onIntro(play) : ScrollTrigger.create({ trigger: n, start: 'top 90%', once: true, onEnter: play });
    });
    each('[data-fill]', function (n) {
      var w = split(n);
      gsap.fromTo(w, { opacity: .16 }, { opacity: 1, ease: 'none', stagger: .1, scrollTrigger: { trigger: n, start: 'top 80%', end: 'bottom 45%', scrub: true } });
    });
    each('[data-count]', function (n) {
      var to = parseFloat(n.dataset.count), dec = parseInt(n.dataset.dec || 0), o = { v: 0 };
      n.textContent = (0).toFixed(dec);
      ScrollTrigger.create({ trigger: n, start: 'top 90%', once: true, onEnter: function () {
        gsap.to(o, { v: to, duration: 1.4, ease: P, onUpdate: function () { n.textContent = o.v.toFixed(dec); } });
      } });
    });
    each('[data-parallax]', function (n) {
      gsap.fromTo(n, { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: n.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    each('[data-clipin]', function (n) {
      gsap.set(n, { clipPath: 'inset(100% 0% 0% 0% round 20px)' });
      ScrollTrigger.create({ trigger: n, start: 'top 92%', once: true, onEnter: function () { gsap.to(n, { clipPath: 'inset(0% 0% 0% 0% round 20px)', duration: 1.3, ease: E }); } });
    });
    each('[data-draw]', function (n) {
      gsap.set(n, { scaleX: 0, transformOrigin: 'left center' });
      ScrollTrigger.create({ trigger: n, start: 'top 92%', once: true, onEnter: function () { gsap.to(n, { scaleX: 1, duration: 1.4, ease: E }); } });
    });
    each('[data-hscroll]', function (sec) {
      var track = sec.querySelector('[data-track]');
      track.style.overflowX = 'visible';
      var dist = function () { return track.scrollWidth - sec.clientWidth; };
      gsap.to(track, { x: function () { return -dist(); }, ease: 'none', scrollTrigger: { trigger: sec, pin: true, scrub: 1, start: 'top top', end: function () { return '+=' + dist(); }, invalidateOnRefresh: true } });
    });
    each('[data-clip]', function (sec) {
      var img = sec.querySelector('[data-clip-img]'), txt = sec.querySelector('[data-clip-text]');
      var tl = gsap.timeline({ scrollTrigger: { trigger: sec, pin: true, scrub: 1, start: 'top top', end: '+=120%' } });
      tl.fromTo(img, { clipPath: 'inset(22% 26% 22% 26% round 24px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px)', ease: 'none' })
        .fromTo(img.querySelector('img'), { scale: 1.25 }, { scale: 1, ease: 'none' }, 0)
        .fromTo(txt, { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: 'none', duration: .4 }, .55);
    });
    each('[data-marquee]', function (n) {
      var rev = n.dataset.marquee === 'rev';
      gsap.fromTo(n, { xPercent: rev ? -50 : 0 }, { xPercent: rev ? 0 : -50, duration: 60, ease: 'none', repeat: -1 });
    });
    each('[data-letters]', function (n) {
      var c = split(n, true);
      gsap.fromTo(c, { yPercent: 110 }, { yPercent: 0, ease: P, stagger: .08, scrollTrigger: { trigger: n, start: 'top 95%', end: 'bottom 85%', scrub: 1 } });
    });
    each('[data-pulse]', function (n) { gsap.fromTo(n, { scaleY: .4, opacity: .3, transformOrigin: 'top' }, { scaleY: 1, opacity: 1, duration: 1.2, ease: 'power3.out', repeat: -1, yoyo: true }); });
    each('[data-mag]', function (n) {
      if (touch) return;
      var arrow = n.querySelector('[data-arrow]');
      n.addEventListener('mousemove', function (e) {
        var r = n.getBoundingClientRect();
        gsap.to(n, { x: (e.clientX - r.left - r.width / 2) * .25, y: (e.clientY - r.top - r.height / 2) * .35, duration: .8, ease: P });
      });
      n.addEventListener('mouseenter', function () { arrow && gsap.to(arrow, { x: 4, duration: .6, ease: E }); });
      n.addEventListener('mouseleave', function () { gsap.to(n, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1,.4)' }); arrow && gsap.to(arrow, { x: 0, duration: .6, ease: E }); });
    });
    ScrollTrigger.refresh();
  }
})();
