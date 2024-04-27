const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const userData = require("./userSchema");
require("./config")

const cartSchema = mongoose.Schema({
    couponCode: String,
    couponApplied: {
        type: Boolean,
        default: false,
      },
    userid: ObjectId,
    items: [
        {
            products: { type: mongoose.Schema.Types.ObjectId, ref: 'products' },
            productName:String,
            productImage:String,
            quantity: Number,
            price:Number,
            actualPrice:Number,
            DiscountedAmount:Number,
            discounted:Boolean,
            percentageDiscounted:Number,
            isNowDeleted: {
                type: Boolean,
                default: false
            },
        }
    ],

    Address:String,
    OrderTotalPrice: Number,
    tax:Number,
    TotalDiscountedAmount:Number,
    CouponCode:String,
    ShippingCharge:Number,
    couponValue:Number
})

const cartData = mongoose.model("carts", cartSchema)

module.exports = cartData;