/* =========================================================
   週末のAI整え習慣 — コンテンツページ
   Podcast（stand.fm）と、Googleドライブの学習資料を
   1つのページにまとめて表示します。

   ▼ Podcastを追加するとき
   下の EPISODES に1行足すだけです（stand.fmのURLを貼るだけでOK）。

   ▼ 学習資料を追加するとき
   下の CONTENTS に1件追記するだけです（Googleドライブの共有リンクを貼る）。
   ========================================================= */
(function () {
  'use strict';

  var esc = function (s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  };

  /* ---------- ナビ（モバイル） ---------- */
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

  /* =====================================================
     Podcast（stand.fm 限定公開エピソード）
     ・新しい回は url に stand.fm のエピソードURLを貼って追加
     ・theme（任意）を入れるとカードに副題が表示されます
     ===================================================== */
  var EPISODES = [
    { url: 'https://stand.fm/episodes/6a405981f6da955ea231d2a6', no: 1, theme: '', date: '5/30' },
    { url: 'https://stand.fm/episodes/6a4059c8ac08572069cc0537', no: 2, theme: '', date: '6/6' },
    { url: 'https://stand.fm/episodes/6a405a0cf6da955ea231d2b4', no: 3, theme: '', date: '6/13' },
    { url: 'https://stand.fm/episodes/6a405a81f6da955ea231d2c6', no: 4, theme: '', date: '6/20' },
    { url: 'https://stand.fm/episodes/6a405ed967dded2eddb5eb93', no: 5, theme: '', date: '6/27' },
    { url: 'https://stand.fm/episodes/6a483bd107e378c56bc832b6', no: 6, theme: '', date: '7/4' },
    { url: 'https://stand.fm/episodes/6a516dc980a4752b43a0c567', no: 7, theme: '', date: '7/11' },
    { url: 'https://stand.fm/episodes/6a5aa5063f95b14bbd46428f', no: 8, theme: '', date: '7/18' },
    { url: 'https://stand.fm/episodes/6a63df4622340506b937e4bb', no: 9, theme: '', date: '7/25' },
  ];
  // 既定の表示順： 'newest'（新しい回が上＝降順）/ 'oldest'（第1回が上＝昇順）
  var POD_ORDER = 'newest';

  var STORE_KEY = 'wa_podcast_watched_sfm_v1';
  var ORDER_KEY = 'wa_podcast_order_v1';
  var currentOrder = (function () {
    try { return localStorage.getItem(ORDER_KEY) || POD_ORDER; } catch (e) { return POD_ORDER; }
  })();

  var podList = document.getElementById('podList');

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

  EPISODES.forEach(function (ep, i) {
    ep.id = episodeId(ep);
    if (!ep.no) ep.no = i + 1;
    ep.embed = 'https://stand.fm/embed/episodes/' + ep.id;
    ep.link = ep.url || ('https://stand.fm/episodes/' + ep.id);
  });

  function renderPodcast() {
    if (!podList) return;
    podList.innerHTML = '';
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
          (ep.date ? '<span class="pod-date">' + esc(ep.date) + '</span>' : '') +
        '</div>' +
        (ep.theme ? '<h3 class="pod-theme">' + esc(ep.theme) + '</h3>' : '') +
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

      podList.appendChild(card);

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
        saveWatched(watched); sync();
      });
      sync();
    });
  }

  function setupPodcastSort() {
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
        renderPodcast();
      });
    });
    updateUI();
  }

  /* =====================================================
     学習コンテンツ（Googleドライブの資料）
     ・編集するのは CONTENTS だけです
     ===================================================== */
  var CATEGORIES = ['AI基礎', 'ツール活用', '現場での運用', '発信・キャリア', '振り返り資料'];

  var CONTENTS = [
    // 例）
    // {
    //   title: '生成AIリテラシー入門 振り返り資料',
    //   desc: '権限管理とデータ保存先の考え方を、出典リンク付きで整理した資料です。',
    //   category: '現場での運用',
    //   date: '2026-08-10',
    //   type: 'PDF',
    //   url: 'https://drive.google.com/file/d/xxxxxxxx/view',
    //   source: '2026/8/10 セミナー'
    // },
  ];

  function formatDate(d) {
    var m = String(d || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? (m[1] + '.' + m[2] + '.' + m[3]) : '';
  }

  var grid = document.getElementById('contentGrid');
  var empty = document.getElementById('contentEmpty');
  var filterWrap = document.getElementById('contentFilter');
  var countEl = document.getElementById('contentCount');
  var currentCat = 'all';

  function buildFilter() {
    if (!filterWrap) return;
    if (!CONTENTS.length) { filterWrap.hidden = true; return; }

    var used = CATEGORIES.filter(function (cat) {
      return CONTENTS.some(function (c) { return c.category === cat; });
    });

    var html = '<button type="button" class="filter-btn active" data-cat="all">すべて</button>';
    used.forEach(function (cat) {
      html += '<button type="button" class="filter-btn" data-cat="' + esc(cat) + '">' + esc(cat) + '</button>';
    });
    filterWrap.innerHTML = html;

    filterWrap.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.filter-btn') : null;
      if (!btn) return;
      currentCat = btn.dataset.cat;
      filterWrap.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      renderLibrary();
    });
  }

  function renderLibrary() {
    if (!grid) return;

    var list = CONTENTS.slice().sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
    if (currentCat !== 'all') {
      list = list.filter(function (c) { return c.category === currentCat; });
    }

    if (countEl) {
      countEl.textContent = CONTENTS.length ? ('全' + CONTENTS.length + '件') : '';
    }

    if (!list.length) {
      grid.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    grid.innerHTML = '';
    list.forEach(function (c) {
      var card = document.createElement('article');
      card.className = 'content-card';
      card.innerHTML =
        '<div class="content-head">' +
          '<span class="content-cat">' + esc(c.category) + '</span>' +
          (c.type ? '<span class="content-type">' + esc(c.type) + '</span>' : '') +
        '</div>' +
        '<h3 class="content-title">' + esc(c.title) + '</h3>' +
        '<p class="content-desc">' + esc(c.desc) + '</p>' +
        '<p class="content-meta">' +
          '<span>' + formatDate(c.date) + '</span>' +
          (c.source ? '<span>' + esc(c.source) + '</span>' : '') +
        '</p>' +
        '<a class="content-link" href="' + esc(c.url) + '" target="_blank" rel="noopener">' +
          '資料を開く ↗' +
        '</a>';
      grid.appendChild(card);
    });
  }

  setupPodcastSort();
  renderPodcast();
  buildFilter();
  renderLibrary();
})();
