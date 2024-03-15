"use strict";

// Import required modules
const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");

// Get the base name of the current file
const basename = path.basename(__filename);

// Determine the environment (default to 'development' if not specified)
const env = process.env.NODE_ENV || "development";

// Load database configuration based on the environment
const config = require(__dirname + "/../../config/db.js")[env];

// Initialize an empty object to store models
const db = {};

// Initialize Sequelize instance with database configuration
let sequelize;
if (config.use_env_variable) {
  // Use environment variable for database connection URI if available
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Use database, username, password, and other details from configuration
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Read model files from the current directory and initialize them
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      // Filter out current file, test files, and non-JavaScript files
      file.indexOf(".") !== 0 &&
      file !== basename &&
      file.slice(-3) === ".js" &&
      file.indexOf(".test.js") === -1
    );
  })
  .forEach((file) => {
    // Require the model function and initialize it with Sequelize instance and DataTypes
    const model = require(path.join(__dirname, file))(
      sequelize,
      Sequelize.DataTypes
    );
    // Add the initialized model to the db object
    db[model.name] = model;
  });

// Associate models if associations exist
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Export Sequelize instance and Sequelize object along with initialized models
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Export the db object
module.exports = db;
