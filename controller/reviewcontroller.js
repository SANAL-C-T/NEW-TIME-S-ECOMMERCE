const reviewData=require("../model/reviewschema");
const productData=require("../model/productSchema");
const userData=require("../model/userSchema");


const userReview=async(req,res)=>{
    try{
await reviewData()
    }
    catch(error){
        console.log(error.message)
    }
}


