const mongoose = require("mongoose");
require("../model/config")
const referCollection = mongoose.Schema({
    bonusAmount: Number,
    expiryDate: String,
    createdDate: String,
    refercode: Number,
    block_promotion: {
        type: Boolean,
        default: false
    }

})
const referData = mongoose.model("referOffer", referCollection)

module.exports = referData;