const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');
const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// デフォルトルート
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// シナリオを保存するための変数
let savedScenario = '';

// ゲーム開始エンドポイント
app.post('/api/chatgpt/start', async (req, res) => {
    try {
        const { time, profession } = req.body;

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "あなたはTRPGのゲームマスターです。" },
                { role: "user", content: `ゲーム内の時代設定は「${time}」、キャラクターの職業は「${profession}」です。プレイヤーに世界観と初期シナリオを説明してください。世界とシナリオは10分ほどのプレイ時間でクリアできるように作成してください。説明の後、プレイヤーに最初のアクションをいくつか提示してください` }
            ],
            max_tokens: 1000,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer {あなたのAPIキーをいれてください}`,
                'Content-Type': 'application/json'
            }
        });

        // 生成されたシナリオを保存
        savedScenario = response.data.choices[0].message.content;

        res.json({ message: savedScenario });
    } catch (error) {
        console.error('Error details:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'エラーが発生しました', details: error.response ? error.response.data : error.message });
    }
});

// アクション実行エンドポイント
app.post('/api/chatgpt/action', async (req, res) => {
    try {
        const { action } = req.body;

        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "あなたはTRPGのゲームマスターです。" },
                { role: "user", content: `以下のシナリオを使って、プレイヤーキャラクターが以下のアクションを実行しました: "${action}"。結果と物語の進行を説明してください。たまに意外な結果を出してください。また、次の行動をプレイヤーにいくつか提示してください。シナリオ: ${savedScenario}` }
            ],
            max_tokens: 1000,
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer {あなたのAPIキーをいれてください}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ message: response.data.choices[0].message.content });
    } catch (error) {
        console.error('Error details:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'エラーが発生しました', details: error.response ? error.response.data : error.message });
    }
});

app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
