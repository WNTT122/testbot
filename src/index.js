// Main entry point for the Discord Twitch Notification Bot
require('dotenv').config();
const { Client, GatewayIntentBits, Events } = require('discord.js');
const cron = require('node-cron');

const { loadStreamers, saveStreamers } = require('./utils/storage');
const { checkStreamers } = require('./utils/twitch');
const { sendLiveNotifications } = require('./utils/notifications');
const { registerCommands } = require('./commands');

// Initialize Discord client
const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds, 
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Track currently live streamers to avoid duplicate notifications
let liveStreamers = new Map();

// Bot initialization
client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
  
  // Register slash commands
  registerCommands(client);
  
  // Set up periodic checking for live streamers
  const checkInterval = process.env.CHECK_INTERVAL || 5;
  console.log(`Setting up checks every ${checkInterval} minutes`);
  
  cron.schedule(`*/${checkInterval} * * * *`, async () => {
    try {
      const streamers = loadStreamers();
      if (streamers.length === 0) {
        console.log('No streamers to check');
        return;
      }
      
      console.log(`Checking ${streamers.length} streamers...`);
      const liveStreams = await checkStreamers(streamers);
      
      // Get channel to send notifications
      const channel = client.channels.cache.get(process.env.NOTIFICATION_CHANNEL_ID);
      if (!channel) {
        console.error('Notification channel not found');
        return;
      }
      
      // Send notifications for newly live streamers
      await sendLiveNotifications(channel, liveStreams, liveStreamers);
      
      // Update currently live streamers
      liveStreamers = new Map(
        liveStreams.map(stream => [stream.user_id, stream])
      );
    } catch (error) {
      console.error('Error in scheduled check:', error);
    }
  });
});

// Handle interactions (slash commands)
client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand()) return;
  
  const { commandName } = interaction;
  
  if (commandName === 'addstreamer') {
    const streamerName = interaction.options.getString('name');
    const streamers = loadStreamers();
    
    if (streamers.includes(streamerName.toLowerCase())) {
      await interaction.reply(`${streamerName} is already in your watchlist!`);
      return;
    }
    
    streamers.push(streamerName.toLowerCase());
    saveStreamers(streamers);
    await interaction.reply(`Added ${streamerName} to your watchlist!`);
  }
  
  if (commandName === 'removestreamer') {
    const streamerName = interaction.options.getString('name');
    let streamers = loadStreamers();
    
    const initialLength = streamers.length;
    streamers = streamers.filter(name => name.toLowerCase() !== streamerName.toLowerCase());
    
    if (streamers.length === initialLength) {
      await interaction.reply(`${streamerName} is not in your watchlist!`);
      return;
    }
    
    saveStreamers(streamers);
    await interaction.reply(`Removed ${streamerName} from your watchlist!`);
  }
  
  if (commandName === 'liststreamers') {
    const streamers = loadStreamers();
    
    if (streamers.length === 0) {
      await interaction.reply('You are not watching any streamers!');
      return;
    }
    
    await interaction.reply(`Watching ${streamers.length} streamers: ${streamers.join(', ')}`);
  }
  
  if (commandName === 'checkstreamer') {
    const streamerName = interaction.options.getString('name');
    await interaction.deferReply();
    
    try {
      const liveStreams = await checkStreamers([streamerName.toLowerCase()]);
      
      if (liveStreams.length === 0) {
        await interaction.editReply(`${streamerName} is not currently live.`);
        return;
      }
      
      await sendLiveNotifications(interaction, liveStreams, new Map(), true);
    } catch (error) {
      console.error('Error checking streamer:', error);
      await interaction.editReply('There was an error checking that streamer.');
    }
  }
});

// Login to Discord
client.login(process.env.DISCORD_TOKEN);

// Handle exit signals
process.on('SIGINT', () => {
  console.log('Bot shutting down...');
  client.destroy();
  process.exit(0);
});