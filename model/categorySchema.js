const mongoose = require("mongoose");
require("../model/config")
const categoryCollection = mongoose.Schema({
    categoryName: {
        type: String
    },
    Categorystatus: {
        type: Boolean
    },
    hasCatOffer: {
        type: Boolean,
        default: false,
    },
    catOffer: [{
        catDiscountValue: Number,
        startDate: String,
        endDate: String
    }],

})

const categoryData = mongoose.model("category", categoryCollection);
module.exports = categoryData;