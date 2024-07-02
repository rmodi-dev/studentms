module.exports = {
    HOST: "localhost", //hostname
    USER: "root", //username
    PASSWORD: "password1", //user password
    DB: "studentms1", //database name
    dialect: "mysql",
    pool: {        
        max: 5, //max no of connections in pool        
        min: 0, //min no of connections in pool
        acquire: 30000, //max time the pool will try to get connections
        idle: 10000 //max time in ms that a connection
    }
}