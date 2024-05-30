module.exports = app => {
    //Importing the controller logic for the student model
    const student_controller = require("../controllers/student.controller");
    
    //Importing router interface from express module
    let router = require("express").Router();

    //Route to get all students in our database
    router.get("/r", student_controller.GetAllStudents);

    //Defining API Root URL
    router.put("/update/:id", student_controller.UpdateStudent);

    router.get("/findstudent", student_controller.GetStudentByIdPost);

    router.post("/create", student_controller.CreateStudent);

    router.delete("/delete", student_controller.DeleteStudent);

    //Defining API Root URL
    app.use('/api/students', router);
}