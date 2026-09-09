const path = require('path');
const fs = require('fs');
const { REST, Routes } = require('discord.js');
const client = require('../index');
const Logger = require('../utils/logger');

class CommandHandler {
  constructor(client) {
    this.client = client;
    this.commandsPath = path.join(__dirname, '../commands');
    this.commands = new Map();
    this.load();
    this.register();
  }

  load() {
    const categories = fs.readdirSync(this.commandsPath);

    for (const category of categories) {
      const categoryPath = path.join(this.commandsPath, category);
      if (!fs.statSync(categoryPath).isDirectory()) continue;

      const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));

      for (const file of files) {
        const filePath = path.join(categoryPath, file);
        const command = require(filePath);

        if (!command.data || !command.execute) {
          console.warn(`⚠️  Comando inválido: ${file}`);
          continue;
        }

        this.commands.set(command.data.name, { ...command, category });
        console.log(`✅ Comando carregado: ${command.data.name}`);
      }
    }
  }

  async register() {
    try {
      const commands = Array.from(this.commands.values()).map(cmd => cmd.data.toJSON());
      
      const rest = new REST().setToken(process.env.DISCORD_TOKEN);
      
      await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), {
        body: commands,
      });

      console.log(`✅ ${commands.length} comando(s) registrado(s) globalmente`);
    } catch (error) {
      console.error('❌ Erro ao registrar comandos:', error);
    }
  }

  getCommand(name) {
    return this.commands.get(name);
  }

  getAllCommands() {
    return this.commands;
  }
}

module.exports = CommandHandler;
