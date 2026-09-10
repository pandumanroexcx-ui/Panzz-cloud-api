const fs = require('fs');
const path = require('path');

const commands = new Map();

function loadFromDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      loadFromDir(fullPath);
      continue;
    }
    if (!entry.name.endsWith('.js') || entry.name === 'index.js') continue;
    try {
      delete require.cache[require.resolve(fullPath)];
      const cmd = require(fullPath);
      if (!cmd.name || typeof cmd.run !== 'function') continue;
      commands.set(cmd.name, cmd);
      if (Array.isArray(cmd.alias)) for (const a of cmd.alias) commands.set(a, cmd);
    } catch (e) {
      console.log(`[ERROR LOAD] ${fullPath}:`, e.message);
    }
  }
}

loadFromDir(__dirname);
console.log(`[COMMANDS] ${new Set([...commands.values()].map((c) => c.name)).size} command dimuat`);

module.exports = commands;
