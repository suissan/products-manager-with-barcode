// models/Stock.ts
import {
    Model,
    DataTypes,
    CreationOptional,
    InferAttributes,
    InferCreationAttributes,
  } from 'sequelize';
  import { database } from './sequelize-loader';
  
  class Stock extends Model<
    InferAttributes<Stock>,
    InferCreationAttributes<Stock>
  > {
    declare id: CreationOptional<number>;
    declare name: string;
    declare stock: number;
    declare code: string | null;
    declare createdAt: CreationOptional<Date>;
    declare updatedAt: CreationOptional<Date>;
  }
  
  Stock.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize: database,
      tableName: 'products_stocks',
      timestamps: true,
    }
  );
  
  export { Stock };
  