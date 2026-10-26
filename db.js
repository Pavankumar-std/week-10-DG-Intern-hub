// ---------------------------------------------------------------
// db.js  -  a TINY "database" that stores everything in one JSON file.
// Why? So beginners can run the project WITHOUT installing MongoDB/MySQL.
// Later you can swap this file for Mongoose (MongoDB) or Sequelize (MySQL);
// the controllers only use: data.users, data.jobs, data.applications, ...
// ---------------------------------------------------------------
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'data', 'db.json');

// This object lives in memory. We copy it to the file every time we call save().
const data = { users: [], jobs: [], applications: [], notifications: [] };

// Read the JSON file (returns false if the file does not exist yet)
function load() {
  if (!fs.existsSync(FILE)) return false;
  Object.assign(data, JSON.parse(fs.readFileSync(FILE, 'utf8')));
  return true;
}

// Write the in-memory data to the JSON file
function save() {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(data, null, 2));
}

// Create a simple unique id like "lq3x9a1b2c"
function nextId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

module.exports = { data, load, save, nextId };
