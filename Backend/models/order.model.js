module.exports = (sequelize, Sequelize) => {
const Order = sequelize.define("orders", {
    userId: {
        type: Sequelize.INTEGER
    },
    cart: {
        type: Sequelize.JSON
    },
    shippingAddress: {
        type: Sequelize.STRING
    },
    paymentInfo: {
        type: Sequelize.JSON
    },
    total: {
        type: Sequelize.DOUBLE
    },
    status: {
        type: Sequelize.STRING,
        defaultValue: "pending"
    },
    orderDate: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }

});

Order.associate = (models) => {
    Order.belongsTo(models.User, {
        foreignKey: "userId"
    });
};
return Order;
};
