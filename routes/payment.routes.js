module.exports = app => {
    //Importing the controller logic for the student model
    const payment_controller = require("../controllers/payment.controller");
    
    //Importing router interface from express module
    let router = require("express").Router();    

    //Defining '/api/payments' API Routes URLs
    router.post("/register_fees_payment", payment_controller.RegisterPayment);
    router.get("/search_fees", payment_controller.SearchPayments);
    router.get("/fees_balances", payment_controller.ListFeesBalances);
    router.get("/fees_totals", payment_controller.TotalFeesInPeriod);

    //Defining API Root URL
    app.use('/api/payments', router);
}