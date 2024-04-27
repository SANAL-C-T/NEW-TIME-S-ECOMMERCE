const mongoose = require("mongoose");

const spec = mongoose.Schema({

    brand: {
        type: String
    },
    MadeIn: {
        type: String
    },
    StrapMaterial: {
        type: String
    },
    waterResistant: {
        type: Boolean
    },
    display: {
        type: String
    },
    screenSize: {
        type: String
    },
    fastCharge: {
        type: Boolean
    },
    battery: {
        type: String
    },
    weight: {
        type: String
    },
    sleepTracker: {
        type: Boolean
    },
    warranty: {
        type: String
    },


})

const specification = mongoose.model("specification", spec)

module.exports = specification