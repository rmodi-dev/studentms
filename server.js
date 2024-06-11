// for building rest APIs
const express = require("express");

// helps to parse the reques and creatr the req.body object
const bodyParser = require("body-parser");
const morgan = require('morgan'); //Logging API CRUD operations

const app = express();
const PORT = 8080; // setting port number for the backend

app.use(bodyParser.json()); // Parse requests of content-type -application/json
app.use(bodyParser.urlencoded({ extended: true})); //parse requests of content type - application/x-www-form
app.use(morgan('dev'));
app.use(express.json());

//import models
const db = require("./models"); 
// import routes
require("./routes/student.routes")(app);
require("./routes/payment.routes")(app);


db.sequelize_config.sync( {force: false} ).then(()=>{ console.log("DB re-synched") }); //synchronise or purge the database

app.get("/",(req, res) => { res.json({message: "welcome to student ms"}) }); //Main route

app.listen(PORT, () => { console.log(`server has started on port ${PORT}`); });