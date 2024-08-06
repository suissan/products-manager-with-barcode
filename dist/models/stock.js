"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stock = void 0;
const sequelize_loader_1 = require("./sequelize-loader");
const stock = sequelize_loader_1.database.define('products_stocks', {
    id: {
        type: sequelize_loader_1.Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: sequelize_loader_1.Sequelize.STRING,
        allowNull: false
    },
    stock: {
        type: sequelize_loader_1.Sequelize.INTEGER,
        allowNull: false
    },
    code: {
        type: sequelize_loader_1.Sequelize.STRING,
        allowNull: true
    },
    createdAt: {
        type: sequelize_loader_1.Sequelize.DATE,
        allowNull: false
    },
    updatedAt: {
        type: sequelize_loader_1.Sequelize.DATE,
        allowNull: false
    }
});
exports.stock = stock;
stock.sync();
