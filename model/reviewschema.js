const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
require("../model/config")
const reviewSchema = mongoose.Schema({
    comment: String,
    rating: Number,
    username:String,
    user:  {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products'
    },
    Time: { type: Date, default: Date.now }
});

const reviewData = mongoose.model("review", reviewSchema);

module.exports = reviewData;
