//importing models
const db = require("../models");

//returning students
const Student = db.students;

//define orm
const Op = db.Sequelize.Op;

// retreive all students from the database
exports.GetAllStudents = (req, res) => {
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
exports.UpdateStudent = (req, res) => {
    const param_id = req.params.id;
    Student.update ( req.body, {
        where: {id: param_id}
    }).then(
        data => {
            if(data == 1){
                res.send({
                    status: "Success",
                    status_code: 100,
                    message: "Student updated",
                    result: data
                });
            } else {
                res.send({
                    status: "Error",
                    status_code: 101,
                    message: `Student with id ${param_id} was not found. No recorded updated`,
                    result: data
                });
            }
        }
    ).catch(err => {
        res.status(500).send({
            status: "Error",
            status_code: 101,
            message: err.message || "Error occured while updating the student"
        });
    });
}

// Find a specific student by ID (POST)
exports.GetStudentByIdPost = async(req, res) => {
    const body_id = req.body.id;
    const student_id = await Student.findByPk(body_id);

    if(student_id === null){
        res.status(400).send({ message: `There is no student with ID ${body_id} in the database.` });
        return;
    }

    Student.findByPk(body_id)
        .then( data => { res.status(200).send(data) })
        .catch(err => { res.status(500).send({ message: "Error in finding the student" }) });
}

// Create a student
exports.CreateStudent = (req, res) => {
    let msg="";

    if (!req.body.first_name){ msg = msg + "First name is required. " }
    if (!req.body.last_name){ msg = msg + "Last name is required. " }
    if (!req.body.gender){ msg = msg + "Gender is required." }
    if ((req.body.gender != 'F') && (req.body.gender != 'M')){ 
        msg = msg + "ONLY either F or M is allowed for Gender."
    }
    if ((!req.body.first_name) && (!req.body.last_name) && (!req.body.gender)){ 
        msg = "No information submitted. Student's first name, last name, and gender are ALL required."
    }

    if( msg!==""){
        res.status(400).send({
            message: `${msg}`
        });
        return;
    }

    const student_data = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        gender: req.body.gender,
        class: req.body.class,
        physical_address: req.body.physical_address,
        status: req.body.status ? req.body.status : false
    }

    Student.create(student_data).then(
        data => {
            res.send(data);
        }
    ).catch(err => {
        res.status(500).send({
            status: "Error",
            status_code: 1001,
            message: err.message || "Error occured while creating student"
        });
    });
}

// Function delete a student
exports.DeleteStudent = async(req, res) => {
    const body_id = req.body.id;
    const student_id = await Student.findByPk(body_id);

    if(student_id === null){
        const id = student_id ? student_id : body_id;
        res.status(400).send({
            message: `No student with ID ${ id } exists in the database. No record deleted.`
        });
        return;
    }

    Student.destroy({ where: { id: student_id } })
    .then(
        data => {
            if(data == 1){
                res.send({
                    status: "Success",
                    status_code: 100,
                    message: "Student Deleted",
                    result: data
                });
            }else{
                res.send({
                    status: "Error",
                    status_code: 101,
                    message: `Student with id ${param_id} was not found. No recorded deleted`,
                    result: data
                });
            }
        }
    ).catch(err => {
        res.status(500).send({
            status: "Internal Error",
            status_code: 101,
            message: err.message || "Error Occurred While deleting a student"
        });
    });
};


// Another function that deletes a student
exports.DeleteStudentSQL = async(req, res) => {
    const body_id = req.body.id;
    const student_id = await Student.findByPk(body_id);

    if(student_id === null){
        const id = student_id ? student_id : body_id;
        res.status(400).send({
            message: `No student with ID ${ id } exists in the database. No record deleted.`
        });
        return;
    }

    // Results will be an empty array and metadata will contain the number of affected rows.
    const { QueryTypes } = require('sequelize');
    const [results, metadata] = await sequelize.query(
        `DELETE FROM students WHERE id = ${student_id}`, {
            type: QueryTypes.DELETE,
          }
    );

    if(metadata == 1){
        res.send({
            status: "Success",
            status_code: 100,
            message: "Student Deleted",
            result: metadata
        });
    }else{
        res.send({
            status: "Error",
            status_code: 101,
            message: `Student with id ${param_id} was not found. No recorded deleted`,
            result: results
        });
    }
};
