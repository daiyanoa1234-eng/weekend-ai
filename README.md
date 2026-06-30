# 週末のAI整え習慣 — ホームページ

土曜朝6時のAI朝活コミュニティ「週末のAI整え習慣」の公式サイト（静的サイト）。
https://daiyanoa1234-eng.github.io/weekend-ai

## ファイル構成
- `index.html` … トップページ（企画紹介・参加導線）
- `podcast.html` … Podcastバックナンバー（独立ページ。ヘッダーから遷移）
- `styles.css` / `script.js` … 共通スタイル・トップ用スクリプト
- `podcast.js` … Podcast表示スクリプト（stand.fmのエピソードを埋め込み表示）
- `assets/` … 画像素材
- `gas/` … （旧）Google Drive連携用スクリプト。stand.fm運用では不要なので削除して構いません。

公開範囲：コメキャリ（COMECARE）内の限定公開（一般公開しない。各ページに `noindex` 設定済み）。
参加導線：各CTA「次回の朝活に参加する」は申込URL <https://therapis10.com/signup?invitationCode=unTbjuDp>（セラピストドットコム）を開きます。利用者はそこから、毎週土曜7時に立ち上がる「週末のAI整え習慣」スレッドにリアクション／返信して参加。一度参加表明すると以降はメンションで自動通知。

---

## 公開方法（GitHub Pages）
1. GitHubで **Public** リポジトリを新規作成。
2. 「Add file → Upload files」で、この **フォルダの中身**（`index.html` などのファイルと `assets/` フォルダ）をアップロードしてCommit。
   ※ `index.html` がリポジトリ直下に来るように。
3. 「Settings → Pages」→ Source を「Deploy from a branch」、Branch `main` / `/(root)` で Save。
4. 1〜2分で公開URL（`https://<ユーザー名>.github.io/<リポジトリ名>/`）が発行される。**「Enforce HTTPS」にチェック**。
5. 独自ドメイン（例 `ai.therapis10.com`）は Pages の Custom domain＋DNSのCNAMEで設定可能。

---

## Podcast（stand.fm 限定公開）
Podcastページは、stand.fm公式の埋め込みプレイヤーで各回を再生します。
URL限定公開（チャンネル一覧には出ない）のエピソードでも、URLさえ分かれば再生・埋め込みできます。

### 新しい回を追加する
`podcast.js` の先頭にある `EPISODES` に1行足すだけ：
```js
{ url: 'https://stand.fm/episodes/エピソードID', no: 6, theme: '（任意の副題）', date: '（任意の日付）' },
```
- `url` … stand.fmのエピソードURLを貼るだけ（必須）。
- `no` … 回数。省略時は並び順で自動採番。
- `theme` / `date` … 任意。入れるとカードに表示されます。
- 表示順は `ORDER`（`'newest'` 新しい回が上 / `'oldest'` 第1回が上）で切替。

### 仕組みと注意
- 再生はstand.fm側で行われるため、**音源URLや配信の管理はstand.fmに集約**できます（このサイトに音声ファイルは置きません）。
- 倍速再生はstand.fmアプリ／プレイヤー側の機能です。各カードの「stand.fmで開く」から利用できます。
- 「視聴済み」「視聴本数」はこのサイト独自の機能で、ブラウザのlocalStorageに保存されます（個人情報の送信なし）。
- **限定公開は一覧の自動取得ができません**。新着の自動反映が必要なら、エピソードを公開設定にしてstand.fmのRSSを使う運用に変更する必要があります（限定公開のままなら上記の手動追加が前提）。

---

## セキュリティの注意
- stand.fm方式では、APIキーやアクセストークンをサイトに置く必要がありません（埋め込みURLのみ）。
- URL限定公開のエピソードは「URLを知っていれば誰でも再生できる」状態です。完全非公開にはできない点に注意（限定公開の仕様）。
- Publicリポジトリに、パスワード・OAuthシークレット・サービスアカウントJSON等の秘密情報は置かない。
- 申込URLの招待コードは公開ページから誰でも見えます。限定運用したい場合は、後から無効化・差し替えできる招待リンクを使用してください。
- 公開時は GitHub Pages の「Enforce HTTPS」を有効化。
