const dbConfig = require("../config/db.config.js"); // import DB Config

const Sequelize = require("sequelize");
const sequelize_config = new Sequelize(
    dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD,{
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
}).catch( (error) => {
    console.error('Unable to connect to the database: ', error);
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize_config = sequelize_config;

db.students = require("./students.model.js")(sequelize_config, Sequelize);
db.studentfees = require("./studentfees.model.js")(sequelize_config, Sequelize);
db.feespayments = require("./feespayments.model.js")(sequelize_config, Sequelize);
db.classfees = require("./classfees.model.js")(sequelize_config, Sequelize);

db.studentfees.belongsTo(db.classfees, { foreignKey: 'classfeeId' });
db.classfees.hasMany(db.studentfees, { foreignKey: 'classfeeId' });

db.feespayments.belongsTo(db.studentfees, { foreignKey: 'studentfeeId' });
db.studentfees.hasMany(db.feespayments, { foreignKey: 'studentfeeId' });

db.studentfees.belongsTo(db.students, { foreignKey: 'studentId' });
db.students.hasMany(db.studentfees, { foreignKey: 'studentId' });

db.feespayments.belongsTo(db.students, { foreignKey: 'studentId' });
db.students.hasMany(db.feespayments, { foreignKey: 'studentId' });

db.feespayments.belongsTo(db.classfees, { through: (db.studentfees, { as: 'studentfees' }) });
db.classfees.hasOne(db.feespayments, { through: (db.studentfees, { as: 'studentfees' }) });

module.exports = db;