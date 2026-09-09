const Database = require('../database/database');

class Logger {
  static async log(guildId, userId, action, target, details = '') {
    try {
      await Database.run(
        `INSERT INTO logs (guild_id, user_id, action, target, details) VALUES (?, ?, ?, ?, ?)`,
        [guildId, userId || null, action, target || null, details]
      );
    } catch (error) {
      console.error('❌ Erro ao registrar log:', error);
    }
  }

  static async getLogs(guildId, limit = 50) {
    try {
      return await Database.all(
        `SELECT * FROM logs WHERE guild_id = ? ORDER BY created_at DESC LIMIT ?`,
        [guildId, limit]
      );
    } catch (error) {
      console.error('❌ Erro ao recuperar logs:', error);
      return [];
    }
  }
}

module.exports = Logger;
