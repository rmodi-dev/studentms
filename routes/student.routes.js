module.exports = app => {
    //Importing the controller logic for the student model
    const student_controller = require("../controllers/student.controller");
    
    //Importing router interface from express module
    var router = require("express").Router();

    //Route to get all students in our database
    router.get("/r", student_controller.GetAllStudents);

    //Defining API Root URL
    router.put("/update/:id", student_controller.UpdateStudent);

    //Defining API Root URL
    app.use('/api/students', router);
}