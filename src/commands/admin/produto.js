const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const ProductManager = require('../../../utils/productManager');
const CategoryManager = require('../../../utils/categoryManager');
const InventoryManager = require('../../../utils/inventoryManager');
const EmbedFactory = require('../../../utils/embedFactory');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('produto')
    .setDescription('Gerenciar produtos')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
      subcommand.setName('criar')
        .setDescription('Criar um novo produto')
        .addIntegerOption(option =>
          option.setName('categoria_id')
            .setDescription('ID da categoria')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('nome')
            .setDescription('Nome do produto')
            .setRequired(true)
        )
        .addNumberOption(option =>
          option.setName('preco')
            .setDescription('Preço do produto')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('descricao')
            .setDescription('Descrição do produto')
            .setRequired(false)
        )
        .addBooleanOption(option =>
          option.setName('digital')
            .setDescription('É um produto digital?')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName('listar')
        .setDescription('Listar todos os produtos')
    )
    .addSubcommand(subcommand =>
      subcommand.setName('editar')
        .setDescription('Editar um produto')
        .addIntegerOption(option =>
          option.setName('produto_id')
            .setDescription('ID do produto')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('nome')
            .setDescription('Novo nome')
            .setRequired(false)
        )
        .addNumberOption(option =>
          option.setName('preco')
            .setDescription('Novo preço')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName('deletar')
        .setDescription('Deletar um produto')
        .addIntegerOption(option =>
          option.setName('produto_id')
            .setDescription('ID do produto')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand.setName('estoque')
        .setDescription('Gerenciar estoque')
        .addIntegerOption(option =>
          option.setName('produto_id')
            .setDescription('ID do produto')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option.setName('quantidade')
            .setDescription('Nova quantidade')
            .setRequired(true)
        )
    ),
  
  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const guildId = interaction.guildId;
      const subcommand = interaction.options.getSubcommand();

      if (subcommand === 'criar') {
        const categoryId = interaction.options.getInteger('categoria_id');
        const nome = interaction.options.getString('nome');
        const preco = interaction.options.getNumber('preco');
        const descricao = interaction.options.getString('descricao') || '';
        const digital = interaction.options.getBoolean('digital') || false;

        const productId = await ProductManager.createProduct(
          guildId,
          categoryId,
          nome,
          descricao,
          preco,
          null,
          digital
        );

        const embed = EmbedFactory.createSuccessEmbed(
          '✅ Produto Criado',
          `Produto **${nome}** criado com sucesso!\nID: ${productId}\nPreço: R$ ${preco.toFixed(2)}`
        );

        await interaction.editReply({ embeds: [embed] });
      }

      else if (subcommand === 'listar') {
        const products = await ProductManager.getProductsByGuild(guildId);

        if (products.length === 0) {
          const embed = EmbedFactory.createErrorEmbed('Nenhum produto encontrado.');
          return await interaction.editReply({ embeds: [embed] });
        }

        const embed = EmbedFactory.createSuccessEmbed(
          '📦 Produtos',
          products.map(p => `**${p.name}** (ID: ${p.id})\nPreço: R$ ${p.price.toFixed(2)}`).join('\n\n')
        );

        await interaction.editReply({ embeds: [embed] });
      }

      else if (subcommand === 'editar') {
        const productId = interaction.options.getInteger('produto_id');
        const nome = interaction.options.getString('nome');
        const preco = interaction.options.getNumber('preco');

        const updates = {};
        if (nome) updates.name = nome;
        if (preco) updates.price = preco;

        await ProductManager.updateProduct(productId, updates);

        const embed = EmbedFactory.createSuccessEmbed(
          '✅ Produto Atualizado',
          'Produto atualizado com sucesso!'
        );

        await interaction.editReply({ embeds: [embed] });
      }

      else if (subcommand === 'deletar') {
        const productId = interaction.options.getInteger('produto_id');
        await ProductManager.deleteProduct(productId);

        const embed = EmbedFactory.createSuccessEmbed(
          '✅ Produto Deletado',
          'Produto deletado com sucesso!'
        );

        await interaction.editReply({ embeds: [embed] });
      }

      else if (subcommand === 'estoque') {
        const productId = interaction.options.getInteger('produto_id');
        const quantidade = interaction.options.getInteger('quantidade');

        await InventoryManager.updateInventory(productId, quantidade);

        const embed = EmbedFactory.createSuccessEmbed(
          '✅ Estoque Atualizado',
          `Estoque atualizado para ${quantidade} unidades!`
        );

        await interaction.editReply({ embeds: [embed] });
      }
    } catch (error) {
      console.error('❌ Erro no comando produto:', error);
      const embed = EmbedFactory.createErrorEmbed('Erro ao executar comando.');
      await interaction.editReply({ embeds: [embed] });
    }
  }
};
