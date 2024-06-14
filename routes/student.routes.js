module.exports = app => {
    //Importing the controller logic for the student model
    const student_controller = require("../controllers/student.controller");
    
    //Importing router interface from express module
    let router = require("express").Router();

    //Routes
    router.get("/r", student_controller.GetAllStudents);
    router.put("/update/:id", student_controller.UpdateStudent);
    router.get("/find/:id", student_controller.GetStudentByID);
    router.post("/findbyid", student_controller.FindStudentById);
    router.post("/create", student_controller.CreateStudent);
    router.delete("/delete", student_controller.DeleteStudent);
    router.delete("/delete_student", student_controller.DeleteStudentSQL);
    router.get("/search", student_controller.SearchStudent);
    router.post("/find_by_class", student_controller.FindStudentsInClass);

    //Defining API Root URL
    app.use('/api/students', router);
}