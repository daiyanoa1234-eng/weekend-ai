/* =========================================================
   週末のAI整え習慣 — セミナーページ
   ▼ 運用メモ（このコメントはサイト上には表示されません）
   　 新しい回を追加するときは、下の SEMINARS に1件追記してください。
   ========================================================= */
(function () {
  'use strict';

  /* ===================================================== */
  /*  セミナー設定（ここを編集）                             */
  /*  ・date は 'YYYY-MM-DD' 形式（並び替え・開催済み判定に使用） */
  /*  ・tags は任意。カード/モーダルにバッジとして表示されます    */
  /* ===================================================== */
  var SEMINARS = [
    {
      date: '2026-08-10',
      dateLabel: '2026年8月10日（月）',
      time: '20:00〜21:00',
      title: '現場を守るために。管理職と考える生成AIリテラシー入門',
      subtitle: '権限管理とデータ保存先の理解',
      speakerName: '梶原 祐輔',
      speakerTitle: '理学療法士／株式会社PLAST チーフ・DX担当',
      price: '無料',
      thumb: 'assets/2026-08-10_generative-ai-literacy.jpg',
      summary: '生成AIを現場に取り入れるときに管理職が押さえておきたい、権限管理とデータ保存先の考え方を整理する回です。',
      url: 'https://therapis10.com/seminars/cmrzelrg500bkizfk0atnahxh',
      tags: ['アーカイブ配信あり', '限定コミュニティあり', '資料配布あり']
    },
    {
      date: '2026-08-17',
      dateLabel: '2026年8月17日（月）',
      time: '20:00〜21:00',
      title: 'キャリアの可能性を広げる！自己ブランディングのためのGrokを活用したX運用術',
      subtitle: '',
      speakerName: '小島 健',
      speakerTitle: '運動器認定理学療法士／十全記念病院',
      price: '無料',
      thumb: 'assets/2026-08-17_grok-x-branding.jpg',
      summary: 'Grokを活用してX（旧Twitter）運用を効率化し、自己ブランディングやキャリアの可能性を広げるための実践術を紹介します。',
      url: 'https://therapis10.com/seminars/cmrzeqc6n00cwizfkc2z9wwnd',
      tags: ['アーカイブ配信あり', '限定コミュニティあり', '資料配布あり']
    }
  ];
  /* ===================================================== */

  /* ヘッダー・モバイルナビの処理は common.js に集約しました。
     （以前はこのファイルにも同じコードがありました） */

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function isPast(dateStr) {
    var d = new Date(dateStr + 'T23:59:59');
    return d.getTime() < Date.now();
  }

  /* ---------- 並び替え・開催状況の絞り込み ---------- */
  var ORDER_KEY = 'wa_seminars_order_v1';
  var STATUS_KEY = 'wa_seminars_status_v1';
  var semOrder = (function () {
    try { return localStorage.getItem(ORDER_KEY) || 'newest'; } catch (e) { return 'newest'; }
  })();
  var semStatus = (function () {
    try { return localStorage.getItem(STATUS_KEY) || 'all'; } catch (e) { return 'all'; }
  })();

  /* 起動時に1回だけ呼ぶ：並び替えボタン・開催状況の絞り込みボタンを組み立てて、
     クリックの登録も1回だけ行う（アーカイブ動画タブ・Podcastタブと同じ考え方）。 */
  function initSemToolbar() {
    document.querySelectorAll('[data-sem-order]').forEach(function (b) {
      b.addEventListener('click', function () {
        semOrder = b.dataset.semOrder;
        try { localStorage.setItem(ORDER_KEY, semOrder); } catch (e) {}
        render();
      });
    });

    var statusWrap = document.getElementById('semStatusFilter');
    if (!statusWrap) return;

    var upcomingCount = SEMINARS.filter(function (s) { return !isPast(s.date); }).length;
    var pastCount = SEMINARS.filter(function (s) { return isPast(s.date); }).length;

    statusWrap.innerHTML =
      '<button type="button" class="range-btn" data-sem-status="all">すべて<span class="range-count">' + SEMINARS.length + '</span></button>' +
      '<button type="button" class="range-btn" data-sem-status="upcoming">開催予定<span class="range-count">' + upcomingCount + '</span></button>' +
      '<button type="button" class="range-btn" data-sem-status="past">開催終了<span class="range-count">' + pastCount + '</span></button>';

    statusWrap.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-sem-status]') : null;
      if (!b) return;
      semStatus = b.dataset.semStatus;
      try { localStorage.setItem(STATUS_KEY, semStatus); } catch (err) {}
      render();
    });
  }

  /* ---------- refs ---------- */
  var grid = document.getElementById('semGrid');
  var empty = document.getElementById('semEmpty');
  var modal = document.getElementById('semModal');
  var modalBody = document.getElementById('semModalBody');
  var modalClose = document.getElementById('semModalClose');

  function openModal(sem) {
    if (!modal || !modalBody) return;
    var past = isPast(sem.date);
    modalBody.innerHTML =
      '<figure class="sem-modal-thumb">' +
        '<img src="' + escapeHtml(sem.thumb) + '" alt="' + escapeHtml(sem.title) + '">' +
        (past ? '<span class="sem-badge sem-badge-past">開催終了</span>' : '<span class="sem-badge sem-badge-live">開催予定</span>') +
      '</figure>' +
      '<div class="sem-modal-content">' +
        '<p class="sem-modal-date">' + escapeHtml(sem.dateLabel) + '　' + escapeHtml(sem.time) + '</p>' +
        '<h3 class="sem-modal-title">' + escapeHtml(sem.title) + '</h3>' +
        (sem.subtitle ? '<p class="sem-modal-subtitle">' + escapeHtml(sem.subtitle) + '</p>' : '') +
        '<p class="sem-modal-summary">' + escapeHtml(sem.summary) + '</p>' +
        '<div class="sem-modal-speaker">' +
          '<span class="sem-speaker-name">' + escapeHtml(sem.speakerName) + '</span>' +
          '<span class="sem-speaker-title">' + escapeHtml(sem.speakerTitle) + '</span>' +
        '</div>' +
        (sem.tags && sem.tags.length ?
          '<ul class="sem-modal-tags">' + sem.tags.map(function (t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('') + '</ul>'
          : '') +
        '<div class="sem-modal-cta">' +
          '<a href="' + escapeHtml(sem.url) + '" target="_blank" rel="noopener" class="btn btn-cta btn-lg">' +
            (past ? 'アーカイブを見る' : '無料で申し込む') +
          '</a>' +
          '<span class="sem-modal-price">参加費：' + escapeHtml(sem.price) + '</span>' +
        '</div>' +
      '</div>';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sem-lock');
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('sem-lock');
  }

  if (modalClose) modalClose.addEventListener('click', closeModal);
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal || e.target.classList.contains('sem-modal-backdrop')) closeModal();
    });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });

  /* ---------- render cards ---------- */
  function render() {
    if (!grid) return;

    // 並び替え・絞り込みボタンの見た目を同期
    document.querySelectorAll('[data-sem-order]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.semOrder === semOrder);
    });
    document.querySelectorAll('#semStatusFilter [data-sem-status]').forEach(function (b) {
      b.classList.toggle('active', b.dataset.semStatus === semStatus);
    });

    var ordered = SEMINARS.slice();
    if (semStatus === 'upcoming') ordered = ordered.filter(function (s) { return !isPast(s.date); });
    else if (semStatus === 'past') ordered = ordered.filter(function (s) { return isPast(s.date); });

    ordered.sort(function (a, b) {
      // 開催予定（0）を常に開催終了（1）より先＝左に表示する
      var aPast = isPast(a.date) ? 1 : 0;
      var bPast = isPast(b.date) ? 1 : 0;
      if (aPast !== bPast) return aPast - bPast;
      var diff = new Date(a.date) - new Date(b.date);
      return semOrder === 'oldest' ? diff : -diff;
    });

    var countEl = document.getElementById('semCount');
    if (countEl) countEl.textContent = ordered.length ? ('全' + ordered.length + '件') : '';

    if (!ordered.length) {
      grid.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    grid.innerHTML = '';
    ordered.forEach(function (sem) {
      var past = isPast(sem.date);
      var card = document.createElement('article');
      card.className = 'sem-card' + (past ? ' is-past' : '');

      card.innerHTML =
        '<button type="button" class="sem-card-thumb" aria-label="' + escapeHtml(sem.title) + 'の詳細を見る">' +
          '<img src="' + escapeHtml(sem.thumb) + '" alt="' + escapeHtml(sem.title) + '" loading="lazy">' +
          (past ? '<span class="sem-badge sem-badge-past">開催終了</span>' : '<span class="sem-badge sem-badge-live">開催予定</span>') +
        '</button>' +
        '<div class="sem-card-body">' +
          '<p class="sem-card-date">' + escapeHtml(sem.dateLabel) + '　' + escapeHtml(sem.time) + '</p>' +
          '<h3 class="sem-card-title">' + escapeHtml(sem.title) + '</h3>' +
          (sem.subtitle ? '<p class="sem-card-subtitle">' + escapeHtml(sem.subtitle) + '</p>' : '') +
          '<p class="sem-card-speaker">' + escapeHtml(sem.speakerName) + '　' + escapeHtml(sem.speakerTitle) + '</p>' +
          '<div class="sem-card-actions">' +
            '<button type="button" class="btn btn-ghost sem-detail">詳細を見る</button>' +
            '<a href="' + escapeHtml(sem.url) + '" target="_blank" rel="noopener" class="btn btn-cta sem-apply">' +
              (past ? 'アーカイブを見る' : '無料で申し込む') +
            '</a>' +
          '</div>' +
        '</div>';

      card.querySelector('.sem-detail').addEventListener('click', function () { openModal(sem); });
      card.querySelector('.sem-card-thumb').addEventListener('click', function () { openModal(sem); });

      grid.appendChild(card);
    });
  }

  initSemToolbar();
  render();
})();
