const SequelizeMock = require("sequelize-mock");
const dbMock = new SequelizeMock();

// Define a mock Product model with manual validation for required fields
const ProductMock = dbMock.define('Product', {
  id: 1,
  name: 'Test Product',
  price: 100,
  stock: 10,
  userId: 1,
}, {
  hooks: {
    beforeValidate: (product) => {
      // Manually simulate Sequelize's validation for required fields
      if (!product.name || !product.price || !product.userId) {
        throw new Error('Name, price, and userId are required');
      }
    }
  }
});

describe('Product Model', () => {
  it('should create a new product', async () => {
    const product = await ProductMock.create({
      name: 'New Product',
      price: 150,
      stock: 20,
      userId: 1,
    });

    expect(product.name).toBe('New Product');
    expect(product.price).toBe(150);
    expect(product.stock).toBe(20);
    expect(product.userId).toBe(1);
  });

  it('should return product by primary key (id)', async () => {
    ProductMock.findByPk = jest.fn().mockResolvedValue({
      id: 1,
      name: 'Test Product',
      price: 100,
      stock: 10,
      userId: 1,
    });

    const product = await ProductMock.findByPk(1);
    expect(product.id).toBe(1);
    expect(product.name).toBe('Test Product');
    expect(product.price).toBe(100);
  });

  it('should find a product by specific condition (name)', async () => {
    ProductMock.findOne = jest.fn().mockResolvedValue({
      id: 1,
      name: 'Test Product',
      price: 100,
      stock: 10,
      userId: 1,
    });

    const product = await ProductMock.findOne({ where: { name: 'Test Product' } });
    expect(product.name).toBe('Test Product');
  });

  it('should update a product', async () => {
    ProductMock.update = jest.fn().mockResolvedValue([1, [{ name: 'Updated Product' }]]);

    const updatedProduct = await ProductMock.update(
      { name: 'Updated Product' },
      { where: { id: 1 } }
    );

    expect(updatedProduct[1][0].name).toBe('Updated Product');
  });

  it('should destroy a product', async () => {
    ProductMock.destroy = jest.fn().mockResolvedValue(1);

    const result = await ProductMock.destroy({ where: { id: 1 } });
    expect(result).toBe(1);
  });
});
