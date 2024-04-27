const mangoose = require("mongoose")
require("../model/config")
const bannerTextCollection = mangoose.Schema({
    mainText: String,
    SubText: String,
    ParaText: String,
});

const bannerTextData = mangoose.model("TextOnBanner", bannerTextCollection);
module.exports = bannerTextData;