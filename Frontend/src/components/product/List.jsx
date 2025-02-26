import React, { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
<style>
{`
  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0; }
    100% { opacity: 1; }
  }
`}
</style>
const ProductListPage = () => {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: 0,
    image: null, // To hold the selected image
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); 
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);

  const token = localStorage.getItem('token');

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-access-token': token,
        },
      });

      const data = await response.json();
      if (Array.isArray(data)) {
        setProducts(data);
      } else {
        console.error('Error fetching products:', data);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setNewProduct(prev => ({
      ...prev,
      image: file,
    }));
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
  
    // Check if name and price are provided
    if (!newProduct.name || !newProduct.price) {
      toast.error("Product name and price are required");
      return;
    }
  
    // Prepare FormData object for sending the data
    const formData = new FormData();
    formData.append("name", newProduct.name);
    formData.append("description", newProduct.description);
    formData.append("price", newProduct.price);
    formData.append("stock", newProduct.stock);
  
    // Append the image if provided
    if (newProduct.image) {
      formData.append("image", newProduct.image); // Binary data will be handled automatically
    }
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/products`, {
        method: "POST",
        headers: {
          "x-access-token": token, // Send the token as part of the request header
        },
        body: formData, // The FormData automatically handles image encoding and multipart data
      });
  
      if (response.ok) {
        toast.success("Product added successfully!");
        setNewProduct({
          name: "",
          description: "",
          price: "",
          stock: 0,
          image: null, // Reset image after adding product
        });
        setModalOpen(false); // Close the modal
        fetchProducts(); // Refresh the product list
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Error adding product");
      }
    } catch (error) {
      console.error("Error adding product:", error);
      toast.error("Error adding product");
    }
  };
  

  const handleEditProduct = async (e) => {
    e.preventDefault();
  
    if (!newProduct.name || !newProduct.price || !newProduct.stock) {
      toast.error('Please fill all required fields!');
      return;
    }
  
    // Prepare FormData object
    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('description', newProduct.description);
    formData.append('price', newProduct.price);
    formData.append('stock', newProduct.stock);
    if (newProduct.image) formData.append('image', newProduct.image); // Append image if exists
  
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/products/${editProduct.id}`, {
        method: 'PUT',
        headers: {
          'x-access-token': token, // Pass the token for authentication
          // Do not set Content-Type here when sending FormData
        },
        body: formData, // Send FormData with file and other data
      });
  
      if (response.ok) {
        toast.success('Product updated successfully!');
        setNewProduct({ name: '', description: '', price: '', stock: 0, image: null });
        setModalOpen(false);
        setEditProduct(null);
        fetchProducts();
      } else {
        toast.error('Error editing product');
      }
    } catch (error) {
      console.error('Error editing product:', error);
      toast.error('Error editing product');
    }
  };
  


  const handleDeleteProduct = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/products/${productToDelete}`, {
        method: 'DELETE',
        headers: {
          'x-access-token': token,
        },
      });

      if (response.ok) {
        toast.success('Product deleted successfully!');
        setConfirmationModalOpen(false);
        setProductToDelete(null);
        fetchProducts();
      } else {
        toast.error('Error deleting product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Error deleting product');
    }
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Products</h1>
      </header>
      <div className="dashboard-content">
        <button onClick={() => setModalOpen(true)} className="add-button">Add New Product</button>
        {modalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>{editProduct ? 'Edit Product' : 'Add Product'}</h2>
              <form onSubmit={editProduct ? handleEditProduct : handleAddProduct}>
                <input
                  type="text"
                  name="name"
                  placeholder="Product Name"
                  value={newProduct.name}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={newProduct.description}
                  onChange={handleInputChange}
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={newProduct.price}
                  onChange={handleInputChange}
                />
                <input
                  type="number"
                  name="stock"
                  placeholder="Stock"
                  value={newProduct.stock}
                  onChange={handleInputChange}
                  required
                />
                {/* Image upload field */}
                <input
                  type="file"
                  name="image"
                  onChange={handleImageChange}
                />
                <button type="submit">{editProduct ? 'Update Product' : 'Add Product'}</button>
                <button type="button" onClick={() => setModalOpen(false)}>Cancel</button>
              </form>
            </div>
          </div>
        )}

        {/* Table to display the list of products */}
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Image</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.description}</td>
                <td>NRs.{product.price}</td>
                <td>{product.stock}   {product.stock <= 2 && <span style={{ color: 'red', fontWeight: 'bold', marginLeft: '5px',  animation: 'blink 1s infinite' }}>Stock Low</span>}
                </td>
                <td>
                  <img
                    src={`${process.env.REACT_APP_APP_API_URL}/${product.image}`}
                    alt={product.name}
                    style={{ width: "50px", height: "50px" }}
                  />
                </td>
                <td>
                  <button onClick={() => {
                    setEditProduct(product);
                    setNewProduct({
                      name: product.name,
                      description: product.description,
                      price: product.price,
                      stock: product.stock,
                      image: null, // Reset image for editing
                    });
                    setModalOpen(true);
                  }}>Edit</button>
                  <button onClick={() => {
                    setProductToDelete(product.id);
                    setConfirmationModalOpen(true);
                  }}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Confirmation Modal */}
        {confirmationModalOpen && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Are you sure you want to delete this product?</h2>
              <button onClick={handleDeleteProduct}>Yes, Delete</button>
              <button onClick={() => setConfirmationModalOpen(false)}>Cancel</button>
            </div>
          </div>
        )}
      </div>
      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
};

export default ProductListPage;
