const mongoose = require("mongoose");
require("../model/config")
const couponSchema = mongoose.Schema({
    couponCode: String,
    offerType: String,
    OfferDescription: String,
    discount: Number,
    percentageDiscount:Number,
    expiryDate: Date,
    createdDate: Date,
    validTime: String,
    productCategory: String
})
const couponData = mongoose.model("coupon", couponSchema)

module.exports = couponData;