const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const app = express();

// var corsOptions = {
//   origin: "http://localhost:8081"
// };

// app.use(cors(corsOptions));
// Configure CORS
const corsOptions = {
  origin: 'http://localhost:3000',  // Allow only the React frontend
  methods: 'GET,POST,PUT,DELETE',  // Allowed methods
  // credentials: true,  // Allow credentials (cookies, authorization headers)
};

app.use(cors(corsOptions));  // Enable CORS with specified options

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// database
const db = require("./models");
const Role = db.role;
const User = db.user;

db.sequelize.sync();
// force: true will drop the table if it already exists
// db.sequelize.sync({force: true}).then(() => {
//   console.log('Drop and Resync Database with { force: true }');
//   initial();
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to my application." });
});

// routes
require('./routes/auth.routes')(app);
require('./routes/user.routes')(app);
require('./routes/product.routes')(app);
// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// function initial() {
//   Role.create({
//     id: 1,
//     name: "user"
//   });
 
//   Role.create({
//     id: 2,
//     name: "moderator"
//   });
 
//   Role.create({
//     id: 3,
//     name: "admin"
//   });

//   User.create({
//     id: 1,
//     username: "admin",
//     email: "admin@admin.com",
//     password: bcrypt.hashSync("admin123", 8),
//     roles: "admin"
//   });
// }
async function initial() {
  try {
    // Create roles if they don't exist
    await Role.bulkCreate([
      { id: 1, name: "user" },
      { id: 2, name: "moderator" },
      { id: 3, name: "admin" }
    ], { ignoreDuplicates: true });

    // Check if the admin user already exists
    let user = await User.findOne({ where: { id: 1 } });
    if (!user) {
      user = await User.create({
        id: 1,
        username: "admin",
        email: "admin@admin.com",
        password: bcrypt.hashSync("admin123", 8)
      });

      // Assign role "admin" (roleId = 3) to user
      const adminRole = await Role.findOne({ where: { id: 3 } });
      if (adminRole) {
        await user.setRoles([adminRole.id]); // This assumes a Many-to-Many relation
      }
    }

    console.log("Initial data setup completed.");
  } catch (error) {
    console.error("Error during initial data setup:", error);
  }
}