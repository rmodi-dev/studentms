module.exports = (sequelize_config, Sequelize) => {
    const Feespayments = sequelize_config.define("feespayments", {
        amount_paid:{ type:Sequelize.BIGINT.UNSIGNED, allowNull: false },
        date_paid:{ type:Sequelize.DATE, allowNull: false }
    });
    return Feespayments;
}