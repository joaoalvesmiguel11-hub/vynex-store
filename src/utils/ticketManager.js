const Database = require('../database/database');
const Logger = require('./logger');

class TicketManager {
  static generateTicketNumber() {
    return `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  static async createTicket(userId, guildId, subject) {
    try {
      const ticketNumber = this.generateTicketNumber();
      
      const result = await Database.run(
        `INSERT INTO tickets (ticket_number, user_id, guild_id, subject, status)
         VALUES (?, ?, ?, ?, ?)`,
        [ticketNumber, userId, guildId, subject, 'open']
      );

      await Logger.log(guildId, userId, 'TICKET_CREATED', ticketNumber, `Subject: ${subject}`);
      return result.lastID;
    } catch (error) {
      console.error('❌ Erro ao criar ticket:', error);
      throw error;
    }
  }

  static async getTicket(ticketId) {
    try {
      return await Database.get(
        `SELECT * FROM tickets WHERE id = ?`,
        [ticketId]
      );
    } catch (error) {
      console.error('❌ Erro ao buscar ticket:', error);
      return null;
    }
  }

  static async getTicketByNumber(ticketNumber) {
    try {
      return await Database.get(
        `SELECT * FROM tickets WHERE ticket_number = ?`,
        [ticketNumber]
      );
    } catch (error) {
      console.error('❌ Erro ao buscar ticket:', error);
      return null;
    }
  }

  static async getUserTickets(userId) {
    try {
      return await Database.all(
        `SELECT * FROM tickets WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
      );
    } catch (error) {
      console.error('❌ Erro ao buscar tickets:', error);
      return [];
    }
  }

  static async getGuildTickets(guildId, status = null) {
    try {
      let query = `SELECT * FROM tickets WHERE guild_id = ?`;
      const params = [guildId];

      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }

      query += ` ORDER BY created_at DESC`;
      return await Database.all(query, params);
    } catch (error) {
      console.error('❌ Erro ao buscar tickets:', error);
      return [];
    }
  }

  static async updateTicketChannel(ticketId, channelId) {
    try {
      await Database.run(
        `UPDATE tickets SET channel_id = ? WHERE id = ?`,
        [channelId, ticketId]
      );
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar channel:', error);
      throw error;
    }
  }

  static async closeTicket(ticketId) {
    try {
      await Database.run(
        `UPDATE tickets SET status = 'closed', closed_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [ticketId]
      );
      return true;
    } catch (error) {
      console.error('❌ Erro ao fechar ticket:', error);
      throw error;
    }
  }

  static async reopenTicket(ticketId) {
    try {
      await Database.run(
        `UPDATE tickets SET status = 'open', closed_at = NULL WHERE id = ?`,
        [ticketId]
      );
      return true;
    } catch (error) {
      console.error('❌ Erro ao reabrir ticket:', error);
      throw error;
    }
  }
}

module.exports = TicketManager;
