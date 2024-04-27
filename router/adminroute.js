const adminUrlRouter = require("express").Router();
//........................................................
// importing of controllers
const adminin = require("../controller/admincontroller")
const multerUpload = require("../middleware/uploadImage")
const bannerUP=require("../middleware/banneruploader")
const jwtAuth = require("../middleware/adminjwtvalidation")
const product = require("../controller/productcontroller")

// all routes related to admin

// adminUrlRouter.get("/signup", adminin.adminSignUP)
// adminUrlRouter.post("/adminsignup", adminin.adminDataStore)


adminUrlRouter.get("/enter", jwtAuth.haveToken, adminin.adminlogin)
adminUrlRouter.post("/enter", adminin.adminVerification)
adminUrlRouter.get("/dashboard", jwtAuth.haveToken1, adminin.adminDashboard)
adminUrlRouter.post("/adjustGraph", jwtAuth.haveToken1, adminin.renderDashboard)
adminUrlRouter.get("/banner", jwtAuth.haveToken1, adminin.adminbanner)
//add product
adminUrlRouter.get("/products", jwtAuth.haveToken1, adminin.adminproduct)
adminUrlRouter.post("/products", jwtAuth.haveToken1, multerUpload.multiUpload, product.addproduct)
//edit product
adminUrlRouter.get("/editProduct/:id", jwtAuth.haveToken1, product.edit)
adminUrlRouter.post("/editProduct/:id", jwtAuth.haveToken1, multerUpload.multiUpload, product.saveedit)
adminUrlRouter.get("/listProduct", jwtAuth.haveToken1, product.listProducts)
adminUrlRouter.get("/DeleteProduct/:id", jwtAuth.haveToken1, product.Deleteproduct)
adminUrlRouter.get("/RestoreProduct/:id", jwtAuth.haveToken1, product.restoreproduct)
adminUrlRouter.get("/usercontol", jwtAuth.haveToken1, adminin.usermanage)
adminUrlRouter.post("/blockUser/:id", jwtAuth.haveToken1, adminin.usersetting)
adminUrlRouter.post("/unblockUser/:id", jwtAuth.haveToken1, adminin.usersetting1)
adminUrlRouter.get("/category", jwtAuth.haveToken1, adminin.showcategory)
adminUrlRouter.post("/category", jwtAuth.haveToken1, adminin.addcategory)
adminUrlRouter.get("/deleteCategory/:id", jwtAuth.haveToken1, adminin.deleCategory)
adminUrlRouter.get("/restoreCategory/:id", jwtAuth.haveToken1, adminin.restoreCategory)
adminUrlRouter.get("/editCategory/:id", jwtAuth.haveToken1, adminin.editorCategory)
adminUrlRouter.post("/editedcategory/:id", jwtAuth.haveToken1, adminin.editedCategory)
adminUrlRouter.post("/category", jwtAuth.haveToken1, adminin.addcategory)
adminUrlRouter.get("/orders", jwtAuth.haveToken1, adminin.orderManagement)
adminUrlRouter.post("/statusUpdate/:id", jwtAuth.haveToken1, adminin.orderStatusUpdate)
adminUrlRouter.get("/coupon", jwtAuth.haveToken1, adminin.coupons)
adminUrlRouter.get("/listCoupon", jwtAuth.haveToken1, adminin.listcoupons)
adminUrlRouter.post("/couponAdd", jwtAuth.haveToken1, adminin.addcoupons)
adminUrlRouter.get("/editcoupon/:id", jwtAuth.haveToken1, adminin.editcoupons)
adminUrlRouter.post("/editcoupon/:id", jwtAuth.haveToken1, adminin.changecoupons)
adminUrlRouter.post("/deletecoupon/:id", jwtAuth.haveToken1, adminin.deletecoupons)
adminUrlRouter.get("/logout", adminin.logout)
adminUrlRouter.post("/reportbydate", jwtAuth.haveToken1, adminin.daywisereport)
adminUrlRouter.get("/downloadrevenue", jwtAuth.haveToken1, adminin.downloadrevenue)
adminUrlRouter.get("/downloadrevenuepdf", jwtAuth.haveToken1, adminin.downloadrevenuepdf)
adminUrlRouter.get("/addOffer", jwtAuth.haveToken1, adminin.addofferproduct)
adminUrlRouter.get("/Offercategory", jwtAuth.haveToken1, adminin.addoffercategory)
adminUrlRouter.post("/Offercategory", jwtAuth.haveToken1, adminin.offercategorywise)
adminUrlRouter.get("/Offerproduct", jwtAuth.haveToken1, adminin.addofferproduct)
adminUrlRouter.post("/Offerproduct", jwtAuth.haveToken1, adminin.offerproductwise)
adminUrlRouter.get("/offerreferral", jwtAuth.haveToken1, adminin.offerreferal)

// adminUrlRouter.get("/referOfferAdds", jwtAuth.haveToken1, adminin.addReferalOffer)
// adminUrlRouter.post("/referOfferAdds", jwtAuth.haveToken1, adminin.addReferalOffer)

adminUrlRouter.post("/referOfferAdd", jwtAuth.haveToken1, adminin.updateReferalOffer)
adminUrlRouter.post("/removeOffer", jwtAuth.haveToken1, adminin.removeOffer)
adminUrlRouter.post("/removeProductOffer", jwtAuth.haveToken1, adminin.removeproductOffer)
adminUrlRouter.get("/download", jwtAuth.haveToken1, adminin.downloadoption)
adminUrlRouter.post("/postDate", jwtAuth.haveToken1, adminin.postbydate)
// adminUrlRouter.get("/reportbydates", jwtAuth.haveToken1, adminin.bydate)
adminUrlRouter.post("/convertToExcel", adminin.downloadDetailExcel)
adminUrlRouter.post("/convertToPDF", adminin.downloadDetailPdf)
adminUrlRouter.post("/addBanner/:selectedBanner",bannerUP.singleBanner,adminin.bannerAdding)
adminUrlRouter.get("/bannerConfig",adminin.bannerConfigur)
adminUrlRouter.post("/save/samsung",bannerUP.multiBanner,adminin.bannerdatabse)
adminUrlRouter.post("/save/:section",bannerUP.multiBanner,adminin.storebanner)
// adminUrlRouter.post("/salesChart",adminin.chartData)
adminUrlRouter.post("/update/:section",bannerUP.multiBanner,adminin.updateBanner)

module.exports = {
    adminUrlRouter
}