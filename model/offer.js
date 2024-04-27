const mongoose = require("mongoose");
require("../model/config")
const offerSchema = mongoose.Schema({
    offerType: String,
    OfferDescription: String,
    discount: Number,
    expiryDate: String,
    createdDate: String,
    validTime: String,
    productCategoryOffer: String,

})
const offerData = mongoose.model("offer", offerSchema)

module.exports = couponData;