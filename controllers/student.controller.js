//importing models and modules
const db = require("../models");

//returning students
const Student = db.students;
const Studentfees = db.studentfees;

const Op = db.Sequelize.Op; //Operator to be used

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
    Student.update( req.body, {  where: {id: param_id} })
    .then( data => {
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
    })
    .catch(err => {
        res.status(500).send({
            status: "Error",
            status_code: 101,
            message: err.message || "Error occured while updating the student"
        });
    });
}

// Find Student by ID
exports.GetStudentByID = async(req, res) => {
    const param_id = req.params.id;
    const student_id = await Student.findByPk(param_id);
    console.log("Reached");

    if(student_id === null){
        res.status(400).send({ message: `No student student with id ${param_id}` });
        return;
    }

    Student.findByPk(param_id)
    .then( data => {  res.send(data); })
    .catch(err => {
        res.status(500).send({ message:  err.message || "Error in finding a student" });
    });

}

// Find a specific student by ID (POST)
exports.FindStudentById = async(req, res) => {
    const body_id = req.body.sid;
    const student_id = await Student.findByPk(body_id);

    if(student_id === null){
        res.status(400).send({
            message: "Error retrieving student with id"
        });
        return;
    }

    Student.findByPk(body_id)
        .then( data => {
                res.status(200).send(data);
        })
        .catch(err => {
            res.status(500).send({
                message: "Error in finding a student"
            });
        });
}

// Create a student
exports.CreateStudent = async(req, res) => {
    const { first_name, last_name, class: student_class, gender,
         physical_address, school_fees, status } = req.body;
    let msg="";

    if (!first_name){ msg = msg + "First name is required. " }
    if (!last_name){ msg = msg + "Last name is required. " }
    if (!gender){ msg = msg + "Gender is required." }
    if ((gender != 'F') && (gender != 'M')){ 
        msg = msg + "ONLY either F or M is allowed for Gender."
    }
    if (!school_fees){ msg = msg + "School fees is required." }
    if ((!first_name) && (!last_name) && (!gender) && (!school_fees)){ 
        msg = "No information submitted. Student's first name, last name, \
        gender and school fees are ALL required."
    }

    if( msg!==""){
        res.status(400).send({ message: `${msg}` });
        return;
    }

    const student_data = {
        first_name: first_name,
        last_name: last_name,
        gender: gender,
        class: student_class,
        physical_address: physical_address,
        status: status ? status : false
    }

    Student.create(student_data)
        .then(async data => {
            await Studentfees.create({studentId: data.id, fees_amount: school_fees });
            res.send({...data.dataValues, fees_amount: school_fees});
        }
    ).catch(err => {
        res.status(500).send({
            status: "Error",
            status_code: 1001,
            message: err.message || "Error Occurred While creating students"
        });
    });
}

// Function delete a student
exports.DeleteStudent = async(req, res) => {
    const found_student = await Student.findByPk(req.body.id);

    if(found_student === null){
        res.status(400).send({
            message: `No student with ID ${ req.body.id } exists in the database. No record deleted.`
        });
        return;
    }
    const student_id = found_student.dataValues.id;

    Student.destroy({ where: { id: student_id } })
    .then( data => {
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
                message: `Student with id ${req.body.id} was not found. No recorded deleted`,
                result: data
            });
        }
    }).catch(err => {
        res.status(500).send({ message: err.message });
    });
};

// Search Students by first name
exports.SearchStudent = async(req, res) => {
    const first_name = req.query.first_name;
    let condition = first_name ? { first_name: { [Op.like]: `%${first_name}%` } } : null;

    Student.findAll({where: condition})
    .then(data => {  res.send(data) })
    .catch(err => {
        res.status(500).send({ message: err.message || "Error while searching a student" })
    });
}

// Deletes a student, uses SQL
exports.DeleteStudentSQL = async(req, res) => {
    const found_student = await Student.findByPk(req.body.id);

    if(found_student === null){
        res.status(400).send({
            message: `No student with ID ${ req.body.id } exists in the database. No record deleted.`
        });
        return;
    }
    const student_id = found_student.dataValues.id;

    try {

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
                message: `Student with id ${req.body.id} was not found. No recorded deleted`,
                result: results
            });
        }
    } catch(error) {
        console.error("Error deleting student:", error);
        res.status(500).send({
            message: error
        });
    }
};

// retreive all students in a specific class
exports.FindStudentsInClass = (req, res) => {
    const StudentClass = req.body.student_class;
    let vmsg='';

    if(StudentClass === null){
        vmsg = `No class, or invalid class specified. Please specify one of: S1, S2, S3, S4, S5 or S6.`;
    }

    if( vmsg!==""){
        res.status(400).send({ message: `${vmsg}` });
        return;
    }

    Student.findAll({
        attributes: ['first_name', 'last_name', 'class'],
        where: { class: { [Op.like]: `%${StudentClass}%` }}
    })
    .then(data => {  res.send(data) })
    .catch(err => {
        res.status(500).send({
            status: "Error",
            status_code: 101,
            message: err.message || "Error occured while retrieving students"
        });
    });
}
