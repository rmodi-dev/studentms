
module.exports =(sequelize_config, Sequelize) => {
    const student =sequelize_config.define("student", {
        first_name:{type:Sequelize.STRING},
        last_name:{type:Sequelize.STRING},
        gender:{type:Sequelize.STRING},
        class:{type:Sequelize.STRING},
        physical_address:{type:Sequelize.STRING},
        status:{type:Sequelize.BOOLEAN},
        
    });

    return student;
}