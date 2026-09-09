const { Client, GatewayIntentBits, Collection } = require('discord.js');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const Database = require('./database/database');
const CommandHandler = require('./handlers/commandHandler');
const EventHandler = require('./handlers/eventHandler');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
client.cooldowns = new Collection();

// Validação de variáveis de ambiente
const requiredEnvVars = ['DISCORD_TOKEN', 'CLIENT_ID'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('❌ Variáveis de ambiente faltando:', missingEnvVars.join(', '));
  console.error('Por favor, configure o arquivo .env');
  process.exit(1);
}

// Inicializar banco de dados
Database.initialize();

// Handlers
new CommandHandler(client);
new EventHandler(client);

// Login
client.login(process.env.DISCORD_TOKEN);

module.exports = client;
