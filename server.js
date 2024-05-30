// import modules
// for building rest APIs
const express = require("express");
// helps to parse the reques and creatr the req.body object
const bodyParser = require("body-parser");
const morgan = require('morgan'); //Loggings

const app =express()
// Parse requests of content-type -application/json
app.use(bodyParser.json());
//importing models
const db = require("./models");
//synchronising the database
db.sequelize_config.sync();
//parse requests of content type - application/x-www-form
app.use(bodyParser.urlencoded({ extended: true}));
app.use(morgan('dev'));
// setting port number for the backend
//simple route
app.get("/",(req, res)=>{
    res.json({message: "welcome to student ms"});
});
//bussiness logic
app.post("/sum", (req, res) =>{
    const number1 = parseInt(req.body.number_1);
    const number2 = parseInt(req.body.number_2);

    res.json({result:`sum is ${number1 + number2}`});
});
//import routes
require("./routes/student.routes")(app);
const PORT = 8080;

app.listen(

    PORT, ()=>{
        console.log(`server has started on port ${PORT}`);
    });
