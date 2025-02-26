const db = require("../models");
const Product = db.product;
const Order = db.order;
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure the 'uploads/products' folder exists
const uploadDir = path.join(__dirname, "../uploads/products");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Use the ensured directory
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)); // Generate a unique filename
  }
});

const upload = multer({ storage: storage }).single("image"); // Single file upload with field name 'image'

// Create Product
exports.createProduct = (req, res) => {
  // First, handle file upload
  
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send({ message: "Error uploading image", error: err.message });
    }

    try {
      const { name, description, price, stock } = req.body;
      const userId = req.userId; // Ensure this comes from authentication

     
      // Check if an image was uploaded
      const imagePath = req.file ? `uploads/products/${req.file.filename}` : null; // Use existing image if no new one uploaded

      // Create the product in the database
      const newProduct = await Product.create({
        name,
        description,
        price,
        stock,
        userId,
        image: imagePath, // Store image path if uploaded
      });

      res.status(201).send({ message: "Product created successfully!", product: newProduct });
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).send({ message: "Error creating product", error: error.message });
    }
  });
};


// Get Product List
exports.getProducts = (req, res) => {
  Product.findAll()
    .then(products => {
      res.status(200).send(products);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

// Update Product
exports.updateProduct = (req, res) => {
  // First, process the image with multer middleware before continuing
  upload(req, res, (err) => {
    if (err) {
      // Handle errors from multer (file size, file type, etc.)
      return res.status(500).send({ message: 'Error uploading image', error: err.message });
    }

    // After image upload, handle product update logic
    const productId = req.params.id;
    const { name, description, price, stock } = req.body;

    console.log(req.body);
    Product.findByPk(productId)
      .then(product => {
        if (!product) {
          return res.status(404).send({ message: 'Product not found' });
        }

        // If an image was uploaded, update the image field, otherwise keep the old one
        const imagePath = req.file ? `uploads/products/${req.file.filename}` : product.image;

        // Update the product in the database
        product.update({
          name: name || product.name,
          description: description || product.description,
          price: price || product.price,
          stock: stock || product.stock,
          image: imagePath,
        })
        .then(updatedProduct => {
          res.status(200).send({ message: 'Product updated successfully!', updatedProduct });
        })
        .catch(err => {
          res.status(500).send({ message: 'Error updating product', error: err.message });
        });
      })
      .catch(err => {
        res.status(500).send({ message: 'Error finding product', error: err.message });
      });
  });
};


// Delete Product
exports.deleteProduct = (req, res) => {
  const productId = req.params.id;

  Product.destroy({
    where: {
      id: productId
    }
  })
    .then(deleted => {
      if (deleted === 0) {
        return res.status(404).send({ message: "Product not found" });
      }
      res.status(200).send({ message: "Product deleted successfully!" });
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

// Get Product by ID
exports.getProductById = (req, res) => {
  const productId = req.params.id;

  Product.findByPk(productId)
    .then(product => {
      if (!product) {
        return res.status(404).send({ message: "Product not found" });
      }
      res.status(200).send(product);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};

// Create Order
// exports.createOrder = async (req, res) => {
//   const { userId, cart, shippingAddress, paymentInfo, total } = req.body;

//   if (!userId || !cart || !shippingAddress || !paymentInfo || !total) {
//     return res.status(400).send({ message: 'All fields are required.' });
//   }

//   try {
//     const newOrder = await Order.create({
//       userId,
//       cart,
//       shippingAddress,
//       paymentInfo,
//       total,
//     });

//     res.status(201).send({
//       message: 'Order created successfully!',
//       order: newOrder,
//     });
//   } catch (err) {
//     console.error('Error creating order:', err); // Log the error on the server
//     res.status(500).send({ message: 'Error creating order: ' + err.message });
//   }
// };
exports.createOrder = async (req, res) => {
  const { userId, cart, shippingAddress, paymentInfo, total } = req.body;

  if (!userId || !cart || !shippingAddress || !paymentInfo || !total) {
    return res.status(400).send({ message: 'All fields are required.' });
  }

  const t = await db.sequelize.transaction(); // Using the sequelize instance from models

  try {
    // Step 1: Create the order
    const newOrder = await Order.create(
      {
        userId,
        cart,
        shippingAddress,
        paymentInfo,
        total,
      },
      { transaction: t }
    );

    // Step 2: Loop through cart items and reduce product stock
    for (const item of cart) {
      const product = await Product.findByPk(item.id, { transaction: t });

      if (!product) {
        throw new Error(`Product with ID ${item.id} not found`);
      }

      // Step 3: Check if there's enough stock to fulfill the order
      if (product.stock < item.quantity) {
        throw new Error(`Not enough stock for product ${item.name}`);
      }

      // Step 4: Reduce the stock
      product.stock -= item.quantity;

      // Step 5: If stock is low, notify admin
      if (product.stock <= 2) {
        console.log(`Product ${product.name} stock is running low!`);
      }

      // Save the updated product stock
      await product.save({ transaction: t });
    }

    // Step 6: Commit the transaction if everything is successful
    await t.commit();

    // Step 7: Return the successful response
    res.status(201).send({
      message: 'Order created successfully!',
      order: newOrder,
    });
  } catch (err) {
    await t.rollback();
    console.error('Error creating order:', err);
    res.status(500).send({ message: 'Error creating order: ' + err.message });
  }
};


// Get Order List
exports.getOrders = (req, res) => {
  Order.findAll()
    .then(orders => {
      res.status(200).send(orders);
    })
    .catch(err => {
      res.status(500).send({ message: err.message });
    });
};


// Update Order Status
exports.updateOrder = async (req, res) => {
  const { id } = req.params; // Order ID from URL
  const { status } = req.body; // New status from the request body

  try {
    // Find the order by ID
    const order = await Order.findOne({ where: { id } });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Update order status
    order.status = status;
    await order.save();

    res.status(200).json({ message: 'Order status updated successfully', order });
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Error updating order' });
  }
};

// Delete Order
exports.deleteOrder = async (req, res) => {
  const { id } = req.params; // Order ID from URL

  try {
    // Find the order by ID
    const order = await Order.findOne({ where: { id } });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Delete the order
    await order.destroy();

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ message: 'Error deleting order' });
  }
};


exports.fetchLowStockProducts = async (req, res) => {
  try {
    // Fetch products with stock <= 2
    const lowStockProducts = await Product.findAll({
      where: {
        stock: { [db.Sequelize.Op.lte]: 2 }, // Stock less than or equal to 2
      },
      attributes: ["id", "name", "stock"], // Fetch only necessary fields
    });

    if (lowStockProducts.length === 0) {
      return res.status(200).json({ message: "No low stock products", products: [] });
    }

    // Create an array of stock low messages
    const stockLowMessages = lowStockProducts.map(product => ({
      productName: product.name,
      stock: product.stock,
      message: `Stock low for ${product.name}, only ${product.stock} left!`
    }));

    res.status(200).json({ products: stockLowMessages });
  } catch (error) {
    console.error("Error fetching low stock products:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getProductsAndOrdersCounts = async (req, res) => {
  try {
    // Fetch the count of products and orders
    const [productsCount, ordersCount] = await Promise.all([
      Product.count(),
      Order.count(),
    ]);
    
    res.status(200).json({ products: productsCount, orders: ordersCount });
  } catch (error) {
    console.error("Error fetching products and orders counts:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};