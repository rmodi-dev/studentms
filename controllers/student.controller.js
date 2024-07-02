//importing models and modules
const db = require("../models");

//returning students
const Students = db.students;
const Studentfees = db.studentfees;
const Classfees = db.classfees;
const Feespayments = db.feespayments;

const Op = db.Sequelize.Op; //Operator to be used

// retreive all students from the database
exports.GetAllStudents = (req, res) => {
    Students.findAll().then(data => {
        res.send({
            status: "Success",
            status_code: 100,
            message: "Students retreived",
            result: data
        });
    }).catch(err => {
        res.status(500).send({
            status: "Error",
            status_code: 101,
            message: err.message || "Error occured while retrieving students"
        });
    });
}

// Update a specific student
exports.UpdateStudent = async(req, res) => {
    const param_id = req.params.id;
    console.log("Starting with: ", param_id);
    const found_student = await Students.findByPk(param_id, {
        attributes: ['id', 'first_name', 'last_name', 'gender', 'current_class', 'physical_address'],
        include: {
            model: Studentfees, attributes: ['id', 'studentId', 'classfeeId'],
            include: {
                model: Classfees, attributes: ['id', 'fees_class', 'fees_amount', 'status'],
                include: {
                    model: Feespayments, attributes: ['id', 'studentfeeId', 'amount_paid', 'date_paid'],
                }
            }
        }
    });

    console.log("Proceeding... ");

    if(found_student === null){
        res.status(400).send({ message: `No student student with id ${ param_id }` });
        return;
    }

    console.log("found_student dataValues: ", found_student.dataValues);

    // const {id, first_name, last_name, gender, current_class, physical_address} = found_student.dataValues;
    // const fees_schedules = [];
    // const fees_schedule = {};
    // found_student.dataValues.studentfees.forEach(feesSchedule => {
    //     const fees_schedule = {
    //         "id": feesSchedule.id,
    //         "class": feesSchedule.class,
    //         "fees_amount": feesSchedule.fees_amount,
    //         "studentId": feesSchedule.studentId
    //     };
    //     fees_schedules.push(fees_schedule)
    // });

    // Object.assign(fees_schedule, ArraySort(fees_schedules[0]));
    // const {id:fees_schedule_id, class: old_class, fees_amount} = fees_schedule;
    // const {first_name:new_first_name, last_name:new_last_name, gender:new_gender, current_class:new_class,
    //     school_fees:new_fees, physical_address:new_physical_address} = req.body;
    
    // if((first_name === new_first_name) && (last_name === new_last_name) && (gender === new_gender)
    //     && (current_class === new_class) && (fees_amount === new_fees) && (physical_address === new_physical_address)){
    //     res.status(400).send({ message: `Nothing to update.` });
    //     return;
    // }

    // if((new_class === old_class) && (fees_amount !== new_fees)){
    //     res.status(400).send({ message: `School fees should not change once set for a given class.` });
    //     return;
    // }

    // if((old_class !== new_class) && (fees_amount === new_fees)){
    //     res.status(400).send({ message: `Please set fees for new class ${ new_class }` });
    //     return;
    // }

    // let update_data = 0;
    // let umsg = "";
    // Students.update(req.body, { where: {id: id} })
    // .then(async data => {
    //     update_data = data;
    //     if(old_class !== new_class){
    //         try{
    //             await Studentfees.create({ studentId: id, class: new_class, fees_amount: new_fees });
    //             umsg = `Fees schedule for ${ new_class } created.`;
    //         } catch(err){
    //             res.status(500).send({
    //                 status: "Error",
    //                 status_code: 1001,
    //                 message: err.message || `Error Occurred while creating a new fees schedule for ${ first_name } ${ last_name }`
    //             });
    //         }
    //     }else{
    //         try{
    //             await Studentfees.update({ fees_amount: new_fees }, { where: { id: fees_schedule_id}});
    //         } catch(err){
    //             res.status(500).send({
    //                 status: "Error",
    //                 status_code: 1001,
    //                 message: err.message || `Error Occurred while updating fees schedule for ${ first_name } ${ last_name }`
    //             });
    //         }
    //     }
    // }).then(() => {
    //     if(update_data == 1){
    //         res.send({
    //             status: "Success",
    //             status_code: 100,
    //             message: (umsg !== "") ? "Student Updated. "+umsg : "Student Updated"
    //         });
    //     }else{
    //         res.send({
    //             status: "Error",
    //             status_code: 101,
    //             message: `Student with id ${ param_id } was not found. No recorded updated`,
    //             result: update_data
    //         });
    //     }
    //  })
    // .catch(err => {
    //     res.status(500).send({
    //         status: "Error",
    //         status_code: 1001,
    //         message: err.message || `Error Occurred while updating student ${ first_name } ${ last_name }`
    //     });
    // });

    return;
}

// Find Student by ID
exports.GetStudentByID = async(req, res) => {
    const param_id = req.params.id;
    const student_id = await Students.findByPk(param_id);

    if(student_id === null){
        res.status(400).send({ message: `No student student with id ${param_id}` });
        return;
    }

    Students.findByPk(param_id)
    .then( data => { res.status(200).send(data) })
    .catch(err => { res.status(500).send({ message:  err.message || "Error in finding a student" }) });
}

// Find a specific student by ID (POST)
exports.FindStudentById = async(req, res) => {
    const body_id = req.body.id;
    const found_student = await Students.findByPk(body_id);

    if(found_student === null){
        res.status(400).send({ message: `Error retrieving student with ID ${ body_id }.` });
        return;
    }

    Students.findByPk(body_id)
    .then(data => { res.status(200).send(data) })
    .catch(err => { res.status(500).send({  message: err.message || "Error in finding a student" }) });
}

// Create a student
exports.CreateStudent = async(req, res) => {
    const {first_name, last_name, current_class, gender, physical_address, status} = req.body;
    let msg = "";

    if (!first_name){ msg = msg + "First name is required. " }
    if (!last_name){ msg = msg + "Last name is required. " }
    if (!current_class){ msg = msg + "Class is required. " }
    if (!gender){ msg = msg + "Gender is required." }
    if ((gender != 'F') && (gender != 'M')){ 
        msg = msg + "ONLY either F or M is allowed for Gender."
    }
    if ((!first_name) && (!last_name) && (!current_class) && (!gender)){ 
        msg = "No information submitted. Student's first name, last name, class, and gender are ALL required."
    }

    if(msg !== ""){
        res.status(400).send({ message: `${msg}` });
        return;
    }

    Classfees.findAll({
        attributes: ['id', 'fees_amount'],
        where: { fees_class: current_class, status: true }
    })
    .then( fees_data => {
        if(fees_data.length < 1){
            res.status(400).send({ message: `No fees set for ${current_class}. Fees must be set for a given class before resgistering any student.` });
            return;
        }

        const {id, fees_amount} = fees_data[0].dataValues;
        const student_data = {
            first_name: first_name,
            last_name: last_name,
            gender: gender,
            current_class: current_class,
            physical_address: physical_address,
            fees_amount: fees_amount
        }

        Students.create(student_data)
        .then(async data => {
            const student = {
                studentId: data.id,
                first_name: first_name,
                last_name: last_name,
                gender: gender,
                current_class: current_class,
                physical_address: physical_address,
                status: status,
                fees_amount: fees_amount
            }
            await Studentfees.create({ studentId: data.id, classfeeId: id });
            res.send({
                status: "Success",
                status_code: 100,
                message: "Student sucessfully created",
                result: student
            })
        })
    })
    .catch(err => {
        res.status(500).send({
            status: "Error",
            status_code: 1001,
            message: err.message || "Error occurred while creating student"
        });
    });
}

// Function delete a student
exports.DeleteStudent = async(req, res) => {
    const found_student = await Students.findByPk(req.body.id);

    if(found_student === null){
        res.status(400).send({ message: `No student with ID ${ req.body.id } in the database. No record deleted.` } );
        return;
    }
    const student_id = found_student.dataValues.id;

    Students.destroy({ where: { id: student_id } })
    .then(data => {
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
                message: `Student with id ${ req.body.id } was not found. No recorded deleted`,
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
    let condition = first_name ? { first_name: { [Op.like]: `%${first_name}%` }} : null;

    Students.findAll({ where: condition })
    .then(data => { res.send(data) })
    .catch(err => { res.status(500).send({ message: err.message || "Error while searching a student" }) });
}

// Deletes a student, uses SQL
exports.DeleteStudentSQL = async(req, res) => {
    const found_student = await Students.findByPk(req.body.id);

    if(found_student === null){
        res.status(400).send({ message: `No student with ID ${ req.body.id } exists in the database.` });
        return;
    }

    const student_id = found_student.dataValues.id;

    const Sequelize_config = db.sequelize_config;

    // Raw MySQL query
    const sqlQuery = `DELETE FROM students WHERE id = :student_id`;

    try {
        // For MySQL, "affectedRows" will contain the number of affected rows.
        const [affectedRows] = await Sequelize_config.query(sqlQuery, { replacements: { student_id } });
        res.send({
            status: "Success",
            status_code: 100,
            message: "Student Deleted",
            result: affectedRows
        });
    } catch (error) {
        res.status(500).send({
            status: "Error",
            status_code: 500,
            message: "Failed to delete student",
            error: error.message
        });
    }
};

// retreive all students in a specific class
exports.FindStudentsInClass = (req, res) => {
    const StudentClass = req.body.student_class.replace(/\./g, '');
    let vmsg = '';

    const regex = /^[S][1-6]$/i;

    if(! regex.test(StudentClass)){
        vmsg = `Invalid class specified. Please specify one of: S1, S2, S3, S4, S5 or S6.`;
    }

    if( vmsg!==""){
        res.status(400).send({ message: `${vmsg}` });
        return;
    }

    Students.findAll({
        attributes: ['first_name', 'last_name', 'current_class'],
        where: { current_class: { [Op.like]: `%${StudentClass}%` }},
    })
    .then(data => { res.send(data) })
    .catch(err => {
        res.status(500).send({
            status: "Error",
            status_code: 101,
            message: err.message || "Error occured while retrieving students"
        });
    });
}
