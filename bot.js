const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { GoalNear } = goals;
const Vec3 = require('vec3');

// Add this import:
const mcData = require('minecraft-data')('1.21.9');

const HOST = process.env.SERVER_HOST || 'surviveandchill.falixsrv.me';
const PORT = parseInt(process.env.SERVER_PORT || '25565', 10);
const USER = process.env.BOT_USERNAME || 'ooogamer00*';  // Updated username here
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
    
    // Pass mcData here:
    const defaultMove = new Movements(bot, mcData);
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

    randomActions();
  });

  bot.on('error', (err) => console.log('[bot] error:', err));
  bot.on('end', () => {
    console.log('[bot] disconnected — reconnecting...');
    if (chatTimer) clearInterval(chatTimer);
    setTimeout(startBot, RECONNECT_DELAY);
  });

  bot.on('messagestr', (msg) => console.log('[server msg]', msg));
}

function randomActions() {
  if (!bot || !bot.spawned) return;

  const actions = ['move', 'break', 'wait'];
  const action = actions[Math.floor(Math.random() * actions.length)];

  switch(action) {
    case 'move':
      const x = bot.entity.position.x + Math.floor(Math.random() * 10 - 5);
      const y = bot.entity.position.y;
      const z = bot.entity.position.z + Math.floor(Math.random() * 10 - 5);
      bot.pathfinder.setGoal(new GoalNear(x, y, z, 1));
      break;
    case 'break':
      const block = bot.findBlock({
        matching: b => b.type !== 0,
        maxDistance: 5
      });
      if (block) bot.dig(block).catch(() => {});
      break;
    case 'wait':
      break;
  }

  setTimeout(randomActions, 3000 + Math.random() * 4000);
}

startBot();
