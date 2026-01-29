/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

const functions = require('firebase-functions/v1');
const { IncomingWebhook } = require('@slack/client');

// Slack Incoming Webhook URLを環境設定から取得
const webhook = new IncomingWebhook(functions.config().slack.url);

const LEVEL_CONFIG = {
    info: {
        emoji: "ℹ️",
        mention: "",
    },
    warning: {
        emoji: "⚠️",
        mention: "",
    },
    error: {
        emoji: "❌",
        mention: "<!here>",
    },
    critical: {
        emoji: "🚨",
        mention: "<!channel>",
    },
};

/**
 * RESTリクエストを受け取り、Slackにメッセージを投稿するHTTP関数
 *
 * リクエストボディの例:
 * {
 *   "text": "Hello from Firebase Function!",
 *   "channel": "#general" // 投稿したいチャンネル（オプション、Webhookで指定されていれば不要）
 * }
 */
exports.slackMessageRouter = functions
    .region("asia-northeast1")
    .runWith({ timeoutSeconds: 60, memory: "128MB" })
    .https.onRequest(async (req, res) => {
    res.set("Content-Type", "application/json; charset=utf-8");

    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
    }

    const { text, channel, level = "info" } = req.body || {};

    if (!text) {
        return res.status(400).json({ error: '"text" is required' });
    }

    const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.info;

    // Slack に送る最終メッセージ
    const slackText = [
        cfg.mention,
        cfg.emoji,
        text,
    ].filter(Boolean).join(" ");

    try {
        await webhook.send({
        text: slackText,
        channel: channel || undefined,
        });

        functions.logger.info("Slack message sent", {
        level,
        channel,
        text,
        });

        return res.status(200).json({ ok: true });
    } catch (err) {
        functions.logger.error("Slack send failed", err);
        return res.status(500).json({ ok: false });
    }
});

