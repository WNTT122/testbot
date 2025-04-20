FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY . .

# Create data volume
VOLUME [ "/usr/src/app/data" ]

# Start the bot
CMD [ "node", "src/index.js" ]