const Database = require('../database/database');
const Logger = require('./logger');

class CartManager {
  static async addToCart(userId, guildId, productId, quantity = 1) {
    try {
      const existing = await Database.get(
        `SELECT * FROM carts WHERE user_id = ? AND product_id = ?`,
        [userId, productId]
      );

      if (existing) {
        await Database.run(
          `UPDATE carts SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?`,
          [quantity, userId, productId]
        );
      } else {
        await Database.run(
          `INSERT INTO carts (user_id, guild_id, product_id, quantity) VALUES (?, ?, ?, ?)`,
          [userId, guildId, productId, quantity]
        );
      }

      await Logger.log(guildId, userId, 'CART_ADDED', `Product ID: ${productId}`, `Quantity: ${quantity}`);
      return true;
    } catch (error) {
      console.error('❌ Erro ao adicionar ao carrinho:', error);
      throw error;
    }
  }

  static async getCart(userId) {
    try {
      return await Database.all(
        `SELECT c.*, p.name, p.price, p.image_url FROM carts c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = ?
         ORDER BY c.added_at DESC`,
        [userId]
      );
    } catch (error) {
      console.error('❌ Erro ao buscar carrinho:', error);
      return [];
    }
  }

  static async removeFromCart(userId, productId) {
    try {
      await Database.run(
        `DELETE FROM carts WHERE user_id = ? AND product_id = ?`,
        [userId, productId]
      );
      return true;
    } catch (error) {
      console.error('❌ Erro ao remover do carrinho:', error);
      throw error;
    }
  }

  static async updateCartQuantity(userId, productId, quantity) {
    try {
      if (quantity <= 0) {
        return await this.removeFromCart(userId, productId);
      }

      await Database.run(
        `UPDATE carts SET quantity = ? WHERE user_id = ? AND product_id = ?`,
        [quantity, userId, productId]
      );
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar quantidade:', error);
      throw error;
    }
  }

  static async clearCart(userId) {
    try {
      await Database.run(
        `DELETE FROM carts WHERE user_id = ?`,
        [userId]
      );
      return true;
    } catch (error) {
      console.error('❌ Erro ao limpar carrinho:', error);
      throw error;
    }
  }

  static async getCartTotal(userId) {
    try {
      const result = await Database.get(
        `SELECT SUM(c.quantity * p.price) as total FROM carts c
         JOIN products p ON c.product_id = p.id
         WHERE c.user_id = ?`,
        [userId]
      );
      return result?.total || 0;
    } catch (error) {
      console.error('❌ Erro ao calcular total:', error);
      return 0;
    }
  }
}

module.exports = CartManager;
