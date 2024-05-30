// import dbConfig
const dbConfig = require("../config/db.config.js");

const Sequelize = require("sequelize");
const sequelize_config = new Sequelize(
    dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD,
    {
        host: dbConfig.HOST,
        dialect: dbConfig.dialect,
        pool:{
            max: dbConfig.pool.max,
            min: dbConfig.pool.min,
            acquire: dbConfig.pool.acquire,
            idle: dbConfig.pool.idle,
        }
     }
);

sequelize_config.authenticate().then(() => {
    console.log('Connection has been established successfully.');
 }).catch((error) => {
    console.error('Unable to connect to the database: ', error);
 });

const db = {};
db.Sequelize = Sequelize;
db.sequelize_config = sequelize_config;

db.students = require("./student.model.js")(sequelize_config, Sequelize);
module.exports = db;