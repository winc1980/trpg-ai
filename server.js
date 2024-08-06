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
                { role: "user", content: `あなたはTRPGのゲームマスターです。私はプレイヤーです。ゲーム内の時代設定は 「${time}」、キャラクターの職業は 「${profession}」です。ゲーム内の時代設定とキャラクターの職業はプレイヤーが決めるので少し待っていてください。また、全体的に文章の演出にこだわって作ってください。それではプレイヤーに世界観と初期シナリオを説明してください。主人公の性格や容姿持ち物やバックグラウンドなども考えた上で主人公キャラクターの描写は必ず魅力的に書いてください。クライマックスでこんなんを乗り越えるための物語の重要アイテムは、主人公が元から持っているパターンか、ストーリーの途中で苦労して手に入れるかにして欲しい。もし、主人公が重要アイテムを元から持っているパターンであれば、最初に主人公の描写とともにプレイヤーに気づかれないようにさりげなくアイテムの存在も描写してください。ただしこれがストーリーの重要アイテムである、という事は絶対に直接的に書かないでください。また、ストーリーの途中で主人公以外の重要なキャラクターが出てくる場合、そのキャラクターの性格や容姿、行動やセリフなどを魅力的に描写してください。ただしモブキャラの場合は魅力的な描写は必要ない。ストーリーの途中でアイテムをゲットする展開もおすすめします。アイテムをゲットした場合、必ず全てのアイテムがストーリーの進行に関わるように物語を作り、アイテムの伏線は全て回収するようにストーリーを作ってください。また、ストーリーの真相などは詳細に述べてください。世界観とシナリオは10分ほどのプレイ時間でクリアできるように作成してください。説明の後、プレイヤーに最初のアクションをいくつか提示してプレイヤーにアクションを選ばせてください。その後プレイヤーの選択に応じてシナリオが変わるようにゲームシナリオを作っていってください。そのくり返りをしながら合計10分でプレイ出来るTRPGを作ってください。ただしストーリーの進行があまり進まない選択肢は入れずに、必ず選択した後には急展開が待っていること。選択肢を選んだ後はストーリーがぐんぐん進むようにストーリーを作って。物語全体を通してストーリーに緩急をつけてください。また、起承転結でいう転のクライマックスでは、絶体絶命の最大のピンチを迎えるように展開を盛り上げてください。そしてどんでん返しのあるシナリオにしてください。その後エンディングに関わる重要なアクションをプレイヤーに提示させてください。それに応じてエンディングを提示して終わるTRPGにしてください。また、クライマックス時に敵を倒す展開の場合は、ゲーム中にプレイヤーがゲットしたか元々切り札だと気づかずにプレイヤーが持っていた切り札を使って倒せるようにしてください。後者の場合は主人公の説明描写の中にキーアイテムの存在も匂わせてください` }
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
                { role: "user", content: `以下のシナリオを使って、プレイヤーキャラクターが以下のアクションを実行しました: "${action}"。シナリオ: ${savedScenario}` }
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
