const mongoose = require("mongoose");

require("../model/config")
const wishlistCollection = mongoose.Schema({
    userId: {
        type: String,
    },
    list: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'products'
    }]
})

const wishData = mongoose.model("wishlist", wishlistCollection);

module.exports = wishData;