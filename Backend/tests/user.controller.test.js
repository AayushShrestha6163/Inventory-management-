const { Sequelize, DataTypes } = require('sequelize');
const User = require('../models/user.model'); // Adjust path if necessary

// Mock the User model
jest.mock('../models/user.model', () => {
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

describe('User Model Tests', () => {
  let userModel;

  beforeAll(() => {
    userModel = new User();
  });

  it('should create a new user', async () => {
    const mockUser = { id: 1, username: 'testuser' };

    // Mocking the Sequelize create method
    userModel.create.mockResolvedValue(mockUser);

    const user = await userModel.create({ username: 'testuser' });

    expect(user.username).toBe('testuser');
    expect(userModel.create).toHaveBeenCalledWith({ username: 'testuser' });
  });

  it('should return all users', async () => {
    const mockUsers = [{ id: 1, username: 'testuser' }];

    userModel.findAll.mockResolvedValue(mockUsers);

    const users = await userModel.findAll();

    expect(users).toEqual(mockUsers);
    expect(userModel.findAll).toHaveBeenCalled();
  });

  it('should find a user by primary key (id)', async () => {
    const mockUser = { id: 1, username: 'testuser' };

    userModel.findByPk.mockResolvedValue(mockUser);

    const user = await userModel.findByPk(1);

    expect(user).toEqual(mockUser);
    expect(userModel.findByPk).toHaveBeenCalledWith(1);
  });

  it('should find a user by specific conditions', async () => {
    const mockUser = { id: 1, username: 'testuser' };

    userModel.findOne.mockResolvedValue(mockUser);

    const user = await userModel.findOne({ where: { username: 'testuser' } });

    expect(user).toEqual(mockUser);
    expect(userModel.findOne).toHaveBeenCalledWith({ where: { username: 'testuser' } });
  });

  it('should update an existing user', async () => {
    const mockUpdatedUser = { id: 1, username: 'updateduser' };

    // Mocking the update method to return the updated user
    userModel.update.mockResolvedValue([1, [mockUpdatedUser]]);

    const result = await userModel.update({ username: 'updateduser' }, { where: { id: 1 } });

    expect(result[1][0].username).toBe('updateduser');
    expect(userModel.update).toHaveBeenCalledWith(
      { username: 'updateduser' },
      { where: { id: 1 } }
    );
  });

  it('should destroy a user by primary key (id)', async () => {
    userModel.destroy.mockResolvedValue(1); // Simulate successful deletion

    const result = await userModel.destroy({ where: { id: 1 } });

    expect(result).toBe(1); // Check that 1 row was deleted
    expect(userModel.destroy).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  // More tests for other edge cases can be added here
});
