import { database, Sequelize } from "./sequelize-loader";

const stock = database.define(
    'products_stocks',
    {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        stock: {
            type: Sequelize.INTEGER,
            allowNull: false
        },
        code: {
            type: Sequelize.STRING,
            allowNull: true
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false
        },
        updatedAt: {
            type: Sequelize.DATE,
            allowNull: false
        }
    },
);

stock.sync();

export { stock }
