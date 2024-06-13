function ProcessFeesSchedule(fees_schedule) {
    const feespayments = [];
    let total_paid = 0;
    fees_schedule.forEach(payment => {
        total_paid += payment.amount_paid;
        const paid = {
            "amount_paid": payment.amount_paid,
            "date_paid": payment.date_paid
        };
        feespayments.push(paid);
    });
    return {
        total: total_paid,
        payments: { ...feespayments }
    };
}
exports.ProcessFeesSchedule = ProcessFeesSchedule;
