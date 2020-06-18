const Sequelize =require('sequelize');

const sequelize = new Sequelize('postgres://postgres:0000@localhost:5432/store');

const User = sequelize.define("user", {
    id: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        type: Sequelize.INTEGER
    },
    email: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    age: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
});

const StoreItem = sequelize.define("storeItem", {
    id: {
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        type: Sequelize.INTEGER
    },
    title: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false
    },
    image: {
        type: Sequelize.STRING,
        allowNull: false
    },
    price: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
});

User.hasMany(StoreItem,{ onDelete: "cascade" });

sequelize.sync();

module.exports ={
    sequelize,
    StoreItem,
    User
};