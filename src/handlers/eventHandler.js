const path = require('path');
const fs = require('fs');

class EventHandler {
  constructor(client) {
    this.client = client;
    this.eventsPath = path.join(__dirname, '../events');
    this.load();
  }

  load() {
    const files = fs.readdirSync(this.eventsPath).filter(f => f.endsWith('.js'));

    for (const file of files) {
      const filePath = path.join(this.eventsPath, file);
      const event = require(filePath);

      if (!event.name || !event.execute) {
        console.warn(`⚠️  Evento inválido: ${file}`);
        continue;
      }

      if (event.once) {
        this.client.once(event.name, (...args) => event.execute(...args, this.client));
      } else {
        this.client.on(event.name, (...args) => event.execute(...args, this.client));
      }

      console.log(`✅ Evento carregado: ${event.name}`);
    }
  }
}

module.exports = EventHandler;
