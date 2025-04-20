const fetch = require('node-fetch');

// Cache the Twitch access token
let twitchAccessToken = null;
let tokenExpiration = 0;

/**
 * Gets a Twitch API access token
 */
async function getTwitchAccessToken() {
  const now = Date.now();
  
  // Return cached token if it's still valid
  if (twitchAccessToken && tokenExpiration > now) {
    return twitchAccessToken;
  }
  
  // Otherwise, get a new one
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;
  
  try {
    const response = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get Twitch token: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    twitchAccessToken = data.access_token;
    
    // Set token expiration (subtract 60 seconds to be safe)
    tokenExpiration = now + (data.expires_in - 60) * 1000;
    
    return twitchAccessToken;
  } catch (error) {
    console.error('Error getting Twitch access token:', error);
    throw error;
  }
}

/**
 * Checks which streamers from the list are currently live
 */
async function checkStreamers(streamerNames) {
  if (!streamerNames || streamerNames.length === 0) {
    return [];
  }
  
  try {
    const token = await getTwitchAccessToken();
    const clientId = process.env.TWITCH_CLIENT_ID;
    
    // First get user IDs for the streamers
    const userQueryString = streamerNames.map(name => `login=${name}`).join('&');
    const userResponse = await fetch(`https://api.twitch.tv/helix/users?${userQueryString}`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!userResponse.ok) {
      throw new Error(`Failed to get Twitch users: ${userResponse.status} ${userResponse.statusText}`);
    }
    
    const userData = await userResponse.json();
    
    if (!userData.data || userData.data.length === 0) {
      return [];
    }
    
    // Get IDs of all users
    const userIds = userData.data.map(user => user.id);
    
    // Check which streamers are live
    const streamQueryString = userIds.map(id => `user_id=${id}`).join('&');
    const streamResponse = await fetch(`https://api.twitch.tv/helix/streams?${streamQueryString}`, {
      headers: {
        'Client-ID': clientId,
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!streamResponse.ok) {
      throw new Error(`Failed to get Twitch streams: ${streamResponse.status} ${streamResponse.statusText}`);
    }
    
    const streamData = await streamResponse.json();
    
    // Add user data to stream data
    if (streamData.data && streamData.data.length > 0) {
      return streamData.data.map(stream => {
        const user = userData.data.find(user => user.id === stream.user_id);
        return {
          ...stream,
          profile_image_url: user ? user.profile_image_url : null,
          user_name: user ? user.display_name : stream.user_name
        };
      });
    }
    
    return [];
  } catch (error) {
    console.error('Error checking streamers:', error);
    throw error;
  }
}

module.exports = { checkStreamers };