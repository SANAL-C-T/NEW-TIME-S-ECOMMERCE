const mongoose = require("mongoose");

require("../model/config")
const AddressCollection = mongoose.Schema({
    userId: {
        type: String,
    },
    Address: {
        type: String
    },

})

const AddressData = mongoose.model("UserOTP", AddressCollection);

module.exports = AddressData;