// import modules
// for building rest APIs
const express = require("express");
// helps to parse the reques and creatr the req.body object
const bodyParser = require("body-parser");
const morgan = require('morgan'); //Logging API CRUD operations

const app = express()

// Parse requests of content-type -application/json
app.use(bodyParser.json());
//parse requests of content type - application/x-www-form
app.use(bodyParser.urlencoded({ extended: true}));

app.use(morgan('dev'));

//importing models
const db = require("./models");

//synchronise or purge the database
//db.sequelize_config.sync( {force: true} ).then(()=>{ console.log("DB re-synched") });

//Main route
app.get("/",(req, res) => { res.json({message: "welcome to student ms"}) });

//bussiness logic
app.post("/sum", (req, res) => {
    const number1 = parseInt(req.body.number_1);
    const number2 = parseInt(req.body.number_2);

    res.json({result:`sum is ${number1 + number2}`});
});

// import routes
require("./routes/student.routes")(app);

// setting port number for the backend
const PORT = 8080;

app.listen(
     PORT, () => {
        console.log(`server has started on port ${PORT}`);
    }
);
