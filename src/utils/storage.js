const fs = require('fs');
const path = require('path');

// Path to store the list of streamers
const STORAGE_DIR = path.join(__dirname, '../../data');
const STREAMERS_FILE = path.join(STORAGE_DIR, 'streamers.json');

/**
 * Ensures the data directory exists
 */
function ensureStorageDir() {
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
}

/**
 * Loads the list of streamers from storage
 * @returns {Array} Array of streamer names
 */
function loadStreamers() {
  ensureStorageDir();
  
  try {
    if (fs.existsSync(STREAMERS_FILE)) {
      const data = fs.readFileSync(STREAMERS_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading streamers:', error);
  }
  
  // Return empty array if file doesn't exist or has invalid content
  return [];
}

/**
 * Saves the list of streamers to storage
 * @param {Array} streamers Array of streamer names
 */
function saveStreamers(streamers) {
  ensureStorageDir();
  
  try {
    const data = JSON.stringify(streamers, null, 2);
    fs.writeFileSync(STREAMERS_FILE, data, 'utf8');
  } catch (error) {
    console.error('Error saving streamers:', error);
  }
}

module.exports = { loadStreamers, saveStreamers };