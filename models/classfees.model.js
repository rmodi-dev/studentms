module.exports = (sequelize_config, Sequelize) => {
    const Classfees = sequelize_config.define("classfees", {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        fees_class: { type:Sequelize.STRING, allowNull: false },
        fees_amount: { type:Sequelize.BIGINT.UNSIGNED, allowNull: false },
        status: { type:Sequelize.BOOLEAN, defaultValue: true }
    });
    return Classfees;
}