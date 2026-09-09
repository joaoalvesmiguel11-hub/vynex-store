const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const CategoryManager = require('../../../utils/categoryManager');
const EmbedFactory = require('../../../utils/embedFactory');
const Logger = require('../../../utils/logger');
const ServerManager = require('../../../utils/serverManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Comandos administrativos')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommandGroup(group =>
      group.setName('categorias')
        .setDescription('Gerenciar categorias de produtos')
        .addSubcommand(subcommand =>
          subcommand.setName('criar')
            .setDescription('Criar uma categoria')
            .addStringOption(option =>
              option.setName('nome')
                .setDescription('Nome da categoria')
                .setRequired(true)
            )
            .addStringOption(option =>
              option.setName('descricao')
                .setDescription('Descrição da categoria')
                .setRequired(false)
            )
            .addStringOption(option =>
              option.setName('emoji')
                .setDescription('Emoji da categoria')
                .setRequired(false)
            )
        )
        .addSubcommand(subcommand =>
          subcommand.setName('listar')
            .setDescription('Listar todas as categorias')
        )
        .addSubcommand(subcommand =>
          subcommand.setName('editar')
            .setDescription('Editar uma categoria')
            .addIntegerOption(option =>
              option.setName('categoria_id')
                .setDescription('ID da categoria')
                .setRequired(true)
            )
            .addStringOption(option =>
              option.setName('nome')
                .setDescription('Novo nome')
                .setRequired(false)
            )
            .addStringOption(option =>
              option.setName('descricao')
                .setDescription('Nova descrição')
                .setRequired(false)
            )
        )
        .addSubcommand(subcommand =>
          subcommand.setName('deletar')
            .setDescription('Deletar uma categoria')
            .addIntegerOption(option =>
              option.setName('categoria_id')
                .setDescription('ID da categoria')
                .setRequired(true)
            )
        )
    ),
  
  async execute(interaction) {
    try {
      await interaction.deferReply({ ephemeral: true });

      const guildId = interaction.guildId;
      const subcommandGroup = interaction.options.getSubcommandGroup();
      const subcommand = interaction.options.getSubcommand();

      if (subcommandGroup === 'categorias') {
        if (subcommand === 'criar') {
          const nome = interaction.options.getString('nome');
          const descricao = interaction.options.getString('descricao') || '';
          const emoji = interaction.options.getString('emoji') || '📦';

          const categoryId = await CategoryManager.createCategory(guildId, nome, descricao, emoji);

          const embed = EmbedFactory.createSuccessEmbed(
            '✅ Categoria Criada',
            `Categoria **${nome}** criada com sucesso!\nID: ${categoryId}`
          );

          await interaction.editReply({ embeds: [embed] });
        }

        else if (subcommand === 'listar') {
          const categories = await CategoryManager.getCategoriesByGuild(guildId);

          if (categories.length === 0) {
            const embed = EmbedFactory.createErrorEmbed('Nenhuma categoria encontrada.');
            return await interaction.editReply({ embeds: [embed] });
          }

          const embed = EmbedFactory.createSuccessEmbed(
            '📂 Categorias',
            categories.map(c => `${c.emoji} **${c.name}** (ID: ${c.id})\n${c.description}`).join('\n\n')
          );

          await interaction.editReply({ embeds: [embed] });
        }

        else if (subcommand === 'editar') {
          const categoryId = interaction.options.getInteger('categoria_id');
          const nome = interaction.options.getString('nome');
          const descricao = interaction.options.getString('descricao');

          const updates = {};
          if (nome) updates.name = nome;
          if (descricao) updates.description = descricao;

          await CategoryManager.updateCategory(categoryId, updates);

          const embed = EmbedFactory.createSuccessEmbed(
            '✅ Categoria Atualizada',
            'Categoria atualizada com sucesso!'
          );

          await interaction.editReply({ embeds: [embed] });
        }

        else if (subcommand === 'deletar') {
          const categoryId = interaction.options.getInteger('categoria_id');

          await CategoryManager.deleteCategory(categoryId);

          const embed = EmbedFactory.createSuccessEmbed(
            '✅ Categoria Deletada',
            'Categoria deletada com sucesso!'
          );

          await interaction.editReply({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('❌ Erro no comando admin:', error);
      const embed = EmbedFactory.createErrorEmbed('Erro ao executar comando administrativo.');
      await interaction.editReply({ embeds: [embed] });
    }
  }
};
