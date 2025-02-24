const { authJwt } = require('../middleware');  // Import authJwt middleware
const productController = require('../controllers/product.controller.js');  // Import product controller

module.exports = (app) => {
  // Allow CORS headers
  app.use((req, res, next) => {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  // Protected routes with JWT token authentication
  app.get("/api/products", [authJwt.verifyToken], productController.getProducts);
  app.post("/api/products", [authJwt.verifyToken], productController.createProduct);
  app.get("/api/products/:id", [authJwt.verifyToken], productController.getProductById);
  app.put("/api/products/:id", [authJwt.verifyToken], productController.updateProduct);
  app.delete("/api/products/:id", [authJwt.verifyToken], productController.deleteProduct);
  app.get("/api/allproducts", productController.getProducts);
  app.post("/api/orders", productController.createOrder);
  app.get("/api/orders",productController.getOrders);
  app.put('/api/orders/:id', [authJwt.verifyToken], productController.updateOrder);

  // Route for deleting an order
  app.delete('/api/orders/:id', [authJwt.verifyToken], productController.deleteOrder);
  app.get("/api/low-stock", [authJwt.verifyToken], productController.fetchLowStockProducts);
  app.get("/api/products-and-orders-counts",productController.getProductsAndOrdersCounts);
};
