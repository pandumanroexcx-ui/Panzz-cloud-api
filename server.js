const express = require('express');
const fs = require('fs');
const path = require('path');
const { VERIFY_TOKEN } = require('./config');
const { sendMessage, sendImage, sendList } = require('./lib/send-message');
const { decryptRequest, encryptResponse } = require('./lib/flow-crypto');
const { renderBoard } = require('./lib/tictactoe-render');
const { checkWinner, aiMove } = require('./lib/tictactoe-logic');
const { getGame, saveGame, endGame } = require('./lib/game-state');
const { askGemini } = require('./lib/ai-client');

const app = express();
app.use(express.json());

const PRIVATE_KEY_PEM = fs.readFileSync(path.join(__dirname, 'private_key.pem'), 'utf-8');

app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

async function runCommand(name, ctx) {
  const commands = require('./commands');
  const cmd = commands.get(name);
  if (!cmd) return false;
  try {
    await cmd.run({ ...ctx, commands });
  } catch (err) {
    console.error(`Error di command "${name}":`, err);
    await sendMessage(ctx.from, 'Error pas jalanin command itu.');
  }
  return true;
}

app.post('/webhook', async (req, res) => {
  res.sendStatus(200);

  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;
  const message = value?.messages?.[0];
  if (!message) return;

  const from = message.from;
  const ctx = { sendMessage, sendImage, sendList, from, message };

  if (message.type === 'interactive' && message.interactive?.type === 'list_reply') {
    const id = message.interactive.list_reply.id;

    if (id.startsWith('cat:')) {
      const category = id.slice(4);
      const commands = require('./commands');
      const rows = [];
      const seen = new Set();
      for (const cmd of commands.values()) {
        if (cmd.category === category && !seen.has(cmd.name)) {
          seen.add(cmd.name);
          rows.push({ id: cmd.name, title: cmd.name, description: cmd.description || '' });
        }
      }
      await sendList(from, {
        header: category.toUpperCase(),
        body: 'Tap command buat langsung jalanin:',
        buttonText: 'Lihat Command',
        sections: [{ title: category.toUpperCase(), rows }],
      });
    } else {
      await runCommand(id, { ...ctx, args: [] });
    }
    return;
  }

  const text = message.text?.body || '';
  const body = text.trim();
  if (!body) return;

  console.log(`Pesan masuk dari ${from}: ${text}`);

  const commandName = body.toLowerCase().split(' ')[0];
  const args = body.split(' ').slice(1);

  const commands = require('./commands');
  const cmd = commands.get(commandName);

  if (cmd) {
    await runCommand(commandName, { ...ctx, args });
    return;
  }

  // Bukan command dikenal -> fallback ke AI
  try {
    const answer = await askGemini(body);
    await sendMessage(from, answer);
  } catch (e) {
    console.error('AI fallback error:', e.message);
  }
});

app.post('/flow-endpoint', express.json(), async (req, res) => {
  let decryptedBody, aesKeyBuffer, initialVectorBuffer;

  try {
    const result = decryptRequest(req.body, PRIVATE_KEY_PEM);
    decryptedBody = result.decryptedBody;
    aesKeyBuffer = result.aesKeyBuffer;
    initialVectorBuffer = result.initialVectorBuffer;
  } catch (e) {
    console.error('Gagal dekripsi:', e.message);
    return res.status(421).send();
  }

  const { action, flow_token, data } = decryptedBody;

  if (action === 'ping') {
    const response = { version: '3.0', data: { status: 'active' } };
    return res.send(encryptResponse(response, aesKeyBuffer, initialVectorBuffer));
  }

  let responsePayload;

  if (action === 'INIT') {
    const game = getGame(flow_token);
    const boardImage = await renderBoard(game.board);
    responsePayload = {
      version: '3.0',
      screen: 'PLAY',
      data: {
        board_image: boardImage,
        cell_options: game.board.map((v, i) => ({ id: String(i), title: `Kotak ${i + 1}`, enabled: !v })),
        status_text: 'Giliranmu (X)',
      },
    };
  } else if (action === 'data_exchange') {
    const game = getGame(flow_token);
    const cellIndex = parseInt(data.cell, 10);

    if (!game.board[cellIndex]) {
      game.board[cellIndex] = 'X';
      let winner = checkWinner(game.board);
      if (!winner) {
        const aiIndex = aiMove(game.board);
        if (aiIndex !== undefined) game.board[aiIndex] = 'O';
        winner = checkWinner(game.board);
      }
      saveGame(flow_token, game);

      if (winner) {
        endGame(flow_token);
        const resultText = winner === 'draw' ? 'Seri! 🤝' : winner === 'X' ? 'Kamu menang! 🎉' : 'Bot menang! 🤖';
        const boardImage = await renderBoard(game.board);
        responsePayload = { version: '3.0', screen: 'RESULT', data: { board_image: boardImage, result_text: resultText } };
      } else {
        const boardImage = await renderBoard(game.board);
        responsePayload = {
          version: '3.0',
          screen: 'PLAY',
          data: {
            board_image: boardImage,
            cell_options: game.board.map((v, i) => ({ id: String(i), title: `Kotak ${i + 1}`, enabled: !v })),
            status_text: 'Giliranmu (X)',
          },
        };
      }
    } else {
      const boardImage = await renderBoard(game.board);
      responsePayload = {
        version: '3.0',
        screen: 'PLAY',
        data: {
          board_image: boardImage,
          cell_options: game.board.map((v, i) => ({ id: String(i), title: `Kotak ${i + 1}`, enabled: !v })),
          status_text: 'Kotak udah keisi, pilih yang lain!',
        },
      };
    }
  } else {
    responsePayload = { version: '3.0', data: { acknowledged: true } };
  }

  res.send(encryptResponse(responsePayload, aesKeyBuffer, initialVectorBuffer));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));
