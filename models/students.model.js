module.exports = (sequelize_config, Sequelize) => {
    const Students = sequelize_config.define( "students", {
        id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
        first_name: { type:Sequelize.STRING, allowNull: false },
        last_name: { type:Sequelize.STRING, allowNull: false },
        gender: { type:Sequelize.ENUM('M','F'), allowNull: false },
        current_class: { type:Sequelize.STRING, allowNull: false },
        physical_address: { type:Sequelize.STRING, defaultValue: 'Bwaise' },
        status: { type:Sequelize.BOOLEAN, defaultValue: true },
    });
    return Students;
}