"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Stock = void 0;
// models/Stock.ts
const sequelize_1 = require("sequelize");
const sequelize_loader_1 = require("./sequelize-loader");
class Stock extends sequelize_1.Model {
}
exports.Stock = Stock;
Stock.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    stock: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
    },
    code: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
    },
}, {
    sequelize: sequelize_loader_1.database,
    tableName: 'products_stocks',
    timestamps: true,
});
