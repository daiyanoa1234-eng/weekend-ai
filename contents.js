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
     学習コンテンツ
     ・編集するのは CONTENTS だけです

     ▼ タグについて（フィルターに使用・設定不要）
       tags: ['AIリテラシー'] のように、各エントリに好きなタグを書くだけです。
       別の場所に一覧を登録する必要はありません。実際に使われているタグから
       フィルターのボタンが自動で作られます。1件に複数タグも付けられます
       （例: tags: ['AIリテラシー', '情報セキュリティ']）。
       タグはカードには表示せず、絞り込み専用です（動画カードは特に
       サムネイル・タイトル・概要のみのシンプル表示にしています）。
       ※ PDF・スライドなど非動画カードのみ、タグを小さなラベルとしてカードにも表示します。

     ▼ 動画コンテンツ（YouTubeで運用）
       チャンネルダッシュボード： https://studio.youtube.com/channel/UCBaZSkwcG8jsj8_gEaHrQ4w

       1. YouTube Studioに動画をアップロードする（サムネイルもYouTube側で設定）。
       2. 動画のURL（例: https://youtu.be/8ubAUePSwY8）から、末尾のIDだけを取り出す
          （このカードの場合は "8ubAUePSwY8"）。
       3. 下の CONTENTS に youtubeId を持つエントリを1件追加する。type を '動画' にすると、
          YouTubeのサムネイル画像を使ったカードになり、タップするとその場で
          ポップアップ再生されます（セミナーページの詳細ポップアップと同じ構造）。
       4. このページのカード表示は「サムネイル・タイトル・概要（2文程度）」のみです。
          desc は長文にせず、2文程度に収めてください。

     ▼ PDF・スライドなど（サムネイルなし・Googleドライブ運用のまま）
       ルート： 「HPコンテンツ」 https://drive.google.com/drive/folders/14SgZ8A5yAS4RpGqVpFFAMG0xtY2BLw37
       youtubeId は付けず、url に共有リンク（「リンクを知っている全員が閲覧可」）を入れると、
       これまで通りテキストカード＋「資料を開く」リンクで表示されます。
     ===================================================== */

  // YouTubeの動画IDから、サムネイル画像・埋め込み再生用URLを組み立てるヘルパー
  function ytThumbUrl(id) {
    return 'https://img.youtube.com/vi/' + id + '/hqdefault.jpg';
  }
  function ytEmbedUrl(id) {
    return 'https://www.youtube-nocookie.com/embed/' + id;
  }

  var CONTENTS = [
    // 例）PDF・スライドなど（サムネイルなしのテキストカード）
    // {
    //   title: '生成AIリテラシー入門 振り返り資料',
    //   desc: '権限管理とデータ保存先の考え方を、出典リンク付きで整理した資料です。',
    //   tags: ['現場での運用'],                                // 好きなタグを書くだけでOK（複数可）
    //   date: '2026-08-10',
    //   type: 'スライド',                                     // スライド / PDF / シート など
    //   url: 'https://drive.google.com/file/d/xxxxxxxx/view',  // 「HPコンテンツ」フォルダ内のファイルの共有リンク
    //   source: '2026/8/10 セミナー'
    // },
    // 例）動画（YouTube・サムネイル付き・タップでポップアップ再生）
    // {
    //   title: '動画のタイトル',
    //   desc: '概要（2文程度）。',
    //   tags: ['AIリテラシー'],
    //   date: '2026-08-10',
    //   type: '動画',
    //   youtubeId: 'YouTube動画のID（例: 8ubAUePSwY8）',
    //   source: '出典・回のメモなど（任意）'
    // },

    // ▼ 追加済みの動画（date は仮の値です。実際の回に合わせて調整してください）
    {
      title: 'AI時代の"見えてしまう情報"',
      desc: 'Claudeなどの共有設定を誤ると、社内資料やお客様情報が検索エンジンから見つかる状態になってしまうことがあります。投稿前のチェックポイントや権限範囲の見直し方を紹介します。',
      tags: ['AIリテラシー'],
      date: '2026-07-25',
      type: '動画',
      youtubeId: '8ubAUePSwY8',
      source: '週末のAI整え習慣 今週のトピック③'
    },
  ];

  function formatDate(d) {
    var m = String(d || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? (m[1] + '.' + m[2] + '.' + m[3]) : '';
  }

  var grid = document.getElementById('contentGrid');
  var empty = document.getElementById('contentEmpty');
  var filterWrap = document.getElementById('contentFilter');
  var countEl = document.getElementById('contentCount');
  var currentTag = 'all';

  // 実際に CONTENTS で使われているタグだけを集めて、重複なく登場順に並べる
  function collectTags() {
    var seen = {};
    var list = [];
    CONTENTS.forEach(function (c) {
      (c.tags || []).forEach(function (t) {
        if (!seen[t]) { seen[t] = true; list.push(t); }
      });
    });
    return list;
  }

  function buildFilter() {
    if (!filterWrap) return;
    if (!CONTENTS.length) { filterWrap.hidden = true; return; }

    var tags = collectTags();
    var html = '<button type="button" class="filter-btn active" data-cat="all">すべて</button>';
    tags.forEach(function (tag) {
      html += '<button type="button" class="filter-btn" data-cat="' + esc(tag) + '">' + esc(tag) + '</button>';
    });
    filterWrap.innerHTML = html;

    filterWrap.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('.filter-btn') : null;
      if (!btn) return;
      currentTag = btn.dataset.cat;
      filterWrap.querySelectorAll('.filter-btn').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      renderLibrary();
    });
  }

  /* ---------- 動画ポップアップ（セミナーページの詳細モーダルと同じ構造） ---------- */
  var cvModal = document.getElementById('cvModal');
  var cvModalBody = document.getElementById('cvModalBody');
  var cvModalClose = document.getElementById('cvModalClose');

  function openVideoModal(c) {
    if (!cvModal || !cvModalBody) return;
    cvModalBody.innerHTML =
      '<div class="cv-video-wrap">' +
        '<iframe src="' + esc(ytEmbedUrl(c.youtubeId)) + '" title="' + esc(c.title) + '" loading="lazy" ' +
        'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
        'allowfullscreen></iframe>' +
      '</div>' +
      '<div class="cv-modal-content">' +
        '<h3 class="cv-modal-title">' + esc(c.title) + '</h3>' +
        '<p class="cv-modal-desc">' + esc(c.desc) + '</p>' +
        (c.source ? '<p class="cv-modal-source">' + esc(c.source) + '</p>' : '') +
      '</div>';
    cvModal.classList.add('open');
    cvModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('cv-lock');
  }

  function closeVideoModal() {
    if (!cvModal) return;
    cvModal.classList.remove('open');
    cvModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('cv-lock');
    if (cvModalBody) cvModalBody.innerHTML = ''; // 再生停止
  }

  if (cvModalClose) cvModalClose.addEventListener('click', closeVideoModal);
  if (cvModal) {
    cvModal.addEventListener('click', function (e) {
      if (e.target === cvModal || e.target.classList.contains('cv-modal-backdrop')) closeVideoModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeVideoModal();
  });

  function renderLibrary() {
    if (!grid) return;

    var list = CONTENTS.slice().sort(function (a, b) {
      return new Date(b.date) - new Date(a.date);
    });
    if (currentTag !== 'all') {
      list = list.filter(function (c) { return (c.tags || []).indexOf(currentTag) !== -1; });
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
      var isVideo = !!c.youtubeId;
      var card = document.createElement('article');
      card.className = 'content-card' + (isVideo ? ' content-card-video' : '');

      if (isVideo) {
        // カード面はサムネイル・タイトル・概要（2文程度）のみを表示
        card.innerHTML =
          '<button type="button" class="content-card-thumb" aria-label="' + esc(c.title) + 'を再生">' +
            '<img src="' + esc(ytThumbUrl(c.youtubeId)) + '" alt="' + esc(c.title) + '" loading="lazy">' +
            '<span class="content-play-badge">▶ 動画を見る</span>' +
          '</button>' +
          '<div class="content-card-body">' +
            '<h3 class="content-title">' + esc(c.title) + '</h3>' +
            '<p class="content-desc">' + esc(c.desc) + '</p>' +
          '</div>';
        card.querySelector('.content-card-thumb').addEventListener('click', function () { openVideoModal(c); });
      } else {
        var tagChips = (c.tags || []).map(function (t) {
          return '<span class="content-cat">' + esc(t) + '</span>';
        }).join('');
        card.innerHTML =
          '<div class="content-head">' +
            tagChips +
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
      }
      grid.appendChild(card);
    });
  }

  setupPodcastSort();
  renderPodcast();
  buildFilter();
  renderLibrary();
})();
