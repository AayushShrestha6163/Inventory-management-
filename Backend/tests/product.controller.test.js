const { Sequelize, DataTypes } = require('sequelize');
const Product = require('../models/product.model'); // Adjust path if necessary

// Mock the Product model
jest.mock('../models/product.model', () => {
  return jest.fn().mockImplementation(() => {
    return {
      create: jest.fn(),
      findAll: jest.fn(),
      findByPk: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      destroy: jest.fn(),
    };
  });
});

describe('Product Model Tests', () => {
  let productModel;

  beforeAll(() => {
    productModel = new Product();
  });

  it('should create a new product', async () => {
    const mockProduct = { id: 1, name: 'Product1', price: 100, stock: 10 };

    // Mocking the Sequelize create method
    productModel.create.mockResolvedValue(mockProduct);

    const product = await productModel.create({ name: 'Product1', price: 100, stock: 10 });

    expect(product.name).toBe('Product1');
    expect(product.price).toBe(100);
    expect(product.stock).toBe(10);
    expect(productModel.create).toHaveBeenCalledWith({ name: 'Product1', price: 100, stock: 10 });
  });

  it('should return all products', async () => {
    const mockProducts = [
      { id: 1, name: 'Product1', price: 100, stock: 10 },
      { id: 2, name: 'Product2', price: 150, stock: 5 },
    ];

    productModel.findAll.mockResolvedValue(mockProducts);

    const products = await productModel.findAll();

    expect(products).toEqual(mockProducts);
    expect(productModel.findAll).toHaveBeenCalled();
  });

  it('should find a product by primary key (id)', async () => {
    const mockProduct = { id: 1, name: 'Product1', price: 100, stock: 10 };

    productModel.findByPk.mockResolvedValue(mockProduct);

    const product = await productModel.findByPk(1);

    expect(product).toEqual(mockProduct);
    expect(productModel.findByPk).toHaveBeenCalledWith(1);
  });

  it('should find a product by specific conditions', async () => {
    const mockProduct = { id: 1, name: 'Product1', price: 100, stock: 10 };

    productModel.findOne.mockResolvedValue(mockProduct);

    const product = await productModel.findOne({ where: { name: 'Product1' } });

    expect(product).toEqual(mockProduct);
    expect(productModel.findOne).toHaveBeenCalledWith({ where: { name: 'Product1' } });
  });

  it('should update an existing product', async () => {
    const mockUpdatedProduct = { id: 1, name: 'Updated Product', price: 120, stock: 8 };

    // Mocking the update method to return the updated product
    productModel.update.mockResolvedValue([1, [mockUpdatedProduct]]);

    const result = await productModel.update({ name: 'Updated Product', price: 120, stock: 8 }, { where: { id: 1 } });

    expect(result[1][0].name).toBe('Updated Product');
    expect(result[1][0].price).toBe(120);
    expect(result[1][0].stock).toBe(8);
    expect(productModel.update).toHaveBeenCalledWith(
      { name: 'Updated Product', price: 120, stock: 8 },
      { where: { id: 1 } }
    );
  });

  it('should destroy a product by primary key (id)', async () => {
    productModel.destroy.mockResolvedValue(1); // Simulate successful deletion

    const result = await productModel.destroy({ where: { id: 1 } });

    expect(result).toBe(1); // Check that 1 row was deleted
    expect(productModel.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  // More tests for other edge cases can be added here
});
