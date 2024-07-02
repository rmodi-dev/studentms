//importing models
const db = require("../models");
const { ProcessFeesSchedule } = require("./functions/ProcessFeesSchedule");

const Students = db.students;
const Studentfees = db.studentfees;
const Feespayment = db.feespayments;
const Classfees = db.classfees;

//define operator
const Op = db.Sequelize.Op;

// Set fees for a specific class
exports.SetClassFees = (req, res) => {
    const fees_class = req.body.fees_class.replace(/\./g, '');
    const fees_amount = parseInt(req.body.fees_amount);
    const min_fees_amount = 500000;
    let vmsg = '';

    const class_regex = /^[S][1-6]$/i;
    const fees_regex = /^\d+$/;

    if(! class_regex.test(fees_class)){
        vmsg = `Invalid class specified. Please specify one of: S1, S2, S3, S4, S5 or S6.`;
    }

    if(! (fees_regex.test(fees_amount) && (fees_amount>=min_fees_amount))){
        vmsg = vmsg+` Invalid fees amount specified. Please specify an amount no less that ${min_fees_amount}`;
    }

    if( vmsg!==""){
        res.status(400).send({ message: `${vmsg}` });
        return;
    }

    Classfees.create({ fees_class: fees_class, fees_amount: fees_amount })
    .then(data => { res.send(data) })
    .catch(err => {
        res.status(500).send({
            status: "Error",
            status_code: 101,
            message: err.message || `Error occured while setting fees for ${fees_class}`
        });
    });
}

// retreive student fees within specified amount range
exports.SearchPayments = async(req, res) => {
    const {minFee, maxFee} = req.query;
    console.log("minFee: "+minFee);
    console.log("maxFee: "+maxFee);
    Students.findAll({
        attributes: ['id', 'first_name', 'last_name'],
        include: {
            model: Studentfees,
            attributes: ['id', 'class', 'fees_amount', 'studentId'],
            where: { fees_amount: { [Op.between] : [parseInt(minFee), parseInt(maxFee)] }}
        }
    }).then(data => { res.json(data) })
    .catch(err => {
        res.status(500).send({ message: err.message || "Error while retrieving payments in specified range" });
    });
}

// Register a fees payment
exports.RegisterPayment = async(req, res) => {
    let msg = "";
    const {first_name, last_name, class : student_class, amount_paid, date_paid} = req.body;

    if (!first_name){ msg = msg + "First name is required. " }
    if (!last_name){ msg = msg + "Last name is required. " }
    if (!student_class){ msg = msg + "Class is required." }
    if (!amount_paid){ msg = msg + "Amount paid is required." }
    if (!date_paid){ msg = msg + "Date of fees payment is required." }
    if ((!first_name) && (!last_name) && (!student_class) && (!amount_paid) && (!date_paid)){ 
        msg = "No information submitted. Student's first name, last name, class, amount paid and date of payment are ALL required."
    }

    if( msg !== ""){
        res.status(400).send({ message: `${msg}` });
        return;
    }

    Students.findOne({
        attributes: ['id', 'first_name', 'last_name'],
        where: {
            first_name: { [Op.like]: `%${first_name}%`},
            last_name: { [Op.like]: `%${last_name}%`}
        },
        include: {
            model: Studentfees,
            attributes: ['id', 'class', 'fees_amount', 'studentId'],
            where: {
                class: { [Op.like]: `%${student_class}%`}
            }
        }
    }).then(data => {
        let id = null, studentfees = null, StudentFees = null, idf = null, fees_amount = null, studentId = null;
        const DataValues = data ? data.dataValues : null;
        if(DataValues !== null){
            id = data.dataValues.id;
            studentfees = data.dataValues.studentfees;
            StudentFees = {...studentfees[0]}.fees.dataValues;
            idf = StudentFees.id;
            fees_amount = StudentFees.fees_amount;
            studentId = StudentFees.studentId;
        }

        let vmsg = "";
        if(id === null){
            vmsg = `No student with details ${ last_name } ${ first_name }, ${ student_class } exists in the database. Student must be registered before accepting payments.`
        } else if((idf === null) || (fees_amount === null) || (studentId === null)){
             vmsg = `No fees amount set for ${ last_name } ${ first_name }, ${ student_class } in the system. The fees amount must be determined and registered in the system, before accepting payments from the student.`
        }

        if( vmsg !== ""){
            res.status(400).send({ message: `${vmsg}` });
            return;
        }

        const fees_payment = {
            amount_paid: amount_paid,
            date_paid: date_paid,
            studentfeeId: idf
        }

        Feespayment.create(fees_payment)
        .then( data => {
            res.send({
                status: "Success",
                status_code: 100,
                message: "School fees payment registered",
                result: {
                    first_name: first_name,
                    last_name: last_name,
                    class: student_class,
                    ...data.dataValues
                }
            })
        }).catch(err => {
            res.status(500).send({
                status: "Error",
                status_code: 1001,
                message: err.message || "Error Occurred While registering payment"
            })
        });
    })
}

// retreive student fees balances
exports.ListFeesBalances = async (req, res) => {
    Students.findAll({
        attributes: ['id', 'first_name', 'last_name', 'current_class'],
        include: {
            model: Studentfees,
            attributes: ['class', 'fees_amount'],
            include: {
                model: Feespayment,
                attributes: ['amount_paid', 'date_paid'],
            }
        }
    }).then(data => {
        const demanded_students = [];

        data.forEach(student => {
            console.log("Student: "+Object.entries(student.dataValues));

            const {id, first_name, last_name, current_class, studentfees} = student.dataValues;
            const demanded_student = {
                id: id, class: current_class, first_name: first_name, last_name: last_name, total_balance: null, fees_schedules: null,
            };
            const feesSchedules = [...studentfees];
            let total_paid = 0,  total_balance = 0; 
            let schedules_tba = [{
                fees_class: current_class, fees_amount: feesSchedules[0].dataValues.fees_amount,
                fees_balance: feesSchedules[0].dataValues.fees_amount, fees_payments: "Nil"
            }]

            feesSchedules.forEach(feesSchedule => {
                let payments_tba = [];
                const { class: fees_class, fees_amount, feespayments: fees_payments } = feesSchedule.dataValues;
                
                console.log("Fees Schedule: "+Object.entries(feesSchedule.dataValues));

                if(fees_payments){                   
                    fees_payments.forEach(fees_payment => {
                        const {amount_paid, date_paid} = fees_payment;
                        total_paid += amount_paid;
                        const payment = { fees_class: fees_class, amount_paid: amount_paid, date_paid: date_paid };
                        if(total_paid - fees_amount != 0) payments_tba.push(payment);
                    });

                    let fees_balance = fees_amount - total_paid;
                    total_balance += fees_balance;
                }

                if(payments_tba.length > 0){
                    const schedule_tba = { fees_class: fees_class, fees_amount: fees_amount, fees_balance: fees_balance, fees_payments: payments_tba };
                    schedules_tba.push(schedule_tba)
                };

                if(total_balance > 0){
                    Object.defineProperties(demanded_student, { total_balance: { value: total_balance }, fees_schedules: { value: schedules_tba } });
                    demanded_students.push(demanded_student);
                }
            })
        });

        res.send({
            status: "Success",
            status_code: 100,
            message: "School fees balances",
            result: demanded_students
        })
    }).catch(err => {
        res.status(500).send({ message: err.message || "Error while retrieving fees balances" });
    });
};

// retreive total fees and student details for pyaments within a specified date range
exports.TotalFeesInPeriod = async (req, res) => {
    const {startDate, endDate} = req.body;
    Students.findAll({
        attributes: ['id', 'first_name', 'last_name'],
        include: {
            model: Studentfees,
            attributes: ['class', 'fees_amount'],
            include: {
                model: Feespayment,
                attributes: ['amount_paid', 'date_paid'],
                where: { date_paid: { [Op.between]: [startDate, endDate] } },
            }
        }
    }).then(data => {
        const fees_payments = {};
        let grand_total = 0;
        data.forEach(student => {
            const fees_details = {};
            const {id, first_name, last_name, class: student_class, studentfees} = student;

            if (studentfees.length > 0) {
                studentfees.forEach(feesSchedule => {
                    const { total, payments } = ProcessFeesSchedule(feesSchedule.feespayments);
                    const new_fees_schedule = {
                        "class": student_class,
                        "fees_amount": feesSchedule.fees_amount,
                        "total_paid_in_searched_period": total,
                        "feespayments": payments
                    };
                    Object.assign(fees_details, new_fees_schedule);
                    grand_total += total;
                });
                const payments = {
                    "id": id,
                    "first_name": first_name,
                    "last_name": last_name,
                    "fees_schedules": { ...fees_details }
                };
                Object.assign(fees_payments, payments);
            }
        });
        res.json({
            total_paid_over_period: grand_total,
            students_details: { ...fees_payments }
        });
    }).catch(err => {
        res.status(500).send({ message: err.message || `Error while retrieving fees payments between \
            ${ startDate } and ${ endDate }.` });
    });
};