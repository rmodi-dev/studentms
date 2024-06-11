module.exports = app => {
    //Importing the controller logic for the student model
    const payment_controller = require("../controllers/payment.controller");
    
    //Importing router interface from express module
    let router = require("express").Router();    

    //Defining API Route URLs
    router.post("/register", payment_controller.RegisterPayment);
    router.get("/search", payment_controller.SearchPayments);
    router.put("/update/:id", payment_controller.UpdatePayment);
    router.get("/find", payment_controller.FindPaymentById);
    router.delete("/delete", payment_controller.DeletePayment);

    //Defining API Root URL
    app.use('/api/payments', router);
}