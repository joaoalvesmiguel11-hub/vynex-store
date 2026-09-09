const Database = require('../database/database');
const Logger = require('./logger');

class CategoryManager {
  static async createCategory(guildId, name, description = '', emoji = '') {
    try {
      const result = await Database.run(
        `INSERT INTO categories (guild_id, name, description, emoji) VALUES (?, ?, ?, ?)`,
        [guildId, name, description, emoji]
      );

      await Logger.log(guildId, null, 'CATEGORY_CREATED', name, `ID: ${result.lastID}`);
      return result.lastID;
    } catch (error) {
      console.error('❌ Erro ao criar categoria:', error);
      throw error;
    }
  }

  static async getCategory(categoryId) {
    try {
      return await Database.get(
        `SELECT * FROM categories WHERE id = ?`,
        [categoryId]
      );
    } catch (error) {
      console.error('❌ Erro ao buscar categoria:', error);
      return null;
    }
  }

  static async getCategoriesByGuild(guildId) {
    try {
      return await Database.all(
        `SELECT * FROM categories WHERE guild_id = ? ORDER BY name ASC`,
        [guildId]
      );
    } catch (error) {
      console.error('❌ Erro ao buscar categorias:', error);
      return [];
    }
  }

  static async updateCategory(categoryId, updates) {
    try {
      const allowedFields = ['name', 'description', 'emoji'];
      const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
      
      if (fields.length === 0) return false;

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field]);
      values.push(categoryId);

      await Database.run(
        `UPDATE categories SET ${setClause} WHERE id = ?`,
        values
      );

      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar categoria:', error);
      throw error;
    }
  }

  static async deleteCategory(categoryId) {
    try {
      await Database.run(
        `DELETE FROM categories WHERE id = ?`,
        [categoryId]
      );
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar categoria:', error);
      throw error;
    }
  }
}

module.exports = CategoryManager;
