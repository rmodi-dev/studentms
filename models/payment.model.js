
module.exports =(sequelize_config, Sequelize) => {
    const payment =sequelize_config.define("student", {
        studentID:{type:Sequelize.INT, allowNull: false},
        amount:{type:Sequelize.STRING, allowNull: false},
        paidAt:{ type:Sequelize.DATE, allowNull: false}
    });
    return payment;
}