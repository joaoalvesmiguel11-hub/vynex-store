const Database = require('../database/database');
const Logger = require('./logger');

class InventoryManager {
  static async getInventory(productId) {
    try {
      return await Database.get(
        `SELECT * FROM inventory WHERE product_id = ?`,
        [productId]
      );
    } catch (error) {
      console.error('❌ Erro ao buscar estoque:', error);
      return null;
    }
  }

  static async updateInventory(productId, quantity) {
    try {
      await Database.run(
        `UPDATE inventory SET quantity = ?, last_updated = CURRENT_TIMESTAMP WHERE product_id = ?`,
        [quantity, productId]
      );
      return true;
    } catch (error) {
      console.error('❌ Erro ao atualizar estoque:', error);
      throw error;
    }
  }

  static async decreaseInventory(productId, quantity) {
    try {
      const inventory = await this.getInventory(productId);
      if (!inventory) throw new Error('Produto não encontrado');
      if (inventory.quantity < quantity) throw new Error('Estoque insuficiente');

      await this.updateInventory(productId, inventory.quantity - quantity);
      return true;
    } catch (error) {
      console.error('❌ Erro ao diminuir estoque:', error);
      throw error;
    }
  }

  static async increaseInventory(productId, quantity) {
    try {
      const inventory = await this.getInventory(productId);
      if (!inventory) throw new Error('Produto não encontrado');

      await this.updateInventory(productId, inventory.quantity + quantity);
      return true;
    } catch (error) {
      console.error('❌ Erro ao aumentar estoque:', error);
      throw error;
    }
  }

  static async checkStock(productId, quantity) {
    try {
      const inventory = await this.getInventory(productId);
      if (!inventory) return false;
      return inventory.quantity >= quantity;
    } catch (error) {
      console.error('❌ Erro ao verificar estoque:', error);
      return false;
    }
  }
}

module.exports = InventoryManager;
