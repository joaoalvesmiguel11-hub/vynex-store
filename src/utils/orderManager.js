const Database = require('../database/database');
const Logger = require('./logger');
const { v4: uuidv4 } = require('uuid');

class OrderManager {
  static generateOrderNumber() {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  static async createOrder(userId, guildId, items, totalPrice) {
    try {
      const orderNumber = this.generateOrderNumber();
      
      const result = await Database.run(
        `INSERT INTO orders (order_number, user_id, guild_id, total_price, status)
         VALUES (?, ?, ?, ?, ?)`,
        [orderNumber, userId, guildId, totalPrice, 'pending']
      );

      const orderId = result.lastID;

      // Adicionar itens do pedido
      for (const item of items) {
        await Database.run(
          `INSERT INTO order_items (order_id, product_id, quantity, price)
           VALUES (?, ?, ?, ?)`,
          [orderId, item.product_id, item.quantity, item.price]
        );
      }

      // Criar registro de pagamento
      await Database.run(
        `INSERT INTO payments (order_id, amount, status, method)
         VALUES (?, ?, ?, ?)`,
        [orderId, totalPrice, 'pending', 'pix']
      );

      await Logger.log(guildId, userId, 'ORDER_CREATED', orderNumber, `Total: R$ ${totalPrice.toFixed(2)}`);
      return orderId;
    } catch (error) {
      console.error('❌ Erro ao criar pedido:', error);
      throw error;
    }
  }

  static async getOrder(orderId) {
    try {
      return await Database.get(
        `SELECT * FROM orders WHERE id = ?`,
        [orderId]
      );
    } catch (error) {
      console.error('❌ Erro ao buscar pedido:', error);
      return null;
    }
  }

  static async getOrderByNumber(orderNumber) {
    try {
      return await Database.get(
        `SELECT * FROM orders WHERE order_number = ?`,
        [orderNumber]
      );
    } catch (error) {
      console.error('❌ Erro ao buscar pedido:', error);
      return null;
    }
  }

  static async getUserOrders(userId) {
    try {
      return await Database.all(
        `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
        [userId]
      );
    } catch (error) {
      console.error('❌ Erro ao buscar pedidos:', error);
      return [];
    }
  }

  static async getOrderItems(orderId) {
    try {
      return await Database.all(
        `SELECT oi.*, p.name, p.image_url FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`,
        [orderId]
      );
    } catch (error) {
      console.error('❌ Erro ao buscar itens:', error);
      return [];
    }
  }

  static async updateOrderStatus(orderId, status) {
    try {
      const completedAt = status === 'completed' ? new Date().toISOString() : null;
      
      await Database.run(
        `UPDATE orders SET status = ?, completed_at = ? WHERE id = ?`,
        [status, completedAt, orderId]
      );
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar status:', error);
      throw error;
    }
  }

  static async updatePaymentStatus(orderId, status, transactionId = null) {
    try {
      const confirmedAt = status === 'confirmed' ? new Date().toISOString() : null;
      
      await Database.run(
        `UPDATE payments SET status = ?, transaction_id = ?, confirmed_at = ? WHERE order_id = ?`,
        [status, transactionId, confirmedAt, orderId]
      );

      if (status === 'confirmed') {
        await this.updateOrderStatus(orderId, 'confirmed');
      }

      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar pagamento:', error);
      throw error;
    }
  }

  static async setPixQrCode(orderId, qrcode, copyPaste) {
    try {
      await Database.run(
        `UPDATE orders SET pix_qrcode = ?, pix_copy_paste = ? WHERE id = ?`,
        [qrcode, copyPaste, orderId]
      );
      return true;
    } catch (error) {
      console.error('❌ Erro ao definir QR code:', error);
      throw error;
    }
  }
}

module.exports = OrderManager;
