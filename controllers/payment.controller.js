//importing models
const db = require("../models");

//returning payments
const Payment = db.payments;

// retreive payments from the database
exports.SearchPayments = (req, res) => {
    const minAmount = req.params.min;
    const maxAmount = req.params.max;

    if(!minAmount && !maxAmount){
        Payment.findAll().then(
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

        return;
    }


}