# slack-message-router

HTTP API を受け取り、内容に応じて **Slack にメッセージを投稿する Firebase Cloud Functions** です。  
外部システム・cron・CLI から叩くための **シンプルな Slack 投稿ゲートウェイ**として使えます。

---

## ✨ 特徴

- Firebase Cloud Functions（1st Gen / Node.js）
- Slack Incoming Webhook 対応
- HTTP POST で簡単に投稿
- curl / スクリプト / 外部 API から利用可能

---

## 📦 構成

```
slack-message-router/
├── functions/
│   ├── index.js
│   └── package.json
├── firebase.json
└── README.md
```

---

## 🚀 セットアップ

### 1. Firebase プロジェクトを作成
```bash
firebase login
firebase init functions
```

- Runtime: **Node.js 20**
- Region: `asia-northeast1`

---

### 2. Slack Incoming Webhook を作成

1. Slack App を作成
2. **Incoming Webhooks** を有効化
3. Webhook URL を取得

---

### 3. Slack Webhook URL を設定

> ⚠️ `functions.config()` は **2026年3月で廃止予定**ですが、現状は使用可能です

```bash
firebase functions:config:set slack.url="https://hooks.slack.com/services/XXX/YYY/ZZZ"
firebase deploy --only functions
```

---

## 📨 API仕様

### エンドポイント

```
POST https://asia-northeast1-<PROJECT_ID>.cloudfunctions.net/slackMessageRouter
```

### リクエストボディ（JSON）

```json
{
  "text": "Slackに投稿したいメッセージ",
  "channel": "#general",
  "level": "info"
}
```

---

## 🧪 動作確認（curl）

### ✅ Windows / Git Bash（日本語対応・推奨）
**必ず `curl.exe` を使用してください**

```bash
curl.exe -X POST "https://asia-northeast1-<PROJECT_ID>.cloudfunctions.net/slackMessageRouter" ^
  -H "Content-Type: application/json; charset=utf-8" ^
  -d "{\"text\":\"これはFirebase Functionからのテストメッセージです！\"}"
```

### 通知レベル（level）

| level | 説明 | 挙動 |
|---|---|---|
| info | 通常通知 | メンションなし |
| warning | 注意 | ⚠️ |
| error | 障害 | ❌ + @here |
| critical | 緊急 | 🚨 + @channel |

---

## 📝 License

MIT
