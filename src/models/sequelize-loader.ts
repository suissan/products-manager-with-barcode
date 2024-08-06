import * as Sequelize from 'sequelize';

 // SequelizeとしてインポートしたもののSequelizeメソッド
const sqlZ = Sequelize.Sequelize;

require("dotenv").config();

// データベースのURL
const database = new sqlZ(
    process.env.DATABASE_URL || 'postgres://suimox7:postgres@localhost/base'
)

export { database, sqlZ, Sequelize }
