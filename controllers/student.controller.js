//importing models
const db = require("../models");

//returning students
const Student = db.students;

//define orm
const Op =db.Sequelize.Op;

// retreive all students from the database
exports.GetAllStudents = (req, res) =>{
    Student.findAll().then(
        data => {
            res.send({
                status: "Success",
                status_code: 100,
                message: "Students retreived",
                result: data
            });
         }
    ).catch(err => {
        res.status(500).send({
            status: "Error",
            status_code: 101,
            message: err.message || "Error occured while retrieving students"
        });
    });
}

// Update a specific student
exports.UpdateStudent = (req, res) =>{
    const param_id = req.params.id;
    Student.update ( req.body, {
        where: {id: param_id}
    }).then(
        data => {
            res.send({
                status: "Success",
                status_code: 100,
                message: "Students updated",
                result: data
            });
        }
    ).catch(err => {
        res.status(500).send({
            status: "Error",
            status_code: 101,
            message: err.message || "Error occured while updating a student"
        });
    });
}