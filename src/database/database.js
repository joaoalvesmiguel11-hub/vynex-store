const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/store.db');

// Criar diretório se não existir
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}

const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco de dados:', err);
    process.exit(1);
  }
  console.log('✅ Banco de dados conectado');
});

db.configure('busyTimeout', 5000);

class Database {
  static initialize() {
    db.serialize(() => {
      // Tabela de servidores
      db.run(`
        CREATE TABLE IF NOT EXISTS servers (
          guild_id TEXT PRIMARY KEY,
          prefix TEXT DEFAULT '!',
          shop_channel_id TEXT,
          logs_channel_id TEXT,
          tickets_channel_id TEXT,
          admin_role_id TEXT,
          staff_role_id TEXT,
          pix_key TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de categorias
      db.run(`
        CREATE TABLE IF NOT EXISTS categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          guild_id TEXT NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          emoji TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(guild_id, name),
          FOREIGN KEY(guild_id) REFERENCES servers(guild_id)
        )
      `);

      // Tabela de produtos
      db.run(`
        CREATE TABLE IF NOT EXISTS products (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          guild_id TEXT NOT NULL,
          category_id INTEGER NOT NULL,
          name TEXT NOT NULL,
          description TEXT,
          price REAL NOT NULL,
          image_url TEXT,
          is_digital BOOLEAN DEFAULT 0,
          digital_content TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(guild_id) REFERENCES servers(guild_id),
          FOREIGN KEY(category_id) REFERENCES categories(id)
        )
      `);

      // Tabela de estoque
      db.run(`
        CREATE TABLE IF NOT EXISTS inventory (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 0,
          last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
        )
      `);

      // Tabela de usuários
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          guild_id TEXT NOT NULL,
          username TEXT,
          email TEXT,
          total_spent REAL DEFAULT 0,
          total_orders INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(guild_id) REFERENCES servers(guild_id)
        )
      `);

      // Tabela de carrinho
      db.run(`
        CREATE TABLE IF NOT EXISTS carts (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          guild_id TEXT NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL DEFAULT 1,
          added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, product_id),
          FOREIGN KEY(user_id) REFERENCES users(id),
          FOREIGN KEY(product_id) REFERENCES products(id) ON DELETE CASCADE
        )
      `);

      // Tabela de pedidos
      db.run(`
        CREATE TABLE IF NOT EXISTS orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_number TEXT UNIQUE NOT NULL,
          user_id TEXT NOT NULL,
          guild_id TEXT NOT NULL,
          total_price REAL NOT NULL,
          status TEXT DEFAULT 'pending',
          payment_method TEXT DEFAULT 'pix',
          pix_qrcode TEXT,
          pix_copy_paste TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          completed_at DATETIME,
          FOREIGN KEY(user_id) REFERENCES users(id),
          FOREIGN KEY(guild_id) REFERENCES servers(guild_id)
        )
      `);

      // Tabela de itens do pedido
      db.run(`
        CREATE TABLE IF NOT EXISTS order_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          product_id INTEGER NOT NULL,
          quantity INTEGER NOT NULL,
          price REAL NOT NULL,
          FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,
          FOREIGN KEY(product_id) REFERENCES products(id)
        )
      `);

      // Tabela de pagamentos
      db.run(`
        CREATE TABLE IF NOT EXISTS payments (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          order_id INTEGER NOT NULL,
          amount REAL NOT NULL,
          status TEXT DEFAULT 'pending',
          method TEXT DEFAULT 'pix',
          transaction_id TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          confirmed_at DATETIME,
          FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE
        )
      `);

      // Tabela de tickets
      db.run(`
        CREATE TABLE IF NOT EXISTS tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          ticket_number TEXT UNIQUE NOT NULL,
          user_id TEXT NOT NULL,
          guild_id TEXT NOT NULL,
          channel_id TEXT,
          subject TEXT NOT NULL,
          status TEXT DEFAULT 'open',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          closed_at DATETIME,
          FOREIGN KEY(user_id) REFERENCES users(id),
          FOREIGN KEY(guild_id) REFERENCES servers(guild_id)
        )
      `);

      // Tabela de staff
      db.run(`
        CREATE TABLE IF NOT EXISTS staff (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          guild_id TEXT NOT NULL,
          role TEXT NOT NULL,
          permissions TEXT,
          added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(user_id, guild_id),
          FOREIGN KEY(guild_id) REFERENCES servers(guild_id)
        )
      `);

      // Tabela de logs
      db.run(`
        CREATE TABLE IF NOT EXISTS logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          guild_id TEXT NOT NULL,
          user_id TEXT,
          action TEXT NOT NULL,
          target TEXT,
          details TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(guild_id) REFERENCES servers(guild_id)
        )
      `);
    });
  }

  static run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    });
  }

  static get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  static all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows || []);
      });
    });
  }

  static close() {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = Database;
