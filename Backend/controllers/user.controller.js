// user.controller.js
const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const Op = db.Sequelize.Op;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.allAccess = (req, res) => {
  res.status(200).send("Public Content.");
};

exports.userBoard = (req, res) => {
  res.status(200).send("User Content.");
};

exports.adminBoard = (req, res) => {
  res.status(200).send("Admin Content.");
};

exports.moderatorBoard = (req, res) => {
  res.status(200).send("Moderator Content.");
};


exports.userList = (req, res) => {
  User.findAll({
    include: [
      {
        model: Role,
        as: "roles",  // Make sure your model alias is correctly defined
        attributes: ["id", "name"], // Select only relevant role fields
        through: { attributes: [] } // Exclude extra data from user_roles table
      }
    ]
  })
    .then(users => {
      res.status(200).send(users);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};


exports.createUser = (req, res) => {
 // Save User to Database
  User.create({
    username: req.body.username,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 8)  // Hash the password before saving
  })
  .then(user => {
    // If roles are provided, assign roles to user
    if (req.body.roles) {
      Role.findAll({
        where: {
          name: {
            [Op.or]: req.body.roles
          }
        }
      }).then(roles => {
        user.setRoles(roles).then(() => {
          res.send({ message: "User registered successfully!" });
        });
      });
    } else {
      // If no roles are provided, set default role (e.g., "user")
      user.setRoles([1]).then(() => { // Default role = "user" (role id = 1)
        res.send({ message: "User registered successfully!" });
      });
    }
  })
  .catch(err => {
    res.status(500).send({ message: err.message });
  });
};
exports.updateUser = (req, res) => {
  User.findByPk(req.params.id)
    .then(user => {
      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      // Update username and email
      user.update({
        username: req.body.username,
        email: req.body.email
      })
      .then(() => {
        // If roles are provided, update them
        if (req.body.roles) {
          Role.findAll({
            where: {
              name: {
                [Op.or]: req.body.roles
              }
            }
          }).then(roles => {
            user.setRoles(roles).then(() => {
              res.status(200).send({ message: "User and roles updated successfully" });
            });
          }).catch(err => {
            res.status(500).send({ message: err.message });
          });
        } else {
          res.status(200).send({ message: "User updated successfully" });
        }
      })
      .catch(err => {
        res.status(500).send({ message: err.message });
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};


// exports.updateUser = (req, res) => {
//   User.findByPk(req.params.id)
//     .then(user => {
//       if (!user) {
//         return res.status(404).send({ message: "User not found" });
//       }
//       user.update({
//         username: req.body.username,
//         email: req.body.email
//       })
//         .then(() => {
//           res.status(200).send({ message: "User updated successfully" });
//         })
//         .catch(err => {
//           res.status(500).send({ message: err.message });
//         });
//     })
//     .catch(err => {
//       res.status(500).send({ message: err.message });
//     });
// };

exports.deleteUser = (req, res) => {
  User.destroy({
    where: {
      id: req.params.id
    }
  })
    .then(() => {
      res.status(200).send({
        message: "User deleted successfully"
      });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

exports.getUserById = (req, res) => {
  User.findByPk(req.params.id)
    .then(user => {
      res.status(200).send(user);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};
