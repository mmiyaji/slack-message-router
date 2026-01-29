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

/**
 * RESTリクエストを受け取り、Slackにメッセージを投稿するHTTP関数
 *
 * リクエストボディの例:
 * {
 *   "text": "Hello from Firebase Function!",
 *   "channel": "#general" // 投稿したいチャンネル（オプション、Webhookで指定されていれば不要）
 * }
 */
exports.slackMessageRouter = functions.region('asia-northeast1')
    .runWith({
        timeoutSeconds: 60,
        memory: '128MB',
    })
    .https.onRequest(async (req, res) => {
        // POSTリクエストのみを処理
        if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }
    res.set("Content-Type", "application/json; charset=utf-8");
    let body = req.body;
    if (!body || typeof body !== "object") {
        try {
            body = JSON.parse(req.rawBody.toString("utf8"));
        } catch {
            return res.status(400).send(JSON.stringify({ error: "Invalid JSON. Set Content-Type: application/json; charset=utf-8" }));
        }
    }
    // リクエストボディからメッセージ情報を取得
    const { text, channel } = req.body;

    if (!text) {
    return res.status(400).send('Bad Request: "text" field is required in the request body.');
    }

    try {
    // Slackにメッセージを投稿
    await webhook.send({
        text: text,
        channel: channel || undefined, // チャンネルが指定されていれば設定
    });

    functions.logger.info('Message successfully sent to Slack', { text, channel });
    return res.status(200).send('Message sent to Slack successfully!');
    } catch (error) {
    functions.logger.error('Failed to send message to Slack', error);
    return res.status(500).send('Failed to send message to Slack.');
    }
});
