//importing models
const db = require("../models");

const Student = db.students;
const Studentfees = db.studentfees;
const Feespayment = db.feespayments;

//define operator
//const { Op } = require("sequelize");
const Op = db.Sequelize.Op;

// retreive student fees within specified amount range
exports.SearchPayments = async(req, res) => {
    const { minFee, maxFee } = req.query;
    Student.findAll({
        attributes: ['id', 'first_name', 'last_name', 'class'],
        include: {
            model: Studentfees,
            attributes: ['id', 'fees_amount', 'studentId'],
            where: { fees_amount: { [Op.between] : [parseInt(minFee), parseInt(maxFee)] }}
        }
    })
    .then(data => { res.json(data); })
    .catch(err => {
        res.status(500).send({ message: err.message || "Error while retrieving payments in specified range" });
    });
}

// Register a fees payment
exports.RegisterPayment = async(req, res) => {
    let msg="";

    if (!req.body.first_name){ msg = msg + "First name is required. " }
    if (!req.body.last_name){ msg = msg + "Last name is required. " }
    if (!req.body.class){ msg = msg + "Class is required." }
    if (!req.body.amount_paid){ msg = msg + "Amount paid is required." }
    if (!req.body.date_paid){ msg = msg + "Date of fees payment is required." }
    if ((!req.body.first_name) && (!req.body.last_name) && (!req.body.class)
        && (!req.body.amount_paid) && (!req.body.date_paid)){ 
        msg = "No information submitted. Student's first name, last name, class\
         amount paid and date of payment are ALL required."
    }

    if( msg!==""){
        res.status(400).send({
            message: `${msg}`
        });
        return;
    }

    Student.findOne({
        attributes: ['id', 'first_name', 'last_name', 'class'],
        where: {
            first_name: { [Op.like]: `%${req.body.first_name}%`},
            last_name: { [Op.like]: `%${req.body.last_name}%`},
            class: { [Op.like]: `%${req.body.class}%`}
        },
        include: {
            model: Studentfees,
            attributes: ['id', 'fees_amount', 'studentId'],
        }
    })
    .then(data => {
        const fees={...data.dataValues.studentfees[0]};

        let vmsg='';

        if(data.dataValues.id === null){ vmsg = `No student with details ${ req.body.last_name }\
            ${ req.first_name.last_name }, ${ req.body.class } exists in the databse. \
            Student must be registered before accepting payments.` }
        else if((fees.dataValues.id === null) || (fees.dataValues.fees_amount === null)
            || (fees.dataValues.studentId === null)){
             vmsg = `No fees amount set for ${ req.body.last_name } ${ req.first_name.last_name }, \
             ${ req.body.class } in the system. The fees amount must be determined and registered in the \
             system, before accepting payments from the student.`
        }

        if( vmsg!==""){
            res.status(400).send({ message: `${vmsg}` });
            return;
        }

        const fees_payment = {
            amount_paid: req.body.amount_paid,
            date_paid: req.body.date_paid,
            studentfeeId: fees.dataValues.id
        }

        Feespayment.create(fees_payment)
        .then( data => {
            res.send({
                status: "Success",
                status_code: 100,
                message: "School fees payment registered",
                result: {
                    first_name: req.body.first_name,
                    last_name: req.body.last_name,
                    class: req.body.class,
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

// retreive student fees within specified amount range
exports.ListFeesBalances = async(req, res) => {
    Student.findAll({
        attributes: ['id', 'first_name', 'last_name', 'class' ],
        include: {
            model: Studentfees,
            attributes: ['fees_amount'],
            include: {
                model: Feespayment,
                attributes: ['amount_paid', 'date_paid'],
            }
        },
        //where: { fees_amount: { [Op.between] : [parseInt(minFee), parseInt(maxFee)] }},
    })
    .then(data => { res.json(data); })
    .catch(err => {
        res.status(500).send({ message: err.message || "Error while retrieving fees balances" });
    });
}

// retreive student fees within a specified date range
exports.TotalFeesInPeriod = async(req, res) => {
    Student.findAll({
        attributes: ['id', 'first_name', 'last_name', 'class' ],
        include: {
            model: Studentfees,
            attributes: ['fees_amount'],
            include: {
                model: Feespayment,
                attributes: ['amount_paid', 'date_paid'],
                where: { date_paid: { [Op.between] : [req.body.startDate, req.body.endDate] } },
            }
        }
    })
    .then(data => { /*
        const fees_payments = [];

        data.forEach(student => {
            console.log(student.studentfees.length);
            if(student.studentfees.length > 0){
                student.studentfees.forEach(feesSchedule => {
                    const new_fees_schedule = {
                        "fees_amount": feesSchedule.fees_amount,
                        "feespayments": ''
                    }

                    feesSchedule.feespayments.forEach(payment => {
                        const payments = {
                            "amount_paid": payment.amount_paid,
						    "date_paid": payment.date_paid
                        }

                    })

                    const fees_schedules = Object.assign(new_fees_schedule, payments);
                })
                const record = {
                    "id": student.id,
                    "first_name": student.first_name,
                    "last_name": student.last_name,
                    "class": student.class,
                    "fees_amount": student.studentfees.fees_amount,
                    "feespayments": student.studentfees.feespayments
                }
                console.log("fees_amount: "+student.studentfees.fees_amount,);
                console.log("feespayments: "+student.studentfees.feespayments);
                fees_payments.push( record )
            }
        }) */
        res.json(data);
    }).catch(err => {
        res.status(500).send({ message: err.message || "Error while retrieving fees paid" });
    });
}