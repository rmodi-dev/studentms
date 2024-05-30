module.exports = app => {
    // importing the controller logic for the student model
const student_controller = require("../controllers/student.controller");
//IMPORTING router interface from express module
var router = require("express").Router();
// route to get all students in our database
router.get("/r", student_controller.GetAllStudents);
//defining API Root URL

router.put("/update/:id", student_controller.UpdateStudent);

//defining API Root URL
app.use('/api/students', router);

}