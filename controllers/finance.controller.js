//importing models
const db = require("../models");
const { ProcessFeesSchedule } = require("./functions/ProcessFeesSchedule");

const Student = db.students;
const Studentfees = db.studentfees;
const Feespayment = db.feespayments;

//define operator
const Op = db.Sequelize.Op;
//const fn = db.Sequelize.fn;
//const col = db.Sequelize.col;

// retreive student fees within specified amount range
exports.SearchPayments = async(req, res) => {
    const { minFee, maxFee } = req.query;
    console.log("minFee: "+minFee);
    console.log("maxFee: "+maxFee);
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
    const { first_name, last_name, class : student_class, amount_paid, date_paid } = req.body;

    if (!first_name){ msg = msg + "First name is required. " }
    if (!last_name){ msg = msg + "Last name is required. " }
    if (!student_class){ msg = msg + "Class is required." }
    if (!amount_paid){ msg = msg + "Amount paid is required." }
    if (!date_paid){ msg = msg + "Date of fees payment is required." }
    if ((!first_name) && (!last_name) && (!student_class)
        && (!amount_paid) && (!date_paid)){ 
        msg = "No information submitted. Student's first name, last name, class,\
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
            first_name: { [Op.like]: `%${first_name}%`},
            last_name: { [Op.like]: `%${last_name}%`},
            class: { [Op.like]: `%${student_class}%`}
        },
        include: {
            model: Studentfees,
            attributes: ['id', 'fees_amount', 'studentId'],
        }
    })
    .then(data => {
        const { id, studentfees } = data.dataValues;
        const { id:idf, fees_amount, studentId } = {...studentfees[0]}.fees.dataValues;

        let vmsg='';

        if(id === null){
            vmsg = `No student with details ${ last_name } ${ first_name }, ${ student_class } exists in the \
            databse. Student must be registered before accepting payments.`
        } else if((idf === null) || (fees_amount === null) || (studentId === null)){
             vmsg = `No fees amount set for ${ last_name } ${ first_name },  ${ student_class } in the system. \
             The fees amount must be determined and registered in the system, before accepting payments \
             from the student.`
        }

        if( vmsg!==""){
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
    Student.findAll({
        attributes: ['id', 'first_name', 'last_name', 'class'],
        include: {
            model: Studentfees,
            attributes: ['fees_amount'],
            include: {
                model: Feespayment,
                attributes: ['amount_paid', 'date_paid'],
            }
        }
    }).then(data => {
        const demanded_students = {};
        data.forEach(student => {
            const { id, first_name, last_name, class: student_class, studentfees} = student;
            if (studentfees.length > 0){
                studentfees.forEach(feesSchedule => {
                    const { total } = ProcessFeesSchedule(feesSchedule.feespayments);
                    if((feesSchedule.fees_amount - total) > 0){
                        const demanded_student = {
                            "id": id,
                            "class": student_class,
                            "first_name": first_name,
                            "last_name": last_name,
                            "fees_balance": feesSchedule.fees_amount - total
                        };
                        Object.assign(demanded_students, demanded_student);
                    }
                });
            }
        });
        res.json({ ...demanded_students });
    }).catch(err => {
        res.status(500).send({ message: err.message || "Error while retrieving fees balances" });
    });
};

// retreive student fees within a specified date range
exports.TotalFeesInPeriod = async (req, res) => {
    const { startDate, endDate } = req.body;
    Student.findAll({
        attributes: ['id', 'first_name', 'last_name', 'class'],
        include: {
            model: Studentfees,
            attributes: ['fees_amount'],
            include: {
                model: Feespayment,
                attributes: ['amount_paid', 'date_paid'],
 //               include: [[fn('SUM', col('amount_paid')), 'total_amount_paid']],
                where: { date_paid: { [Op.between]: [startDate, endDate] } },
            }
        }
    }).then(data => {
        const fees_payments = {};
        let grand_total = 0;
        data.forEach(student => {
            const fees_details = {};
            const { id, first_name, last_name, class: student_class, studentfees} = student;

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
        res.status(500).send({ message: err.message || `Error while retrieving fees paid between \
            ${ startDate } and ${ endDate }.` });
    });
};