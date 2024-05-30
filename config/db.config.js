module.exports ={
    HOST: "localhost", //hostname
    USER: "root", //username
    PASSWORD: "password1", //user password
    DB: "studentms1", //database name
    dialect: "mysql",
    pool: {
        //max no of connections in pool
        max: 5,
        //min no of connections in pool
        min: 0,
        //max time in milliseconds that the pool will try to get connections
        acquire: 30000,
        //max time in ms that a connection
        idle: 10000
    }
}