/* ==========================================================================
   AI 发展史 · 站点脚本
   纯原生 JS，无依赖。功能：
   1) 阅读进度条  2) 导航滚动态 + 移动端抽屉 + 当前页高亮
   3) 滚动入场动效  4) 时间轴分类筛选 + 关键词搜索
   5) 数字滚动统计  6) 算力条形图动画  7) 返回顶部
   ========================================================================== */
(function () {
  'use strict';

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 1. 阅读进度条 ---------- */
  var bar = $('.progress');
  var toTop = $('.totop');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? (h.scrollTop / max) * 100 : 0;
    if (bar) bar.style.width = p.toFixed(2) + '%';
    var nav = $('.nav');
    if (nav) nav.classList.toggle('scrolled', h.scrollTop > 12);
    if (toTop) toTop.classList.toggle('show', h.scrollTop > 620);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- 2. 导航 ---------- */
  var burger = $('.burger');
  var links = $('.nav-links');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // 当前页面高亮（按文件名匹配）
  (function highlightNav() {
    var file = location.pathname.split('/').pop() || 'index.html';
    $$('.nav-links a').forEach(function (a) {
      var href = a.getAttribute('href') || '';
      if (href === file || (file === '' && href === 'index.html')) {
        a.classList.add('active');
        a.setAttribute('aria-current', 'page');
      }
    });
  })();

  // 同页锚点滚动高亮（scrollspy）
  (function scrollSpy() {
    var anchors = $$('.nav-links a[href^="#"]');
    if (!anchors.length) return;
    var targets = anchors.map(function (a) {
      return { a: a, el: document.getElementById(a.getAttribute('href').slice(1)) };
    }).filter(function (t) { return t.el; });
    if (!targets.length) return;

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var hit = targets.filter(function (t) { return t.el === en.target; })[0];
        if (!hit) return;
        anchors.forEach(function (a) { a.classList.remove('active'); });
        hit.a.classList.add('active');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(function (t) { io.observe(t.el); });
  })();

  /* ---------- 3. 滚动入场 ---------- */
  (function reveal() {
    var els = $$('.reveal');
    if (!els.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- 4. 时间轴筛选 + 搜索 ---------- */
  (function timeline() {
    var list = $('#timeline');
    if (!list) return;
    var items = $$('.tl-item', list);
    var chips = $$('.chip[data-cat]');
    var input = $('#tl-search');
    var empty = $('#tl-empty');
    var count = $('#tl-count');
    var cat = 'all';

    function apply() {
      var q = (input && input.value || '').trim().toLowerCase();
      var shown = 0;
      items.forEach(function (item) {
        var okCat = cat === 'all' || item.getAttribute('data-cat') === cat;
        var okQ = !q || (item.textContent || '').toLowerCase().indexOf(q) > -1;
        var ok = okCat && okQ;
        item.hidden = !ok;
        if (ok) {
          shown++;
          if (!reduceMotion) {
            item.classList.remove('in');
            // 触发重排以重播动画
            void item.offsetWidth;
            item.classList.add('in');
          }
        }
      });
      if (empty) empty.classList.toggle('show', shown === 0);
      if (count) count.textContent = String(shown);
      // 交替左右布局：按可见顺序重新分配左/右
      var visible = items.filter(function (i) { return !i.hidden; });
      visible.forEach(function (item, i) {
        item.classList.toggle('r', i % 2 === 1);
      });
    }

    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.classList.remove('on'); c.setAttribute('aria-pressed', 'false'); });
        chip.classList.add('on');
        chip.setAttribute('aria-pressed', 'true');
        cat = chip.getAttribute('data-cat');
        apply();
      });
    });

    if (input) {
      var t;
      input.addEventListener('input', function () {
        clearTimeout(t);
        t = setTimeout(apply, 130);
      });
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { input.value = ''; apply(); }
      });
    }

    // 支持 ?cat=china 之类的直达筛选
    var m = /[?&]cat=([a-z]+)/i.exec(location.search);
    if (m) {
      var target = chips.filter(function (c) { return c.getAttribute('data-cat') === m[1]; })[0];
      if (target) target.click();
    } else {
      apply();
    }
  })();

  /* ---------- 5. 数字滚动 ---------- */
  (function counters() {
    var els = $$('[data-count]');
    if (!els.length) return;
    function run(el) {
      var to = parseFloat(el.getAttribute('data-count'));
      var dec = parseInt(el.getAttribute('data-dec') || '0', 10);
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduceMotion) { el.textContent = to.toFixed(dec) + suffix; return; }
      var dur = 1100, t0 = performance.now();
      function tick(now) {
        var k = Math.min(1, (now - t0) / dur);
        var e = 1 - Math.pow(1 - k, 3);
        el.textContent = (to * e).toFixed(dec) + suffix;
        if (k < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }
    if (!('IntersectionObserver' in window)) { els.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- 6. 条形图动画 ---------- */
  (function bars() {
    var fills = $$('.bar-fill[data-w]');
    if (!fills.length) return;
    function draw(el) { el.style.width = el.getAttribute('data-w') + '%'; }
    if (!('IntersectionObserver' in window)) { fills.forEach(draw); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { draw(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.3 });
    fills.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- 7. 平滑锚点（兼容无 CSS smooth 环境） ---------- */
  $$('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var id = a.getAttribute('href').slice(1);
      if (!id) return;
      var el = document.getElementById(id);
      if (!el) return;
      e.preventDefault();
      var y = el.getBoundingClientRect().top + window.pageYOffset - 82;
      window.scrollTo({ top: y, behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', '#' + id);
    });
  });

  /* ---------- 8. 页脚年份 ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- 9. 部署自检：域名占位符未替换时给出显式警告 ---------- */
  /* 本站在 4 个页面的 canonical / og:url 中使用了占位域名 ai-history.example。
     如果部署时忘了替换，会造成 canonical 指向不存在的域名 —— 这对 SEO 是有害的，
     而且不会有任何报错，属于典型的「静默事故」。这里让它变成一个看得见的错误。 */
  (function deployGuard() {
    if (location.protocol === 'file:') return;      // 本地双击打开时不打扰
    var link = document.querySelector('link[rel="canonical"]');
    var href = link ? (link.getAttribute('href') || '') : '';
    // .example 是 IANA 保留的顶级域，真实域名不可能包含它。
    // 替换为真实域名后此判断自然不再命中，本段代码无需删除。
    if (href.indexOf('.example') === -1) return;
    document.body.classList.add('has-deploy-warn');
    var bar = document.createElement('div');
    bar.className = 'deploy-warn';
    bar.setAttribute('role', 'alert');
    bar.innerHTML = '⚠️ 本站尚未完成上线配置：canonical / og:url 仍指向占位域名 ' +
      '<code>ai-history.example</code>。请按 README 的「上线前必改清单」替换为真实域名后重新部署。';
    document.body.appendChild(bar);
  })();
})();
