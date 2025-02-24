const config = require("../config/db.config.js");
const Sequelize = require("sequelize");

// Set up Sequelize connection
const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    dialect: config.dialect,
    pool: {
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.user = require("./user.model.js")(sequelize, Sequelize);
db.role = require("./role.model.js")(sequelize, Sequelize);
db.product = require("./product.model.js")(sequelize, Sequelize);
db.order = require("./order.model.js")(sequelize, Sequelize);

// Define associations
db.role.belongsToMany(db.user, {
  through: "user_roles",
  as: "users" 
});
db.user.belongsToMany(db.role, {
  through: "user_roles",
  as: "roles"
});

db.product.belongsTo(db.user, {
  foreignKey: "userId",
  targetKey: "id"
});
db.user.hasMany(db.product, {
  foreignKey: "userId",
  sourceKey: "id"
});

db.order.belongsTo(db.user, {
  foreignKey: "userId",
  targetKey: "id"
});
db.user.hasMany(db.order, {
  foreignKey: "userId",
  sourceKey: "id"
});

// Array of roles
db.ROLES = ["user", "admin", "moderator"];

// Sync database (DO NOT clear data)
const syncDatabase = async () => {
  try {
    // In development and production, do NOT use sync to avoid clearing data
    if (process.env.NODE_ENV === 'development') {
      // Log a message indicating the database sync should be handled through migrations
      console.log("In development, database sync should be handled using migrations.");
    } else {
      // In production, log a message to ensure manual handling of migrations
      console.log("In production, database sync should be handled manually using migrations.");
    }
  } catch (error) {
    console.error("Error syncing database:", error);
  }
};

// Run the database sync function
syncDatabase();

module.exports = db;
