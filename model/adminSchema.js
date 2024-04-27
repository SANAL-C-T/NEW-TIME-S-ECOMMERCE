const mongoose = require("mongoose");

require("./config")

const adminSchema = mongoose.Schema({

    email: {
        type: String,

    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: Number,

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
        default: false,
    },
    profileImage: {
        type: String, // Store the path to the uploaded image
    }
});

const adminData = mongoose.model("admin", adminSchema);

module.exports = adminData;