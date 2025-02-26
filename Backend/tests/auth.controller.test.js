const SequelizeMock = require("sequelize-mock");
const dbMock = new SequelizeMock();

// Define a mock User model with manual validation for required fields
const UserMock = dbMock.define('User', {
  id: 1,
  username: 'testuser',
  email: 'test@example.com',
  password: 'hashedpassword',
}, {
  hooks: {
    beforeValidate: (user) => {
      // Manually simulate Sequelize's validation for required fields
      if (!user.username || !user.email) {
        throw new Error('Username and email are required');
      }
    }
  }
});

describe('User Model', () => {
  it('should create a new user', async () => {
    const user = await UserMock.create({
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'newhashedpassword',
    });

    expect(user.username).toBe('newuser');
    expect(user.email).toBe('newuser@example.com');
    expect(user.password).toBe('newhashedpassword');
  });



  it('should return user by primary key (id)', async () => {
    UserMock.findByPk = jest.fn().mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
    });

    const user = await UserMock.findByPk(1);
    expect(user.id).toBe(1);
    expect(user.username).toBe('testuser');
  });

  it('should find a user by specific condition (email)', async () => {
    UserMock.findOne = jest.fn().mockResolvedValue({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      password: 'hashedpassword',
    });

    const user = await UserMock.findOne({ where: { email: 'test@example.com' } });
    expect(user.email).toBe('test@example.com');
  });

  it('should update a user', async () => {
    UserMock.update = jest.fn().mockResolvedValue([1, [{ username: 'updateduser' }]]);

    const updatedUser = await UserMock.update(
      { username: 'updateduser' },
      { where: { id: 1 } }
    );

    expect(updatedUser[1][0].username).toBe('updateduser');
  });

  it('should destroy a user', async () => {
    UserMock.destroy = jest.fn().mockResolvedValue(1);

    const result = await UserMock.destroy({ where: { id: 1 } });
    expect(result).toBe(1);
  });
});
