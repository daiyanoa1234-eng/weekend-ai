# 週末のAI整え習慣 — ホームページ

土曜朝6時のAI朝活コミュニティ「週末のAI整え習慣」の公式サイト（静的サイト）。

## 公開URL

https://daiyanoa1234-eng.github.io/weekend-ai/

## ファイル構成

- `index.html` … トップページ（企画紹介・参加導線）
- `podcast.html` … Podcastバックナンバー（stand.fm埋め込み）
- `styles.css` … 共通スタイル
- `script.js` … トップページ用スクリプト
- `podcast.js` … Podcast表示スクリプト（stand.fm埋め込み）
- `assets/` … 画像素材

## Podcastの更新方法

`podcast.js` の `EPISODES` に1行追加するだけ：

```js
{ url: 'https://stand.fm/episodes/エピソードID', no: 6, theme: '', date: '' },
