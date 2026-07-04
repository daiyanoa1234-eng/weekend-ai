/* =========================================================
   週末のAI整え習慣 — Podcast page (stand.fm 限定公開エピソード)
   stand.fm公式の埋め込みプレイヤーで再生します。
   新しい回を追加するときは、下の EPISODES に1行足すだけです。
   ========================================================= */
(function () {
  'use strict';

  /* ===================================================== */
  /*  エピソード設定（ここを編集）                          */
  /*  ・新しい回は url に stand.fm のエピソードURLを貼って追加 */
  /*  ・theme（任意）を入れるとカードに副題が表示されます       */
  /* ===================================================== */
  var EPISODES = [
    { url: 'https://stand.fm/episodes/6a405981f6da955ea231d2a6', no: 1, theme: '', date: '5/30' },
    { url: 'https://stand.fm/episodes/6a4059c8ac08572069cc0537', no: 2, theme: '', date: '6/6' },
    { url: 'https://stand.fm/episodes/6a405a0cf6da955ea231d2b4', no: 3, theme: '', date: '6/13' },
    { url: 'https://stand.fm/episodes/6a405a81f6da955ea231d2c6', no: 4, theme: '', date: '6/20' },
    { url: 'https://stand.fm/episodes/6a405ed967dded2eddb5eb93', no: 5, theme: '', date: '6/27' },
    { url: 'https://stand.fm/episodes/6a483bd107e378c56bc832b6', no: 6, theme: '', date: '7/4' }
  ];
  // 既定の表示順： 'newest'（新しい回が上＝降順）/ 'oldest'（第1回が上＝昇順）
  var ORDER = 'newest';
  /* ===================================================== */

  var STORE_KEY = 'wa_podcast_watched_sfm_v1';
  var ORDER_KEY = 'wa_podcast_order_v1';
  var currentOrder = (function () {
    try { return localStorage.getItem(ORDER_KEY) || ORDER; } catch (e) { return ORDER; }
  })();

  /* ---------- Header: mobile nav ---------- */
  var nav = document.getElementById('siteNav');
  var toggle = document.getElementById('navToggle');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') nav.classList.remove('open');
    });
  }

  /* ---------- refs ---------- */
  var list = document.getElementById('podList');
  var elWatched = document.getElementById('watchedCount');
  var elTotal = document.getElementById('totalCount');
  var elWeek = document.getElementById('weekCount');
  var elUnw = document.getElementById('unwatchedCount');
  var elBar = document.getElementById('dashBarFill');
  var elRec = document.getElementById('recTitle');

  /* ---------- watched state ---------- */
  function loadWatched() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function saveWatched(o) { try { localStorage.setItem(STORE_KEY, JSON.stringify(o)); } catch (e) {} }
  var watched = loadWatched();

  function episodeId(ep) {
    if (ep.id) return ep.id;
    var m = String(ep.url || '').match(/episodes\/([A-Za-z0-9]+)/);
    return m ? m[1] : '';
  }
  function isoWeek(d) {
    var date = new Date(d); date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
    var w1 = new Date(date.getFullYear(), 0, 4);
    return date.getFullYear() + '-' + (1 + Math.round(((date - w1) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7));
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------- build / sort ---------- */
  EPISODES.forEach(function (ep, i) {
    ep.id = episodeId(ep);
    if (!ep.no) ep.no = i + 1;
    ep.embed = 'https://stand.fm/embed/episodes/' + ep.id;
    ep.link = ep.url || ('https://stand.fm/episodes/' + ep.id);
  });
  /* ---------- render ---------- */
  function render() {
    list.innerHTML = '';
    var ordered = EPISODES.slice().sort(function (a, b) {
      return currentOrder === 'oldest' ? a.no - b.no : b.no - a.no;
    });
    ordered.forEach(function (ep) {
      var card = document.createElement('article');
      card.className = 'pod-card stand';
      card.id = 'card-' + ep.id;

      card.innerHTML =
        '<div class="pod-head">' +
          '<span class="pod-no">第' + ep.no + '回</span>' +
          (ep.date ? '<span class="pod-date">' + escapeHtml(ep.date) + '</span>' : '') +
        '</div>' +
        (ep.theme ? '<h3 class="pod-theme">' + escapeHtml(ep.theme) + '</h3>' : '') +
        '<div class="sfm-embed">' +
          '<iframe src="' + ep.embed + '" loading="lazy" frameborder="0" height="190" width="100%" ' +
          'allow="autoplay; encrypted-media" allowtransparency="true" class="standfm-embed-iframe" ' +
          'title="第' + ep.no + '回 週末のAI整え習慣"></iframe>' +
        '</div>' +
        '<div class="pod-controls">' +
          '<button class="watch-btn">視聴済みにする</button>' +
          '<span class="pod-actions">' +
            '<a class="pod-link" href="' + ep.link + '" target="_blank" rel="noopener">stand.fmで開く ↗</a>' +
          '</span>' +
        '</div>';

      list.appendChild(card);

      var watchBtn = card.querySelector('.watch-btn');
      function sync() {
        var done = !!watched[ep.id];
        card.classList.toggle('is-watched', done);
        watchBtn.classList.toggle('done', done);
        watchBtn.textContent = done ? '✓ 視聴済み' : '視聴済みにする';
      }
      watchBtn.addEventListener('click', function () {
        if (watched[ep.id]) delete watched[ep.id];
        else watched[ep.id] = Date.now();
        saveWatched(watched); sync(); renderDash();
      });
      sync();
    });
  }

  /* ---------- dashboard ---------- */
  function renderDash() {
    var total = EPISODES.length;
    var ids = Object.keys(watched).filter(function (id) {
      return EPISODES.some(function (e) { return e.id === id; });
    });
    var w = ids.length;
    var thisWeek = isoWeek(Date.now());
    var weekN = ids.filter(function (id) { return isoWeek(watched[id]) === thisWeek; }).length;

    if (elTotal) elTotal.textContent = total;
    if (elWatched) elWatched.textContent = w;
    if (elWeek) elWeek.textContent = weekN;
    if (elUnw) elUnw.textContent = total - w;
    if (elBar) elBar.style.width = (total ? (w / total * 100) : 0) + '%';

    var rec = EPISODES.slice().sort(function (a, b) { return a.no - b.no; })
      .filter(function (e) { return !watched[e.id]; })[0];
    if (elRec) elRec.textContent = rec ? ('第' + rec.no + '回' + (rec.theme ? '　' + rec.theme : '')) : '全て視聴済み 🎉';
  }

  /* ---------- sort toggle ---------- */
  function setupSort() {
    var btns = document.querySelectorAll('.sort-btn');
    if (!btns.length) return;
    function updateUI() {
      btns.forEach(function (b) { b.classList.toggle('active', b.dataset.order === currentOrder); });
    }
    btns.forEach(function (b) {
      b.addEventListener('click', function () {
        currentOrder = b.dataset.order;
        try { localStorage.setItem(ORDER_KEY, currentOrder); } catch (e) {}
        updateUI();
        render();
      });
    });
    updateUI();
  }

  setupSort();
  render();
  renderDash();
})();
