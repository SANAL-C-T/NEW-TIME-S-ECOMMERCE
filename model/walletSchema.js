const mongoose = require("mongoose");

require("../model/config")
const walletCollection = mongoose.Schema({
    userId: {
        type: String,
    },
    avaliable: {
        type: Number
    },
    Transaction: [{
        remark: String,
        debitAmount: Number,
        creditAmount: Number,
        CreditDate: String,
     
    }]
})

const walletData = mongoose.model("wallet", walletCollection);

module.exports = walletData;