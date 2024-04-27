const mongoose = require("mongoose")

const pic = mongoose.Schema({

    pic1: {
        type: String
    },
    pic2: {
        type: String
    },
    pic3: {
        type: String
    },
    pic4: {
        type: String
    },
    pic5: {
        type: String
    },
    pic6: {
        type: String
    },
    pic7: {
        type: String
    },
    pic8: {
        type: String
    },
    pic9: {
        type: String
    },
    pic10: {
        type: String
    },
    pic11: {
        type: String
    },
    pic12: {
        type: String
    },
    pic13: {
        type: String
    },
    pic14: {
        type: String
    },
    pic15: {
        type: String
    },
    pic16: {
        type: String
    },

})


const pic360 = mongoose.model("image360", pic);


module.exports = pic360;