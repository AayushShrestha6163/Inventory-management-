const { authJwt } = require('../middleware');  // Import authJwt middleware
const userController = require('../controllers/user.controller.js');  // Import user controller

module.exports = function(app) {
  // app.use(function(req, res, next) {
  //   res.header(
  //     "Access-Control-Allow-Headers",
  //     "x-access-token, Origin, Content-Type, Accept"
  //   );
  //   next();
  // });

  // app.get("/api/test/all", controller.allAccess);

  // app.get(
  //   "/api/test/user",
  //   [authJwt.verifyToken],
  //   controller.userBoard
  // );

  // app.get(
  //   "/api/test/mod",
  //   [authJwt.verifyToken, authJwt.isModerator],
  //   controller.moderatorBoard
  // );

  // app.get(
  //   "/api/test/admin",
  //   [authJwt.verifyToken, authJwt.isAdmin],
  //   controller.adminBoard
  // );

  // Allow CORS headers
    app.use((req, res, next) => {
      res.header(
        "Access-Control-Allow-Headers",
        "x-access-token, Origin, Content-Type, Accept"
      );
      next();
    });
  
    // Protected routes with JWT token authentication
    app.get("/api/users", [authJwt.verifyToken], userController.userList);
    app.post("/api/users", [authJwt.verifyToken], userController.createUser);
    app.put("/api/users/:id", [authJwt.verifyToken], userController.updateUser);
    app.delete("/api/users/:id", [authJwt.verifyToken], userController.deleteUser);
    app.get("/api/users/:id", [authJwt.verifyToken], userController.getUserById);
  };
  
