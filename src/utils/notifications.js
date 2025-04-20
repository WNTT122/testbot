const { EmbedBuilder } = require('discord.js');

/**
 * Sends notifications for live streamers
 * @param {Object} channel - Discord channel or interaction to send notifications to
 * @param {Array} liveStreams - Array of live stream data
 * @param {Map} previouslyLive - Map of previously live streamers
 * @param {Boolean} forceNotify - Force notifications even if already sent
 */
async function sendLiveNotifications(channel, liveStreams, previouslyLive, forceNotify = false) {
  if (!liveStreams || liveStreams.length === 0) return;
  
  for (const stream of liveStreams) {
    // Skip if already notified unless forced
    if (!forceNotify && previouslyLive.has(stream.user_id)) continue;
    
    // Create embed for stream notification
    const embed = createStreamEmbed(stream);
    
    // Send the notification
    if (channel.reply) {
      // For interactions (from direct command check)
      await channel.editReply({ embeds: [embed] });
    } else {
      // For regular channel messages
      await channel.send({ embeds: [embed] });
    }
  }
}

/**
 * Creates a Discord embed for a live stream
 */
function createStreamEmbed(stream) {
  // Create timestamp for stream start
  const startedAt = new Date(stream.started_at);
  
  // Create embed with Twitch brand color and stream information
  const embed = new EmbedBuilder()
    .setColor('#6441A4') // Twitch Purple
    .setTitle(`Hey, ${stream.user_name} is live!`)
    .setURL(`https://twitch.tv/${stream.user_login}`)
    .setThumbnail(stream.profile_image_url || '')
    .setImage(stream.thumbnail_url?.replace('{width}', '320').replace('{height}', '180') || '')
    .addFields(
      { name: 'Stream Title', value: stream.title || 'No title' },
      { name: 'Playing', value: stream.game_name || 'Not specified', inline: true },
      { name: 'Viewers', value: stream.viewer_count.toString(), inline: true }
    )
    .setFooter({ text: 'Twitch Stream Notification' })
    .setTimestamp(startedAt);
  
  return embed;
}

module.exports = { sendLiveNotifications };