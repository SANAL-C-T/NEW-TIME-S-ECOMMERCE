
const adminData = require("../model/adminSchema")
const productData = require("../model/productSchema")
const categoryData = require("../model/categorySchema")
const bannerData = require("../model/bannerSchema")
const bannerTextData = require("../model/bannerText")
const userDatas = require("../model/userSchema")
const orderData = require("../model/orderhistoryschema")
const couponData = require("../model/couponSchema")
const referData = require("../model/refferschems")
const cron = require('node-cron');
const bcrypt = require("bcrypt")
const ExcelJS = require('exceljs');
const PDF = require('pdfkit');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');

const moment = require("moment")
require('dotenv').config();
const jwt = require("jsonwebtoken");
const { finished } = require("nodemailer/lib/xoauth2")
const jwtsecret = process.env.jwt_admin_secret


/* ---------------------------------------------------- */
const adminlogin = async (req, res) => {
    try {
        const urlData = {
            pageTitle: 'ADMIN LOGIN',
        };
        console.log()
        res.render("admin/adminlogin.ejs", { urlData })
    } catch (error) {
        console.log(error.message)
    }
}
/* ------------------------------------------------------ */
const hashpass = async (pass) => {
    try {
        const codedpass = await bcrypt.hash(pass, 10);
        return codedpass;
    }
    catch (error) {
        console.log(error.message)
    }
}


//logic to add extradetails of admin,connection to schema
/* ---------------------------------------------------- */
const adminDataStore = async (req, res) => {
     console.log(req.body)
    const secret = await hashpass(req.body.password)
    try {
        const adminDetails = new adminData({
            email: req.body.email,
            password: secret,
            phone: req.body.phone,
            username: req.body.username,
            date: req.body.date,
            status: req.body.status,
            profileImage: req.body.profileImage
        })
        await adminDetails.save()
        console.log("adminDetails saved")
    }
    catch (error) {
        console.log(error.message)
    }
}



const adminSignUP=async (req, res) => {
    try {
      
   
        res.render("admin/adminsignup.ejs")
    } catch (error) {
        console.log(error.message)
    }
}






/* ============================================================ */


//logic for authentication
const adminVerification = async (req, res) => {
    try {
        console.log("kkkk")
        const username = req.body.username;
        const password = req.body.password;
        const checkDb = await adminData.findOne({ username })

        console.log(checkDb)
        if (checkDb) {
            const matchPassword = await bcrypt.compare(password, checkDb.password)
            console.log("fdf", matchPassword)
            let databaseusername = checkDb.username
            if (matchPassword && username == databaseusername) {

                const token = await jwt.sign(//generationg jwt token
                    { id: checkDb._id, username: username },
                    jwtsecret,
                    { expiresIn: "28800000" }
                )

                //senting token using cookie
                const options = {
                    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    httpOnly: true
                }
                res.cookie("token", token, options)//sending in cookie
                res.redirect("/admin/dashboard")
            } else {
                console.log("authentication failed")
                res.redirect("/admin/enter")
            }
        }
    }
    catch (error) {
        console.log(error.message)
    }
}

/* ------------------------------------------------- */
const adminDashboard = async (req, res) => {
    try {

        const salesPaymentMethod = await orderData.aggregate([
            { $group: { _id: "$paymentMethod", count: { $sum: 1 } } }
        ]);

        const reducedPaymentMethods = salesPaymentMethod.reduce((acc, { _id, count }) => {
            acc[_id] = count;
            return acc;
        }, {});

        console.log("paymentMethod11111:", reducedPaymentMethods)

        const salesStatusCount = await orderData.aggregate([
            { $group: { _id: "$Status", count: { $sum: 1 } } }
        ])

        const reducedSalesCounts = salesStatusCount.reduce((acc, { _id, count }) => {
            acc[_id] = count;
            return acc;
        }, {})

        // console.log("StatusCount:", reducedSalesCounts)

        const salesRevenue = await orderData.aggregate([
            { $group: { _id: null, totalAmount: { $sum: "$OrderTotalPrice" } } }
        ]);

        // console.log("sales revenue:",salesRevenue[0].totalAmount)

        const userCount = await userDatas.aggregate([
            { $group: { _id: null, totalUser: { $sum: 1 } } }
        ]);

        // console.log("userCount:",userCount[0].totalUser)

        //this will give the count of sold items, it maybe higher than the order history, as a single order contain many item.
        const SaleGraph = await orderData.aggregate([
            { $unwind: "$items" }, // Unwind the items array
            {
                $group: {
                    _id: "$OrderDateGraph",
                    totalQuantity: { $sum: "$items.quantity" }
                }
            },
            { $sort: { _id: 1 } } // Sort the grouped data by _id (OrderDate) in ascending order
        ]);

        // console.log("SaleGraph:::", SaleGraph)

        const reduceQyt = SaleGraph.reduce((acc, { _id, totalQuantity }) => {
            const formattedDate = moment(_id).format('DD/MM/YYYY');
            if (acc[formattedDate]) {
                acc[formattedDate] += totalQuantity;
            } else {
                acc[formattedDate] = totalQuantity;
            }
            return acc;
        }, {});

        // console.log("SaleGraph:::", reduceQyt)

        const orderCount = await orderData.find({}).count()
        //console.log(" order::", orderCount)



        const bestSellingProduct = await orderData.aggregate([
            { $unwind: "$items" }, // Unwind the items array
            {
                $group: {
                    _id: "$items.productName",
                    totalQuantity: { $sum: "$items.quantity" }
                }
            },
            { $sort: { totalQuantity: -1 } }
        ]);

        // console.log("bestSellingProduct:", bestSellingProduct)


        const bestSellerCategory = await orderData.aggregate([
            { $unwind: "$items" }, // Unwind the items array
            {
                $lookup: {
                    from: "products",
                    localField: "items.products",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" }, // Unwind the product array
            {
                $lookup: {
                    from: "categories",
                    localField: "product.productCategory",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" }, // Unwind the category array
            {
                $group: {
                    _id: "$category.categoryName", // Group by category name
                    totalQuantity: { $sum: "$items.quantity" } // Sum the quantity for each category
                }
            },
            { $sort: { totalQuantity: -1 } } // Sort by total quantity in descending order
        ]);

// console.log("bestSellerCategory::",bestSellerCategory)




        const urlData = {
            pageTitle: 'ADMIN DASHBOARD',
            paymentMethod: reducedPaymentMethods,
            StatusCount: reducedSalesCounts,
            revenue: salesRevenue,
            userCount: userCount,
            daywiseSoldItems: reduceQyt,
            order: orderCount,
            bestseller: bestSellingProduct,
            bestSellercategory:bestSellerCategory
        };

        res.render("admin/admindashboard", { urlData })
    } catch (error) {
        console.log(error.message)
    }
}

//dashboard graph functions for fetch API.................
const renderDashboard = async (req, res) => {
    try {

        const dataOfChoice = req.body.selectedValue;
        //for daywise data to dashboard................................
        if (dataOfChoice == "daywise") {
            console.log(dataOfChoice)
            const todaysDate = moment(Date.now()).format("D-MM-YYYY");
            //THIS GETS PAYMENT METHODE RELATED DATA............
            const salesPaymentMethod = await orderData.aggregate([
                { $match: { OrderDate: { $eq: todaysDate } } },
                { $group: { _id: "$paymentMethod", count: { $sum: 1 } } }
            ]);
            const reducedPaymentMethods = salesPaymentMethod.reduce((acc, { _id, count }) => {
                acc[_id] = count;
                return acc;
            }, {});

            // console.log("paymentMethod:",reducedPaymentMethods,"salesPaymentMethod:",salesPaymentMethod)
            //...............................................................
            const salesStatusCount = await orderData.aggregate([
                { $match: { OrderDate: { $eq: todaysDate } } },
                { $group: { _id: "$Status", count: { $sum: 1 } } }
            ])
            const reducedSalesCounts = salesStatusCount.reduce((acc, { _id, count }) => {
                acc[_id] = count;
                return acc;
            }, {})

            // console.log("StatusCount:", reducedSalesCounts)

            const salesRevenue = await orderData.aggregate([
                { $match: { OrderDate: { $eq: todaysDate } } },
                { $group: { _id: null, totalAmount: { $sum: "$OrderTotalPrice" } } }
            ]);

            // console.log("sales revenue:",salesRevenue[0].totalAmount)

            //this will give the count of sold items, it maybe higher than the order history, as a single order contain many item.
            const SaleGraph = await orderData.aggregate([
                { $match: { OrderDate: { $eq: todaysDate } } },
                { $unwind: "$items" }, // Unwind the items array
                { $group: { _id: "$OrderDateGraph", totalQuantity: { $sum: "$items.quantity" } } },
                { $sort: { _id: 1 } } // Sort the grouped data by _id (OrderDate) in ascending order
            ]);

            // console.log("SaleGraph:::", SaleGraph)

            const reduceQyt = SaleGraph.reduce((acc, { _id, totalQuantity }) => {
                const formattedDate = moment(_id).format('DD/MM/YYYY');
                if (acc[formattedDate]) {
                    acc[formattedDate] += totalQuantity;
                } else {
                    acc[formattedDate] = totalQuantity;
                }
                return acc;
            }, {});

            // console.log("SaleGraph:::", reduceQyt)

            const orderCount = await orderData.find({}).count()
            // console.log(" order::", orderCount)



            const bestSellingProduct = await orderData.aggregate([
                { $match: { OrderDate: { $eq: todaysDate } } },
                { $unwind: "$items" }, // Unwind the items array
                { $group: { _id: "$items.productName", totalQuantity: { $sum: "$items.quantity" } } },
                { $sort: { totalQuantity: -1 } }
            ]);

            //  console.log("bestSellingProduct:", bestSellingProduct)
            const todaysData = {

                paymentMethod: reducedPaymentMethods,
                StatusCount: reducedSalesCounts,
                revenue: salesRevenue,
                daywiseSoldItems: reduceQyt,
                order: orderCount,
                bestseller: bestSellingProduct,
                Choice: dataOfChoice

            };

            console.log(JSON.stringify(todaysData))
            res.status(200).json(todaysData)
        }
        //.............................................................

        //for monthwise data to dashboard.....................
        else if (dataOfChoice == "monthwise") {

            console.log(dataOfChoice)
            //THIS GETS PAYMENT METHODE RELATED DATA............

            const salesPaymentMethod = await orderData.aggregate([
                {
                    $group: {
                        _id: {
                            month: { $month: "$OrderDateGraph" },
                            paymentMethod: "$paymentMethod" // Group by paymentMethod
                        },
                        count: { $sum: 1 } // Count the occurrences of each paymentMethod in each month
                    }
                }
            ]);
            console.log("salesPaymentMethod:::", salesPaymentMethod);
            const groupedDatasets = salesPaymentMethod.reduce((acc, dataset) => {
                const month = dataset._id.month;
                if (!acc[month]) {
                    acc[month] = [];
                }
                acc[month].push({ paymentMethod: dataset._id.paymentMethod, count: dataset.count });
                return acc;
            }, {});

            console.log("groupedDatasets::", groupedDatasets);//true


            const salesPaymentMethodObject = Object.keys(groupedDatasets).reduce((acc, key) => {
                acc[key] = groupedDatasets[key].reduce((result, entry) => {
                    result[entry.paymentMethod] = entry.count;
                    return result;
                }, {});
                return acc;
            }, {});

            console.log("salesPaymentMethodObject:", salesPaymentMethodObject);


            //...............................................................
            //This will get the status of each month.
            const salesStatusCount = await orderData.aggregate([
                {
                    $group: {
                        _id: { month: { $month: "$OrderDateGraph" }, status: "$Status" },
                        count: { $sum: 1 }
                    }
                }
            ]);


            const processedData = salesStatusCount.reduce((acc, dataset) => {
                const month = dataset._id.month;
                if (!acc[month]) {
                    acc[month] = [];
                }
                acc[month].push({ status: dataset._id.status, count: dataset.count });
                return acc;
            }, {});

            // console.log("processedData:",processedData);


            const statusAndCountObject = Object.keys(processedData).reduce((acc, key) => {
                acc[key] = processedData[key].reduce((result, entry) => {
                    result[entry.status] = entry.count;
                    return result;
                }, {});
                return acc;
            }, {});

            //   console.log(statusAndCountObject);

            //.........................................................................
            // const salesRevenue = await orderData.aggregate([
            //     {$match:{OrderDate: { $eq: todaysDate }}},
            //     { $group: { _id: null, totalAmount: { $sum: "$OrderTotalPrice" } } }
            // ]);

            // console.log("sales revenue:",salesRevenue[0].totalAmount)



            // this will give the count of sold items, it maybe higher than the order history, as a single order contain many item.
            const MonthWiseSaleGraph = await orderData.aggregate([

                { $unwind: "$items" }, // Unwind the items array
                { $group: { _id: "$OrderDateGraph", totalQuantity: { $sum: "$items.quantity" } } },
                { $sort: { _id: 1 } } // Sort the grouped data by _id (OrderDate) in ascending order
            ]);

            console.log("MonthWiseSaleGraph:::", MonthWiseSaleGraph)

            const MonthWiseSaleGraphReduceQyt = MonthWiseSaleGraph.reduce((acc, { _id, totalQuantity }) => {
                const formattedDate = moment(_id).format('MM/YYYY');
                if (acc[formattedDate]) {
                    acc[formattedDate] += totalQuantity;
                } else {
                    acc[formattedDate] = totalQuantity;
                }
                return acc;
            }, {});

            console.log("MonthWiseSaleGraph reduceQyt:::", MonthWiseSaleGraphReduceQyt)



            const orderCount = await orderData.find({}).count()
            // console.log(" order::", orderCount)



            // const bestSellingProductperMonth = await orderData.aggregate([
            //     { $unwind: "$items" }, // Unwind the items array
            //     { $group: { _id:"$OrderDateGraph", "$items.productName",totalQuantity: { $sum: "$items.quantity" }} },
            //     { $sort: { totalQuantity: -1 } } 
            // ]);

            //  console.log("bestSellingProductperMonth:", bestSellingProductperMonth)

            const monthwiseData = {
                paymentMethod: salesPaymentMethodObject,
                StatusCount: statusAndCountObject,
                //  revenue: salesRevenue,
                monthwiseSoldItems: MonthWiseSaleGraphReduceQyt,
                order: orderCount,
                Choice: dataOfChoice,
                // bestseller:bestSellingProduct
            };

            // console.log(JSON.stringify(todaysData))
            res.status(200).json(monthwiseData)
        }
        //...........................................
        else if (dataOfChoice == "yearwise") {
            console.log(dataOfChoice)


            //THIS GETS PAYMENT METHODE RELATED DATA............

            const salesPaymentMethodYearwise = await orderData.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: "$OrderDateGraph" },
                            paymentMethod: "$paymentMethod" // Group by paymentMethod
                        },
                        count: { $sum: 1 } // Count the occurrences of each paymentMethod in each month
                    }
                }
            ]);
            console.log("salesPaymentMethodYearwise:::", salesPaymentMethodYearwise);
            const groupedDatasets = salesPaymentMethodYearwise.reduce((acc, dataset) => {
                const year = dataset._id.year;
                if (!acc[year]) {
                    acc[year] = [];
                }
                acc[year].push({ paymentMethod: dataset._id.paymentMethod, count: dataset.count });
                return acc;
            }, {});

            console.log("groupedDatasetsYearwise::", groupedDatasets);//true


            const salesPaymentMethodObjectyearWise = Object.keys(groupedDatasets).reduce((acc, key) => {
                acc[key] = groupedDatasets[key].reduce((result, entry) => {
                    result[entry.paymentMethod] = entry.count;
                    return result;
                }, {});
                return acc;
            }, {});

            console.log("salesPaymentMethodObjectyearwise:", salesPaymentMethodObjectyearWise);


            //...............................................................
            // This will get the status of each month.
            const salesStatusCountYearWise = await orderData.aggregate([
                {
                    $group: {
                        _id: { year: { $year: "$OrderDateGraph" }, status: "$Status" },
                        count: { $sum: 1 }
                    }
                }
            ]);


            const processedDataYearwise = salesStatusCountYearWise.reduce((acc, dataset) => {
                const year = dataset._id.year;
                if (!acc[year]) {
                    acc[year] = [];
                }
                acc[year].push({ status: dataset._id.status, count: dataset.count });
                return acc;
            }, {});

            // console.log("processedData:",processedData);


            const statusAndCountObjectYearwise = Object.keys(processedDataYearwise).reduce((acc, key) => {
                acc[key] = processedDataYearwise[key].reduce((result, entry) => {
                    result[entry.status] = entry.count;
                    return result;
                }, {});
                return acc;
            }, {});

            //   console.log(statusAndCountObject);

            // //.........................................................................
            //             // const salesRevenue = await orderData.aggregate([
            //             //     {$match:{OrderDate: { $eq: todaysDate }}},
            //             //     { $group: { _id: null, totalAmount: { $sum: "$OrderTotalPrice" } } }
            //             // ]);

            //             // console.log("sales revenue:",salesRevenue[0].totalAmount)



            //             // this will give the count of sold items, it maybe higher than the order history, as a single order contain many item.
            const YearWiseSaleGraph = await orderData.aggregate([

                { $unwind: "$items" }, // Unwind the items array
                { $group: { _id: "$OrderDateGraph", totalQuantity: { $sum: "$items.quantity" } } },
                { $sort: { _id: 1 } } // Sort the grouped data by _id (OrderDate) in ascending order
            ]);

            console.log("YearWiseSaleGraph:::", YearWiseSaleGraph)

            const YearWiseSaleGraphReduceQyt = YearWiseSaleGraph.reduce((acc, { _id, totalQuantity }) => {
                const formattedDate = moment(_id).format('YYYY');
                if (acc[formattedDate]) {
                    acc[formattedDate] += totalQuantity;
                } else {
                    acc[formattedDate] = totalQuantity;
                }
                return acc;
            }, {});

            console.log("YearWiseSaleGraphReduceQyt reduceQyt:::", YearWiseSaleGraphReduceQyt)



            //             const orderCount = await orderData.find({}).count()
            // console.log(" order::", orderCount)



            // const bestSellingProductperMonth = await orderData.aggregate([
            //     { $unwind: "$items" }, // Unwind the items array
            //     { $group: { _id:"$OrderDateGraph", "$items.productName",totalQuantity: { $sum: "$items.quantity" }} },
            //     { $sort: { totalQuantity: -1 } } 
            // ]);

            //  console.log("bestSellingProductperMonth:", bestSellingProductperMonth)

            const monthwiseData = {
                paymentMethod: salesPaymentMethodObjectyearWise,
                StatusCount: statusAndCountObjectYearwise,
                // //  revenue: salesRevenue,
                yearwiseSoldItems: YearWiseSaleGraphReduceQyt,
                // order: orderCount,
                Choice: dataOfChoice,
                // bestseller:bestSellingProduct
            };

            // console.log(JSON.stringify(todaysData))
            res.status(200).json(monthwiseData)


        }
        else if (dataOfChoice == "overall") {
            console.log(dataOfChoice)
        }




        res.status(200)
    }
    catch (error) {
        console.log(error.message)
    }
}






/* ------------------------------------------------------------ */
const adminbanner = async (req, res) => {
    try {

        const dataBanner = await bannerData.find({})
        const urlData = {
            pageTitle: 'ADMIN BANNER SETTING',
            firstBanner: dataBanner[0],
            SecondBanner: dataBanner[1],
            ThirdBanner: dataBanner[2]
        };
        res.render("admin/adminbanner.ejs", { urlData })
    } catch (error) {
        console.log(error.message)
    }
}
/* ------------------------------------------------------------ */
const adminproduct = async (req, res) => {
    try {
        const categories = await categoryData.find({
            Categorystatus: true
        });
        const urlData = {
            pageTitle: 'ADMIN PRODUCT ADD',
            cat: categories
        };

        res.render("admin/adminproducts.ejs", { urlData })
    }
    catch (error) {
        console.log(error.message)
    }
}



/* --------------------------------------------------------- */
const showcategory = async (req, res) => {
    try {
        const c = await categoryData.find({})
        const urlData = {
            pageTitle: 'ADMIN CATEGORY',
            cat: c
        };
        res.render("admin/admincategory.ejs", { urlData })
    } catch (error) {
        console.log(error.message)
    }
}


/* ---------------------------------------------------- */
const addcategory = async (req, res) => {

    let cateN = req.body.categoryName
    try {
        let act;
        let stat = req.body.Categorystatus
        if (stat == "active") {
            act = true;
        } else if (stat == "inactive") {
            act = false;
        }
        // console.log("incoming data:::::", req.body)
        const addcategoryDetails = new categoryData({
            categoryName: req.body.categoryName,
            Categorystatus: act
        });
        // console.log(addcategoryDetails.categoryName);
        // const alreadyCat = await categoryData.findOne({ categoryName: cateN })
        const alreadyCat = await categoryData.findOne({ categoryName: { $regex: new RegExp(cateN, 'i') } })

        if (alreadyCat === null) {
            await addcategoryDetails.save();
            console.log("Category data saved");
        } else {
            console.log("category already exist so data not saved to database")
        }
        res.redirect("/admin/category")
    } catch (error) {
        console.error(error.message);
    }
};


/* ------------------------------------------------------------ */
const addbanner = async (req, res) => {
    try {
        const addbannerDetails = new bannerData({
            profileImage: req.body.profileImage
        })
        await addbannerDetails.save()
    }
    catch (error) {
        console.log(error.message)
    }
}

/* ---------------------------------------------------- */
const logout = async (req, res) => {
    try {
        // console.log(req.cookie)
        res.clearCookie('token')
        // console.log(req.cookie)
        res.redirect("/admin/enter")
    }
    catch (error) {
        console.log(error.message)
    }
}


/* ---------------------------------------------------- */
const usermanage = async (req, res) => {
    try {
        const UD = await userDatas.find({});
        const urlData = {
            pageTitle: 'ADMIN USER MANAGEMENT',
            userdetails: UD
        };
        res.render("admin/adminusermnage.ejs", { urlData });
    }
    catch (error) {
        console.log(error.message)
    }
}

/* ---------------------------------------------------- */
const usersetting = async (req, res) => {
    console.log("Entering usersetting function");
    const userId = req.params.id;
    let usersStat = (await userDatas.findById(userId))

    if (usersStat.status == true) {
        try {
            console.log("User w:", usersStat.status);
            console.log("User ID:", userId);
            await userDatas.findByIdAndUpdate(userId, { status: false });
            res.redirect("/admin/usercontol")
        } catch (error) {
            console.error(error.message);

        }
    }

};

/* ---------------------------------------------------- */
const usersetting1 = async (req, res) => {
    console.log("Entering usersetting function");
    try {
        const userId = req.params.id;
        console.log("User ID:", userId);
        await userDatas.findByIdAndUpdate(userId, { status: true });
        res.redirect("/admin/usercontol")
    } catch (error) {
        console.error(error.message);

    }
};


/* ---------------------------------------------------- */
const deleCategory = async (req, res) => {
    try {
        console.log("cat delete")
        const ide = req.params.id
        // console.log("::::::::::",ide)
        const cid = await categoryData.updateOne({ _id: ide }, { $set: { Categorystatus: false } });
        res.redirect("/admin/category")

    }
    catch (error) {
        console.log(error.message)
    }
}

/* ---------------------------------------------------- */
const restoreCategory = async (req, res) => {
    try {
        const cats = req.params.id;
        await categoryData.updateOne({ _id: cats }, { $set: { Categorystatus: true } })
        res.redirect("/admin/category")
    }
    catch (error) {
        console.log(error.message)
    }
}

/* ---------------------------------------------------- */

const editorCategory = async (req, res) => {
    try {
        const categid = req.params.id
        let catedata = await categoryData.findOne({ _id: categid })
        const toEjs = {
            catsdata: catedata
        }
        res.render("admin/admineditcategory.ejs", { toEjs })
    }
    catch (error) {
        console.log(error.message)
    }
}


/* ---------------------------------------------------- */
const editedCategory = async (req, res) => {
    try {
        let newcategoryname = req.body.categoryName;
        let newstatus = req.body.Categorystatus;
        const ids = req.params.id;

const alreadyExist=await categoryData.findOne({categoryName:newcategoryname})

if(alreadyExist==null){
    await categoryData.updateOne({ _id: ids }, { $set: { categoryName: newcategoryname, Categorystatus: newstatus } })
    res.redirect("/admin/category")
}else{
  
    let catedata = await categoryData.findOne({ _id: ids })
        const toEjs = {
            catsdata: catedata
        }
        res.locals.errorMessage = 'Name already exist';
        res.render("admin/admineditcategory.ejs", { toEjs })
}

      
    }
    catch (error) {
        console.log(error.message)
    }
}

/* ---------------------------------------------------- */
const orderManagement = async (req, res) => {
    try {
        const urlData = {
            pageTitle: 'ORDER MANAGEMENT',
        }
        let userOrder = await orderData.find({})
        // console.log("lllk",userOrder)
        res.render("admin/ordermanagement.ejs", { urlData, userOrder })
    }
    catch (error) {
        console.log(error.message)
    }
}

/* ---------------------------------------------------- */


const orderStatusUpdate = async (req, res) => {
    console.log("status")
    try {
        const orderId = req.params.id;
        let index = req.body.index;
        let status = req.body.status;
        console.log("orderStatusUpdate in admin", orderId, index, status);
        let date = Date.now()
        var formatedDate = moment(date).format('D-MM-YYYY, dddd, h:mm a')
        // console.log(formatedDate)

        await orderData.updateOne(
            { _id: orderId },
            { $set: { Status: status, DeliveredDate: formatedDate } }
        );

        // if (status === "Cancel") {
        //     let productItems = await orderData.findOne({ _id: orderId }).select('items');

        //     for (const element of productItems.items) {
        //         console.log(element.quantity, element.products);
        //         await productData.updateOne({ _id: element.products }, { $inc: { stockCount: element.quantity } });
        //     }
        // }

        res.redirect("/admin/orders")
    }
    catch (error) {
        console.log(error.message)
    }
}


const coupons = async (req, res) => {
    try {
        const urlData = {
            pageTitle: 'COUPON MANAGEMENT',
        }
        res.render("admin/couponpage.ejs", { urlData })
    }
    catch (error) {
        console.log(error.message)
    }
}



const listcoupons = async (req, res) => {
    try {
        let list = await couponData.find({})
        const urlData = {
            pageTitle: 'LIST OF COUPON',
            couponList: list
        }
        res.render("admin/adminlistcoupon.ejs", { urlData })
    }
    catch (error) {
        console.log(error.message)
    }
}

//adding the coupon to database
const addcoupons = async (req, res) => {
    try {
        const urlData = {
            pageTitle: 'COUPON MANAGEMENT',
        }
        const code = req.body.couponCode;
        let offerType = req.body.offerType;
        let couponCodeDescription = req.body.couponCodeDescription;
        let addedOn = req.body.addDate
        let expiryOn = req.body.ExpiryDate
        const value = req.body.couponValue;

        // console.log("expiryOn:",expiryOn)
        // console.log("addedOn:",addedOn)
        // console.log(" couponCodeDescription:", couponCodeDescription)
        // console.log("offerType:",offerType)
        // console.log("code:",code)
        // console.log("value:",value)


        const alreadyCode = await couponData.findOne({ couponCode: code });

        if (alreadyCode == null) {
            const addCoupon = new couponData({
                couponCode: code,
                offerType: offerType,
                OfferDescription: couponCodeDescription,
                discount: value,
                expiryDate: expiryOn,
                createdDate: addedOn,
            })
            addCoupon.save()
            res.render("admin/couponpage.ejs", { urlData })
        }

        else {

            res.locals.errorMessage = 'THE CODE ALREADY EXISTS';
            res.render("admin/couponpage.ejs", { urlData });
        }




    }
    catch (error) {
        console.log(error.message)
    }
}


//show the edit page for each coupon document
const editcoupons = async (req, res) => {
    try {
        const id = req.params.id;
        let list = await couponData.find({ _id: id })
        const urlData = {
            pageTitle: 'EDIT THE COUPON',
            code: list
        }
        res.render("admin/admineditcoupon.ejs", { urlData })
    }
    catch (error) {
        console.log(error.message)
    }
}


//save the edited coupon 
const changecoupons = async (req, res) => {
    try {
        const id = req.params.id;
        // console.log("id:",id)
        const code = req.body.couponCode;
        let offerType = req.body.offerType;
        let couponCodeDescription = req.body.couponCodeDescription;
        let addedOn = req.body.addDate
        let expiryOn = req.body.ExpiryDate
        let value = req.body.couponValue;

        //    console.log("expiryOn:",expiryOn)
        //    console.log("addedOn:",addedOn)
        //    console.log(" couponCodeDescription:", couponCodeDescription)
        //    console.log("offerType:",offerType)
        //    console.log("code:",code)
        //    console.log("value:",value)
        await couponData.findByIdAndUpdate({ _id: id }, {
            $set: {
                couponCode: code,
                offerType: offerType,
                OfferDescription: couponCodeDescription,
                discount: value,
                expiryDate: expiryOn,
                createdDate: addedOn
            }
        })

        res.redirect("/admin/listCoupon")
    }
    catch (error) {
        console.log(error.message)
    }
}



//to remove the coupon
const deletecoupons = async (req, res) => {
    try {
        const id = req.params.id;
        await couponData.findByIdAndDelete({ _id: id })
        res.redirect("/admin/listCoupon")

    }
    catch (error) {
        console.log(error.message)
    }
}

//....variavles for report printing.......
var downloadtotal;
var downloadCODtotal;
var downloadrazorpayTotal;
var downloadcount;
var downloadreturned;
var discount;
var discountedCount;

// to download the sale report
const downloadoption = async (req, res) => {
    console.log("download transaction");

    try {
        let ordersOfUser = await orderData.find({});
        let totalAmountSum = await orderData.aggregate([
            { $group: { _id: null, total: { $sum: "$OrderTotalPrice" } } }
        ]);
        let generated = totalAmountSum.length > 0 ? totalAmountSum[0].total : 0;
        console.log("totalAmountSum::", generated);

        let totalPAYMENTSum = await orderData.aggregate([
            { $group: { _id: "$paymentMethod", total: { $sum: "$OrderTotalPrice" } } }
        ]);
        console.log("totalPAYMENTSum::", totalPAYMENTSum);

        let totalReturnedSum = await orderData.aggregate([
            { $match: { Status: "Returned" } },
            { $group: { _id: "$Status", total: { $sum: "$OrderTotalPrice" } } }
        ]);
        totalReturnedSum = totalReturnedSum.length > 0 ? totalReturnedSum[0].total : 0;

        console.log("totalReturnedSum::", totalReturnedSum); // []

        const orders = await orderData.find({}).populate({
            path: "userid",
            model: "user"
        });
        console.log(orders);

        let totalReturnedCount = await orderData.aggregate([
            { $match: { Status: "Returned" } },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);
        totalReturnedCount = totalReturnedCount.length > 0 ? totalReturnedCount[0].count : 0;
        console.log("totalReturnedCount::", totalReturnedCount);

        let totalDeliveredCount = await orderData.aggregate([
            { $match: { Status: "delivered" } },
            { $group: { _id: null, count: { $sum: 1 } } }
        ]);
        totalDeliveredCount = totalDeliveredCount.length > 0 ? totalDeliveredCount[0].count : 0;
        console.log("totalDeliveredCount:::", totalDeliveredCount);

        let discountAmount = await orderData.aggregate([
            { $unwind: "$items" },
            { $match: { "items.discounted": true } },
            { $group: { _id: null, totalDiscountAmount: { $sum: "$items.DiscountedAmount" } } }
        ]);
        discountAmount = discountAmount.length > 0 ? discountAmount[0].totalDiscountAmount : 0;
        console.log("discount amount", discountAmount);

        let totalcouponDiscount = await orderData.aggregate([
            { $match: { discountedByCoupon: true } },
            { $group: { _id: null, total: { $sum: "$discountgiven" } } }
        ]);
        totalcouponDiscount = totalcouponDiscount.length > 0 ? totalcouponDiscount[0].total : 0;
        console.log("totalcouponDiscount::", totalcouponDiscount);

        const discountedItemCount = await orderData.aggregate([
            { $unwind: "$items" },
            { $group: { _id: null, discountedItemCount: { $sum: { $cond: [{ $eq: ["$items.discounted", true] }, 1, 0] } } } }
        ]);
        console.log("discount count", discountedItemCount[0].discountedItemCount);

        let totalcounts = await orderData.find({}).count();
        console.log("TOTAL COUNT OF ORDER:", totalcounts);

        // Filter totalPAYMENTSum array to get COD and razorpay totals
        let CODtotal = 0;
        let razorpayTotal = 0;
        totalPAYMENTSum.forEach(item => {
            if (item._id === "COD") {
                CODtotal = item.total;
            } else if (item._id === "razorpay") {
                razorpayTotal = item.total;
            }
        });


let actualAmount=generated-totalReturnedSum;

        const urlData = {
            pageTitle: 'SALES REPORT',
            salesData: orders,
            total: generated,
            actual:actualAmount,
            CODtotal: CODtotal,
            razorpayTotal: razorpayTotal,
            count: totalcounts,
            returned: totalReturnedSum,
            discount: totalcouponDiscount,
            discountedCount: discountedItemCount[0].discountedItemCount,
            returncount: totalReturnedCount,
            deliveredCount: totalDeliveredCount
        };

        // Setting variables for report printing
        downloadtotal = generated;
        downloadCODtotal = CODtotal;
        downloadrazorpayTotal = razorpayTotal;
        downloadcount = totalcounts;
        downloadreturned = totalReturnedSum;
        discount = totalcouponDiscount;
        discountedCount = discountedItemCount[0].discountedItemCount;

        // Rendering the template
        res.render("admin/downloadsoption.ejs", { urlData });
    } catch (error) {
        console.log(error.message);
        res.render("admin/warning.ejs");
    }
};









const daywisereport = async (req, res) => {
    try {
        res.render("../views/admin/bydate.ejs")
    }
    catch (error) {
        console.log(error.message)
    }
}

const downloadrevenue = async (req, res) => {
    try {
        console.log("download");
        const H = "REVENUE DETAILS";
        const data = [
            ['Total Generated Amount', 'COD', 'Online Payment', 'Amount Returned', 'Sale Count', 'Total Discount'],
            [downloadtotal, downloadCODtotal, downloadrazorpayTotal, downloadcount, downloadreturned, discount],
        ];

        // Create a new workbook and add a worksheet
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');
        worksheet.addRow([H]);

        for (let i = 0; i < 2; i++) {
            worksheet.addRow([]);
        }
        // Add data to the worksheet
        data.forEach(row => {
            worksheet.addRow(row);
        });

        const columnWidths = [20, 15, 15, 20, 15, 15];

        columnWidths.forEach((width, index) => {
            worksheet.getColumn(index + 1).width = width;
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=table.xlsx');


        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error creating Excel file:', error.message);
        res.status(500).send('Internal Server Error');
    }
};


const fs = require('fs');

const downloadrevenuepdf = async (req, res) => {
    try {

        const currentDate = moment().format('DD/MM/YYYY, hh:mm:ss');


        const data = [
            ['GENERATED AMOUNT', 'AMOUNT TO ACCOUNT', 'COD', 'ONLINE PAYMENT', 'AMOUNT RETURNED', 'AMOUNT DISCOUNTED'],
            [downloadtotal, downloadCODtotal, downloadrazorpayTotal, downloadcount, downloadreturned, discount],

        ];

        // Create a new PDF document
        const pdfDoc = await PDFDocument.create();
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);


        const page = pdfDoc.addPage([595.28, 841.89]);
        const { width, height } = page.getSize();
        const fontSize = 7;
        const margin = 10;

        // Title
        const titleHeight = 14; // Title font size
        const titleWidth = timesRomanFont.widthOfTextAtSize('TIME S, Revenue Details', titleHeight);
        const titleX = (width - titleWidth) / 2;
        page.drawText('TIME S, Revenue Details', {
            x: titleX,
            y: height - margin - titleHeight,
            size: titleHeight,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // Draw the current date below the title
        const dateHeight = 10; // Date font size
        const dateWidth = timesRomanFont.widthOfTextAtSize(currentDate, dateHeight);
        const dateX = (width - dateWidth) / 2;
        page.drawText(currentDate, {
            x: dateX,
            y: height - margin - titleHeight - dateHeight - 5,
            size: dateHeight,
            font: timesRomanFont,
            color: rgb(0, 0, 0),
        });

        // Calculate column widths and positions dynamically
        const numColumns = data[0].length;
        const columnWidth = (width - 1 * margin) / numColumns;
        const columnPositions = Array.from({ length: numColumns }, (_, i) => margin + i * columnWidth);

        // Table Header
        let y = height - margin - titleHeight - dateHeight - 20;
        for (let i = 0; i < data[0].length; i++) {
            page.drawText(data[0][i], {
                x: columnPositions[i],
                y,
                size: fontSize,
                font: timesRomanFont,
                color: rgb(0, 0, 0),
            });
        }
        y -= 20;

        // Table Data
        const cellHeight = 20;
        for (let i = 1; i < data.length; i++) {
            for (let j = 0; j < data[i].length; j++) {
                page.drawText(data[i][j].toString(), {
                    x: columnPositions[j],
                    y,
                    size: fontSize,
                    font: timesRomanFont,
                    color: rgb(0, 0, 0),
                });
            }
            y -= cellHeight;
        }

        // Save the PDF document to a buffer
        const pdfBytes = await pdfDoc.save();

        // Write the buffer to a file
        fs.writeFileSync('revenueDetails.pdf', pdfBytes);

        // Send the PDF file as a downloadable response
        res.download('revenueDetails.pdf', 'revenueDetails.pdf', (err) => {
            if (err) {
                console.error('Error sending file:', err);
                res.status(500).send('Internal Server Error');
            } else {
                console.log('File sent successfully');
                // Optionally, you can delete the file after sending
                fs.unlinkSync('revenueDetails.pdf');
            }
        });
    } catch (error) {
        console.log('Error:', error.message);
        res.status(500).send('Internal Server Error');
    }
};
// categorywise offer get page

const addoffercategory = async (req, res) => {
    try {
        let categData = await categoryData.find({ Categorystatus: true })
        const urlData = {
            pageTitle: 'ADD  CATEGORY OFFER',
            category: categData
        }
        // console.log("categData:::",categData)
        res.render("admin/categoryoffer.ejs", { urlData })
    }
    catch (error) {
        console.log(error.message)
    }
}


//product offer  get page from categorywise offer page
const addofferproduct = async (req, res) => {
    try {
        let prodata = await productData.find({})

        const urlData = {
            pageTitle: 'ADD PRODUCT OFFER',
            products: prodata
        }

        res.render("admin/adminoffer.ejs", { urlData })
    }
    catch (error) {
        console.log(error.message)
    }
}



const offerreferal = async (req, res) => {
    try {

        const bonusIs = await referData.find({})
        const bonusavalible = bonusIs[0].bonusAmount;

        const urlData = {
            pageTitle: 'ADD REFERAL OFFER',

        }
        res.render("admin/adminreferaladd.ejs", { urlData, bonusavalible })
    }
    catch (error) {
        console.log(error.message)
    }
}


const addReferalOffer = async (req, res) => {
    try {
        const bonusAmount = req.body.bonus;
        const createdDate = req.body.refferCreatedDate;
        const expiryDate = req.body.refferExpiryDate;


        const referCodeAdd = new referData({
            bonusAmount: bonusAmount,
            expiryDate: expiryDate,
            createdDate: createdDate,
        })

        referCodeAdd.save()

        const urlData = {
            pageTitle: 'ADD REFERAL OFFER',

        }

        const bonusIs = await referData.find({})
        const bonusavalible = bonusIs[0].bonusAmount;

        res.render("admin/adminreferaladd.ejs", { urlData, bonusavalible })
    }
    catch (error) {
        console.log(error.message)
    }
}



const updateReferalOffer = async (req, res) => {
    try {
        const bonusAmounts = req.body.bonus;
        const createdDate = req.body.refferCreatedDate;
        const expiryDate = req.body.refferExpiryDate;


        await referData.findOneAndUpdate({}, {
            $set: {
                bonusAmount: bonusAmounts, expiryDate: expiryDate,
                createdDate: createdDate,
            }
        })


        const urlData = {
            pageTitle: 'ADD REFERAL OFFER',

        }

        const bonusIs = await referData.find({})
        console.log("bonusavalible:", bonusIs)
        const bonusavalible = bonusIs[0].bonusAmount;
        console.log("bonusavalible:", bonusavalible)
        res.render("admin/adminreferaladd.ejs", { urlData, bonusavalible })
    }
    catch (error) {
        console.log(error.message)
    }
}



//adding offer of category to db.
const offercategorywise = async (req, res) => {
    try {
        console.log("data coming to offer caterogrywise in admin controller");

        let selectedCategory = req.body.productCategory;
        let discountValue = req.body.discount;
        let offerCreatedDate = req.body.createdDate;
        let offerEndDate = req.body.expiryDate;
        console.log("www", selectedCategory, discountValue, offerCreatedDate, offerEndDate)

        let addedOffer = {
            catDiscountValue: discountValue,
            startDate: offerCreatedDate,
            endDate: offerEndDate,
        }

        await categoryData.findOneAndUpdate({ _id: selectedCategory }, { $set: { catOffer: addedOffer, hasCatOffer: true } })

        res.redirect("/admin/Offercategory")

    }
    catch (error) {
        console.log(error.message)
    }
}


//remove category based offer.......
const removeOffer = async (req, res) => {
    try {
        let id = req.body.id;
        await categoryData.findOneAndUpdate(
            { _id: id },
            { $unset: { catOffer: 1 } },
            { new: true }
        );
        await categoryData.findOneAndUpdate({ _id: id }, { $set: { hasCatOffer: false } })
        res.status(200).json({ message: "Offer removed successfully." });
    }
    catch (error) {
        console.log(error.message)
    }
}


const removeproductOffer = async (req, res) => {
    try {
        let id = req.body.id;
        console.log("data coming to product offer remove:::", id)

        await productData.findOneAndUpdate(
            { _id: id },
            { $unset: { offer: 1 } },
            { new: true }
        );

        await productData.findOneAndUpdate({ _id: id }, { $set: { haveProductOffer: false } })
        //the below code is very important for page reloading from javascript....
        res.status(200).json({ message: "Offer removed successfully." });
    }
    catch (error) {
        console.log(error.message)
    }
}


//adding product based offer to data base.....
const offerproductwise = async (req, res) => {
    try {

        console.log("data coming to offer caterogrywise in admin controller");

        let selectedProduct = req.body.productId;
        let discountValue = req.body.discount;
        let offerCreatedDate = req.body.createdDate;
        let offerEndDate = req.body.expiryDate;
        console.log("offerproductwise:::", selectedProduct, discountValue, offerCreatedDate, offerEndDate)


        let addedOffer = {
            Discountvalue: discountValue,
            StartDate: offerCreatedDate,
            endDate: offerEndDate,
        }
        await productData.findOneAndUpdate({ _id: selectedProduct }, { $set: { offer: addedOffer, haveProductOffer: true } })

        res.redirect("/admin/Offerproduct")
    }
    catch (error) {
        console.log(error.message)
    }
}

// here is the logic for controlling the offer after expirydate.....
async function checkDate() {
    try {
        let todayDate = Date.now() // Get today's date
        console.log("CHECKING OFFER AND COUPON EXPIRED ?");

        // Removing expired product offers
        const productsWithOffers = await productData.find({ offer: { $exists: true, $not: { $size: 0 } } });
        for (const product of productsWithOffers) {
            for (const offer of product.offer) {
                if ((offer.endDate)<(todayDate)) {
                    await productData.updateOne(
                        { _id: product._id },
                        { $pull: { offer: { endDate: offer.endDate } }, $set: { haveProductOffer: false } }
                    );
                    console.log("Product offer removed for product:", product._id);
                }
            }
        }

        // Removing expired coupons
        const couponExpire = await couponData.find({});
        for (const coupon of couponExpire) {
            if ((coupon.expiryDate)<(todayDate)) {
                await couponData.deleteOne({ _id: coupon._id });
                
            }
        
        
        }
    } catch (error) {
        console.error("Error:", error.message);
    }
}

cron.schedule('*/10 * * * * *', () => {
    checkDate();
});




//for datewise sales report 
const postbydate = async (req, res) => {
    try {
        const startd = req.body.startDate;
        const endd = req.body.endDate;
        const sDate = moment(startd).format('D-MM-YYYY');
        const eDate = moment(endd).format('D-MM-YYYY');
        console.log(sDate, eDate)


        const orders = await orderData.find({
            OrderDate: { $gte: (sDate), $lte: (eDate) }
        }).populate({
            path: "userid",
            model: "user"
        });
        console.log("datewise:::::::", orders)


        const totalgenerated = await orderData.aggregate([
            { $match: { OrderDate: { $gte: sDate, $lte: eDate } } },
            { $group: { _id: null, total: { $sum: "$OrderTotalPrice" } } }
        ]).exec();

        const revenue = totalgenerated[0]?.total;
        console.log("totalgenerated:::", totalgenerated[0]?.total)


        let razerpayAmountSum = await orderData.aggregate([
            { $match: { OrderDate: { $gte: sDate, $lte: eDate }, paymentMethod: "razorpay" } },
            { $group: { _id: "$paymentMethod", total: { $sum: "$OrderTotalPrice" } } }
        ]).exec();


        let codAmountSum = await orderData.aggregate([
            { $match: { OrderDate: { $gte: sDate, $lte: eDate }, paymentMethod: "COD" } },
            { $group: { _id: "$paymentMethod", total: { $sum: "$OrderTotalPrice" } } }
        ]).exec();



        let walletAmountSum = await orderData.aggregate([
            { $match: { OrderDate: { $gte: sDate, $lte: eDate }, paymentMethod: "MyWallet" } },
            { $group: { _id: "$paymentMethod", total: { $sum: "$OrderTotalPrice" } } }
        ]).exec();

        console.log("razerpay::::", razerpayAmountSum)
        console.log("cod::::", codAmountSum)
        console.log("wallet::::", walletAmountSum)

        const raz = razerpayAmountSum[0]?.total;
        const cod = codAmountSum[0]?.total;
        const walletss = walletAmountSum[0]?.total;



        let totalReturnedamount = await orderData.aggregate([
            { $match: { OrderDate: { $gte: sDate, $lte: eDate }, Status: "Returned" } },
            { $group: { _id: "$Status", total: { $sum: "$OrderTotalPrice" } } }
        ]).exec();


        if (totalReturnedamount === null || totalReturnedamount.length === 0) {
            totalReturnedamount = 0;

        } else {
            totalReturnedamount = await orderData.aggregate([
                { $match: { OrderDate: { $gte: sDate, $lte: eDate }, Status: "Returned" } },
                { $group: { _id: "$Status", total: { $sum: "$OrderTotalPrice" } } }
            ]).exec();
        }

        const returned = totalReturnedamount[0]?.total;
        console.log("totalReturnedamount::", returned)

        let totalcouponDiscount = await orderData.aggregate([
            { $match: { OrderDate: { $gte: sDate, $lte: eDate }, discountedByCoupon: true } },
            { $group: { _id: null, total: { $sum: "$discountgiven" } } }
        ]).exec();

        // Check if totalcouponDiscount is null or empty
        if (!totalcouponDiscount || totalcouponDiscount.length === 0 || totalcouponDiscount[0].total === undefined) {
            totalcouponDiscount = 0;
        } else {
            // Extract the total from the result
            totalcouponDiscount = totalcouponDiscount[0]?.total;
        }


        console.log("totalcouponDiscount::", totalcouponDiscount)

        const urlData = {
            pageTitle: 'SALES REPORT BY DATE',
        }


        res.render("admin/bydate.ejs", { urlData, orders, revenue, raz, cod, walletss, returned, totalcouponDiscount })
    }
    catch (error) {
        console.log(error.message)
        res.render("admin/warning.ejs");
    }
}



//RENDERING THE PAGE WITH DATEWISE SALES REPORT....
const bydate = async (req, res) => {
    try {
    }
    catch (error) {
        console.log(error.message)
    }
}



const downloadDetailPdf = async (req, res) => {

    try {
        const tableData = req.body.tableData;
        const currentDate = new Date().toDateString();

        const pdfDoc = new PDF();


        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="table_data.pdf"');
        const title = "TIME S  SALES REPORT"

        pdfDoc.pipe(res);
        pdfDoc.text(title, { align: 'center' });
        pdfDoc.moveDown();
        pdfDoc.moveTo(50, pdfDoc.y)

            .lineTo(550, pdfDoc.y)

            .stroke();
        pdfDoc.moveDown();
        pdfDoc.text("DOWNLOADED ON: " + currentDate, { align: 'right' });
        pdfDoc.moveDown();
        pdfDoc.moveTo(50, pdfDoc.y)

            .lineTo(550, pdfDoc.y)

            .dash(5, { space: 5 })

            .stroke();
        pdfDoc.moveDown();
        pdfDoc.moveDown();

        // Create table header
        const header = ['SL NO', 'USERNAME', 'INVOICE DATE', 'INVOICE AMOUNT', 'PAYMENT METHOD'];
        const rowWidths = [20, 20, 20, 20, 20]; // Adjust column widths to add space between columns

        // Set font and font size for header and table content
        pdfDoc.font('Helvetica').fontSize(10);

        // Draw header
        pdfDoc.font('Helvetica').fontSize(11);
        pdfDoc.text(header.join('        '), { align: 'left', width: 1000 }); // Draw header text with increased width to add space between columns

        // Draw table rows
        pdfDoc.moveDown(); // Move down to create space between header and table data
        tableData.forEach(row => {
            const formattedRow = row.map((cell, index) => {
                return cell.padEnd(rowWidths[index] - 2); // Adjust padding for each cell to match column width
            });
            pdfDoc.text(formattedRow.join('        '), { align: 'left', width: 1000 }); // Draw row text with increased width to add space between columns
            pdfDoc.moveDown();

            // Move down to the next row
        });


        pdfDoc.end();
    } catch (error) {
        console.log(error.message);
        res.status(500).send('Internal Server Error');
    }
}



const downloadDetailExcel = async (req, res) => {
    try {
        const { tableData } = req.body;

        console.log("0000000000000000000000000000000");
        console.log('Received tableData:', tableData);
        // Create a new workbook
        const headings = ['SL No', 'USERNAME', 'INVOICE DATE', 'INVOICE AMOUNT', 'PAYMENT METHOD'];
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sheet 1');
        worksheet.addRow(headings);

        // Add the table data to the worksheet
        tableData.forEach(row => {
            worksheet.addRow(row);
        });
        worksheet.columns.forEach((column, index) => {
            // Set width for the first column (SL No) to 10 characters
            if (index === 0) {
                column.width = 10;
            }
            // Set width for other columns to auto-fit
            else {
                column.width = 35;
            }
        });
        // Set the appropriate response headers for file download
        res.set({
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': 'attachment; filename=table_data.xlsx'
        });

        // Generate Excel file buffer
        const buffer = await workbook.xlsx.writeBuffer();

        // Send the Excel file buffer as the response
        res.send(buffer);
    } catch (error) {
        console.error('Error generating or sending Excel file:', error);
        res.status(500).send('Internal Server Error');
    }
};

const bannerAdding = async (req, res) => {
    try {
        console.log("hello")
        let bannerImagePath = `/${req.file.filename}`;
        console.log(bannerImagePath)
        res.status(200).send("data received");
    }
    catch (error) {
        console.log(error.message)
    }
}


const bannerConfigur = async (req, res) => {
    try {
        const urlData = {
            pageTitle: 'ADD BANNER',
        }
        res.render("admin/configurbanner.ejs", { urlData })
    }
    catch (error) {
        console.log(error.message)
    }
}


const bannerdatabse = async (req, res) => {
    try {
        console.log("all  files::::", req.files)
        console.log("files::::", req.files.bannerImage1[0].path)
        console.log("files::::", req.files.bannerImage2[0].path)
        console.log("files::::", req.files.bannerImage3[0].path)
        const imag = {
            bannerImg1: `/${req.files.bannerImage1[0].path}`,
            bannerImg2: `/${req.files.bannerImage2[0].path}`,
            bannerImg3: `/${req.files.bannerImage3[0].path}`
        };

        // Create a new bannerData instance with the imag object
        const data = new bannerData({
            Bannerimages: imag
        });

        // Save the data to the database
        await data.save();


        res.status(200).send('Banner data saved successfully.');
    } catch (error) {
        console.log(error.message);

        res.status(500).send('Internal server error.');
    }
};



//this is the working code to initiate the banner......


const storebanner = async (req, res) => {
    try {
        const imgId = req.params.section;
        const imgfile = req.files
        const mainText = req.body.mainText;
        const subText = req.body.subText;
        const introText = req.body.introText;
        const subHeadingText = req.body.subHeadingText;
        const HeadingText = req.body.HeadingText;

        const img1 = imgfile.bannerImage1[0].path.substring(imgfile.bannerImage1[0].path.indexOf('\\') + 1);
        const img2 = imgfile.bannerImage2[0].path.substring(imgfile.bannerImage2[0].path.indexOf('\\') + 1);
        const img3 = imgfile.bannerImage3[0].path.substring(imgfile.bannerImage3[0].path.indexOf('\\') + 1);

        const bannerConfig = new bannerData({
            sectionName: imgId,
            bannerImage1: `/${img1}`,
            bannerImage2: `/${img2}`,
            bannerImage3: `/${img3}`,
            MainTextContent: mainText,
            SubTextContent: subText,
            introductionTextContent: introText,
            heading: HeadingText,
            subHeading: subHeadingText
        })
        bannerConfig.save()
    }
    catch (error) {
        console.log(error.message)
    }
}




const updateBanner = async (req, res) => {
    try {
        console.log("in update")
        let sections = req.params.section;
        const imgfile = req.files
        const mainText = req.body.mainText;
        const subText = req.body.subText;
        const introText = req.body.introText;
        const subHeadingText = req.body.subHeadingText;
        const HeadingText = req.body.HeadingText;
        // console.log("updateImage::::", imgfile)
         console.log("updateData::::", HeadingText )
         console.log("updateData::::", sections)
        // console.log("section:", sections)

        if (sections == "sectionOne") {
            let img1;
            if (imgfile.bannerImage1 && imgfile.bannerImage1.length > 0) {
                img1 = imgfile.bannerImage1[0].path.substring(imgfile.bannerImage1[0].path.indexOf('\\') + 1);
            } else {

                img1 = "";
            }
            if (img1 != "") {
                await bannerData.findOneAndUpdate(
                    { sectionName: "sectionOne" },
                    {
                        $set: {
                            bannerImage1: `/${img1}`,
                            MainTextContent: mainText,
                            SubTextContent: subText,
                            introductionTextContent: introText,
                            heading: HeadingText,
                            subHeading: subHeadingText
                        }
                    }
                )
            } { }

            let img2;
            if (imgfile.bannerImage2 && imgfile.bannerImage2.length > 0) {
                img2 = imgfile.bannerImage2[0].path.substring(imgfile.bannerImage2[0].path.indexOf('\\') + 1);
            } else {

                img2 = "";
            }

            if (img2 != "") {
                await bannerData.findOneAndUpdate(
                    { sectionName: "sectionOne" },
                    {
                        $set: {

                            bannerImage2: `/${img2}`,
                            MainTextContent: mainText,
                            SubTextContent: subText,
                            introductionTextContent: introText,
                            heading:  HeadingText,
                            subHeading: subHeadingText
                        }
                    }
                )
            } { }



            let img3;
            if (imgfile.bannerImage3 && imgfile.bannerImage3.length > 0) {
                img3 = imgfile.bannerImage3[0].path.substring(imgfile.bannerImage3[0].path.indexOf('\\') + 1);
            } else {

                img3 = "";
            }

            if (img3 != "") {
                await bannerData.findOneAndUpdate(
                    { sectionName: "sectionOne" },
                    {
                        $set: {
                            bannerImage3: `/${img3}`,
                            MainTextContent: mainText,
                            SubTextContent: subText,
                            introductionTextContent: introText,
                            heading:  HeadingText,
                            subHeading: subHeadingText
                        }
                    }
                )
            } { }

            if (img1 == "" && img2 == "" && img3 == "") {
                await bannerData.findOneAndUpdate(
                    { sectionName: "sectionOne" },
                    {
                        $set: {
                            MainTextContent: mainText,
                            SubTextContent: subText,
                            introductionTextContent: introText,
                            heading:  HeadingText,
                            subHeading: subHeadingText
                        }
                    }
                )
            }

        }




        else if (sections == "sectionTwo") {

            let img1;
            if (imgfile.bannerImage1 && imgfile.bannerImage1.length > 0) {
                img1 = imgfile.bannerImage1[0].path.substring(imgfile.bannerImage1[0].path.indexOf('\\') + 1);
            } else {

                img1 = "";
            }
            if (img1 != "") {
                await bannerData.findOneAndUpdate(
                    { sectionName: "sectionTwo" },
                    {
                        $set: {
                            bannerImage1: `/${img1}`,
                            MainTextContent: mainText,
                            SubTextContent: subText,
                            introductionTextContent: introText,
                            heading: subHeadingText,
                            subHeading: HeadingText
                        }
                    }
                )
            } { }

            let img2;
            if (imgfile.bannerImage2 && imgfile.bannerImage2.length > 0) {
                img2 = imgfile.bannerImage2[0].path.substring(imgfile.bannerImage2[0].path.indexOf('\\') + 1);
            } else {

                img2 = "";
            }

            if (img2 != "") {
                await bannerData.findOneAndUpdate(
                    { sectionName: "sectionTwo" },
                    {
                        $set: {

                            bannerImage2: `/${img2}`,
                            MainTextContent: mainText,
                            SubTextContent: subText,
                            introductionTextContent: introText,
                            heading: subHeadingText,
                            subHeading: HeadingText
                        }
                    }
                )
            } { }



            let img3;
            if (imgfile.bannerImage3 && imgfile.bannerImage3.length > 0) {
                img3 = imgfile.bannerImage3[0].path.substring(imgfile.bannerImage3[0].path.indexOf('\\') + 1);
            } else {

                img3 = "";
            }

            if (img3 != "") {
                await bannerData.findOneAndUpdate(
                    { sectionName: "sectionTwo" },
                    {
                        $set: {
                            bannerImage3: `/${img3}`,
                            MainTextContent: mainText,
                            SubTextContent: subText,
                            introductionTextContent: introText,
                            heading: subHeadingText,
                            subHeading: HeadingText
                        }
                    }
                )
            } { }

            if (img1 == "" && img2 == "" && img3 == "") {
                await bannerData.findOneAndUpdate(
                    { sectionName: "sectionTwo" },
                    {
                        $set: {
                            MainTextContent: mainText,
                            SubTextContent: subText,
                            introductionTextContent: introText,
                            heading: subHeadingText,
                            subHeading: HeadingText
                        }
                    }
                )
            }
        }
        else if (sections == "sectionThree") {

            let img1;
            if (imgfile.bannerImage1 && imgfile.bannerImage1.length > 0) {
                img1 = imgfile.bannerImage1[0].path.substring(imgfile.bannerImage1[0].path.indexOf('\\') + 1);
            } else {

                img1 = "";
            }
            if (img1 != "") {
                await bannerData.findOneAndUpdate(
                    { sectionName: "sectionThree" },
                    {
                        $set: {
                            bannerImage1: `/${img1}`,
                            MainTextContent: mainText,
                            SubTextContent: subText,
                            introductionTextContent: introText,
                            heading: subHeadingText,
                            subHeading: HeadingText
                        }
                    }
                )
            } { }

            let img2;
            if (imgfile.bannerImage2 && imgfile.bannerImage2.length > 0) {
                img2 = imgfile.bannerImage2[0].path.substring(imgfile.bannerImage2[0].path.indexOf('\\') + 1);
            } else {

                img2 = "";
            }

            if (img2 != "") {
                await bannerData.findOneAndUpdate(
                    { sectionName: "sectionThree" },
                    {
                        $set: {

                            bannerImage2: `/${img2}`,
                            MainTextContent: mainText,
                            SubTextContent: subText,
                            introductionTextContent: introText,
                            heading: subHeadingText,
                            subHeading: HeadingText
                        }
                    }
                )
            } { }



            let img3;
            if (imgfile.bannerImage3 && imgfile.bannerImage3.length > 0) {
                img3 = imgfile.bannerImage3[0].path.substring(imgfile.bannerImage3[0].path.indexOf('\\') + 1);
            } else {

                img3 = "";
            }

            if (img3 != "") {
                await bannerData.findOneAndUpdate(
                    { sectionName: "sectionThree" },
                    {
                        $set: {
                            bannerImage3: `/${img3}`,
                            MainTextContent: mainText,
                            SubTextContent: subText,
                            introductionTextContent: introText,
                            heading: subHeadingText,
                            subHeading: HeadingText
                        }
                    }
                )
            } { }

            if (img1 == "" && img2 == "" && img3 == "") {
                await bannerData.findOneAndUpdate(
                    { sectionName: "sectionThree" },
                    {
                        $set: {
                            MainTextContent: mainText,
                            SubTextContent: subText,
                            introductionTextContent: introText,
                            heading: subHeadingText,
                            subHeading: HeadingText
                        }
                    }
                )
            }
        }
        res.redirect("/admin/banner")
    }
    catch (error) {
        console.log(error.message)
    }
}







//banner change function......
// const chartData = async (req, res) => {
//     try {

//     }
//     catch (error) {
//         console.log(error.message)
//     }
// }



/* ---------------------------------------------------- */

module.exports = {
    adminlogin,
    adminDashboard,
    adminbanner,
    adminVerification,
    adminDataStore,
    adminproduct,
    addbanner,
    addcategory,
    showcategory,
    logout,
    usermanage,
    usersetting,
    usersetting1,
    deleCategory,
    editorCategory,
    restoreCategory,
    editedCategory,
    orderManagement,
    orderStatusUpdate,
    coupons,
    listcoupons,
    addcoupons,
    editcoupons,
    changecoupons,
    deletecoupons,
    downloadoption,
    daywisereport,
    downloadrevenue,
    downloadrevenuepdf,
    removeproductOffer,
    addoffercategory,
    addofferproduct,
    offerreferal,
    offercategorywise,
    offerproductwise,
    bydate,
    removeOffer,
    postbydate,
    downloadDetailPdf,
    downloadDetailExcel,
    bannerAdding,
    bannerConfigur,
    bannerdatabse,
    storebanner,
    adminSignUP,
    addReferalOffer,
    updateReferalOffer,
    renderDashboard,
    updateBanner,
    // chartData,


}
/* ---------------------------------------------------- */