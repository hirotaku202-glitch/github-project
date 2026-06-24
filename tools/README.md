# tools — 業務ツール

GIL プロジェクトの運用で使う補助スクリプト置き場。

## upload_to_sheets.py

Excel（.xlsx）を Google Drive にアップロードし、Google スプレッドシートへ自動変換するスクリプト。
拠点×ブランドの KPI データや言葉集などの xlsx を、共有しやすいスプレッドシートに変換する用途を想定。
Mac のローカル環境（Claude Code / ターミナル）で実行する。

### 事前準備

1. ライブラリのインストール:

   ```bash
   pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib openpyxl
   ```

2. Google Cloud Console で OAuth クライアント認証情報（デスクトップアプリ）を作成し、
   `credentials.json` をこのスクリプトと同じフォルダに置く。Drive API を有効化しておくこと。

3. アップロードしたい xlsx をこのスクリプトと同じフォルダに置く。

### 実行

```bash
python3 upload_to_sheets.py "〇〇と言われるけと_本当は〇〇_言葉集100.xlsx"
```

初回はブラウザが開いて Google ログイン認証を求められる。認証後 `token.json` が生成され、
次回以降は自動でログインされる。

### 注意

`credentials.json` と `token.json` は機密情報なので **リポジトリにコミットしない**こと
（`.gitignore` で除外済み）。
