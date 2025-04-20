# Discord Twitch Notification Bot

A Discord bot that sends notifications when Twitch streamers go live, including rich embeds with stream information.

## Features

- Monitor multiple Twitch streamers for live status
- Receive Discord notifications when streamers go live
- Rich embeds with streamer name, game/activity, and stream links
- Easy to use commands for managing your watchlist
- Docker support for simple deployment on Portainer

## Setup

### Prerequisites

1. A Discord Bot Token ([Create a Discord Bot](https://discord.com/developers/applications))
2. Twitch API credentials ([Get Twitch API Keys](https://dev.twitch.tv/console/apps/create))
3. Node.js (if running without Docker)
4. Docker & Docker Compose (for containerized deployment)

### Configuration

1. Copy `.env.example` to `.env`
2. Fill in the required credentials:
   ```
   DISCORD_TOKEN=your_discord_bot_token_here
   TWITCH_CLIENT_ID=your_twitch_client_id_here
   TWITCH_CLIENT_SECRET=your_twitch_client_secret_here
   NOTIFICATION_CHANNEL_ID=your_discord_channel_id_here
   CHECK_INTERVAL=5
   ```

### Installation

#### Without Docker

```bash
# Install dependencies
npm install

# Start the bot
npm start
```

#### With Docker

```bash
# Build and start the container
docker-compose up -d

# View logs
docker-compose logs -f
```

#### On Portainer

1. Log in to your Portainer dashboard
2. Go to Stacks → Add stack
3. Upload your `docker-compose.yml` file or paste its contents
4. Configure the environment variables
5. Deploy the stack

## Usage

The bot provides the following slash commands:

- `/addstreamer name:username` - Add a Twitch streamer to your watchlist
- `/removestreamer name:username` - Remove a Twitch streamer from your watchlist
- `/liststreamers` - List all streamers in your watchlist
- `/checkstreamer name:username` - Check if a specific streamer is currently live

## Persistence

The list of streamers is stored in `data/streamers.json`. This directory is persisted as a Docker volume if you're using containerized deployment.