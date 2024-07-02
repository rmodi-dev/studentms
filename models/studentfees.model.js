module.exports = (sequelize_config, Sequelize) => {
    const Studentfees = sequelize_config.define("studentfees", {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        studentId : { type: Sequelize.INTEGER, allowNull: false },
        classfeeId : { type: Sequelize.INTEGER, allowNull: false },
    });
    return Studentfees;
}