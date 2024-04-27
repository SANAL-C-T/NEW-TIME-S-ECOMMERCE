
const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

require("../model/config")

const userSchema = mongoose.Schema({
    first_name: {
        type: String,
    },
    Last_name: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,
        required: true
    },
    permission: {//blocked or unblocked
        type: String,
    },
    username: {
        type: String,
        required: true
    },
    date: {//date of joining
        type: Date,
    },
    status: { //active now or not
        type: Boolean,
        default: true,
    },
    profileImage: {
        type: String, // Store the path to the uploaded image
    },
    verified: {
        type: Boolean
    },
    Address: [{
        phoneNo: Number,
        houseNo: String,
        street: String,
        location: String,
        landmark: String,
        city: String,
        state: String,
        country: String,
        pincode: Number
    }],
    coupon: [{
        id: ObjectId,
        couponCode: String,
        OneTimeUsed: Boolean,
        appliedOnDate: String,
        expiryDate: String
    }],

    My_promotionalCode: "string",
    usedApromotionalCode: {
        type: Boolean,
        default: false
    },

});

const userData = mongoose.model("user", userSchema);

module.exports = userData;