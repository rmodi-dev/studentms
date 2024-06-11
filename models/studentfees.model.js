module.exports = (sequelize_config, Sequelize) => {
//    const _Student = require("./student.model");
    const Studentfees = sequelize_config.define("studentfees", {
        fees_amount:{ type:Sequelize.BIGINT.UNSIGNED, allowNull: false }
    });
    return Studentfees;
}