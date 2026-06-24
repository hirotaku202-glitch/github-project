#!/usr/bin/env python3
"""
Excel を Google Drive にアップロードし、Google スプレッドシートに変換するスクリプト。
Mac のローカル環境（Claude Code / ターミナル）で実行してください。

【事前準備】
1. ライブラリのインストール:
   pip install google-api-python-client google-auth-httplib2 google-auth-oauthlib openpyxl

2. Google Cloud Console で OAuth クライアント認証情報（デスクトップアプリ）を作成し、
   credentials.json をこのスクリプトと同じフォルダに置く。
   （Drive API を有効化しておくこと）

3. アップロードしたい xlsx をこのスクリプトと同じフォルダに置く。

【実行】
   python3 upload_to_sheets.py "〇〇と言われるけと_本当は〇〇_言葉集100.xlsx"

初回はブラウザが開いて Google ログイン認証を求められます。
認証後 token.json が生成され、次回以降は自動でログインされます。
"""

import os
import sys
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# スプレッドシート変換のため drive スコープを使用
SCOPES = ["https://www.googleapis.com/auth/drive.file"]


def get_credentials():
    creds = None
    if os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            creds = flow.run_local_server(port=0)
        with open("token.json", "w") as token:
            token.write(creds.to_json())
    return creds


def main():
    if len(sys.argv) < 2:
        print("使い方: python3 upload_to_sheets.py <xlsxファイル名>")
        sys.exit(1)

    xlsx_path = sys.argv[1]
    if not os.path.exists(xlsx_path):
        print(f"ファイルが見つかりません: {xlsx_path}")
        sys.exit(1)

    # スプレッドシート名は拡張子を除いたファイル名
    sheet_title = os.path.splitext(os.path.basename(xlsx_path))[0]

    creds = get_credentials()
    service = build("drive", "v3", credentials=creds)

    # mimeType を google スプレッドシートに指定することで、アップロード時に自動変換される
    file_metadata = {
        "name": sheet_title,
        "mimeType": "application/vnd.google-apps.spreadsheet",
    }
    media = MediaFileUpload(
        xlsx_path,
        mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        resumable=True,
    )

    print("アップロード中...")
    file = (
        service.files()
        .create(body=file_metadata, media_body=media, fields="id, webViewLink")
        .execute()
    )

    print("✅ 完了しました")
    print(f"スプレッドシート名: {sheet_title}")
    print(f"ファイルID: {file.get('id')}")
    print(f"URL: {file.get('webViewLink')}")


if __name__ == "__main__":
    main()
