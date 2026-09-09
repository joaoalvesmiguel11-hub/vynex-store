const Database = require('../database/database');
const Logger = require('./logger');

class ProductManager {
  static async createProduct(guildId, categoryId, name, description, price, imageUrl, isDigital = false, digitalContent = '') {
    try {
      const result = await Database.run(
        `INSERT INTO products (guild_id, category_id, name, description, price, image_url, is_digital, digital_content)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [guildId, categoryId, name, description, price, imageUrl || null, isDigital ? 1 : 0, digitalContent || null]
      );

      // Criar estoque inicial
      await Database.run(
        `INSERT INTO inventory (product_id, quantity) VALUES (?, ?)`,
        [result.lastID, 0]
      );

      await Logger.log(guildId, null, 'PRODUCT_CREATED', name, `ID: ${result.lastID}`);
      return result.lastID;
    } catch (error) {
      console.error('❌ Erro ao criar produto:', error);
      throw error;
    }
  }

  static async getProduct(productId) {
    try {
      return await Database.get(
        `SELECT * FROM products WHERE id = ?`,
        [productId]
      );
    } catch (error) {
      console.error('❌ Erro ao buscar produto:', error);
      return null;
    }
  }

  static async getProductsByCategory(categoryId) {
    try {
      return await Database.all(
        `SELECT * FROM products WHERE category_id = ? ORDER BY name ASC`,
        [categoryId]
      );
    } catch (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      return [];
    }
  }

  static async getProductsByGuild(guildId) {
    try {
      return await Database.all(
        `SELECT * FROM products WHERE guild_id = ? ORDER BY name ASC`,
        [guildId]
      );
    } catch (error) {
      console.error('❌ Erro ao buscar produtos:', error);
      return [];
    }
  }

  static async updateProduct(productId, updates) {
    try {
      const allowedFields = ['name', 'description', 'price', 'image_url', 'digital_content'];
      const fields = Object.keys(updates).filter(key => allowedFields.includes(key));
      
      if (fields.length === 0) return false;

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field]);
      values.push(productId);

      await Database.run(
        `UPDATE products SET ${setClause} WHERE id = ?`,
        values
      );

      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar produto:', error);
      throw error;
    }
  }

  static async deleteProduct(productId) {
    try {
      await Database.run(
        `DELETE FROM products WHERE id = ?`,
        [productId]
      );
      return true;
    } catch (error) {
      console.error('❌ Erro ao deletar produto:', error);
      throw error;
    }
  }
}

module.exports = ProductManager;
