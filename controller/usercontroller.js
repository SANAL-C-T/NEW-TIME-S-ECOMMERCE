const userData = require("../model/userSchema")
const productDatas = require("../model/productSchema")
const categData = require("../model/categorySchema")
const reviewData = require("../model/reviewschema")
const wishData = require("../model/wishlist")
const productData = require("../model/productSchema")
const referData = require("../model/refferschems")
const bannerData = require("../model/bannerSchema")
const promoCodeGenerator = require('otp-generator');
const bcrypt = require("bcrypt")
const moment = require("moment");
const axios = require("axios");
const { render } = require("ejs")
// const session = require("express-session")
const JWTtoken = require("jsonwebtoken")
const walletData = require("../model/walletSchema")
const { y } = require("pdfkit")
const { values } = require("pdf-lib")

require('dotenv').config();
const jwtcode = process.env.jwt_user_secret
const zipPinCodeKey = process.env.ZIPCODE_API_KEY;

//control function begins here
const homeNotLog = async (req, res) => {
    try {
        let loadProduct = 0;
        let loadProductG = 0;
        let loadProductA = 0;

        const samsungProduct = await productDatas.find({
            productCategory: '662b470beb7e16a0efe66945', // Replace with the actual category ID
            isDeleted: false,
        })
            .populate({
                path: 'productCategory',
                match: { Categorystatus: true } // Only include categories with Categorystatus set to true
            })
            .exec();

        if (samsungProduct[0].productCategory && samsungProduct[0].productCategory.Categorystatus === true) {
            console.log("Samsung product loaded");
            loadProduct = samsungProduct;
        } else {
            loadProduct = 0;
        }

        const appleProduct = await productDatas.find({
            productCategory: '662b7ddbeb7e16a0efe66ed8', // Replace with the actual category ID
            isDeleted: false,
        })
            .populate({
                path: 'productCategory',
                match: { Categorystatus: true } // Only include categories with Categorystatus set to true
            })
            .exec();

        if (appleProduct[0].productCategory && appleProduct[0].productCategory.Categorystatus === true) {
            console.log("Apple product loaded");
            loadProductA = appleProduct;
        } else {
            loadProductA = 0;
        }

        const garminProduct = await productDatas.find({
            productCategory: '662b7ddeeb7e16a0efe66ede', // Replace with the actual category ID
            isDeleted: false,
        })
            .populate({
                path: 'productCategory',
                match: { Categorystatus: true } // Only include categories with Categorystatus set to true
            })
            .exec();

        if (garminProduct[0].productCategory && garminProduct[0].productCategory.Categorystatus === true) {
            console.log("Garmin product loaded");
            loadProductG = garminProduct;
        } else {
            loadProductG = 0;
        }

        const bannerImage = await bannerData.find({})
        console.log("bannerImage:", bannerImage)
        const Banner1 = bannerImage[0];
        const Banner2 = bannerImage[1];
        const Banner3 = bannerImage[2];
        res.render("user/userhomenotlog.ejs", { loadProduct, loadProductA, loadProductG, Banner1, Banner2, Banner3 });

    } catch (error) {
        console.error(error.message);
    }
};


//this is the homepage of a loggedin user.
const home = async (req, res) => {
    try {

        // const deletedOrNot=await productData.find
        let loadProduct = 0;
        let loadProductG = 0;
        let loadProductA = 0;

        const HavesamsungProduct = await productDatas.find({
            productCategory: '662b470beb7e16a0efe66945', // Replace with the actual category ID
            isDeleted: false,
        })

        if (HavesamsungProduct.length > 0) {
            const samsungProduct = await productDatas.find({
                productCategory: '662b470beb7e16a0efe66945', // Replace with the actual category ID
                isDeleted: false,
            })
                .populate({
                    path: 'productCategory',
                    match: { Categorystatus: true } // Only include categories with Categorystatus set to true
                })
                .exec();

            console.log("samsungProduct::::", samsungProduct)

            if (samsungProduct[0].productCategory && samsungProduct[0].productCategory.Categorystatus === true) {
                console.log("Samsung product loaded");
                loadProduct = samsungProduct;
            } else {
                loadProduct = 0;
            }
        }
        else {
            loadProduct = 0
        }

        const HaveappleProduct = await productDatas.find({
            productCategory: '662b7ddbeb7e16a0efe66ed8', // Replace with the actual category ID
            isDeleted: false,
        })

        if (HaveappleProduct.length > 0) {
            const appleProduct = await productDatas.find({
                productCategory: '662b7ddbeb7e16a0efe66ed8', // Replace with the actual category ID
                isDeleted: false,
            })
                .populate({
                    path: 'productCategory',
                    match: { Categorystatus: true } // Only include categories with Categorystatus set to true
                })
                .exec();

            if (appleProduct[0].productCategory && appleProduct[0].productCategory.Categorystatus === true) {
                console.log("Apple product loaded");
                loadProductA = appleProduct;
            } else {
                loadProductA = 0;
            }
        }
        else {
            loadProductA = 0
        }

        const HavegarminProduct = await productDatas.find({
            productCategory: '662b7ddeeb7e16a0efe66ede', // Replace with the actual category ID
            isDeleted: false,
        })

        if (HavegarminProduct.length > 0) {

            const garminProduct = await productDatas.find({
                productCategory: '662b7ddeeb7e16a0efe66ede', // Replace with the actual category ID
                isDeleted: false,
            })
                .populate({
                    path: 'productCategory',
                    match: { Categorystatus: true } // Only include categories with Categorystatus set to true
                })
                .exec();

            if (garminProduct[0].productCategory && garminProduct[0].productCategory.Categorystatus === true) {
                console.log("Garmin product loaded");
                loadProductG = garminProduct;
            } else {
                loadProductG = 0;
            }
        }
        else {
            loadProductG = 0
        }

        console.log("AAAAAA::::", loadProduct, loadProductA, loadProductG)

        const bannerImage = await bannerData.find({})
        console.log("bannerImage:", bannerImage)
        const Banner1 = bannerImage[0];
        const Banner2 = bannerImage[1];
        const Banner3 = bannerImage[2];
        console.log("Banner1:", Banner1)

        res.render("user/userhomepage.ejs", { loadProduct, loadProductA, loadProductG, Banner1, Banner2, Banner3 });

    } catch (error) {
        console.log(error.message)
    }
}


// for taking the user to login page on clickig any buy now on home page
const login = async (req, res) => {
    try {
        res.render("user/userlogin.ejs")
    } catch (error) {
        console.log(error.message)
    }
}


const loginVerify = async (req, res) => {
    try {
        const user = req.body.username;
        const pass = req.body.password;

        // Query for user details including username, password, and status
        const userRecord = await userData.findOne({ username: user }).select('username password status');

        if (!userRecord) {
            res.locals.errorMessage = 'Invalid email or password';
            return res.render("user/userlogin.ejs");
        }

        const isBlocked = userRecord.status === false;
        const isPasswordValid = await bcrypt.compare(pass, userRecord.password);

        if (isBlocked) {
            res.locals.errorMessage = 'You are blocked by admin';
            return res.render("user/userlogin.ejs");
        }

        if (isPasswordValid) {
            const usertoken = JWTtoken.sign({ id: userRecord.username, _id: userRecord._id }, jwtcode, { expiresIn: "28800000" });

            const options = {
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                httpOnly: true
            };

            res.cookie("usertoken", usertoken, options);
            console.log("Token created");
            return res.redirect("/home");
        } else {
            res.locals.errorMessage = 'Invalid email or password';
            return res.render("user/userlogin.ejs");
        }
    } catch (error) {
        console.log(error.message);
        // Handle the error appropriately, e.g., send an error response to the client
    }
}

//if user is not signedup take to signup page
const signup = async (req, res) => {
    try {
        res.render("user/usersignup.ejs")
    } catch (error) {
        console.log(error.message)
    }
}


const secretPass = async (password) => {
    try {
        const hashedPass = await bcrypt.hash(password, 10);
        return hashedPass;
    }
    catch (error) {
        console.log(error.message)
    }
};


// store comming data to database
const storeData = async (req, res) => {
    // console.log(req.session.email)

    try {// here i am only storing the data at the time of signup
        const passwordCode = await secretPass(req.session.password);
        const userEmail = req.session.email;
        const emailIndb = await userData.findOne({ email: userEmail })
        const referCode = req.session.referralCode;
        const usedReferenceCode = await userData.findOne({ My_promotionalCode: referCode })


        let userUsedReferCode;
        if (usedReferenceCode == null) {
            userUsedReferCode = false;
        } else {
            userUsedReferCode = true;
        }
        const promoCode = promoCodeGenerator.generate(10, { upperCaseAlphabets: true, lowerCaseAlphabets: true, specialChars: false });

        // console.log("1:::", emailIndb)
        if (emailIndb == null) {//save only if email doesnot exist in db
            const userdetails = new userData({
                username: req.session.username,
                email: req.session.email,
                password: passwordCode,
                phone: req.session.phone,
                verified: true,
                usedApromotionalCode: userUsedReferCode,
                My_promotionalCode: promoCode
            })
            console.log("Signup data saved in database")
            await userdetails.save()
            req.session.destroy()
            res.redirect("/login")
        } else {
            console.log("email already exist")
            res.locals.errorMessage = 'User already exist, please login';
            res.render("user/usersignup.ejs")

        }

        const userdetails = await userData.findOne({ email: userEmail })
        const wishlist = new wishData({
            userId: userdetails._id
        })
        await wishlist.save();

        const wallet = new walletData({
            userId: userdetails._id,
            avaliable: 0
        });
        await wallet.save();


        const referBonus = await referData.find({})
        // console.log("referBonus::",referBonus)
        // console.log("referBonus::",referBonus.block_promotion)
        // console.log("usedReferenceCode::", usedReferenceCode)

        const walle = await walletData.findOne({ userId: userdetails._id })
        // console.log("walle::",walle.avaliable)


        const promotedPersonsWallet = await walletData.findOne({ userId: usedReferenceCode._id })
        // console.log("promotedPersonsWallet:::",promotedPersonsWallet)

        if (usedReferenceCode != null) {

            const newbalance = promotedPersonsWallet.avaliable + referBonus[0].bonusAmount

            await walletData.findOneAndUpdate(
                { userId: usedReferenceCode._id },
                { 
                    $set: { 
                        avaliable: newbalance
                    },  
                    $push: { 
                        Transaction: { 
                            remark: "Referral Bonus",
                            creditAmount: referBonus[0].bonusAmount,
                            CreditDate: moment(Date.now()).format('DD/MM/YYYY HH:mm:ss') 
                        }
                    }
                }
            );
            
            if (referBonus[0].block_promotion == false) {
                await walletData.findOneAndUpdate(
                    { userId: userdetails._id },
                    { 
                        $set: { 
                            avaliable: referBonus[0].bonusAmount
                        },  
                        $push: { 
                            Transaction: { 
                                remark: "Join Bonus",
                                creditAmount: referBonus[0].bonusAmount,
                                CreditDate: moment(Date.now()).format('DD/MM/YYYY HH:mm:ss')
                            }
                        }
                    }
                );
                
            } else {
            }
        }

    }
    catch (error) {
        console.log("test", error.message)
    }
}


const allproductPage = async (req, res) => {
    try {
        // console.log("test")
        const allproduct = await productDatas.find({ isDeleted: false })
        res.render("user/productdisplay.ejs", { allproduct })
    }
    catch (error) {
        console.log(error.message)
    }
}



const productdetail = async (req, res) => {
    try {
        const pId = req.params.productId;
        const pdetail = await productDatas.findOne({ _id: pId, isDeleted: false })
            .populate({
                path: 'productCategory',
                model: 'category',
                select: 'categoryName',
            })
            .exec();

        if (!pdetail) {
            return res.status(404).send('Product not found');
        }
        { }

        //geting the average review
        const getAvg = await reviewData.find({ product: pId }).populate({
            path: 'product',
            model: "products",
            select: "_id"
        })
        console.log("avggg:", getAvg)
        let totalRating = 0;
        let reviewCount = getAvg.length;

        // Iterate through each review and sum up the ratings
        getAvg.forEach(review => {
            totalRating += review.rating;
        });

        // Calculate the average rating
        const averageRating = reviewCount > 0 ? totalRating / reviewCount : 0;
        let roundedaverageRating = averageRating.toFixed(2);
        console.log("Average Rating:", roundedaverageRating);
        res.render("user/productdetail.ejs", { pdetail, roundedaverageRating });
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}


const buyProduct = async (req, res) => {
    //product details
    try {
        res.render("user/productdetail.ejs")
    } catch (error) {
        console.log(error.message)
    }
}



//if a page is not found
const notfound = async (req, res) => {
    try {
        console.log("IN USER CONTROLLER if no page is found in function notfound")
        console.log("------------------------------------------------------------")
        res.render("user/404.ejs")
    } catch (error) {
        console.log(error.message)
    }
}

const logout = async (req, res) => {
    try {
        console.log("logout")
        res.clearCookie('usertoken');
        res.redirect("/")
    }
    catch (error) {
        console.log(error.message)
    }
}



const about = async (req, res) => {
    try {
        res.render("user/aboutnolog.ejs")
    }
    catch (error) {
        console.log(error.message)
    }
}
const aboutb = async (req, res) => {
    try {
        res.render("user/about.ejs")
    }
    catch (error) {
        console.log(error.message)
    }
}


const contact = async (req, res) => {
    try {
        res.render("user/contactnolog.ejs")
    }
    catch (error) {
        console.log(error.message)
    }
}

const contactb = async (req, res) => {
    try {
        res.render("user/contact.ejs")
    }
    catch (error) {
        console.log(error.message)
    }
}


// const categoryWiseProduct = async (req, res) => {
//     try {
//         const qid = req.params.proid;
//         console.log(qid)
//         const catwise = await productDatas.findOne({ _id: qid })
//             .populate({
//                 path: 'productCategory',
//                 model: 'category',
//                 select: 'categoryName',
//             })
//             .exec();
//         const catlist = await productDatas.find({ productCategory: catwise.productCategory })
//         // console.log(catlist)


//         res.render("user/categoryWiseProduct.ejs", { catlist, catwise });

//     } catch (error) {
//         console.log(error.message)
//     }
// }
//...........................................................................................................


//need to add pagination logics.... to this section,  based on product category, i will have to paginate 
//this page is rendered when the buy product is clicked ,
const categoryWiseProduct = async (req, res) => {
    try {
        // console.log("in categoryWise Product")
        const qid = req.params.proid;
        // console.log("id", qid)
        const pageNumber = 1;
        const itemsPerPage = 4;
        const catwise = await productDatas.findOne({ _id: qid, isDeleted: false })
            .populate({
                path: 'productCategory',
                model: 'category',
                select: 'categoryName',
            })
            .exec();

        let comingCategory = catwise.productCategory.categoryName;
        // console.log("ef",catwise.productCategory.categoryName)
        if (!catwise) {
            return res.status(404).send('Category-wise product not found');
        }
        const catlist = await productDatas.find({ productCategory: catwise.productCategory, isDeleted: false })
            .populate({
                path: 'productCategory',
                model: 'category',
                select: 'categoryName',
            })
            .skip((pageNumber - 1) * itemsPerPage)
            .limit(itemsPerPage)
            .exec();
        const docCount = await productDatas.countDocuments({ productCategory: catwise.productCategory, isDeleted: false });
        // console.log("in categorywise product in usercontroller ", docCount);
        let pageStartindex = (pageNumber - 1) * itemsPerPage;
        res.render("user/categorywiseproduct.ejs", { catlist, catwise, docCount, pageStartindex, comingCategory });

    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
};

//..............forgot password........................
const forgotpassword = async (req, res) => {
    try {
        res.render("user/forgotpassword.ejs")
    }
    catch (error) {
        console.log(error.message)
    }
}


const resetpassword = async (req, res) => {
    try {
        const userEmail = req.body.email;
        const confirmpass = req.body.confirmpassword;
        const newpass = req.body.password;
        // console.log(userEmail)
        // console.log(confirmpass)
        // console.log(newpass)
        const isuser = await userData.findOne({ email: userEmail })
        // console.log(isuser)

        if (isuser == null || isuser.verified == false) {
            res.locals.errorMessage = 'Invalid email or password';
            res.render("user/forgotpassword");
        } else if (confirmpass != newpass) {
            res.locals.errorMessage = 'Invalid email or password';
            res.render("user/forgotpassword");
        }
        else {
            await userData.updateOne({ email: userEmail }, { $set: { password: confirmpass } });


            res.redirect("/login")
        }

    }
    catch (error) {
        console.log(error.message)
    }
}

//.........categorywise filter.....................................
const filter = async (req, res) => {
    try {
        const userFilter = req.body.productType;
        console.log("productTypeChecked::::", userFilter)
        const UserFilterObjectId = await categData.find({ categoryName: { $in: userFilter } }, { _id: 1 });
        // console.log("UserFilterObjectId:::::", UserFilterObjectId);
        const userFilteredProduct = await productDatas.find({ 'productCategory': { $in: UserFilterObjectId } })
            .populate({
                path: 'productCategory',
                model: 'category',
            })
        // console.log("userFilteredProduct:::::", userFilteredProduct)

        const productCount = userFilteredProduct.length;
        const pricesort = req.body.pricesort;
        const pages = req.body.page;
        const usersearch = req.body.ser;
        const pageNumber = parseInt(pages) || 1;
        const itemsPerPage = 4;
        let searching;

        if (usersearch) {
            searching = { productName: { $regex: `^${usersearch}`, $options: 'i' } };
        }

        let products;
        let docCount;
        let serc;
        let SortByPrice

        try {
            // getting any filtered category
            const category = await categData.find({ categoryName: { $in: userFilter } }, { _id: 1 });
            // Taking the count of documents excluding deleted products
            docCount = productCount;
            // Finding the products based on selection excluding deleted products
            products = await productDatas.find({ 'productCategory': { $in: category }, isDeleted: false })
                .populate({
                    path: 'productCategory',
                    model: 'category',
                })
                .skip((pageNumber - 1) * itemsPerPage)
                .limit(itemsPerPage)
                .exec();

            if (pricesort === "Hightolow") {
                console.log("=====sorting from Hightolow===")
                SortByPrice = await productDatas.find({ 'productCategory': { $in: category }, isDeleted: false })
                    .populate({
                        path: 'productCategory',
                        model: 'category',
                    }).sort({ productPrice: -1 })
                    .skip((pageNumber - 1) * itemsPerPage)
                    .limit(itemsPerPage)
                    .exec();

                products = SortByPrice;

            } else if (pricesort === "lowtohigh") {
                console.log("=====sorting from low to high:::")
                // 
                SortByPrice = await productDatas.find({ 'productCategory': { $in: category }, isDeleted: false })
                    .populate({
                        path: 'productCategory',
                        model: 'category',
                    }).sort({ productPrice: 1 })
                    .skip((pageNumber - 1) * itemsPerPage)
                    .limit(itemsPerPage)
                    .exec();
                ;
                products = SortByPrice;
            }
            // console.log("::::sort data::::", SortByPrice)
            if (usersearch != "") {
                console.log(":::::user trying to search====::::", usersearch)
                serc = await productDatas.find({ 'productCategory': { $in: category }, ...searching, isDeleted: false, })
                    .populate({
                        path: 'productCategory',
                        model: 'category',
                    }).skip((pageNumber - 1) * itemsPerPage)
                    .limit(itemsPerPage)
                    .exec();
                products = serc;
                console.log(':::user search query::::', serc);//is working and getting data.
            }
        }


        catch (error) {
            console.log("try inside")
            console.error('Error fetching products:', error);
        }

        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.json(products);
        }

        let pageStartindex = (pageNumber - 1) * itemsPerPage;
        //sending a response body to the frontend as a part of post fetch.
        console.log("___________________________________________________")
        // console.log(" ::::products::", products)
        console.log(" :::pageStartindex:::", pageStartindex)
        console.log(" :::docCount::", docCount)
        console.log(":::userFilte::", userFilter)
        console.log(" :::search::", serc)
        // console.log(" :::sort::", SortByPrice)
        console.log(" ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~")

        res.json({
            products,
            pageStartindex,
            docCount,
            userFilter,
            serc,
            SortByPrice
        });

    } catch (error) {
        console.log("try outside")
        console.log(error.message);

    }
};



//.............edit profile...............................
const editprofile = async (req, res) => {

    try {
        // console.log(":::test:::");
        const user = req.userid;//this is comming from jwt authentication
        const hasUserAddedDetails = await userData.findOne({ _id: user, first_name: { $exists: true } });
    //    console.log("userProfile::",hasUserAddedDetails);

if(hasUserAddedDetails==null){
    res.render("user/userprofileedit.ejs",{hasUserAddedDetails});
}else{
    const hasUserAddedDetails = await userData.findOne({ _id: user, });
    res.render("user/userprofileedit.ejs",{hasUserAddedDetails});
}
      
      
  
    }
    catch (error) {
        console.log(error.message)
    }
}


//...............................................
const saveEditProfile = async (req, res) => {
    try {
      
        const user = req.userid; // This is coming from JWT authentication
        const profilePic = req.file ? `/${req.file.filename}` : undefined;
        const address = {
            houseNo: req.body.house,
            street: req.body.street,
            location: req.body.location,
            landmark: req.body.landmark,
            city: req.body.city,
            state: req.body.state,
            country: req.body.Country,
            pincode: req.body.pincode,
        };



//case if first name and last name is only comming..
    //     if (profilePic === undefined && (
    //         address.houseNo === undefined || 
    //         address.street === undefined ||
    //         address.location === undefined ||
    //         address.landmark === undefined ||
    //         address.city === undefined ||
    //         address.state === undefined ||
    //         address.country === undefined ||
    //         address.pincode === undefined
    //     )) {
    //         await userData.updateOne({ _id: user }, {
    //             $set: {
    //                 first_name: req.body.username1,
    //                 Last_name: req.body.username2,
    //             }
    //         });

         
    //     }
    //     else{}
     
    //     //case  if only profile image is added or updated.
    //     if (
    //         req.body.username1 === undefined ||
    //         req.body.username2 === undefined ||
    //         (
    //             address.houseNo === undefined || 
    //             address.street === undefined ||
    //             address.location === undefined ||
    //             address.landmark === undefined ||
    //             address.city === undefined ||
    //             address.state === undefined ||
    //             address.country === undefined ||
    //             address.pincode === undefined
    //         )
    //     ) {
    //         await userData.updateOne({ _id: user }, {
    //             $set: {
    //                 profileImage: `/${req.file.filename}`,
    //             }
    //         });
    //     }else{}

    //  //case if both image and firstname and lastname is present.
    //     if (
    //         address.houseNo === undefined || 
    //         address.street === undefined ||
    //         address.location === undefined ||
    //         address.landmark === undefined ||
    //         address.city === undefined ||
    //         address.state === undefined ||
    //         address.country === undefined ||
    //         address.pincode === undefined
    //     ) {
    //         await userData.updateOne({ _id: user }, {
    //             $set: {
    //                 first_name: req.body.username1,
    //                 Last_name: req.body.username2,
    //                 profileImage: profilePic,
    //             }
    //         });
    //     } 
    //     //case if everything is present.
    //     else {
    //         await userData.updateOne({ _id: user }, {
    //             $set: {
    //                 first_name: req.body.username1,
    //                 Last_name: req.body.username2,
    //                 phone: req.body.phonenumber,
    //                 profileImage: profilePic,
    //                 Address: address,
    //             }
    //         });
    //     }
    
    //     console.log("Data saved");

    //     const hasUserAddedDetails = await userData.findOne({ _id: user, });
    //     res.render("user/userprofileedit.ejs",{hasUserAddedDetails});
    // } catch (error) {
    //     console.error(error.message);
    // }

    if (profilePic === undefined && (
                address.houseNo === undefined || 
                address.street === undefined ||
                address.location === undefined ||
                address.landmark === undefined ||
                address.city === undefined ||
                address.state === undefined ||
                address.country === undefined ||
                address.pincode === undefined
            )) {
                await userData.updateOne({ _id: user }, {
                    $set: {
                        first_name: req.body.username1,
                        Last_name: req.body.username2,
                    }
                });
    
             
            }
            
         
            //case  if only profile image is added or updated.
            else if (
                req.body.username1 === undefined ||
                req.body.username2 === undefined ||
                (
                    address.houseNo === undefined || 
                    address.street === undefined ||
                    address.location === undefined ||
                    address.landmark === undefined ||
                    address.city === undefined ||
                    address.state === undefined ||
                    address.country === undefined ||
                    address.pincode === undefined
                )
            ) {
                await userData.updateOne({ _id: user }, {
                    $set: {
                        profileImage: `/${req.file.filename}`,
                    }
                });
            }
    
         //case if both image and firstname and lastname is present.
          else if (
                address.houseNo === undefined || 
                address.street === undefined ||
                address.location === undefined ||
                address.landmark === undefined ||
                address.city === undefined ||
                address.state === undefined ||
                address.country === undefined ||
                address.pincode === undefined
            ) {
                await userData.updateOne({ _id: user }, {
                    $set: {
                        first_name: req.body.username1,
                        Last_name: req.body.username2,
                        profileImage: profilePic,
                    }
                });
            } 
            //case if everything is present.
            else {
                await userData.updateOne({ _id: user }, {
                    $set: {
                        first_name: req.body.username1,
                        Last_name: req.body.username2,
                        phone: req.body.phonenumber,
                        profileImage: profilePic,
                        Address: address,
                    }
                });
            }
        
            console.log("Data saved");
    
            const hasUserAddedDetails = await userData.findOne({ _id: user, });
            res.render("user/userprofileedit.ejs",{hasUserAddedDetails});
        } catch (error) {
            console.error(error.message);
        }
    
    
    







};



//.........................................................

const profile = async (req, res) => {
    try {
        const usersid = req.userid;//this is comming from jwt authentication
        const udata = await userData.findOne({ _id: usersid })
        console.log("in user profile--userController")
        res.render("user/userprofile", { udata })
    }
    catch (error) {
        console.log(error.message)
    }
}

//....change passwword..........
const changepassword = async (req, res) => {
    try {
        res.render("user/changepassword.ejs")
    }
    catch (error) {
        console.log(error.message)
    }
}


const showWishlist = async (req, res) => {
    try {
        const usersid = req.userid;//this is comming from jwt authentication

        const totalCount = await wishData.findOne({ userId: usersid }).countDocuments();
        const page = parseInt(req.query.page) || 1;
        const limit = 5;


        const startIndex = (page - 1) * limit;
        const wishList = await wishData.findOne({ userId: usersid })
            .populate({
                path: "list",
                model: "products",
                match: { isDeleted: false }
            })
            .skip(startIndex)
            .limit(limit);

        res.render("user/wishlist.ejs", {
            wishList,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit)
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
};



//........change password.........................

const changesavedpassword = async (req, res) => {
    try {
        const existingpass = req.body.existingpassword;
        const newPass = req.body.newpassword;
        const confirmPsaa = req.body.confrmpassword;
        // console.log("ep,ip", existingpass, newPass, confirmPsaa)
        const usersid = req.userid;//this is comming from jwt authentication
        if (newPass === confirmPsaa) {
            console.log("inside change password.....usercontroller")
            let userdet = await userData.findOne({ _id: usersid })
            // console.log(userdet)
            const isPasswordValid = await bcrypt.compare(existingpass, userdet.password);
            // console.log("kl", isPasswordValid)
            const passwordCode = await secretPass(req.body.newpassword);
            await userData.updateOne(
                { _id: usersid },
                {
                    $set: {
                        password: passwordCode
                    }
                }
            );
        }
        res.locals.errorMessage = 'Invalid password';
        res.render("user/changepassword.ejs")
    }
    catch (error) {
        console.log(error.message)
    }
}


//..........review by user...................
const addReview = async (req, res) => {
    try {
        const product = req.params.id;
        const reviewProduct = await productDatas.findOne({ _id: product })
        res.render("user/writereview.ejs", { reviewProduct })
    }
    catch (error) {
        console.log(error.message)
    }
}

const saveReview = async (req, res) => {
    try {
        const usersid = req.userid;//from JWT AUTHENTICATION

        const getUserName = await userData.find({ _id: usersid }, { username: 1 });
        console.log("getUserName:", getUserName[0].username);


        const saveRev = new reviewData({
            comment: req.body.reviewDescription,
            rating: req.body.rating,
            user: usersid,
            username: getUserName[0].username,
            product: req.params.id,
            Time: Date.now()
        })
        saveRev.save()
        res.redirect("/home")

    }
    catch (error) {
        console.log(error.message)
    }
}


//.........view review.....................

const viewAllReview = async (req, res) => {
    try {
        const usersid = req.userid;//from JWT AUTHENTICATION
        const selectedProduct = req.params.id;
        // console.log("gd", selectedProduct,usersid)

        let viewRev = await reviewData.find({ product: selectedProduct })
        // console.log("viewRev::",viewRev)
        //we are just changing the time format in the array
        viewRev.forEach(review => {
            review.formattedTime = moment(review.Time).format('MMMM Do YYYY, h:mm:ss a');
        });
        console.log("viewRevinnnn::", viewRev)
        res.render("user/allreview.ejs", { viewRev, selectedProduct })

    }
    catch (error) {
        console.log(error.message)

    }
}



const sortNewReview = async (req, res) => {
    try {

        const productIdNow = req.params.selectedProduct;
        console.log("productIdNow:", productIdNow);

        let viewRev = await reviewData.find({ product: productIdNow }).sort({ Time: -1 });
        viewRev.forEach(review => {
            review.formattedTime = moment(review.Time).format('MMMM Do YYYY, h:mm:ss a');
        });
        console.log(viewRev)
        res.status(200).json({ viewRev });

    } catch (error) {
        console.log(error.message);
    }
};

const sorthighestStar = async (req, res) => {
    try {
        console.log("hello sorthighestStar");
        const productIdNow = req.params.selectedProduct;
        console.log("productIdNow:", productIdNow);

        let viewRev = await reviewData.find({ product: productIdNow }).sort({ rating: 1 });
        viewRev.forEach(review => {
            review.formattedTime = moment(review.Time).format('MMMM Do YYYY, h:mm:ss a');
        });
        // console.log(viewRev)
        res.status(200).json({ viewRev });

    } catch (error) {
        console.log(error.message);
    }
};




const sortLowestStar = async (req, res) => {
    try {
        console.log("hello sortLowestStar");
        const productIdNow = req.params.selectedProduct;
        console.log("productIdNow:", productIdNow);

        let viewRev = await reviewData.find({ product: productIdNow }).sort({ rating: -1 });
        viewRev.forEach(review => {
            review.formattedTime = moment(review.Time).format('MMMM Do YYYY, h:mm:ss a');
        });
        console.log(viewRev)
        res.status(200).json({ viewRev });

    } catch (error) {
        console.log(error.message);
    }
};



//.........wallet..........

const wallet = async (req, res) => {
    try {
        const usersid = req.userid;//from JWT AUTHENTICATION
        const getWWallet = await walletData.findOne({ userId: usersid })
        if (getWWallet == null) {
            res.render("user/emptywallet.ejs")
        }
        // console.log("getWWallet", getWWallet)
       
        res.render("user/wallet.ejs", { getWWallet })
    }
    catch (error) {
        console.log(error.message)
    }
}


const wishtoadd = async (req, res) => {
    try {
        const productId = req.body.productId;
        console.log("Product ID:", productId);
        const usersid = req.userid;//from JWT AUTHENTICATION
        const alreadyIn = await wishData.findOne({ userId: usersid, list: { $in: [productId] } });
        if (alreadyIn == null) {

            const selectedProduct = await productData.findById(productId);


            if (!selectedProduct) {
                console.log("Selected product not found");
                return res.status(404).json({ error: "Selected product not found" });
            }
            // Push the ObjectId of the selected product to the list array in the wishlist collection
            const updatedWishlist = await wishData.findOneAndUpdate(
                { userId: usersid },
                { $push: { list: selectedProduct._id } }, // Push only the ObjectId of the selected product
                { new: true }
            );


            res.status(200).json({ message: "Product added to wishlist successfully" });
        }
        else {
            return res.status(200).json({ message: "Product is already in the wishlist" });

        }

    } catch (error) {
        console.error("Error adding product to wishlist:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};



const wishtoremove = async (req, res) => {
    try {
        let productId = req.body.productId;
        console.log("Product ID to remove:", productId);
    }
    catch (error) {
        console.log(error.message)
    }
}

const addtocartAndDeleteWishlist = async (req, res) => {
    try {
        let itemToDeleteFromWishList = req.body.productId;
        // console.log("itemto remove from wishlist::::::::::::::::::", itemToDeleteFromWishList)
        const usersid = req.userid;//from JWT AUTHENTICATION
        await wishData.findOneAndUpdate({ userId: usersid },
            { $pull: { list: itemToDeleteFromWishList } }
        )
        res.status(200)
    }
    catch (error) {
        console.log(error.message)
    }
}

//............................fFUNCTION TO GET DISTANCE USING POSTAL LOCATION API.......................
const getTransportationCost = async (req, res) => {
    try {
        const pincodes = req.body.pin;

        const chargePerKm = 0.50;

        console.log("in coming pincode::", Number(pincodes))

        const params = {
            "code": "673001",//fixed code of hub.
            "compare": pincodes,
            "country": "IN",
            "unit": "km"
        };

        const headers = {
            "apikey": zipPinCodeKey,
            "Accept": "application/json"
        };

        axios.get("https://api.zipcodestack.com/v1/distance", {//going to another server
            params: params,
            headers: headers
        })
            .then(response => {
                const responseData = response.data;
                const results = responseData.results;
                const distances = Object.values(results);

                console.log("Distances:", distances[0]);
                const DeliveryCharge = distances * chargePerKm;
                console.log("DeliveryCharge:", Math.ceil(DeliveryCharge))
                res.status(200).json({ DeliveryCharge: Math.ceil(DeliveryCharge) });
            })
            .catch(error => {
                console.error(error);
            });
    }
    catch (error) {
        console.log(error.message)
    }
}


//...........exports..................................................................................................
module.exports = {
    home,
    notfound,
    login,
    signup,
    storeData,
    homeNotLog,
    allproductPage,
    loginVerify,
    buyProduct,
    productdetail,
    logout,
    about,
    contact,
    categoryWiseProduct,
    forgotpassword,
    resetpassword,
    contactb,
    aboutb,
    filter,
    editprofile,
    profile,
    saveEditProfile,
    changepassword,
    changesavedpassword,
    addReview,
    saveReview,
    viewAllReview,
    wallet,
    wishtoadd,
    wishtoremove,
    showWishlist,
    addtocartAndDeleteWishlist,
    sortNewReview,
    sortLowestStar,
    sorthighestStar,
    getTransportationCost
}