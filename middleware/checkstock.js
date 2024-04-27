const productData=require("../model/productSchema")
const cartData=require("../model/cartSchema")

const checkHaveStock=async(req,res,next)=>{
    try{
        const usersid = req.userid;//this is comming from jwt authentication
console.log("ggggg")
const checkProductDeleted = await cartData.findOne({ userid: usersid })
.populate({
    path: 'items.products',
    model: 'products',
    match: { isDeleted: false }
});

// console.log("checkProductDeleted::::", checkProductDeleted);




const filteredItems = checkProductDeleted.items.filter(item => item.products !== null);

const totalPrice = filteredItems.reduce((acc, item) => {
return acc + item.price;
}, 0);


await cartData.updateOne(
{ userid: usersid },
{ $set: { items: filteredItems, OrderTotalPrice: totalPrice } }
);





next()
    }
    catch(error){
        console.log(error.message)
    }
}


module.exports = {
    checkHaveStock
};