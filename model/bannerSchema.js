
const mangoose = require("mongoose")
require("../model/config")
const bannerCollection = mangoose.Schema({
    sectionName: String,
    bannerImage1: String,
    bannerImage2: String,
    bannerImage3: String,
    MainTextContent: String,
    SubTextContent: String,
    introductionTextContent: String,
    heading:String,
    subHeading:String


});

const bannerData = mangoose.model("banner", bannerCollection);
module.exports = bannerData;