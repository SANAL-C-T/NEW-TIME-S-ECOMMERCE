const mongoose = require("mongoose");

require("../model/config")
const walletCollection = mongoose.Schema({
    userId: {
        type: String,
    },
    history: [{
    }]
})

const walletData = mongoose.model("wallet", walletCollection);

module.exports = walletData;