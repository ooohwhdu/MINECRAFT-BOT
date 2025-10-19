const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalNear } = goals;

const HOST = process.env.SERVER_HOST || 'surviveandchill.falixsrv.me';
const PORT = parseInt(process.env.SERVER_PORT || '25565', 10);
const USER = process.env.BOT_USERNAME || 'ooogamer00*';  // Your username here
const CHAT_INTERVAL = parseInt(process.env.CHAT_INTERVAL || '60', 10) * 1000;
const RECONNECT_DELAY = parseInt(process.env.RECONNECT_DELAY || '10000', 10);

let bot = null;
let chatTimer = null;

function startBot() {
  console.log(`[bot] connecting to ${HOST}:${PORT} as ${USER}`);

  bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: USER,
    auth: 'offline',
    version: '1.21.9'
  });

  bot.loadPlugin(pathfinder);

  bot.once('spawn', () => {
    console.log('[bot] spawned');

    // Use default movements without mcData
    const defaultMove = new Movements(bot);
    bot.pathfinder.setMovements(defaultMove);

    if (chatTimer) clearInterval(chatTimer);
    chatTimer = setInterval(() => {
      const messages = [
        'Ping — still alive!',
        'I like to move around!',
        'Mining is fun!',
        'Hello players!'
      ];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      bot.chat(msg);
    }, CHAT_INTERVAL);

    randomMove();
  });

  bot.on('error', (err) => console.log('[bot] error:', err));
  bot.on('end', () => {
    console.log('[bot] disconnected — reconnecting...');
    if (chatTimer) clearInterval(chatTimer);
    setTimeout(startBot, RECONNECT_DELAY);
  });

  bot.on('messagestr', (msg) => console.log('[server msg]', msg));
}

function randomMove() {
  if (!bot || !bot.spawned) return;

  const x = bot.entity.position.x + Math.floor(Math.random() * 10 - 5);
  const y = bot.entity.position.y;
  const z = bot.entity.position.z + Math.floor(Math.random() * 10 - 5);
  bot.pathfinder.setGoal(new GoalNear(x, y, z, 1));

  setTimeout(randomMove, 3000 + Math.random() * 4000);
}

startBot();
