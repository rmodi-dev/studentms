module.exports = (sequelize_config, Sequelize) => {
    const Feespayments = sequelize_config.define( "feespayments", {
        id: { type: Sequelize.INTEGER, allowNull: false, primaryKey: true },
        studentId : { type: Sequelize.INTEGER, allowNull: false, foreignKey: true },
        studentfeeId : { type: Sequelize.INTEGER, allowNull: false, foreignKey: true },
        amount_paid: { type:Sequelize.BIGINT.UNSIGNED, allowNull: false },
        date_paid: { type:Sequelize.DATE, allowNull: false },
        
    });
    return Feespayments;
}