const mongoose=require("mongoose");

require("../model/config")
const otpCollection=mongoose.Schema({
userId:{
    type:String,
},
otp:{
    type:Number
},
createdDate:{
    type:Date
},expiryDate:{
    type:Date
}


})




const otpData=mongoose.model("UserOTP",otpCollection);

module.exports=otpData;