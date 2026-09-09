# Vynex Store - Bot de Vendas Discord

Um bot Discord completo para gerenciamento de loja virtual com suporte a produtos, carrinho, pedidos, pagamentos PIX e painel administrativo.

## 🚀 Recursos

- ✅ Comando `/loja` com interface interativa
- ✅ Gerenciamento de produtos e categorias
- ✅ Carrinho privado por usuário
- ✅ Pedidos e histórico
- ✅ Sistema de tickets para suporte
- ✅ Integração com PIX (QR Code)
- ✅ Entrega de produtos digitais automática
- ✅ Painel administrativo
- ✅ Sistema de staff e permissões
- ✅ Logs completos de atividades
- ✅ Configuração por servidor

## 📋 Pré-requisitos

- Node.js 18+
- npm ou yarn
- Token Discord Bot
- Chave PIX (para pagamentos)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/joaoalvesmiguel11-hub/vynex-store.git
cd vynex-store
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais.

4. Inicialize o banco de dados:
```bash
npm run db:init
```

5. Inicie o bot:
```bash
# Desenvolvimento
npm run dev

# Produção
npm start
```

## 📝 Configuração do Discord Bot

1. Vá para [Discord Developer Portal](https://discord.com/developers/applications)
2. Crie uma nova aplicação
3. Acesse a aba "Bot" e clique em "Add Bot"
4. Copie o token e adicione ao `.env` como `DISCORD_TOKEN`
5. Em "Scopes", selecione: `bot`, `applications.commands`
6. Em "Permissions", selecione:
   - `Send Messages`
   - `Embed Links`
   - `Read Message History`
   - `Manage Messages`
   - `Add Reactions`
   - `Use Slash Commands`

7. Use a URL gerada para convidar o bot ao seu servidor

## 🛍️ Comandos

### Usuários
- `/loja` - Abre a loja principal
- `/carrinho` - Ver carrinho
- `/pedidos` - Ver histórico de pedidos
- `/ticket [assunto]` - Criar ticket de suporte

### Administradores
- `/admin produtos add` - Adicionar produto
- `/admin produtos edit` - Editar produto
- `/admin produtos delete` - Deletar produto
- `/admin categorias` - Gerenciar categorias
- `/admin estoque` - Ver/atualizar estoque
- `/admin pedidos` - Gerenciar pedidos
- `/admin staff` - Gerenciar staff
- `/admin painel` - Abrir painel administrativo
- `/admin config` - Configurações do servidor

## 💾 Banco de Dados

O bot utiliza SQLite com as seguintes tabelas:

- `servers` - Configurações por servidor
- `categories` - Categorias de produtos
- `products` - Produtos
- `inventory` - Estoque de produtos
- `users` - Dados dos usuários
- `carts` - Carrinhos privados
- `orders` - Pedidos realizados
- `order_items` - Itens dos pedidos
- `payments` - Registro de pagamentos
- `tickets` - Tickets de suporte
- `staff` - Membros da staff
- `logs` - Logs de atividades

## 🔐 Segurança

- ✅ Todos os tokens e chaves em variáveis de ambiente
- ✅ Validação de permissões por comando
- ✅ Proteção de dados sensíveis
- ✅ Logs de todas as ações
- ✅ Rate limiting para evitar abuso

## 📄 Licença

MIT
