const { REST, Routes, SlashCommandBuilder } = require('discord.js');

// Define available commands
const commands = [
  new SlashCommandBuilder()
    .setName('addstreamer')
    .setDescription('Add a Twitch streamer to your watchlist')
    .addStringOption(option => 
      option.setName('name')
        .setDescription('The Twitch username of the streamer')
        .setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('removestreamer')
    .setDescription('Remove a Twitch streamer from your watchlist')
    .addStringOption(option => 
      option.setName('name')
        .setDescription('The Twitch username of the streamer')
        .setRequired(true)),
  
  new SlashCommandBuilder()
    .setName('liststreamers')
    .setDescription('List all the streamers in your watchlist'),
  
  new SlashCommandBuilder()
    .setName('checkstreamer')
    .setDescription('Check if a specific streamer is currently live')
    .addStringOption(option => 
      option.setName('name')
        .setDescription('The Twitch username of the streamer')
        .setRequired(true))
];

// Register slash commands with Discord
async function registerCommands(client) {
  try {
    console.log('Started refreshing application (/) commands.');
    
    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);
    
    // Register commands globally - can take up to an hour to propagate
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    
    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
}

module.exports = { registerCommands };