module.exports = app => {
    //Importing the controller logic for the student model
    const finance_controller = require("../controllers/finance.controller");
    
    //Importing router interface from express module
    let router = require("express").Router();    

    //Defining '/api/payments' API Routes URLs
    router.post("/register_fees_payment", finance_controller.RegisterPayment);
    router.post("/set_class_fees", finance_controller.SetClassFees);
    router.get("/search_fees_in_range", finance_controller.SearchPayments);
    router.get("/fees_balances", finance_controller.ListFeesBalances);
    router.get("/fees_totals", finance_controller.TotalFeesInPeriod);

    //Defining API Root URL
    app.use('/api/finance', router);
}