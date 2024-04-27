const { default: mongoose } = require("mongoose")
const mangoose = require("mongoose")
require("../model/config")


const productCollection = mangoose.Schema({
    productName: {
        type: String,
        required: true
    },
    productCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'category'
    },
    productDescription: {
        type: String,
        required: true
    },

    variant: [{
        productsize: {
            type: String,

        },
        productcolour: {
            type: String,

        }
    }],

    quantity: {
        type: Number,

    },
    productImage: [{
        image1: {
            type: String
        },
        image2: {
            type: String
        },
        image3: {
            type: String
        },
        image4: {
            type: String
        },
        image5: {
            type: String
        },
        image0: {
            type: String
        },
    }],

    image360degree: [{
        image3601: {
            type: String
        },
        image3602: {
            type: String
        },
        image3603: {
            type: String
        },
        image3604: {
            type: String
        },
        image3605: {
            type: String
        },
        image3600: {
            type: String
        },
    }],

    status: {
        type: String,
        enum: ["draft", "published", "outOfStock", "lowStock"]
    },
    stockCount: {
        type: Number,
        default: 0
    },
    uniqueID: {// for checking status
        type: Number
    },
    dialShape: {
        type: String
    },
    MadeIn: {
        type: String
    },
    StrapMaterial: {
        type: String
    },
    StrapColour: {
        type: String
    },
    waterResistant: {
        type: String
    },
    display: {
        type: String
    },
    screenSize: {
        type: String
    },
    fastCharge: {
        type: String
    },
    battery: {
        type: String
    },
    weight: {
        type: String
    },
    call: {
        type: String
    },
    bluetooth: {
        type: String
    },
    wifi: {
        type: String
    },
    display: {
        type: String
    },

    Warranty: {
        type: String
    },
    productPrice: {
        type: Number,
        required: true
    },
    OfferPrice: {
        type: Number
    },
    rating: {
        type: Number
    },

    Comment: {
        type: String
    },

    addedDate: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    haveProductOffer: {
        type: Boolean,
        default: false,
    },
    offer: [{
        Discountvalue: Number,
        StartDate: String,
        endDate: String
    }],
    discountedPrice: {
        type: Number
    }

})
const productData = mongoose.model("products", productCollection);
module.exports = productData;