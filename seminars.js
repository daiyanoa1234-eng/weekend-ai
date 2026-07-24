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
  var header = document.getElementById('siteHeader');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 8);
    });
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function isPast(dateStr) {
    var d = new Date(dateStr + 'T23:59:59');
    return d.getTime() < Date.now();
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
            (past ? 'この回の詳細を見る' : 'この回に申し込む') +
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
    var ordered = SEMINARS.slice().sort(function (a, b) {
      return new Date(a.date) - new Date(b.date);
    });

    if (!ordered.length) {
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    grid.innerHTML = '';
    ordered.forEach(function (sem) {
      var past = isPast(sem.date);
      var card = document.createElement('article');
      card.className = 'sem-card' + (past ? ' is-past' : '');
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', sem.title + 'の詳細を見る');

      card.innerHTML =
        '<figure class="sem-card-thumb">' +
          '<img src="' + escapeHtml(sem.thumb) + '" alt="' + escapeHtml(sem.title) + '" loading="lazy">' +
          (past ? '<span class="sem-badge sem-badge-past">開催終了</span>' : '<span class="sem-badge sem-badge-live">開催予定</span>') +
        '</figure>' +
        '<div class="sem-card-body">' +
          '<p class="sem-card-date">' + escapeHtml(sem.dateLabel) + '　' + escapeHtml(sem.time) + '</p>' +
          '<h3 class="sem-card-title">' + escapeHtml(sem.title) + '</h3>' +
          '<p class="sem-card-speaker">' + escapeHtml(sem.speakerName) + '　' + escapeHtml(sem.speakerTitle) + '</p>' +
          '<span class="sem-card-more">詳しく見る ＋</span>' +
        '</div>';

      card.addEventListener('click', function () { openModal(sem); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openModal(sem); }
      });

      grid.appendChild(card);
    });
  }

  render();
})();
